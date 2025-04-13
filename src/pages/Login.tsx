
import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const { user, login, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // If already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-nightlife-900">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) return;
    
    setIsSubmitting(true);
    const success = await login(username, password);
    setIsSubmitting(false);
    
    if (success) {
      // Redirect to the page they were trying to access, or to the dashboard
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-nightlife-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Nightflow</h1>
          <p className="text-muted-foreground">Accountability Tracker for Nightlife Events</p>
        </div>
        
        <Card className="bg-nightlife-800 border-nightlife-700">
          <CardHeader>
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-nightlife-700 border-nightlife-600"
                  placeholder="Enter your username"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-nightlife-700 border-nightlife-600"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Demo credentials: admin / password
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
