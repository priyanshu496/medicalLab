import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { AlertCircle, Lock, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginUser } from '@/routes/api/users';

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginFn = useServerFn(loginUser);

  // Check if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      navigate({ to: '/dashboard' });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const response = await loginFn({
        data: {
          userId: userId.trim(),
          password: password.trim(),
        },
      });

      if (!response.success) {
        setError(response.message || 'Login failed');
        return;
      }

      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      // Navigate based on role
      const role = response.user.role;
      if (role === 'master') {
        navigate({ to: '/dashboard/master' });
      } else if (role === 'cashier') {
        navigate({ to: '/dashboard/cashier' });
      } else if (role === 'lab_technician') {
        navigate({ to: '/dashboard/technician' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <h1 className="text-3xl font-bold text-white">💊</h1>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NextGenLab</h1>
          <p className="text-gray-600">Lab Management System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-linear-to-r from-blue-600 to-cyan-500 text-white">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Secure Login
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

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-gray-900 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Username / Login ID
                </Label>
                <Input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your username"
                  className="bg-white border-2 focus:border-blue-600"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-white border-2 focus:border-blue-600"
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin(e as any);
                    }
                  }}
                />
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </form>

            {/* Demo Credentials Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center mb-3">Demo Credentials:</p>
              <div className="bg-blue-50 rounded-lg p-3 space-y-2 text-sm">
                <div>
                  <p className="text-gray-700"><strong>Master User:</strong></p>
                  <p className="text-gray-600">ID: master | Password: master123</p>
                </div>
                <div>
                  <p className="text-gray-700"><strong>Cashier:</strong></p>
                  <p className="text-gray-600">ID: cashier | Password: cashier123</p>
                </div>
                <div>
                  <p className="text-gray-700"><strong>Lab Technician:</strong></p>
                  <p className="text-gray-600">ID: technician | Password: tech123</p>
                </div>
              </div>
            </div>

            {/* Signup Link */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-3">Don't have an account?</p>
              <Link
                to="/signup"
                className="inline-block w-full px-6 py-2 bg-linear-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all duration-300 text-center"
              >
                Create Account
              </Link>
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
