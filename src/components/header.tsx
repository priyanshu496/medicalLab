import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowBigLeft, LogOut, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';


export function Header() {
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
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate({ to: '/login' });
  };
   if (!currentUser) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="">
              <PlusIcon className='w-15 h-15'/>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                LabSanchalak
              </h1>
              <p className="text-md text-gray-600">
                A Laboratory management System by Globizhub India Pvt Ltd
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {currentUser.fullName}
              </p>
              <p className="text-xs text-gray-600">Master Administrator</p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
            <Link to='/'>
            
            <Button
              className=" gap-2"
            >
              <ArrowBigLeft className="w-4 h-4" /> 
            </Button>
            </Link>
          </div>
        </div>
      </header>
  );
}