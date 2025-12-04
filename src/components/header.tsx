import { Link } from '@tanstack/react-router';
import { Activity, Home } from 'lucide-react';

interface HeaderProps {
  showHomeButton?: boolean;
  className?: string;
}

export function Header({ showHomeButton = true, className = '' }: HeaderProps) {
  return (
    <header className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                NextGenLab
              </h1>
              <p className="text-xs text-gray-600 font-medium">Lab Management System</p>
            </div>
          </Link>

          {/* Navigation */}
          {showHomeButton && (
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg"
            >
              <Home className="w-4 h-4" />
              <span className="font-semibold">Dashboard</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}