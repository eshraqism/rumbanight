
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, Clock, MapPin, Percentage, Database,
  Edit, Trash2, Plus, BarChart3, Users, DollarSign
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Event, EventEntry, EventReport } from '@/types';
import { getEvent, getEventEntries, deleteEvent, calculateEventReport } from '@/services/eventService';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [entries, setEntries] = useState<EventEntry[]>([]);
  const [report, setReport] = useState<EventReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;

      try {
        const eventData = await getEvent(id);
        if (!eventData) {
          toast({
            title: 'Event not found',
            description: 'The requested event could not be found.',
            variant: 'destructive',
          });
          navigate('/events');
          return;
        }

        setEvent(eventData);

        // Fetch entries for this event
        const entriesData = await getEventEntries(id);
        setEntries(entriesData);

        // Calculate report if we have entries
        if (entriesData.length > 0) {
          const reportData = await calculateEventReport(id);
          setReport(reportData);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load event details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      const success = await deleteEvent(id);
      if (success) {
        toast({
          title: 'Event deleted',
          description: 'The event has been successfully deleted.',
        });
        navigate('/events');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the event.',
        variant: 'destructive',
      });
    } finally {
      setConfirmDelete(false);
    }
  };

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

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">
            Sorry, the event you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/events">Back to Events</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">{event.name}</h1>
          <p className="text-muted-foreground">
            {new Date(event.date).toLocaleDateString()} • {event.venueName}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button asChild variant="outline" className="bg-nightlife-700 border-nightlife-600">
            <Link to={`/events/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Event Details */}
        <Card className="bg-nightlife-800 border-nightlife-700 md:col-span-2">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date & Day</p>
                  <p className="text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()} • {event.dayOfWeek}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-muted-foreground">{event.time}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Database className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Venue</p>
                  <p className="text-muted-foreground">{event.venueName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Percentage className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Deal Type</p>
                  <p className="text-muted-foreground">{event.dealType}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Payment Terms</p>
                  <p className="text-muted-foreground">
                    {event.paymentTerms || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-6 bg-nightlife-700" />

            <div>
              <h3 className="text-lg font-medium mb-4">Revenue Split</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {event.partners.map((partner, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-nightlife-700 rounded-lg">
                      <span className="font-medium">{partner.name}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          partner.name === 'Rumba' 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-nightlife-600 text-nightlife-100'
                        }`}
                      >
                        {partner.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  Total: {event.partners.reduce((sum, p) => sum + p.percentage, 0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-nightlife-800 border-nightlife-700">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start" variant="secondary">
              <Link to={`/events/${id}/entry`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Event Entry
              </Link>
            </Button>
            
            <Button asChild className="w-full justify-start" variant="secondary">
              <Link to={`/reports/${id}`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
            
            <Button asChild className="w-full justify-start" variant="secondary">
              <Link to={`/events/${id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Event Entries */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Event Entries</h2>
          <Button asChild>
            <Link to={`/events/${id}/entry`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Link>
          </Button>
        </div>

        {entries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <Card key={entry.id} className="bg-nightlife-800 border-nightlife-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                    <Link
                      to={`/events/${id}/entry/${entry.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Attendance</p>
                        <p className="font-medium">{entry.attendance}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tables from Rumba</p>
                        <p className="font-medium">{entry.tablesFromRumba}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-medium">
                          {formatCurrency(
                            entry.totalNightRevenue || entry.doorRevenue || 0
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Commissions</p>
                        <p className="font-medium">
                          {formatCurrency(
                            entry.tableCommissions + entry.vipGirlsCommissions
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <Separator className="bg-nightlife-700" />
                    
                    <div className="pt-2">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Promoters</span>
                        <span className="text-sm text-muted-foreground">
                          {entry.promoters.length}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Staff</span>
                        <span className="text-sm text-muted-foreground">
                          {entry.staff.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Ad Spend</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(entry.adSpend)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-nightlife-800 border-nightlife-700 p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No Entries Yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first entry to start tracking results for this event.
            </p>
            <Button asChild>
              <Link to={`/events/${id}/entry`}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Entry
              </Link>
            </Button>
          </Card>
        )}
      </div>

      {/* Event Summary/Report */}
      {report && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Event Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-nightlife-800 border-nightlife-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-green-500/10">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <h3 className="text-2xl font-bold">{formatCurrency(report.totalRevenue)}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-nightlife-800 border-nightlife-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Percentage className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rumba's Share</p>
                    <h3 className="text-2xl font-bold">{formatCurrency(report.rumbaShare)}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-nightlife-800 border-nightlife-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-orange-500/10">
                    <DollarSign className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                    <h3 className="text-2xl font-bold">{formatCurrency(report.totalExpenses)}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-nightlife-800 border-nightlife-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${
                    report.profit >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  }`}>
                    <DollarSign className={`h-6 w-6 ${
                      report.profit >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Profit</p>
                    <h3 className={`text-2xl font-bold ${
                      report.profit >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {formatCurrency(report.profit)}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6">
            <Button asChild variant="outline" className="bg-nightlife-700 border-nightlife-600">
              <Link to={`/reports/${id}`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Full Report
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-nightlife-800 border-nightlife-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{event.name}" and all associated entries and data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-nightlife-700 hover:bg-nightlife-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default EventDetails;
