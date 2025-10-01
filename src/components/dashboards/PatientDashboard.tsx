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
import { Moon, Sun, Calendar as CalendarIcon, Clock, FileText, CreditCard, Settings, Plus, Video, Edit, LogOut, User, Stethoscope, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/Store/UserStore';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl } from '@/utils/APIUrl.ts';

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

  // Virtual visit join state
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinRoomInput, setJoinRoomInput] = useState('');

  // const prescriptions: Prescription[] = [
  //   { id: '1', date: '2024-01-10', dentistName: 'Dr. Sarah Smith', medication: 'Amoxicillin', dosage: '500mg', instructions: 'Take 3 times daily with meals', refills: 1 },
  //   { id: '2', date: '2024-01-05', dentistName: 'Dr. Mike Johnson', medication: 'Ibuprofen', dosage: '400mg', instructions: 'Take as needed for pain', refills: 0 },
  // ];

  // const medicalRecords: MedicalRecord[] = [
  //   { id: '1', date: '2024-01-10', procedure: 'Root Canal', dentistName: 'Dr. Sarah Smith', notes: 'Completed successfully, follow-up in 2 weeks', cost: 1200.00 },
  //   { id: '2', date: '2024-01-05', procedure: 'Dental Cleaning', dentistName: 'Dr. Mike Johnson', notes: 'Regular cleaning, no issues found', cost: 150.00 },
  //   { id: '3', date: '2023-12-20', procedure: 'Cavity Filling', dentistName: 'Dr. Sarah Smith', notes: 'Small cavity filled, no complications', cost: 200.00 },
  // ];

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
      console.log('Update profile payload:', requestPayload); // Debug log
      const response = await axios.patch(`${apiUrl}/auth/update-profile`, requestPayload);
      console.log('Update profile response:', response.data); // Debug log
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditingProfile(false);
      setShowProfileDialog(false);
      toast({ title: 'Profile updated', description: 'Your profile was updated successfully.' });
    },
    onError: (err) => {
      console.error('Update profile error:', err); // Debug log
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
      console.log('Appointments fetch response:', response.data); // Debug log
      return response.data;
    },
  });

  // Real stats from data
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
  const [selectedRx, setSelectedRx] = React.useState<any | null>(null);
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
      // Error is handled in onError callback
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
    onError: (err: any) => {
      toast({ title: 'Deletion failed', description: err?.message || 'Could not delete profile.', variant: 'destructive' });
    }
  });

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your profile? This action can be reverted only by an admin.');
    if (!confirmed) return;
    try {
      await deleteProfileMutation.mutateAsync();
    } catch (_) {}
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
    // Add actual cancellation logic here
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

      {/* Quick Actions */}
      <div className="mb-8">
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
                  <TableRow key={appointment.id} onClick={() => openDetails(appointment)} className="cursor-pointer hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{appointment.timeSlot}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {appointment.dentist?.user?.firstName} {appointment.dentist?.user?.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(appointment.appointmentType.toLowerCase())}>
                        {appointment.appointmentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(appointment.status.toLowerCase())}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {appointment.status === 'CONFIRMED' && appointment.videoChatLink && (
                          <>
                            <Button asChild size="sm">
                              <a href={appointment.videoChatLink} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" /> Join
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(appointment.videoChatLink)}>Copy Link</Button>
                          </>
                        )}
                        {!appointment.videoChatLink && appointment.status === 'CONFIRMED' && (
                          <span className="text-xs text-muted-foreground">Link will appear here when your dentist shares it.</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {appointment.notes || 'No notes'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {appointment.status === 'CONFIRMED' && (
                          <Button variant="outline" size="sm" onClick={() => setShowJoinDialog(true)}>
                            <Video className="h-3 w-3" />
                            Join via Link
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleCancelAppointment(appointment.id)}>
                          Cancel
                        </Button>
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
            <div className="space-y-4">
              {prescriptionList.map((prescription) => (
                <div
                  key={prescription.id}
                  className="flex flex-col p-4 border rounded-lg space-y-3 cursor-pointer hover:bg-muted/30"
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
                      <div key={med.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{med.medicationName}</span>
                          <Badge variant="outline">{med.dosage}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
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
              {detailsAppt?.videoChatLink ? (
                <Button onClick={joinFromDetails}>Join Meeting</Button>
              ) : (
                <span className="text-xs text-muted-foreground">Your join link will appear here once shared by your dentist.</span>
              )}
              <Button variant="outline" onClick={closeDetails}>Close</Button>
            </div>
          </div>
        </BaseDialogContent>
      </BaseDialog>

      <BaseDialog open={!!selectedRx} onOpenChange={(open) => (open ? null : closeRx())}>
        <BaseDialogContent className="max-w-2xl">
          <BaseDialogHeader>
            <BaseDialogTitle>Prescription Details</BaseDialogTitle>
            <BaseDialogDescription>
              {selectedRx?.appointment?.dentist?.user?.firstName} {selectedRx?.appointment?.dentist?.user?.lastName} • {selectedRx?.prescriptionNumber}
            </BaseDialogDescription>
          </BaseDialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Issued on:</span> {selectedRx?.issueDate ? new Date(selectedRx.issueDate).toLocaleDateString() : '—'}
            </div>
            <div>
              <span className="text-muted-foreground">Expires on:</span> {selectedRx?.expiryDate ? new Date(selectedRx.expiryDate).toLocaleDateString() : '—'}
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span> {selectedRx?.status}
            </div>
            <div>
              <span className="text-muted-foreground">Diagnosis:</span> {selectedRx?.diagnosis || '—'}
            </div>
            <div>
              <span className="text-muted-foreground">Notes:</span> {selectedRx?.notes || '—'}
            </div>
            <div>
              <span className="text-muted-foreground">Medications:</span>
              <div className="mt-2 space-y-2">
                {selectedRx?.medications?.map((m: any) => (
                  <div key={m.id} className="border rounded p-2 flex items-start justify-between">
                    <div>
                      <div className="font-medium">{m.medicationName}</div>
                      <div className="text-xs text-muted-foreground">{m.dosage} • {m.frequency} • {m.duration}</div>
                      {m.instructions && (
                        <div className="text-xs">Instructions: {m.instructions}</div>
                      )}
                    </div>
                    <div className="text-sm">Qty: {m.quantity}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={closeRx}>Close</Button>
            </div>
          </div>
        </BaseDialogContent>
      </BaseDialog>
    </div>
  );
};

export default PatientDashboard;