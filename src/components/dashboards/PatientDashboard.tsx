/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/dashboards/ui/card';
import { Button } from '@/components/dashboards/ui/button';
import { Input } from '@/components/dashboards/ui/input';
import { Label } from '@/components/dashboards/ui/label';
import { Textarea } from '@/components/dashboards/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/dashboards/ui/table';
import { Badge } from '@/components/dashboards/ui/badge';
import { Dialog as BaseDialog, DialogContent as BaseDialogContent, DialogHeader as BaseDialogHeader, DialogTitle as BaseDialogTitle, DialogDescription as BaseDialogDescription, DialogTrigger } from '@/components/dashboards/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/dashboards/ui/select';
import { Calendar } from '@/components/dashboards/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Calendar as CalendarIcon, Clock, FileText, CreditCard, Settings, Plus, Video, Edit, LogOut, User, Stethoscope, ExternalLink, CheckCircle2, Download } from 'lucide-react';
import { useAuthStore } from '@/Store/UserStore';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl } from '@/utils/APIUrl.ts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ChatbotPanel from '@/components/dashboards/ChatbotPanel';

interface Prescription {
  id: string;
  date: string;
  dentistName: string;
  medication: string;
  dosage: string;
  instructions: string;
  refills: number;
}

interface MedicalRecord {
  id: string;
  date: string;
  procedure: string;
  dentistName: string;
  notes: string;
  cost: number;
}

