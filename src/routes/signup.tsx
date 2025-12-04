import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { AlertCircle, Lock, User, Mail, Phone, ArrowLeft, Building2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createUser, getAvailableRoles } from '@/routes/api/users';
import { getMainLabInfo } from '@/routes/api/lab-info';

export const Route = createFileRoute('/signup')({
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    userId: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [labInfoId, setLabInfoId] = useState<number | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  const createUserFn = useServerFn(createUser);
  const getRolesFn = useServerFn(getAvailableRoles);
  const getLabInfoFn = useServerFn(getMainLabInfo);

  // Check if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const role = user.role?.toLowerCase() || 'master';
      navigate({ to: `/dashboard/${role}` });
    }
  }, [navigate]);

  // Load lab info and roles
  useEffect(() => {
    const loadData = async () => {
      try {
        const labResponse = await getLabInfoFn();
        console.log('Lab response:', labResponse);
        if (labResponse.success && labResponse.labInfo) {
          setLabInfoId(labResponse.labInfo.id);
        } else {
          setError('Lab information not configured. Please contact administrator to set up the lab first.');
          return;
        }

        const rolesResponse = await getRolesFn();
        console.log('Roles response:', rolesResponse);
        
        if (rolesResponse.roles && Array.isArray(rolesResponse.roles)) {
          // Use all roles (including master)
          const filteredRoles = rolesResponse.roles;
          console.log('Available roles:', filteredRoles);
          setRoles(filteredRoles);
          // Set default role to first role
          if (filteredRoles.length > 0) {
            setSelectedRole(filteredRoles[0].id);
          } else {
            setError('No roles available for signup. Please contact administrator.');
          }
        } else {
          console.error('Invalid roles response:', rolesResponse);
          setError('Failed to load roles. Please contact administrator.');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load signup data. Please try again later.');
      }
    };

    loadData();
  }, []);

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.userId.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.userId.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (formData.phoneNumber.length < 10) {
      setError('Phone number must be at least 10 digits');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!selectedRole) {
      setError('Please select a role');
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    if (!labInfoId) {
      setError('Lab configuration not found. Please contact administrator.');
      return;
    }

    try {
      setLoading(true);

      const response = await createUserFn({
        data: {
          userId: formData.userId.trim(),
          password: formData.password,
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          roleId: selectedRole!,
          labInfoId: labInfoId,
          permissions: [],
        },
      });

      if (!response.success) {
        setError('Failed to create account. Please try again.');
        return;
      }

      setSuccess('Account created successfully! Redirecting to login...');
      
      // Clear form
      setFormData({
        fullName: '',
        userId: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate({ to: '/login' });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-linear-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NextGenLab</h1>
          <p className="text-gray-600">Create Your Account</p>
        </div>

        {/* Signup Card */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-linear-to-r from-green-600 to-emerald-500 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Sign Up
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {error && (
              <Alert className="border-red-300 bg-red-50 mb-6">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800 ml-2">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-300 bg-green-50 mb-6">
                <AlertCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 ml-2">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-900 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="bg-white border-2 focus:border-green-600"
                  disabled={loading}
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-gray-900 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Username
                </Label>
                <Input
                  id="userId"
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  placeholder="Choose a username (min 3 characters)"
                  className="bg-white border-2 focus:border-green-600"
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="bg-white border-2 focus:border-green-600"
                  disabled={loading}
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-gray-900 font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-600" />
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="bg-white border-2 focus:border-green-600"
                  disabled={loading}
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-900 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  Role
                </Label>
                <select
                  id="role"
                  value={selectedRole || ''}
                  onChange={(e) => setSelectedRole(Number(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none bg-white disabled:bg-gray-100"
                  disabled={loading || roles.length === 0}
                >
                  <option value="">
                    {roles.length === 0 ? 'Loading roles...' : 'Select a role'}
                  </option>
                  {roles.map((role: any) => (
                    <option key={role.id} value={role.id}>
                      {role.roleName === 'lab_technician' ? 'Lab Technician' : role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password (min 6 characters)"
                  className="bg-white border-2 focus:border-green-600"
                  disabled={loading}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-900 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className="bg-white border-2 focus:border-green-600"
                  disabled={loading}
                />
              </div>

              {/* Signup Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 mt-6"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-3">Already have an account?</p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>

            {/* Info Box */}
            <div className="mt-4 bg-blue-50 rounded-lg p-3 text-xs text-gray-700">
              <p className="font-semibold mb-1">Note:</p>
              <p>You can sign up as any available role: Master, Cashier, or Lab Technician.</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            For support, contact: <span className="font-semibold">support@nextgenlab.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}