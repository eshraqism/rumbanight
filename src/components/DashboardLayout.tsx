
import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, BarChart3, Plus, LogOut, Home, LayoutDashboard, FileText } from 'lucide-react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  
  // If still loading auth state, show a loading spinner
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-nightlife-900">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Events', path: '/events', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Create Event', path: '/events/create', icon: <Plus className="h-5 w-5" /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-nightlife-900 text-white">
      {/* Mobile top nav */}
      <div className="md:hidden bg-nightlife-800 p-4 flex justify-between items-center">
        <div className="text-xl font-bold text-primary">Nightflow</div>
        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-nightlife-800 p-6 border-r border-nightlife-700 animate-fade-in">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-primary">Nightflow</h2>
          <p className="text-sm text-muted-foreground">Accountability Tracker</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                isActivePath(item.path) 
                  ? 'bg-nightlife-300/10 text-primary'
                  : 'hover:bg-nightlife-700'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto pt-6 border-t border-nightlife-700">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="font-semibold text-nightlife-900">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="font-medium">{user.username}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      
      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-nightlife-800 border-t border-nightlife-700 flex justify-around py-2 z-10">
        {navItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path}
            className={`p-3 rounded-md flex flex-col items-center ${
              isActivePath(item.path) 
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
      
      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto pb-20 md:pb-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
