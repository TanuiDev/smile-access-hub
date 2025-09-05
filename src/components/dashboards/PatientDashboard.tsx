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
import { Calendar } from '@/components/dashboards/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Calendar as CalendarIcon, Clock, MapPin, Phone, Mail, LogOut, User, Stethoscope, FileText, CreditCard, Settings, Plus, Video, Edit } from 'lucide-react';
import { useAuthStore } from '@/Store/UserStore';
import { useNavigate } from 'react-router-dom';
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
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [appointmentType, setAppointmentType] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
   const logout = useAuthStore(state => state.logout);
const navigate = useNavigate();
 

  const prescriptions: Prescription[] = [
    { id: '1', date: '2024-01-10', dentistName: 'Dr. Sarah Smith', medication: 'Amoxicillin', dosage: '500mg', instructions: 'Take 3 times daily with meals', refills: 1 },
    { id: '2', date: '2024-01-05', dentistName: 'Dr. Mike Johnson', medication: 'Ibuprofen', dosage: '400mg', instructions: 'Take as needed for pain', refills: 0 },
  ];

  const medicalRecords: MedicalRecord[] = [
    { id: '1', date: '2024-01-10', procedure: 'Root Canal', dentistName: 'Dr. Sarah Smith', notes: 'Completed successfully, follow-up in 2 weeks', cost: 1200.00 },
    { id: '2', date: '2024-01-05', procedure: 'Dental Cleaning', dentistName: 'Dr. Mike Johnson', notes: 'Regular cleaning, no issues found', cost: 150.00 },
    { id: '3', date: '2023-12-20', procedure: 'Cavity Filling', dentistName: 'Dr. Sarah Smith', notes: 'Small cavity filled, no complications', cost: 200.00 },
  ];

  const { user } = useAuthStore(state => state);
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
  });

  const {
    isLoading: isProfileLoading,
    error: profileError,
    data: profileResponse,
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}/auth/profile`);
      console.log(response.data);
      return response.data;
    },
    enabled: true,
  });

  const profile = profileResponse?.data;

  React.useEffect(() => {
    if (showProfileDialog && profile) {
      setEditForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phoneNumber: profile.phoneNumber ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
        state: profile.state ?? '',
      });
    }
  }, [showProfileDialog, profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: typeof editForm) => {
      const response = await axios.put(`${apiUrl}/auth/update-profile`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditingProfile(false);
    },
  });

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(editForm);
      toast({ title: 'Profile updated', description: 'Your profile was updated successfully.' });
    } catch (err) {
      toast({ title: 'Update failed', description: 'Could not update profile.', variant: 'destructive' });
    }
  };

  const stats = {
    upcomingAppointments: 3,
    totalVisits: 12,
    totalSpent: 1550.00,
    prescriptions: 2,
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

  const handleJoinMeeting = (appointmentId: string) => {
    toast({ title: 'Joining meeting', description: 'Redirecting to virtual consultation...' });
    // Add actual meeting join logic here
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast({ title: 'Theme changed', description: `Switched to ${!isDarkMode ? 'dark' : 'light'} mode.` });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'secondary';
      case 'confirmed': return 'default'; 
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
      case 'cleaning': return 'outline';
      default: return 'secondary';
    }
  };


  const { isLoading, error, data } = useQuery({
  queryKey: ['patientData'],


  
  queryFn: async () => {   

    const response = await axios.get(`${apiUrl}/appointments/my-appointments`);    
    return response.data;
  },
});


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
            <p className="text-xs text-muted-foreground">Dental visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">On dental care</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prescriptions}</div>
            <p className="text-xs text-muted-foreground">Active prescriptions</p>
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
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                  <DialogDescription>Choose your preferred date and appointment type</DialogDescription>
                </DialogHeader>
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
              </DialogContent>
            </Dialog>

            <Button variant="outline">
              <Video className="mr-2 h-4 w-4" />
              Join Virtual Visit
            </Button>
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
    <TableRow key={appointment.id}>
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
        <div className="flex items-center space-x-2">
          {appointment.status === 'CONFIRMED' && (
            <Button variant="outline" size="sm" onClick={() => handleJoinMeeting(appointment.id)}>
              <Video className="h-3 w-3" />
              Join
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
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{prescription.medication}</span>
                      <Badge variant="outline">{prescription.dosage}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Instructions: {prescription.instructions}</p>
                      <p>Refills: {prescription.refills} remaining</p>
                      <p>Prescribed by: {prescription.dentistName} on {prescription.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={(open) => { setShowProfileDialog(open); if (!open) { setIsEditingProfile(false); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Information</DialogTitle>
            <DialogDescription>Your personal and medical information</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            {!isEditingProfile ? (
              <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setIsEditingProfile(false); if (profile) { setEditForm({ firstName: profile.firstName ?? '', lastName: profile.lastName ?? '', phoneNumber: profile.phoneNumber ?? '', address: profile.address ?? '', city: profile.city ?? '', state: profile.state ?? '' }); } }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                {isEditingProfile ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Input name="firstName" placeholder="First name" value={editForm.firstName} onChange={handleEditChange} />
                    <Input name="lastName" placeholder="Last name" value={editForm.lastName} onChange={handleEditChange} />
                  </div>
                ) : (
                  <Input value={`${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim()} readOnly />
                )}
              </div>
              <div>
                <Label>Email</Label>
                <Input value={profile?.emailAddress ?? ''} readOnly />
              </div>
              <div>
                <Label>Phone</Label>
                {isEditingProfile ? (
                  <Input name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} />
                ) : (
                  <Input value={profile?.phoneNumber ?? ''} readOnly />
                )}
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0,10) : ''} readOnly />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              {isEditingProfile ? (
                <div className="grid grid-cols-3 gap-2">
                  <Input name="address" placeholder="Street address" value={editForm.address} onChange={handleEditChange} />
                  <Input name="city" placeholder="City" value={editForm.city} onChange={handleEditChange} />
                  <Input name="state" placeholder="State" value={editForm.state} onChange={handleEditChange} />
                </div>
              ) : (
                <Input value={[profile?.address, profile?.city, profile?.state].filter(Boolean).join(', ')} readOnly />
              )}
            </div>
            {user?.role === 'PATIENT' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Insurance Provider</Label>
                  <Input value={profile?.patient?.insuranceProvider ?? ''} readOnly />
                </div>
                <div>
                  <Label>Insurance Number</Label>
                  <Input value={profile?.patient?.insuranceNumber ?? ''} readOnly />
                </div>
                <div>
                  <Label>Emergency Contact</Label>
                  <Input value={profile?.patient?.emergencyContact ?? ''} readOnly />
                </div>
                <div>
                  <Label>Allergies</Label>
                  <Input value={Array.isArray(profile?.patient?.allergies) ? profile?.patient?.allergies.join(', ') : (profile?.patient?.allergies ?? '')} readOnly />
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientDashboard;

