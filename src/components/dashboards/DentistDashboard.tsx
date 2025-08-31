import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Calendar, Stethoscope, Video, LogOut, User, Clock, MapPin, Phone, Mail, Plus, Edit, Eye } from 'lucide-react';
import { useAuthStore } from '@/Store/UserStore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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

  const { isLoading, error, data } = useQuery({
    queryKey: ['patientData'],  
  
    
    queryFn: async () => {   
  
      const response = await axios.get(`${apiUrl}/appointments/my-appointments`);
      console.log(response.data);
      return response.data;
    },
  });
  
  const appointments: Appointment[] = [
    { id: '1', patientName: 'John Doe', patientEmail: 'john@example.com', date: '2024-01-15', time: '09:00 AM', type: 'consultation', status: 'scheduled', notes: 'Regular checkup' },
    { id: '2', patientName: 'Jane Smith', patientEmail: 'jane@example.com', date: '2024-01-15', time: '10:30 AM', type: 'follow-up', status: 'in-progress', notes: 'Post-treatment follow-up' },
    { id: '3', patientName: 'Mike Johnson', patientEmail: 'mike@example.com', date: '2024-01-15', time: '02:00 PM', type: 'emergency', status: 'scheduled', notes: 'Tooth pain' },
  ];

  const patients: Patient[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', lastVisit: '2024-01-10', nextAppointment: '2024-01-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', lastVisit: '2024-01-08', nextAppointment: '2024-01-20' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '+1234567892', lastVisit: '2024-01-05', nextAppointment: '2024-01-15' },
  ];

  const stats = {
    todayAppointments: 5,
    totalPatients: 45,
    completedToday: 2,
    pendingAppointments: 3,
  };

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
    // Add actual appointment completion logic here
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
    if (!meetingLink.trim()) {
      toast({ title: 'Error', description: 'Please enter a meeting link.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Meeting created', description: 'Virtual meeting link has been created and shared.' });
    setMeetingLink('');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast({ title: 'Theme changed', description: `Switched to ${!isDarkMode ? 'dark' : 'light'} mode.` });
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

      {/* Prescription Dialog */}
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
    </div>
  );
};

export default DentistDashboard;

