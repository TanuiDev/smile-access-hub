import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Users, CreditCard, Database, LogOut, User, Search,Plus, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/Store/UserStore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl } from '@/utils/APIUrl.ts';


interface Payment {
  id: string;
  patientName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  


  

const { isLoading, error, data } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    const response = await axios.get(`${apiUrl}/auth/users`);
    return response.data.data; 
  },
});





  const payments: Payment[] = [
    { id: '1', patientName: 'John Doe', amount: 150.00, status: 'completed', date: '2024-01-15' },
    { id: '2', patientName: 'Jane Smith', amount: 200.00, status: 'pending', date: '2024-01-14' },
    { id: '3', patientName: 'Bob Wilson', amount: 175.50, status: 'completed', date: '2024-01-13' },
  ];

 const stats = {
  totalUsers: data ? data.length : 0,
  totalPatients: data ? data.filter((u) => u.role === "PATIENT").length : 0,
  totalDentists: data ? data.filter((u) => u.role === "DENTIST").length : 0,
  totalRevenue: 125000, 
  activeAppointments: 23 
};


  const handleLogout = () => {
    logout(); // Call the logout function from auth store
    toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    navigate('/login'); // Redirect to login page
  };

  const handleDeleteUser = (userId: string) => {
    toast({ title: 'User deleted', description: 'User has been removed from the system.' });
    // Add actual delete logic here
  };

  const handleUpdateUser = (userId: string) => {
    toast({ title: 'Edit user', description: 'User details updated successfully.' });
    // Add actual update logic here
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast({ title: 'Theme changed', description: `Switched to ${!isDarkMode ? 'dark' : 'light'} mode.` });
  };

 const filteredUsers = (data ?? [])
  .filter((user) =>
    `${user.firstName} ${user.lastName} ${user.emailAddress}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
  .filter((user) =>
    roleFilter === "ALL" ? true : user.role === roleFilter
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, monitor payments, and oversee system operations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/addDentist')} >
           <Plus className='mr-2 h-4 w-4' />
            Add Dentist
          </Button>
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button> 
        </div>
      </div>

      
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dentists</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDentists}</div>
            <p className="text-xs text-muted-foreground">+2 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Appointments</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAppointments}</div>
            <p className="text-xs text-muted-foreground">Today's appointments</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all users in the system</CardDescription>
              </div>
              <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border rounded-md px-2 py-1 text-sm"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="DENTIST">Dentist</option>
                <option value="PATIENT">Patient</option>
              </select>
            </div>
              
             
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
               Manage all users in the system ({filteredUsers.length} users)
            </CardDescription>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
  {isLoading && (
    <TableRow>
      <TableCell colSpan={5}>Loading users...</TableCell>
    </TableRow>
  )}
  {error && (
    <TableRow>
      <TableCell colSpan={5}>Failed to load users</TableCell>
    </TableRow>
  )}
  {!isLoading && !error && filteredUsers.length === 0 && (
    <TableRow>
      <TableCell colSpan={5}>No users found</TableCell>
    </TableRow>
  )}
  {!isLoading &&
    !error &&
    filteredUsers.map((user) => (
      <TableRow key={user.id}>
        <TableCell>
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} />
              <AvatarFallback>
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                {user.emailAddress}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge
            variant={user.role === "DENTIST" ? "default" : "secondary"}
          >
            {user.role}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant="secondary">active</Badge>
          {/* If your DB has status, replace with user.status */}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {new Date(user.createdAt).toLocaleDateString()}
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateUser(user.id)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteUser(user.id)}
            >
              <Trash2 className="h-3 w-3" />
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

      {/* Payment Overview */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Payment Overview</CardTitle>
            <CardDescription>Recent payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.patientName}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

