
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Percent, Users, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getEvents, calculateEventReport } from '@/services/eventService';

const Reports: React.FC = () => {
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents
  });

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      if (!events) return [];
      
      // For each event, get a report
      const reportPromises = events.map(async (event) => {
        const report = await calculateEventReport(event.id);
        return { event, report };
      });
      
      return Promise.all(reportPromises);
    },
    enabled: !!events
  });

  const isLoading = eventsLoading || reportsLoading;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {reports && reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map(({ event, report }) => report && (
                <Card key={event.id} className="bg-nightlife-800 border-nightlife-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>{event.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">Revenue</span>
                        </div>
                        <p className="font-medium">${report.totalRevenue.toFixed(2)}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Percent className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">Rumba Share</span>
                        </div>
                        <p className="font-medium">${report.rumbaShare.toFixed(2)}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">Attendance</span>
                        </div>
                        <p className="font-medium">{report.totalAttendance}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">Profit</span>
                        </div>
                        <p className="font-medium">${report.profit.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-nightlife-700">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Payment due in:</span>
                        <span className="font-medium">{report.daysUntilPaid} days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-nightlife-800 border-nightlife-700">
              <CardContent className="p-6">
                <div className="text-center py-6">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Reports Available</h3>
                  <p className="text-muted-foreground">
                    Add events and entries to generate reports.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default Reports;