const PatientDashboard = () => {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [appointmentType, setAppointmentType] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const { user, logout } = useAuthStore(state => state);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    emergencyContact: '',
    insuranceProvider: '',
    insuranceNumber: '',
    medicalHistory: '',
    allergies: '',
  });


  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinRoomInput, setJoinRoomInput] = useState('');

  const prescriptionRef = React.useRef<HTMLDivElement>(null);



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
    if (showProfileDialog && profile) {
      setEditForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        emergencyContact: profile.roleData?.emergencyContact || '',
        insuranceProvider: profile.roleData?.insuranceProvider || '',
        insuranceNumber: profile.roleData?.insuranceNumber || '',
        medicalHistory: profile.roleData?.medicalHistory || '',
        allergies: profile.roleData?.allergies || '',
      });
    }
  }, [showProfileDialog, profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: typeof editForm) => {
      
      const hasChanges = Object.values(payload).some(value => value.trim() !== '');
      if (!hasChanges) {
        throw new Error('No changes provided');
      }

      const { emergencyContact, insuranceProvider, insuranceNumber, medicalHistory, allergies, ...baseFields } = payload;
      const requestPayload = {
        ...baseFields,
        ...(user?.role === 'PATIENT' && {
          roleData: {
            emergencyContact: emergencyContact.trim() || undefined,
            insuranceProvider: insuranceProvider.trim() || undefined,
            insuranceNumber: insuranceNumber.trim() || undefined,
            medicalHistory: medicalHistory.trim() || undefined,
            allergies: allergies.trim() || undefined,
          },
        }),
      };
      
      const response = await axios.patch(`${apiUrl}/auth/update-profile`, requestPayload);
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditingProfile(false);
      setShowProfileDialog(false);
      toast({ title: 'Profile updated', description: 'Your profile was updated successfully.' });
    },
    onError: (err) => {
      
      toast({
        title: 'Update failed',
        description:err.message || 'Could not update profile.',
        variant: 'destructive',
      });
    },
  });

  const { isLoading: isPrescriptionsLoading, error: prescriptionsError, data: prescriptionsResponse } = useQuery({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}/prescriptions/my-prescriptions`);
      return response.data;
    }
  });
  const prescriptionList= prescriptionsResponse?.data ?? [];

  const { isLoading, error, data } = useQuery({
    queryKey: ['patientData'],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}/appointments/my-appointments`);
      console.log('Appointments fetch response:', response.data); 
      return response.data;
    },
  });

  
  const appointmentsArray = Array.isArray(data?.data) ? data.data : [];
  const todayISO = new Date().toISOString().slice(0, 10);
  const upcomingAppointments = appointmentsArray.filter(a => {
    try {
      const d = new Date(a.appointmentDate);
      const dayISO = d.toISOString().slice(0,10);
      const isFutureOrToday = dayISO >= todayISO;
      const active = ['SCHEDULED','CONFIRMED','IN_PROGRESS'].includes(a.status);
      return isFutureOrToday && active;
    } catch { return false; }
  }).length;
  const totalVisits = appointmentsArray.length;
  const completedVisits = appointmentsArray.filter(a => a.status === 'COMPLETED').length;
  const prescriptionsCount = Array.isArray(prescriptionList) ? prescriptionList.length : 0;

  const stats = {
    upcomingAppointments,
    totalVisits,
    completedVisits,
    prescriptions: prescriptionsCount,
  };

  // Prescription details dialog
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRx, setSelectedRx] = React.useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openRx = (rx: any) => setSelectedRx(rx);
  const closeRx = () => setSelectedRx(null);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(editForm);
    } catch (err) {
    
    }
  };

  const deleteProfileMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.patch(`${apiUrl}/auth/delete-user`);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'Profile deleted', description: 'Your account has been marked as deleted.' });
      logout();
      navigate('/login');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast({ title: 'Deletion failed', description: err?.message || 'Could not delete profile.', variant: 'destructive' });
    }
  });

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your profile? This action can be reverted only by an admin.');
    if (!confirmed) return;
    try {
      await deleteProfileMutation.mutateAsync();
    // eslint-disable-next-line no-empty, @typescript-eslint/no-explicit-any
    } catch (error:any) {
      console.log("Error",error)
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    navigate('/login');
  };

  const handleScheduleAppointment = () => {
    if (!selectedDate || !appointmentType) {
      toast({ title: 'Missing information', description: 'Please select date and appointment type.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Appointment scheduled', description: 'Your appointment has been scheduled successfully.' });
    setShowScheduleDialog(false);
    setSelectedDate(undefined);
    setAppointmentType('');
    setAppointmentNotes('');
  };

  const handleCancelAppointment = (appointmentId: string) => {
    toast({ title: 'Appointment cancelled', description: 'Your appointment has been cancelled.' });
    
  };

  const parseRoomIdFromInput = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split('/');
      return parts[parts.length - 1] || '';
    } catch {
      return trimmed; 
    }
  };

  const handleJoinMeeting = () => {
    const roomId = parseRoomIdFromInput(joinRoomInput);
    if (!roomId) {
      toast({ title: 'Missing room', description: 'Enter a room ID or link.', variant: 'destructive' });
      return;
    }
    setShowJoinDialog(false);
    setJoinRoomInput('');
    navigate(`/meet/${roomId}`);
  };

  const toggleTheme = () => {   
    setIsDarkMode(!isDarkMode);
    toast({ title: 'Theme changed', description: `Switched to ${!isDarkMode ? 'dark' : 'light'} mode.` });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'secondary';
      case 'confirmed': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'consultation': return 'default';
      case 'follow-up': return 'secondary';
      case 'emergency': return 'destructive';
      case 'cleaning': return 'outline';
      default: return 'secondary';
    }
  };

 
  const [detailsAppt, setDetailsAppt] = React.useState<any | null>(null);
  
  const openDetails = (appt: any) => setDetailsAppt(appt);
  const closeDetails = () => setDetailsAppt(null);
  const joinFromDetails = () => {
    if (!detailsAppt?.videoChatLink) return;
    window.open(detailsAppt.videoChatLink, '_blank', 'noopener');
  };

  const handleDownloadPrescription = async () => {
    if (!prescriptionRef.current || !selectedRx) return;

    try {
      toast({ title: 'Generating PDF', description: 'Please wait...' });

      const canvas = await html2canvas(prescriptionRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`prescription_${selectedRx.prescriptionNumber}_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast({ 
        title: 'Download successful', 
        description: 'Prescription PDF has been downloaded.' 
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ 
        title: 'Download failed', 
        description: 'Could not generate PDF. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.firstName || data?.[0]?.patient?.user?.firstName || 'Patient'}. Manage your dental care journey.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={() => setShowProfileDialog(true)}>
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
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">Appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisits}</div>
            <p className="text-xs text-muted-foreground">All-time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Visits</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedVisits}</div>
            <p className="text-xs text-muted-foreground">Marked as completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prescriptions}</div>
            <p className="text-xs text-muted-foreground">Total prescriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions  Chatbot */}
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Schedule appointments and manage your care</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <BaseDialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  <Link to="/appointment">Schedule Appointment</Link>
                </Button>
              </DialogTrigger>
              <BaseDialogContent className="max-w-md">
                <BaseDialogHeader>
                  <BaseDialogTitle>Schedule New Appointment</BaseDialogTitle>
                  <BaseDialogDescription>Choose your preferred date and appointment type</BaseDialogDescription>
                </BaseDialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="appointmentType">Appointment Type</Label>
                    <Select value={appointmentType} onValueChange={setAppointmentType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific concerns or requests..."
                      value={appointmentNotes}
                      onChange={(e) => setAppointmentNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleScheduleAppointment}>
                      Schedule
                    </Button>
                  </div>
                </div>
              </BaseDialogContent>
            </BaseDialog>

            <BaseDialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Video className="mr-2 h-4 w-4" />
                  Join Virtual Visit
                </Button>
              </DialogTrigger>
              <BaseDialogContent className="max-w-md">
                <BaseDialogHeader>
                  <BaseDialogTitle>Join Virtual Visit</BaseDialogTitle>
                  <BaseDialogDescription>Paste the meeting link or enter the room ID shared by your dentist.</BaseDialogDescription>
                </BaseDialogHeader>
                <div className="space-y-3">
                  <Label htmlFor="roomId">Room ID or Link</Label>
                  <Input id="roomId" placeholder="e.g. https://yourapp.com/meet/abcd1234 or abcd1234" value={joinRoomInput} onChange={(e) => setJoinRoomInput(e.target.value)} />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowJoinDialog(false)}>Cancel</Button>
                    <Button onClick={handleJoinMeeting}>Join</Button>
                  </div>
                </div>
              </BaseDialogContent>
            </BaseDialog>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View Records
            </Button>
          </CardContent>
        </Card>

        <ChatbotPanel
          audience="patient"
          title="Ask the Dental Assistant"
          description="Get quick guidance on symptoms, aftercare, insurance-friendly questions, and visit prep."
        />
      </div>

      {/* Upcoming Appointments */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled dental visits</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Dentist</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(data?.data) && data.data.map((appointment) => (
                  <TableRow key={appointment.id} className="hover:bg-muted/30">
                    <TableCell onClick={() => openDetails(appointment)} className="cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{appointment.timeSlot}</span>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => openDetails(appointment)} className="cursor-pointer font-medium">
                      {appointment.dentist?.user?.firstName} {appointment.dentist?.user?.lastName}
                    </TableCell>
                    <TableCell onClick={() => openDetails(appointment)} className="cursor-pointer">
                      <Badge variant={getTypeColor(appointment.appointmentType.toLowerCase())}>
                        {appointment.appointmentType}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => openDetails(appointment)} className="cursor-pointer">
                      <Badge variant={getStatusColor(appointment.status.toLowerCase())}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {appointment.appointmentType === 'VIDEO_CHAT' && (
                          <>
                            {appointment.videoChatLink && (
                              <>
                                <Button asChild size="sm">
                                  <a href={appointment.videoChatLink} target="_blank" rel="noreferrer">
                                    <Video className="h-3 w-3 mr-1" /> Join
                                  </a>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard?.writeText(appointment.videoChatLink);
                                    toast({ title: 'Link copied', description: 'Meeting link copied to clipboard' });
                                  }}
                                >
                                  Copy Link
                                </Button>
                              </>
                            )}
                            {!appointment.videoChatLink && appointment.status === 'CONFIRMED' && (
                              <span className="text-xs text-muted-foreground">Waiting for meeting link...</span>
                            )}
                          </>
                        )}
                        {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelAppointment(appointment.id);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Prescriptions */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
            <CardDescription>Your current and past medications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prescriptionList.map((prescription) => (
                <div
                  key={prescription.id}
                  className="flex flex-col p-4 border rounded-lg space-y-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => openRx(prescription)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {prescription.status === 'ACTIVE' ? (
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" aria-label="Active"></span>
                      ) : (
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-300" aria-label="Inactive"></span>
                      )}
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Diagnosis:</span> {prescription.diagnosis || '—'}
                      </div>
                    </div>
                    {prescription.status !== 'ACTIVE' && (
                      <Badge variant="outline" className="text-xs">Completed</Badge>
                    )}
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">Prescribed by:</span>{' '}
                      {prescription.appointment?.dentist?.user?.firstName} {prescription.appointment?.dentist?.user?.lastName} on{' '}
                      {new Date(prescription.issueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {prescription.medications.map((med: any) => (
                      <div key={med.id} className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{med.medicationName}</span>
                          <Badge variant="outline">{med.dosage}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground pl-6">
                          <p>Instructions: {med.instructions}</p>
                          {typeof med.refills === 'number' && (
                            <p>Refills: {med.refills} remaining</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Profile Dialog */}
      <BaseDialog open={showProfileDialog} onOpenChange={(open) => {
        setShowProfileDialog(open);
        if (!open) {
          setIsEditingProfile(false);
        }
      }}>
        <BaseDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <BaseDialogHeader>
            <BaseDialogTitle>Profile Information</BaseDialogTitle>
            <BaseDialogDescription>Your personal and medical information</BaseDialogDescription>
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
                        emergencyContact: profile.roleData?.emergencyContact || '',
                        insuranceProvider: profile.roleData?.insuranceProvider || '',
                        insuranceNumber: profile.roleData?.insuranceNumber || '',
                        medicalHistory: profile.roleData?.medicalHistory || '',
                        allergies: profile.roleData?.allergies || '',
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
            {user?.role === 'PATIENT' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Insurance Provider</Label>
                  {isEditingProfile ? (
                    <Input
                      name="insuranceProvider"
                      value={editForm.insuranceProvider}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <Input value={profile?.roleData?.insuranceProvider || 'Not provided'} readOnly />
                  )}
                </div>
                <div>
                  <Label>Insurance Number</Label>
                  {isEditingProfile ? (
                    <Input
                      name="insuranceNumber"
                      value={editForm.insuranceNumber}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <Input value={profile?.roleData?.insuranceNumber || 'Not provided'} readOnly />
                  )}
                </div>
                <div>
                  <Label>Emergency Contact</Label>
                  {isEditingProfile ? (
                    <Input
                      name="emergencyContact"
                      value={editForm.emergencyContact}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <Input value={profile?.roleData?.emergencyContact || 'Not provided'} readOnly />
                  )}
                </div>
                <div>
                  <Label>Allergies</Label>
                  {isEditingProfile ? (
                    <Input
                      name="allergies"
                      value={editForm.allergies}
                      onChange={handleEditChange}
                    />
                  ) : (
                    <Input value={profile?.roleData?.allergies || 'Not provided'} readOnly />
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Medical History</Label>
                  {isEditingProfile ? (
                    <Textarea
                      name="medicalHistory"
                      value={editForm.medicalHistory}
                      onChange={handleEditChange}
                      rows={4}
                    />
                  ) : (
                    <Input value={profile?.roleData?.medicalHistory || 'Not provided'} readOnly />
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                Close
              </Button>
              <Button
                variant="destructive"
                className="ml-2"
                onClick={handleDeleteProfile}
                disabled={deleteProfileMutation.isPending}
              >
                {deleteProfileMutation.isPending ? 'Deleting...' : 'Delete My Profile'}
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
              {detailsAppt?.dentist?.user?.firstName} {detailsAppt?.dentist?.user?.lastName} • {new Date(detailsAppt?.appointmentDate || Date.now()).toLocaleDateString()} {detailsAppt?.timeSlot}
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
              {detailsAppt?.appointmentType === 'VIDEO_CHAT' && (
                <>
                  {detailsAppt?.videoChatLink ? (
                    <Button onClick={joinFromDetails}>Join Meeting</Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Your join link will appear here once shared by your dentist.</span>
                  )}
                </>
              )}
              <Button variant="outline" onClick={closeDetails}>Close</Button>
            </div>
          </div>
        </BaseDialogContent>
      </BaseDialog>

      <BaseDialog open={!!selectedRx} onOpenChange={(open) => (open ? null : closeRx())}>
        <BaseDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <BaseDialogHeader>
            <BaseDialogTitle>Prescription Details</BaseDialogTitle>
            <BaseDialogDescription>
              {selectedRx?.appointment?.dentist?.user?.firstName} {selectedRx?.appointment?.dentist?.user?.lastName} • {selectedRx?.prescriptionNumber}
            </BaseDialogDescription>
          </BaseDialogHeader>
          
          {/* Prescription content with ref for PDF generation */}
          <div ref={prescriptionRef} className="space-y-4 p-6 bg-white">
            {/* Header section for PDF */}
            <div className="text-center border-b-2 border-gray-300 pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Medical Prescription</h2>
              <p className="text-sm text-gray-600 mt-1">Prescription Number: {selectedRx?.prescriptionNumber}</p>
            </div>

            <div className="space-y-4 text-sm text-gray-900">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Prescribed by:</span>
                  <p className="mt-1">{selectedRx?.appointment?.dentist?.user?.firstName} {selectedRx?.appointment?.dentist?.user?.lastName}</p>
                </div>
                <div>
                  <span className="font-semibold">Patient:</span>
                  <p className="mt-1">{profile?.firstName} {profile?.lastName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Issued on:</span>
                  <p className="mt-1">{selectedRx?.issueDate ? new Date(selectedRx.issueDate).toLocaleDateString() : '—'}</p>
                </div>
                <div>
                  <span className="font-semibold">Expires on:</span>
                  <p className="mt-1">{selectedRx?.expiryDate ? new Date(selectedRx.expiryDate).toLocaleDateString() : '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <Badge variant={selectedRx?.status === 'ACTIVE' ? 'default' : 'outline'}>
                  {selectedRx?.status}
                </Badge>
              </div>

              <div>
                <span className="font-semibold">Diagnosis:</span>
                <p className="mt-1">{selectedRx?.diagnosis || '—'}</p>
              </div>

              {selectedRx?.notes && (
                <div>
                  <span className="font-semibold">Notes:</span>
                  <p className="mt-1 text-gray-700">{selectedRx?.notes}</p>
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-semibold text-base mb-3 border-b border-gray-200 pb-2">Medications:</h3>
                <div className="space-y-4">
                  {selectedRx?.medications?.map((m: any, index: number) => (
                    <div key={m.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-base text-gray-900">{index + 1}. {m.medicationName}</span>
                            <Badge variant="outline" className="bg-white">{m.dosage}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                            <div>
                              <span className="font-medium">Frequency:</span> {m.frequency}
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span> {m.duration}
                            </div>
                            <div>
                              <span className="font-medium">Quantity:</span> {m.quantity}
                            </div>
                            {typeof m.refills === 'number' && (
                              <div>
                                <span className="font-medium">Refills:</span> {m.refills}
                              </div>
                            )}
                          </div>
                          {m.instructions && (
                            <div className="mt-3 pt-2 border-t border-gray-200">
                              <span className="font-medium text-xs">Instructions:</span>
                              <p className="text-xs text-gray-700 mt-1">{m.instructions}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer for PDF */}
              <div className="mt-8 pt-4 border-t-2 border-gray-300 text-xs text-gray-600 text-center">
                <p className="font-medium">This is a digital prescription. Please present this document to your pharmacy.</p>
                <p className="mt-2">Generated on {new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={closeRx}>Close</Button>
            <Button onClick={handleDownloadPrescription}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </BaseDialogContent>
      </BaseDialog>
    </div>
  );
};

export default PatientDashboard;