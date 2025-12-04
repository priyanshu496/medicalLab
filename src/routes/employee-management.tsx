import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { AlertCircle, CheckCircle2, Edit2, Home, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUser, deleteUser, getAllUsers, getAvailableRoles } from '@/routes/api/users';

export const Route = createFileRoute('/employee-management')({
  component: EmployeeManagement,
});

function EmployeeManagement() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const createUserFn = useServerFn(createUser);
  const getAllUsersFn = useServerFn(getAllUsers);
  const deleteUserFn = useServerFn(deleteUser);
  const getRolesFn = useServerFn(getAvailableRoles);

  const userSchema = z.object({
    userId: z.string().min(1, 'Login ID is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phoneNumber: z.string().optional(),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate({ to: '/login' });
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== 'master') {
      navigate({ to: '/dashboard/' + user.role });
      return;
    }

    setCurrentUser(user);
    loadData(user);
  }, [navigate]);

  const loadData = async (user: any) => {
    try {
      setLoading(true);
      const [usersResult, rolesResult] = await Promise.all([
        getAllUsersFn({ labInfoId: user.labInfo.id }),
        getRolesFn(),
      ]);
      setEmployees(usersResult.users || []);
      setRoles(rolesResult.roles || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    try {
      setError(null);
      setSuccess(false);

      const roleId = parseInt(selectedRole);
      const result = await createUserFn({
        data: {
          ...data,
          roleId,
          labInfoId: currentUser.labInfo.id,
        },
      });

      if (result.success) {
        setSuccess(true);
        reset();
        setSelectedRole('');
        await loadData(currentUser);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create employee');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteUserFn({ data: { id: userId } });
        await loadData(currentUser);
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete employee');
      }
    }
  };

  if (!currentUser) {
    return null;
  }

  const getRoleName = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    return role?.roleName || 'Unknown';
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'master':
        return 'bg-purple-100 text-purple-700';
      case 'cashier':
        return 'bg-cyan-100 text-cyan-700';
      case 'lab_technician':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
              <p className="text-gray-600">Manage users, roles, and permissions</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate({ to: '/dashboard/master' })} 
            variant="outline"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="shadow-2xl border-0 overflow-hidden sticky top-8">
              <CardHeader className="bg-linear-to-r from-purple-600 to-pink-500 text-white">
                <CardTitle className="text-xl">Add New Employee</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {success && (
                  <Alert className="border-green-300 bg-green-50 shadow-md mb-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-800 ml-2">
                      Employee added!
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert className="border-red-300 bg-red-50 shadow-md mb-4">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <AlertDescription className="text-red-800 ml-2">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-900 font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      {...register('fullName')} 
                      placeholder="John Doe" 
                      className="bg-white border-2 text-sm"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-600">{errors.fullName.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 font-medium">
                      Login ID <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      {...register('userId')} 
                      placeholder="john.doe" 
                      className="bg-white border-2 text-sm"
                    />
                    {errors.userId && (
                      <p className="text-xs text-red-600">{errors.userId.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 font-medium">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      {...register('password')} 
                      type="password"
                      placeholder="••••••••" 
                      className="bg-white border-2 text-sm"
                    />
                    {errors.password && (
                      <p className="text-xs text-red-600">{errors.password.message as string}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 font-medium">
                      Role <span className="text-red-500">*</span>
                    </Label>
                    {roles && roles.length > 0 ? (
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="bg-white border-2 text-sm">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1).replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2 bg-gray-100 text-gray-600 rounded text-sm">
                        {loading ? 'Loading roles...' : 'No roles available'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 font-medium">Email (Optional)</Label>
                    <Input 
                      {...register('email')} 
                      type="email"
                      placeholder="john@lab.com" 
                      className="bg-white border-2 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 font-medium">Phone (Optional)</Label>
                    <Input 
                      {...register('phoneNumber')} 
                      placeholder="9876543210" 
                      className="bg-white border-2 text-sm"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-linear-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-lg text-sm"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Employee'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Employees List Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 overflow-hidden">
              <CardHeader className="bg-linear-to-r from-blue-600 to-cyan-500 text-white">
                <CardTitle className="text-xl">Registered Employees</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading employees...</p>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No employees added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {employees.map((emp) => (
                      <div
                        key={emp.id}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900">{emp.fullName}</h4>
                            <p className="text-sm text-gray-600">@{emp.userId}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(emp.role?.roleName || '')}`}>
                            {emp.role?.roleName?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <p className="text-gray-600">Email:</p>
                            <p className="font-semibold text-gray-900">{emp.email || '-'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Phone:</p>
                            <p className="font-semibold text-gray-900">{emp.phoneNumber || '-'}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs"
                            disabled
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteUser(emp.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Role Info */}
        <div className="mt-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-linear-to-r from-blue-50 to-cyan-50">
              <CardTitle className="text-lg">Role Descriptions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border-2 border-purple-200 rounded-lg">
                  <h4 className="font-bold text-purple-900 mb-2">Master Administrator</h4>
                  <p className="text-sm text-gray-700">Full system access. Can manage all features including employees, configuration, and billing.</p>
                </div>
                <div className="p-4 border-2 border-cyan-200 rounded-lg">
                  <h4 className="font-bold text-cyan-900 mb-2">Cashier</h4>
                  <p className="text-sm text-gray-700">Handles billing and payment processing. Access to bills, invoices, and payment management.</p>
                </div>
                <div className="p-4 border-2 border-teal-200 rounded-lg">
                  <h4 className="font-bold text-teal-900 mb-2">Lab Technician</h4>
                  <p className="text-sm text-gray-700">Manages test booth and results entry. Can record samples and enter test results.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
