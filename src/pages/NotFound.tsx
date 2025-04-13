
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-nightlife-900 p-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-4 text-white">Page Not Found</h2>
        <p className="text-muted-foreground mb-2">
          We couldn't find the page you're looking for: <span className="text-white font-mono">{location.pathname}</span>
        </p>
        <p className="text-muted-foreground mb-8">
          Please check the URL or return to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link to="/dashboard" className="inline-flex items-center">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/events" className="inline-flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Go to Events
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
