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
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Calendar as CalendarIcon, Clock, MapPin, Phone, Mail, LogOut, User, Stethoscope, FileText, CreditCard, Settings, Plus, Video, Edit } from 'lucide-react';

interface Appointment {
  id: string;
  date: string;
  time: string;
  dentistName: string;
  type: 'consultation' | 'follow-up' | 'emergency' | 'cleaning';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

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

  // Mock data - replace with actual API calls
  const appointments: Appointment[] = [
    { id: '1', date: '2024-01-20', time: '10:00 AM', dentistName: 'Dr. Sarah Smith', type: 'consultation', status: 'confirmed', notes: 'Regular checkup' },
    { id: '2', date: '2024-01-25', time: '02:30 PM', dentistName: 'Dr. Mike Johnson', type: 'cleaning', status: 'scheduled', notes: 'Deep cleaning session' },
    { id: '3', date: '2024-01-30', time: '09:00 AM', dentistName: 'Dr. Sarah Smith', type: 'follow-up', status: 'scheduled', notes: 'Post-treatment review' },
  ];

  const prescriptions: Prescription[] = [
    { id: '1', date: '2024-01-10', dentistName: 'Dr. Sarah Smith', medication: 'Amoxicillin', dosage: '500mg', instructions: 'Take 3 times daily with meals', refills: 1 },
    { id: '2', date: '2024-01-05', dentistName: 'Dr. Mike Johnson', medication: 'Ibuprofen', dosage: '400mg', instructions: 'Take as needed for pain', refills: 0 },
  ];

  const medicalRecords: MedicalRecord[] = [
    { id: '1', date: '2024-01-10', procedure: 'Root Canal', dentistName: 'Dr. Sarah Smith', notes: 'Completed successfully, follow-up in 2 weeks', cost: 1200.00 },
    { id: '2', date: '2024-01-05', procedure: 'Dental Cleaning', dentistName: 'Dr. Mike Johnson', notes: 'Regular cleaning, no issues found', cost: 150.00 },
    { id: '3', date: '2023-12-20', procedure: 'Cavity Filling', dentistName: 'Dr. Sarah Smith', notes: 'Small cavity filled, no complications', cost: 200.00 },
  ];

  const patientInfo = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Main St, City, State',
    dateOfBirth: '1990-01-01',
    insurance: 'Blue Cross Blue Shield',
    emergencyContact: 'Jane Doe (+1234567891)',
  };

  const stats = {
    upcomingAppointments: 3,
    totalVisits: 12,
    totalSpent: 1550.00,
    prescriptions: 2,
  };

  const handleLogout = () => {
    toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    // Add actual logout logic here
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {patientInfo.name}. Manage your dental care journey.</p>
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
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                        <span>{appointment.date}</span>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{appointment.time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{appointment.dentistName}</TableCell>
                    <TableCell>
                      <Badge variant={getTypeColor(appointment.type)}>
                        {appointment.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {appointment.status === 'confirmed' && (
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
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Information</DialogTitle>
            <DialogDescription>Your personal and medical information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={patientInfo.name} readOnly />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={patientInfo.email} readOnly />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={patientInfo.phone} readOnly />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input value={patientInfo.dateOfBirth} readOnly />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={patientInfo.address} readOnly />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Insurance</Label>
                <Input value={patientInfo.insurance} readOnly />
              </div>
              <div>
                <Label>Emergency Contact</Label>
                <Input value={patientInfo.emergencyContact} readOnly />
              </div>
            </div>
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

