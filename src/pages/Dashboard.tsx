
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Users, DollarSign, Clock, TrendingUp, 
  BarChart3, Plus, CalendarDays, ArrowRight
} from 'lucide-react';
import { Event, EventEntry, EventReport } from '@/types';
import { getEvents, getEventEntries, calculateEventReport } from '@/services/eventService';

const Dashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [recentEntries, setRecentEntries] = useState<EventEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRevenue: 0,
    totalProfit: 0,
    avgAttendance: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await getEvents();
        setEvents(eventsData);
        
        // Get recent entries
        const entriesData = await getEventEntries();
        setRecentEntries(entriesData.slice(0, 5));
        
        // Calculate stats
        let totalRevenue = 0;
        let totalProfit = 0;
        let totalAttendance = 0;
        
        for (const entry of entriesData) {
          const event = eventsData.find(e => e.id === entry.eventId);
          if (event) {
            const report = await calculateEventReport(event.id, entry.id);
            if (report) {
              totalRevenue += report.totalRevenue;
              totalProfit += report.profit;
              totalAttendance += entry.attendance;
            }
          }
        }
        
        setStats({
          totalEvents: eventsData.length,
          totalRevenue,
          totalProfit,
          avgAttendance: entriesData.length > 0 ? totalAttendance / entriesData.length : 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Nightflow Accountability Tracker
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-nightlife-800 border-nightlife-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <h3 className="text-2xl font-bold">{stats.totalEvents}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-nightlife-800 border-nightlife-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-nightlife-800 border-nightlife-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.totalProfit)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-nightlife-800 border-nightlife-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Users className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Attendance</p>
                <h3 className="text-2xl font-bold">{Math.round(stats.avgAttendance)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-nightlife-800 border-nightlife-700 lg:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Your next scheduled events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="flex items-center p-4 rounded-lg bg-nightlife-700 hover:bg-nightlife-600 transition-colors"
                  >
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-nightlife-300/10 text-primary">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <div className="ml-4 flex-grow">
                      <Link to={`/events/${event.id}`} className="text-lg font-medium hover:text-primary hover:underline">
                        {event.name}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} at {event.time} • {event.venueName}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/events/${event.id}`}>
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No upcoming events</p>
                <Button asChild className="mt-4">
                  <Link to="/events/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-nightlife-800 border-nightlife-700">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start" variant="secondary">
              <Link to="/events/create">
                <Plus className="mr-2 h-4 w-4" />
                Create New Event
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="secondary">
              <Link to="/events">
                <Calendar className="mr-2 h-4 w-4" />
                View All Events
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="secondary">
              <Link to="/reports">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-nightlife-800 border-nightlife-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest event entries and updates
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/events">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentEntries.length > 0 ? (
            <div className="space-y-4">
              {recentEntries.map(entry => {
                const event = events.find(e => e.id === entry.eventId);
                return (
                  <div key={entry.id} className="flex items-center border-b border-nightlife-700 pb-4 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-nightlife-700 flex items-center justify-center text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">
                        {event?.name || 'Event'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Entry added for {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-sm">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Dashboard;
