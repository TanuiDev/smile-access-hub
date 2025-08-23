import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, Stethoscope, LogOut, Settings, Calendar, FileText, CreditCard, Video, MapPin, Phone, Mail } from 'lucide-react';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import DentistDashboard from '@/components/dashboards/DentistDashboard';
import PatientDashboard from '@/components/dashboards/PatientDashboard';

// Mock user data - replace with actual authentication
const mockUser = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  role: 'ADMIN', // Change this to test different dashboards: 'ADMIN', 'DENTIST', 'PATIENT'
  avatar: 'https://avatar.vercel.sh/john',
};

const Dashboards = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentRole, setCurrentRole] = useState(mockUser.role);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // Extract role from URL path
  useEffect(() => {
    const pathRole = location.pathname.split('/').pop()?.toUpperCase();
    if (pathRole && ['ADMIN', 'DENTIST', 'PATIENT'].includes(pathRole)) {
      setCurrentRole(pathRole);
    }
  }, [location]);

  const handleLogout = () => {
    toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    navigate('/');
  };

  const handleRoleChange = (newRole: string) => {
    setCurrentRole(newRole);
    navigate(`/dashboard/${newRole.toLowerCase()}`);
    setShowRoleSelector(false);
    toast({ title: 'Role changed', description: `Switched to ${newRole} dashboard.` });
  };

  const getDashboardTitle = () => {
    switch (currentRole) {
      case 'ADMIN': return 'Admin Dashboard';
      case 'DENTIST': return 'Dentist Dashboard';
      case 'PATIENT': return 'Patient Dashboard';
      default: return 'Dashboard';
    }
  };

  const getDashboardDescription = () => {
    switch (currentRole) {
      case 'ADMIN': return 'Manage users, monitor payments, and oversee system operations';
      case 'DENTIST': return 'Manage appointments, write prescriptions, and create virtual meetings';
      case 'PATIENT': return 'Schedule appointments, view prescriptions, and manage your dental care';
      default: return 'Welcome to your dashboard';
    }
  };

  const renderDashboard = () => {
    switch (currentRole) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'DENTIST':
        return <DentistDashboard />;
      case 'PATIENT':
        return <PatientDashboard />;
      default:
        return <RoleSelector onRoleSelect={handleRoleChange} />;
    }
  };

  // Role selector component for initial role selection
  const RoleSelector = ({ onRoleSelect }: { onRoleSelect: (role: string) => void }) => (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Welcome to DentaLink</h1>
          <p className="mt-2 text-muted-foreground">Please select your role to access the appropriate dashboard</p>
        </div>

        {/* User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Current user details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback>{mockUser.firstName[0]}{mockUser.lastName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{mockUser.firstName} {mockUser.lastName}</h3>
                <p className="text-muted-foreground">{mockUser.email}</p>
                <Badge variant="outline" className="mt-2">{mockUser.role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Selection */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onRoleSelect('ADMIN')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Admin</CardTitle>
              <CardDescription>System administration and user management</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Manage all users</li>
                <li>• Monitor payments</li>
                <li>• System oversight</li>
                <li>• Database management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onRoleSelect('DENTIST')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Dentist</CardTitle>
              <CardDescription>Patient care and appointment management</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Manage appointments</li>
                <li>• Write prescriptions</li>
                <li>• Virtual meetings</li>
                <li>• Patient records</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onRoleSelect('PATIENT')}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Patient</CardTitle>
              <CardDescription>Appointment scheduling and care management</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Schedule appointments</li>
                <li>• View prescriptions</li>
                <li>• Medical history</li>
                <li>• Virtual visits</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );

  // If role is selected, show the appropriate dashboard
  if (currentRole && ['ADMIN', 'DENTIST', 'PATIENT'].includes(currentRole)) {
    return (
      <div className="min-h-screen bg-background">
        {/* Top Navigation Bar */}
        <div className="border-b bg-card">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary" />
                <span className="font-semibold">DentaLink</span>
              </div>
              <Badge variant="outline">{currentRole}</Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => setShowRoleSelector(true)}>
                Switch Role
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {renderDashboard()}

        {/* Role Switcher Dialog */}
        {showRoleSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Switch Dashboard Role</h3>
              <div className="space-y-3">
                {['ADMIN', 'DENTIST', 'PATIENT'].map((role) => (
                  <Button
                    key={role}
                    variant={currentRole === role ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleRoleChange(role)}
                  >
                    {role === 'ADMIN' && <Shield className="mr-2 h-4 w-4" />}
                    {role === 'DENTIST' && <Stethoscope className="mr-2 h-4 w-4" />}
                    {role === 'PATIENT' && <User className="mr-2 h-4 w-4" />}
                    {role}
                  </Button>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setShowRoleSelector(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show role selector if no role is selected
  return <RoleSelector onRoleSelect={handleRoleChange} />;
};

export default Dashboards;
