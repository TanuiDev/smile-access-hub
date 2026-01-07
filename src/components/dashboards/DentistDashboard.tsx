import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboards/ui/card';
import { Button } from '@/components/dashboards/ui/button';
import { Input } from '@/components/dashboards/ui/input';
import { Label } from '@/components/dashboards/ui/label';
import { Textarea } from '@/components/dashboards/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/dashboards/ui/table';
import { Badge } from '@/components/dashboards/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/dashboards/ui/avatar';
import { Dialog as BaseDialog, DialogContent as BaseDialogContent, DialogHeader as BaseDialogHeader, DialogTitle as BaseDialogTitle, DialogDescription as BaseDialogDescription } from '@/components/dashboards/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/dashboards/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/dashboards/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Calendar, Stethoscope, Video, LogOut, User, Clock, MapPin, Phone, Mail, Plus, Edit, Eye, UserCircle, Settings, Check, MoreVertical, Link as LinkIcon } from 'lucide-react';
import { useAuthStore } from '@/Store/UserStore';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiUrl } from '@/utils/APIUrl';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ChatbotPanel from '@/components/dashboards/ChatbotPanel';
interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  videoChatLink?: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  nextAppointment?: string;
}


const DentistDashboard = () => {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    dentistId: '',
    specialization: '',
    education: '',
    experience: 0,
    bio: '',
    availability: '',
    hourlyRate: 0,
  });

  const { isLoading, error, data } = useQuery({
    queryKey: ['patientData'],  
  
    
    queryFn: async () => {   
  
      const response = await axios.get(`${apiUrl}/appointments/my-appointments`);
      console.log(response.data);
      return response.data;
    },
  });

  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const res = await axios.patch(`${apiUrl}/appointments/${appointmentId}/status`, { status: 'CONFIRMED' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientData'] });
      toast({ title: 'Appointment confirmed', description: 'The appointment has been confirmed.' });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast({ title: 'Confirmation failed', description: err?.response?.data?.message || 'Please try again.', variant: 'destructive' });
    }
  });

  const setInProgressMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const res = await axios.patch(`${apiUrl}/appointments/${appointmentId}/status`, { status: 'IN_PROGRESS' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientData'] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const res = await axios.patch(`${apiUrl}/appointments/${appointmentId}/status`, { status: 'COMPLETED' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientData'] });
      toast({ title: 'Appointment completed', description: 'Proceed to write the prescription.' });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast({ title: 'Completion failed', description: err?.response?.data?.message || 'Please try again.', variant: 'destructive' });
    }
  });

  const handleStartAppointment = (appointmentId: string, existingLink?: string) => {
    setInProgressMutation.mutate(appointmentId);
    let url = existingLink;
    if (!url) {
      const fallbackId = Math.random().toString(36).slice(2, 10);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const genId = (self as any).crypto?.randomUUID?.() ?? fallbackId;
      url = `${window.location.origin}/meet/${genId}?appointmentId=${appointmentId}`;
      saveMeetingMutation.mutate({ id: appointmentId, url });
    } else if (url && !url.includes('appointmentId=')) {
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}appointmentId=${appointmentId}`;
    }
    window.open(url, '_blank', 'noopener');
  };

  const handleCompleteAndWrite = (appointmentId: string) => {
    completeMutation.mutate(appointmentId, {
      onSuccess: () => {
        navigate(`/prescriptions/new?appointmentId=${appointmentId}`);
      }
    });
  };

  // Query for dentist profile - using same endpoint as patient dashboard
  const { isLoading: isProfileLoading, error: profileError, data: profileResponse } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}/auth/profile`);
      console.log('Profile fetch response:', response.data);
      return response.data;
    },
    enabled: true,
  });

  const profile = profileResponse?.data;

  React.useEffect(() => {
    if (showProfileModal && profile) {
      setEditForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        dentistId: profile.roleData?.dentistId || '',
        specialization: profile.roleData?.specialization || '',
        education: profile.roleData?.education || '',
        experience: profile.roleData?.experience || 0,
        bio: profile.roleData?.bio || '',
        availability: profile.roleData?.availability || '',
        hourlyRate: profile.roleData?.hourlyRate || 0,
      });
    }
  }, [showProfileModal, profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: typeof editForm) => {
      const hasChanges = Object.values(payload).some(value => 
        typeof value === 'string' ? value.trim() !== '' : value !== 0
      );
      if (!hasChanges) {
        throw new Error('No changes provided');
      }

      const { dentistId, specialization, education, experience, bio, availability, hourlyRate, ...baseFields } = payload;
      const requestPayload = {
        ...baseFields,
        roleData: {
          dentistId: dentistId.trim() || undefined,
          specialization: specialization.trim() || undefined,
          education: education.trim() || undefined,
          experience: experience || undefined,
          bio: bio.trim() || undefined,
          availability: availability.trim() || undefined,
          hourlyRate: hourlyRate || undefined,
        },
      };
      console.log('Update profile payload:', requestPayload);
      const response = await axios.patch(`${apiUrl}/auth/update-profile`, requestPayload);
      console.log('Update profile response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditingProfile(false);
      setShowProfileModal(false);
      toast({ title: 'Profile updated', description: 'Your profile was updated successfully.' });
    },
    onError: (err) => {
      console.error('Update profile error:', err);
      toast({
        title: 'Update failed',
        description: err.message || 'Could not update profile.',
        variant: 'destructive',
      });
    },
  });

  const patients: Patient[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', lastVisit: '2024-01-10', nextAppointment: '2024-01-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', lastVisit: '2024-01-08', nextAppointment: '2024-01-20' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '+1234567892', lastVisit: '2024-01-05', nextAppointment: '2024-01-15' },
  ];

  const stats = React.useMemo(() => {
    if (!data?.data) return { todayAppointments: 0, totalPatients: 0, completedToday: 0, pendingAppointments: 0 };
  
    const appointments = data.data;
    const today = new Date().toISOString().split("T")[0]; 
  
    const todayAppointments = appointments.filter(
      (a) => a.appointmentDate.split("T")[0] === today
    ).length;
  
    const totalPatients = new Set(appointments.map((a) => a.patientId)).size;
  
    const completedToday = appointments.filter(
      (a) =>
        a.appointmentDate.split("T")[0] === today &&
        a.status === "COMPLETED"
    ).length;
  
    const pendingAppointments = appointments.filter(
      (a) => ["SCHEDULED", "CONFIRMED"].includes(a.status)
    ).length;
  
    return {
      todayAppointments,
      totalPatients,
      completedToday,
      pendingAppointments,
    };
  }, [data]);

  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    navigate('/login');
  };

  const handleCompleteAppointment = (appointmentId: string) => {
    toast({ title: 'Appointment completed', description: 'Appointment marked as completed.' });
   
  };

  const handleWritePrescription = (patient: Patient) => {
    setSelectedPatient(patient);
    setPrescriptionText('');
  };

  const handleSubmitPrescription = () => {
    if (!selectedPatient || !prescriptionText.trim()) {
      toast({ title: 'Error', description: 'Please enter prescription details.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Prescription sent', description: `Prescription sent to ${selectedPatient.name}.` });
    setSelectedPatient(null);
    setPrescriptionText('');
  };

  const handleCreateMeeting = () => {
    const fallbackId = Math.random().toString(36).slice(2, 10);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const genId = (self as any).crypto?.randomUUID?.() ?? fallbackId;
    const roomId = meetingLink.trim() || genId;
    const shareUrl = `${window.location.origin}/meet/${roomId}`;
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    toast({ title: 'Meeting created', description: `Link copied. Share with patient: ${shareUrl}` });
    setMeetingLink('');
    window.open(shareUrl, '_blank', 'noopener');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast({ title: 'Theme changed', description: `Switched to ${!isDarkMode ? 'dark' : 'light'} mode.` });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(editForm);
    } catch (err) {
      // Error handling is done in the mutation's onError
            toast({ title: 'Update Failed', description: err?.response?.data?.message || 'Please try again.', variant: 'destructive' });          
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'secondary';
      case 'in-progress': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'default';
      case 'follow-up': return 'secondary';
      case 'emergency': return 'destructive';
      default: return 'secondary';
    }
  };

  const [meetingUrlInput, setMeetingUrlInput] = useState<Record<string, string>>({});

  const saveMeetingMutation = useMutation({
    mutationFn: async ({ id, url }: { id: string; url: string }) => {
      const res = await axios.patch(`${apiUrl}/appointments/${id}/meeting`, { videoChatLink: url });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientData'] });
      toast({ title: 'Meeting link saved', description: 'Patients can now join from their dashboard.' });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast({ title: 'Save failed', description: err?.response?.data?.message || 'Please try again.', variant: 'destructive' });
    }
  });

  const handleSaveMeeting = (appointmentId: string) => {
    const url = meetingUrlInput[appointmentId]?.trim();
    if (!url) {
      toast({ title: 'Missing link', description: 'Please paste or generate a meeting link.', variant: 'destructive' });
      return;
    }
    saveMeetingMutation.mutate({ id: appointmentId, url });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detailsAppt, setDetailsAppt] = useState<any | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openDetails = (appt: any) => setDetailsAppt(appt);
  const closeDetails = () => setDetailsAppt(null);

  const joinFromDetails = () => {
    if (!detailsAppt) return;
    const url = detailsAppt.videoChatLink || '';
    if (!url) {
      toast({ title: 'No meeting link', description: 'Save a meeting link first.', variant: 'destructive' });
      return;
    }
    window.open(url, '_blank', 'noopener');
  };

  const writeRxFromDetails = () => {
    if (!detailsAppt) return;
    navigate(`/prescriptions/new?appointmentId=${detailsAppt.id}`);
  };

  const handleConfirmAppointment = (appointmentId: string) => {
    try {
      confirmMutation.mutate(appointmentId);
    } catch {
            toast({ title: 'Confirmation Failed', description: err?.response?.data?.message || 'Please try again.', variant: 'destructive' });

    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dentist Dashboard</h1>
          <p className="text-muted-foreground">Manage appointments, write prescriptions, and create virtual meetings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={() => setShowProfileModal(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">Appointments scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Under your care</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">Appointments finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAppointments}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Chatbot */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Create Virtual Meeting</CardTitle>
            <CardDescription>Generate a meeting link for virtual consultations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter meeting link or generate one..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
              <Button onClick={handleCreateMeeting}>
                <Video className="mr-2 h-4 w-4" />
                Create
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Overview</CardTitle>
            <CardDescription>Quick access to patient information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patients.slice(0, 3).map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{patient.name}</div>
                      <div className="text-xs text-muted-foreground">{patient.email}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleWritePrescription(patient)}>
                    <Stethoscope className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <ChatbotPanel
          audience="dentist"
          title="Chairside AI Assistant"
          description="Draft talking points, quick education blurbs, or prep guidance for upcoming visits."
        />
      </div>

      {/* Appointments */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>Manage your daily schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {Array.isArray(data?.data) && data.data.map((appointment) => (
              <TableRow key={appointment.id} className="hover:bg-muted/30">
                <TableCell onClick={() => openDetails(appointment)} className="cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {`${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {appointment.patient.user.firstName} {appointment.patient.user.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.patient.user.emailAddress}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell onClick={() => openDetails(appointment)} className="cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {new Date(appointment.appointmentDate).toLocaleDateString()}{" "}
                      {appointment.timeSlot}
                    </span>
                  </div>
                </TableCell>
                <TableCell onClick={() => openDetails(appointment)} className="cursor-pointer">
                  <Badge variant={getTypeColor(appointment.appointmentType)}>
                    {appointment.appointmentType}
                  </Badge>
                </TableCell>
                <TableCell onClick={() => openDetails(appointment)} className="cursor-pointer">
                  <Badge variant={getStatusColor(appointment.status.toLowerCase())}>
                    {appointment.status}
                  </Badge>
                </TableCell>
                <TableCell onClick={() => openDetails(appointment)} className="cursor-pointer text-sm text-muted-foreground max-w-xs truncate">
                  {appointment.notes || 'No notes'}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-col gap-2">
                    {/* Meeting Link Section - Always show for non-completed appointments */}
                    {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                      <div className="space-y-2">
                        {!appointment.videoChatLink ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Paste meeting link"
                              value={meetingUrlInput[appointment.id] ?? ''}
                              onChange={(e) => setMeetingUrlInput(prev => ({ ...prev, [appointment.id]: e.target.value }))}
                              className="h-8 text-xs"
                            />
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handleSaveMeeting(appointment.id)}
                              className="h-8"
                            >
                              <LinkIcon className="h-3 w-3 mr-1" /> Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                            <Video className="h-3 w-3" />
                            <span className="flex-1 truncate">Meeting link ready</span>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => navigator.clipboard?.writeText(appointment.videoChatLink)}
                              className="h-6 px-2"
                            >
                              Copy
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Primary Action Buttons */}
                    <div className="flex gap-2">
                      {appointment.status === 'SCHEDULED' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleConfirmAppointment(appointment.id)}
                            className="flex-1"
                          >
                            <Check className="h-3 w-3 mr-1" /> Confirm
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStartAppointment(appointment.id, appointment.videoChatLink)}>
                                <Video className="h-3 w-3 mr-2" /> Start Meeting
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleWritePrescription({
                                id: appointment.id,
                                name: `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`,
                                email: appointment.patient.user.emailAddress,
                                phone: '',
                                lastVisit: ''
                              })}>
                                <Stethoscope className="h-3 w-3 mr-2" /> Write Prescription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}

                      {appointment.status === 'CONFIRMED' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleStartAppointment(appointment.id, appointment.videoChatLink)}
                            className="flex-1"
                          >
                            <Video className="h-3 w-3 mr-1" /> Start Meeting
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCompleteAndWrite(appointment.id)}>
                                <Check className="h-3 w-3 mr-2" /> Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleWritePrescription({
                                id: appointment.id,
                                name: `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`,
                                email: appointment.patient.user.emailAddress,
                                phone: '',
                                lastVisit: ''
                              })}>
                                <Stethoscope className="h-3 w-3 mr-2" /> Write Prescription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}

                      {appointment.status === 'IN_PROGRESS' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleCompleteAndWrite(appointment.id)}
                            className="flex-1"
                          >
                            <Check className="h-3 w-3 mr-1" /> Complete & Write Rx
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStartAppointment(appointment.id, appointment.videoChatLink)}>
                                <Video className="h-3 w-3 mr-2" /> Rejoin Meeting
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleWritePrescription({
                                id: appointment.id,
                                name: `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`,
                                email: appointment.patient.user.emailAddress,
                                phone: '',
                                lastVisit: ''
                              })}>
                                <Stethoscope className="h-3 w-3 mr-2" /> Write Prescription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}

                      {appointment.status === 'COMPLETED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWritePrescription({
                            id: appointment.id,
                            name: `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`,
                            email: appointment.patient.user.emailAddress,
                            phone: '',
                            lastVisit: ''
                          })}
                          className="flex-1"
                        >
                          <Stethoscope className="h-3 w-3 mr-1" /> Write Prescription
                        </Button>
                      )}

                      {appointment.status === 'CANCELLED' && (
                        <span className="text-xs text-muted-foreground italic">No actions available</span>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}

              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Prescription Didalog */}
      <BaseDialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <BaseDialogContent className="max-w-2xl">
          <BaseDialogHeader>
            <BaseDialogTitle>Write Prescription</BaseDialogTitle>
            <BaseDialogDescription>
              Write a prescription for {selectedPatient?.name}
            </BaseDialogDescription>
          </BaseDialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="prescription">Prescription Details</Label>
              <Textarea
                id="prescription"
                placeholder="Enter prescription details, dosage, instructions..."
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                rows={6}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitPrescription}>
                Send Prescription
              </Button>
            </div>
          </div>
        </BaseDialogContent>
      </BaseDialog>

      {/* Profile Dialog */}
      <BaseDialog open={showProfileModal} onOpenChange={(open) => {
        setShowProfileModal(open);
        if (!open) {
          setIsEditingProfile(false);
        }
      }}>
        <BaseDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <BaseDialogHeader>
            <BaseDialogTitle>Profile Information</BaseDialogTitle>
            <BaseDialogDescription>Your personal and professional information</BaseDialogDescription>
          </BaseDialogHeader>
          <div className="flex justify-end">
            {!isEditingProfile ? (
              <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingProfile(false);
                    if (profile) {
                      setEditForm({
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        phoneNumber: profile.phoneNumber || '',
                        address: profile.address || '',
                        city: profile.city || '',
                        state: profile.state || '',
                        dentistId: profile.roleData?.dentistId || '',
                        specialization: profile.roleData?.specialization || '',
                        education: profile.roleData?.education || '',
                        experience: profile.roleData?.experience || 0,
                        bio: profile.roleData?.bio || '',
                        availability: profile.roleData?.availability || '',
                        hourlyRate: profile.roleData?.hourlyRate || 0,
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {isProfileLoading && <p>Loading profile...</p>}
            {profileError && <p className="text-red-500">Error loading profile: {profileError.message}</p>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                {isEditingProfile ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      name="firstName"
                      placeholder="First name"
                      value={editForm.firstName}
                      onChange={handleEditChange}
                    />
                    <Input
                      name="lastName"
                      placeholder="Last name"
                      value={editForm.lastName}
                      onChange={handleEditChange}
                    />
                  </div>
                ) : (
                  <Input value={`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()} readOnly />
                )}
              </div>
              <div>
                <Label>Email</Label>
                <Input value={profile?.emailAddress || ''} readOnly />
              </div>
              <div>
                <Label>Phone</Label>
                {isEditingProfile ? (
                  <Input
                    name="phoneNumber"
                    value={editForm.phoneNumber}
                    onChange={handleEditChange}
                  />
                ) : (
                  <Input value={profile?.phoneNumber || ''} readOnly />
                )}
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : ''}
                  readOnly
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              {isEditingProfile ? (
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    name="address"
                    placeholder="Street address"
                    value={editForm.address}
                    onChange={handleEditChange}
                  />
                  <Input
                    name="city"
                    placeholder="City"
                    value={editForm.city}
                    onChange={handleEditChange}
                  />
                  <Input
                    name="state"
                    placeholder="State"
                    value={editForm.state}
                    onChange={handleEditChange}
                  />
                </div>
              ) : (
                <Input value={[profile?.address, profile?.city, profile?.state].filter(Boolean).join(', ') || ''} readOnly />
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Professional Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dentist ID</Label>
                  {isEditingProfile ? (
                    <Input
                      name="dentistId"
                      value={editForm.dentistId}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <Input value={profile?.roleData?.dentistId || 'Not provided'} readOnly />
                  )}
                </div>
                <div>
                  <Label>Specialization</Label>
                  {isEditingProfile ? (
                    <Input
                      name="specialization"
                      value={editForm.specialization}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <Input value={profile?.roleData?.specialization || 'Not provided'} readOnly />
                  )}
                </div>
                <div>
                  <Label>Education</Label>
                  {isEditingProfile ? (
                    <Input
                      name="education"
                      value={editForm.education}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <Input value={profile?.roleData?.education || 'Not provided'} readOnly />
                  )}
                </div>
                <div>
                  <Label>Experience (Years)</Label>
                  {isEditingProfile ? (
                    <Input
                      name="experience"
                      type="number"
                      value={editForm.experience}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <Input value={profile?.roleData?.experience || 'Not provided'} readOnly />
                  )}
                </div>
                <div>
                  <Label>Hourly Rate ($)</Label>
                  {isEditingProfile ? (
                    <Input
                      name="hourlyRate"
                      type="number"
                      step="0.01"
                      value={editForm.hourlyRate}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <Input value={profile?.roleData?.hourlyRate ? `$${profile.roleData.hourlyRate}` : 'Not provided'} readOnly />
                  )}
                </div>
                <div>
                  <Label>Availability</Label>
                  {isEditingProfile ? (
                    <Input
                      name="availability"
                      value={editForm.availability}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <Input value={profile?.roleData?.availability || 'Not provided'} readOnly />
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Bio</Label>
                  {isEditingProfile ? (
                    <Textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleEditChange}
                      rows={4}
                    />
                  ) : (
                    <Input value={profile?.roleData?.bio || 'Not provided'} readOnly />
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowProfileModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </BaseDialogContent>
      </BaseDialog>

      <BaseDialog open={!!detailsAppt} onOpenChange={(open) => (open ? null : closeDetails())}>
        <BaseDialogContent className="max-w-lg">
          <BaseDialogHeader>
            <BaseDialogTitle>Appointment Details</BaseDialogTitle>
            <BaseDialogDescription>
              {detailsAppt?.patient?.user?.firstName} {detailsAppt?.patient?.user?.lastName} • {new Date(detailsAppt?.appointmentDate || Date.now()).toLocaleDateString()} {detailsAppt?.timeSlot}
            </BaseDialogDescription>
          </BaseDialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span> {detailsAppt?.appointmentType}
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span> {detailsAppt?.status}
            </div>
            <div>
              <span className="text-muted-foreground">Condition:</span> {detailsAppt?.conditionDescription}
            </div>
            <div>
              <span className="text-muted-foreground">Severity:</span> {detailsAppt?.severity}
            </div>
            <div>
              <span className="text-muted-foreground">Notes:</span> {detailsAppt?.notes || '—'}
            </div>
            <div className="flex items-center gap-2 pt-2">
              {detailsAppt?.videoChatLink ? (
                <Button onClick={joinFromDetails}>Join Meeting</Button>
              ) : (
                <span className="text-xs text-muted-foreground">No meeting link saved yet.</span>
              )}
              <Button variant="outline" onClick={writeRxFromDetails}>Write Prescription</Button>
              <Button variant="outline" onClick={closeDetails}>Close</Button>
            </div>
          </div>
        </BaseDialogContent>
      </BaseDialog>
    </div>
  );
};

export default DentistDashboard;

