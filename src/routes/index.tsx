import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('currentUser');
    
    if (user) {
      // User is logged in, redirect to their role-based dashboard
      const parsedUser = JSON.parse(user);
      const role = parsedUser.role?.toLowerCase() || 'master';
      navigate({ to: `/dashboard/${role}` });
    } else {
      // No user logged in, redirect to login page
      navigate({ to: '/login' });
    }
  }, [navigate]);

  // Loading state
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}