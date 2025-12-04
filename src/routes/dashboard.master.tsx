import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  Activity,
  BarChart3,
  Building2,
  ClipboardList,
  DollarSign,
  FileText,
  Stethoscope,
  TestTube,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent} from '@/components/ui/card';

export const Route = createFileRoute('/dashboard/master')({
  component: MasterDashboard,
});

function MasterDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate({ to: '/login' });
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== 'master') {
      navigate({ to: '/dashboard/cashier' });
      return;
    }

    setCurrentUser(user);
  }, [navigate]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const dashboardItems = [
    {
      title: 'Patient Registration',
      description: 'Register patients and assign tests',
      icon: ClipboardList,
      color: 'from-orange-600 to-red-500',
      href: '/register',
      badge: 'Operations',
    },
    {
      title: 'Test Management',
      description: 'Configure tests and parameters',
      icon: TestTube,
      color: 'from-indigo-600 to-blue-500',
      href: '/setup',
      badge: 'Setup',
    },
    {
      title: 'Test Entry',
      description: 'Record test entries for patients',
      icon: Activity,
      color: 'from-teal-600 to-cyan-500',
      href: '/test-entry',
      badge: 'Operations',
    },
    {
      title: 'Test Results',
      description: 'Enter and manage test results',
      icon: FileText,
      color: 'from-pink-600 to-rose-500',
      href: '/test-results',
      badge: 'Operations',
    },
    {
      title: 'Doctor Management',
      description: 'Add and manage doctors referral database',
      icon: Stethoscope,
      color: 'from-green-600 to-emerald-500',
      href: '/setup',
      badge: 'Setup',
    },
    {
      title: 'Employee Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      color: 'from-purple-600 to-pink-500',
      href: '/employee-management',
      badge: 'Admin',
    },
    {
      title: 'Billing & Reports',
      description: 'Manage payments and generate bills',
      icon: DollarSign,
      color: 'from-cyan-600 to-blue-500',
      href: '/billing',
      badge: 'Finance',
    },
    {
      title: 'Reports & Analytics',
      description: 'View system reports and analytics',
      icon: BarChart3,
      color: 'from-violet-600 to-purple-500',
      href: '/exports',
      badge: 'Analytics',
      disabled: false,
    },
    {
      title: 'Lab Configuration',
      description: 'Setup lab details, logo, GSTIN, registration',
      icon: Building2,
      color: 'from-blue-600 to-cyan-500',
      href: '/lab-setup',
      badge: 'Setup',
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50">
      {/* Lab Info Card */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Items Grid */}
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="">
              {currentUser.labInfo?.labLogo && (
                <img
                  src={currentUser.labInfo.labLogo}
                  alt="Lab Logo"
                  className="w-30 h-15 rounded-lg p-2 object-contain"
                />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentUser.labInfo?.labName} Dashboard
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={index}
                  to={item.href}
                  disabled={item.disabled}
                  className={item.disabled ? 'pointer-events-none' : ''}
                >
                  <Card
                    className={`
                      shadow-lg hover:shadow-2xl transition-all duration-300 
                      transform hover:-translate-y-2 overflow-hidden h-full
                      ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className={`bg-linear-to-br ${item.color} h-1`}></div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`w-12 h-12 bg-linear-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {item.badge}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-blue-600 font-semibold text-sm">
                        Access
                        <span className="text-lg">→</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Active Users', value: '3', icon: Users, color: 'from-blue-600 to-cyan-500' },
              { label: 'Registered Patients', value: '0', icon: ClipboardList, color: 'from-green-600 to-emerald-500' },
              { label: 'Tests Available', value: '0', icon: TestTube, color: 'from-purple-600 to-pink-500' },
              { label: 'Total Revenue', value: '₹0', icon: DollarSign, color: 'from-orange-600 to-red-500' },
            ].map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <Card key={idx} className="shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 bg-linear-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                      >
                        <IconComp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}