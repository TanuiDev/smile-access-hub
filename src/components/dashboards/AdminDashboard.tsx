import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboards/ui/card';
import { Button } from '@/components/dashboards/ui/button';
import { Input } from '@/components/dashboards/ui/input';
import { Label } from '@/components/dashboards/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/dashboards/ui/table';
import { Badge } from '@/components/dashboards/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/dashboards/ui/avatar';
import { ConfirmationDialog } from '@/components/dashboards/ui/ConfirmationDialog';
import { useToast } from '@/hooks/use-toast';
import { Moon, Sun, Users, CreditCard, Database, LogOut, User, Search,Plus, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/Store/UserStore';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl } from '@/utils/APIUrl.ts';


interface Payment {
  id: string;
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
  accountReference?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    role: string;
  };
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; role: string; name: string } | null>(null);
  
  
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("ALL");
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  


  

const { isLoading, error, data, refetch } = useQuery({
  queryKey: ["users"],
  queryFn: async () => {
    const response = await axios.get(`${apiUrl}/auth/users`);
    return response.data.data; 
  },
});

// Fetch payments data
const { 
  isLoading: paymentsLoading, 
  error: paymentsError, 
  data: paymentsData, 
  refetch: refetchPayments 
} = useQuery({
  queryKey: ["payments", paymentStatusFilter, paymentSearchTerm],
  queryFn: async () => {
    const params = new URLSearchParams();
    if (paymentStatusFilter !== "ALL") {
      params.append('status', paymentStatusFilter);
    }
    if (paymentSearchTerm) {
      params.append('search', paymentSearchTerm);
    }
    params.append('limit', '100'); // Get more payments for better overview
    
    const response = await axios.get(`${apiUrl}/payments?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data.data; 
  },
});

// Fetch payment statistics
const { 
  data: paymentStats, 
  refetch: refetchPaymentStats 
} = useQuery({
  queryKey: ["paymentStats"],
  queryFn: async () => {
    const response = await axios.get(`${apiUrl}/payments/stats`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data.data; 
  },
});





 const stats = {
  totalUsers: data ? data.length : 0,
  totalPatients: data ? data.filter((u) => u.role === "PATIENT").length : 0,
  totalDentists: data ? data.filter((u) => u.role === "DENTIST").length : 0,
  totalRevenue: paymentStats?.financial?.totalRevenue || 0, 
  activeAppointments: 23, // TODO: Fetch from appointments API
  totalPayments: paymentStats?.overview?.totalPayments || 0,
  successfulPayments: paymentStats?.overview?.successfulPayments || 0,
  pendingPayments: paymentStats?.overview?.pendingPayments || 0,
  failedPayments: paymentStats?.overview?.failedPayments || 0
};


  const handleLogout = () => {
    logout(); // Call the logout function from auth store
    toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    navigate('/login'); // Redirect to login page
  };

  const currentUser = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);

  const handleDeleteUser = (user: { id: string; role: string; name: string }) => {
    if (currentUser?.id === user.id) {
      toast({ title: 'Action not allowed', description: 'You cannot delete your own account.', variant: 'destructive' });
      return;
    }

    if (user.role === 'ADMIN') {
      toast({ title: 'Action not allowed', description: 'You cannot delete admin users.', variant: 'destructive' });
      return;
    }

    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await axios.delete(`${apiUrl}/auth/delete-user/${userToDelete.id}` , {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      toast({ title: 'User deleted', description: 'User has been removed from the system.' });
      await refetch();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error:any) {
      const message = error?.response?.data?.message || 'Failed to delete user';
      toast({ title: 'Deletion failed', description: message, variant: 'destructive' });
    } finally {
      setUserToDelete(null);
    }
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

      
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
            <div className="text-2xl font-bold">KSH{stats.totalRevenue.toLocaleString()}</div>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.successfulPayments} successful, {stats.pendingPayments} pending
            </p>
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
              onClick={() => handleDeleteUser({ 
                id: user.id, 
                role: user.role, 
                name: `${user.firstName} ${user.lastName}` 
              })}
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Payment Overview</CardTitle>
                <CardDescription>Recent payment transactions ({paymentsData?.length || 0} payments)</CardDescription>
              </div>
              <div className="flex w-full max-w-md items-center space-x-2">
                <Input
                  placeholder="Search payments..."
                  value={paymentSearchTerm}
                  onChange={(e) => setPaymentSearchTerm(e.target.value)}
                />
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  <option value="ALL">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    try {
                      const params = new URLSearchParams();
                      if (paymentStatusFilter !== "ALL") {
                        params.append('status', paymentStatusFilter);
                      }
                      if (paymentSearchTerm) {
                        params.append('search', paymentSearchTerm);
                      }
                      params.append('format', 'csv');
                      
                      const response = await axios.get(`${apiUrl}/payments/reports/generate?${params.toString()}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                      });
                      
                      // Create and download CSV
                      const blob = new Blob([response.data], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `payment-report-${new Date().toISOString().split('T')[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                      
                      toast({ title: 'Report generated', description: 'Payment report has been downloaded successfully.' });
                    } catch (error) {
                      toast({ 
                        title: 'Report generation failed', 
                        description: 'Failed to generate payment report.', 
                        variant: 'destructive' 
                      });
                    }
                  }}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt Number</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsLoading && (
                  <TableRow>
                    <TableCell colSpan={5}>Loading payments...</TableCell>
                  </TableRow>
                )}
                {paymentsError && (
                  <TableRow>
                    <TableCell colSpan={5}>Failed to load payments</TableCell>
                  </TableRow>
                )}
                {!paymentsLoading && !paymentsError && (!paymentsData || paymentsData.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5}>No payments found</TableCell>
                  </TableRow>
                )}
                {!paymentsLoading &&
                  !paymentsError &&
                  paymentsData?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.user 
                          ? `${payment.user.firstName} ${payment.user.lastName}`
                          : 'Unknown User'
                        }
                      </TableCell>
                      <TableCell>KSh {Number(payment.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          payment.status === 'SUCCESS' ? 'default' : 
                          payment.status === 'PENDING' ? 'secondary' : 
                          'destructive'
                        }>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.mpesaReceiptNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone and will permanently remove the user from the system.`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
};

export default AdminDashboard;

