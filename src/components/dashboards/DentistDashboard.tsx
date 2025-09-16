import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboards/ui/card';
import { Button } from '@/components/dashboards/ui/button';
import { Input } from '@/components/dashboards/ui/input';
import { Label } from '@/components/dashboards/ui/label';
import { Textarea } from '@/components/dashboards/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/dashboards/ui/table';
import { Badge } from '@/components/dashboards/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/dashboards/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/dashboards/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/dashboards/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Calendar, Stethoscope, Video, LogOut, User, Clock, MapPin, Phone, Mail, Plus, Edit, Eye, UserCircle, Settings } from 'lucide-react';
import { useAuthStore } from '@/Store/UserStore';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiUrl } from '@/utils/APIUrl';
import axios from 'axios';
interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
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
    onError: (err: any) => {
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

  const handleStartAppointment = (appointmentId: string) => {
    toast({ title: 'Appointment started', description: 'Appointment is now in progress.' });
    // Add actual appointment start logic here
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
    const genId = (self as any).crypto?.randomUUID?.() ?? fallbackId;
    const roomId = meetingLink.trim() || genId;
    const shareUrl = `${window.location.origin}/meet/${roomId}`;
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    toast({ title: 'Meeting created', description: `Link copied. Share with patient: ${shareUrl}` });
    setMeetingLink('');
    navigate(`/meet/${roomId}`);
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

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
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
              <TableRow key={appointment.id}>
                <TableCell>
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
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {new Date(appointment.appointmentDate).toLocaleDateString()}{" "}
                      {appointment.timeSlot}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getTypeColor(appointment.appointmentType)}>
                    {appointment.appointmentType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(appointment.status.toLowerCase())}>
                    {appointment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {appointment.notes || 'No notes'}
                </TableCell>
                <TableCell>
                  {appointment.status === 'SCHEDULED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartAppointment(appointment.id)}
                    >
                      Start
                    </Button>
                  )}
                  {appointment.status === 'IN_PROGRESS' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompleteAppointment(appointment.id)}
                    >
                      Complete
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleWritePrescription({
                        id: appointment.id,
                        name: `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`,
                        email: appointment.patient.user.emailAddress,
                        phone: '',
                        lastVisit: ''
                      })
                    }
                  >
                    <Stethoscope className="h-3 w-3" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Prescription Didalog */}
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write Prescription</DialogTitle>
            <DialogDescription>
              Write a prescription for {selectedPatient?.name}
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={showProfileModal} onOpenChange={(open) => {
        setShowProfileModal(open);
        if (!open) {
          setIsEditingProfile(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Information</DialogTitle>
            <DialogDescription>Your personal and professional information</DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DentistDashboard;

