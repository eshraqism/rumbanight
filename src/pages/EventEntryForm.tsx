
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createEventEntry, getEvent } from '@/services/eventService';
import { Event, Promoter, Staff } from '@/types';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  date: z.string().min(1, { message: 'Date is required' }),
  doorRevenue: z.string().optional(),
  totalNightRevenue: z.string().optional(),
  attendance: z.string().min(1, { message: 'Attendance is required' }),
  tablesFromRumba: z.string().min(1, { message: 'Tables from Rumba is required' }),
  tableCommissions: z.string().min(1, { message: 'Table commissions is required' }),
  vipGirlsCommissions: z.string().min(1, { message: 'VIP girls commissions is required' }),
  adSpend: z.string().min(1, { message: 'Ad spend is required' }),
  adReach: z.string().min(1, { message: 'Ad reach is required' }),
  adClicks: z.string().min(1, { message: 'Ad clicks is required' }),
  adLeads: z.string().min(1, { message: 'Ad leads is required' }),
  leadsCollected: z.string().min(1, { message: 'Leads collected is required' }),
  daysUntilPaid: z.string().min(1, { message: 'Days until paid is required' }),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const EventEntryForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [promoters, setPromoters] = useState<Promoter[]>([{ id: Date.now().toString(), name: '', commission: 0 }]);
  const [staff, setStaff] = useState<Staff[]>([{ id: Date.now().toString(), role: '', name: '', payment: 0 }]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      doorRevenue: '0',
      totalNightRevenue: '0',
      attendance: '0',
      tablesFromRumba: '0',
      tableCommissions: '0',
      vipGirlsCommissions: '0',
      adSpend: '0',
      adReach: '0',
      adClicks: '0',
      adLeads: '0',
      leadsCollected: '0',
      daysUntilPaid: '7',
      notes: '',
    },
  });

  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        const eventData = await getEvent(id);
        if (eventData) {
          setEvent(eventData);
        } else {
          toast({
            title: "Error",
            description: "Event not found",
            variant: "destructive",
          });
          navigate('/events');
        }
      };
      fetchEvent();
    }
  }, [id, navigate]);

  const addPromoter = () => {
    setPromoters([...promoters, { id: Date.now().toString(), name: '', commission: 0 }]);
  };

  const removePromoter = (id: string) => {
    setPromoters(promoters.filter(p => p.id !== id));
  };

  const updatePromoter = (id: string, field: keyof Promoter, value: string | number) => {
    setPromoters(
      promoters.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const addStaffMember = () => {
    setStaff([...staff, { id: Date.now().toString(), role: '', name: '', payment: 0 }]);
  };

  const removeStaffMember = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  const updateStaffMember = (id: string, field: keyof Staff, value: string | number) => {
    setStaff(
      staff.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const onSubmit = async (data: FormData) => {
    if (!id || !event) return;

    try {
      const entryData = {
        eventId: id,
        date: new Date(data.date),
        promoters,
        staff,
        doorRevenue: event.dealType === 'Entrance Deal' ? parseFloat(data.doorRevenue || '0') : undefined,
        totalNightRevenue: event.dealType === 'Revenue Share' ? parseFloat(data.totalNightRevenue || '0') : undefined,
        attendance: parseInt(data.attendance),
        tablesFromRumba: parseInt(data.tablesFromRumba),
        tableCommissions: parseFloat(data.tableCommissions),
        vipGirlsCommissions: parseFloat(data.vipGirlsCommissions),
        adSpend: parseFloat(data.adSpend),
        adReach: parseInt(data.adReach),
        adClicks: parseInt(data.adClicks),
        adLeads: parseInt(data.adLeads),
        leadsCollected: parseInt(data.leadsCollected),
        daysUntilPaid: parseInt(data.daysUntilPaid),
        notes: data.notes,
      };

      await createEventEntry(entryData);
      navigate(`/events/${id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event entry",
        variant: "destructive",
      });
    }
  };

  if (!event) {
    return (
      <DashboardLayout>
        <div className="flex justify-center my-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add Entry for {event.name}</h1>
        <p className="text-muted-foreground mt-1">
          Record performance metrics for this event
        </p>
      </div>

      <Card className="bg-nightlife-800 border-nightlife-700">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {event.dealType === 'Entrance Deal' ? (
                <FormField
                  control={form.control}
                  name="doorRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Door Revenue ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="totalNightRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Night Revenue ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="attendance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attendance</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tablesFromRumba"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tables from Rumba</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Card className="bg-nightlife-700 border-nightlife-600">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>Promoters</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addPromoter}
                    >
                      Add Promoter
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  {promoters.map((promoter, index) => (
                    <div key={promoter.id} className="flex space-x-3 mb-3">
                      <div className="flex-grow">
                        <Input
                          placeholder="Promoter Name"
                          value={promoter.name}
                          onChange={(e) => updatePromoter(promoter.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          placeholder="Commission"
                          min="0"
                          step="0.01"
                          value={promoter.commission}
                          onChange={(e) => updatePromoter(promoter.id, 'commission', parseFloat(e.target.value))}
                        />
                      </div>
                      {index > 0 && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => removePromoter(promoter.id)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-nightlife-700 border-nightlife-600">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>Staff</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addStaffMember}
                    >
                      Add Staff
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  {staff.map((member, index) => (
                    <div key={member.id} className="flex space-x-3 mb-3">
                      <div className="w-1/3">
                        <Input
                          placeholder="Role"
                          value={member.role}
                          onChange={(e) => updateStaffMember(member.id, 'role', e.target.value)}
                        />
                      </div>
                      <div className="flex-grow">
                        <Input
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => updateStaffMember(member.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          placeholder="Payment"
                          min="0"
                          step="0.01"
                          value={member.payment}
                          onChange={(e) => updateStaffMember(member.id, 'payment', parseFloat(e.target.value))}
                        />
                      </div>
                      {index > 0 && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => removeStaffMember(member.id)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tableCommissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Table Commissions ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vipGirlsCommissions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIP Girls Commissions ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="text-lg font-medium mt-6 mb-3">Ad Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="adSpend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Spend ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adReach"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Reach</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adClicks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Clicks</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adLeads"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Leads</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="leadsCollected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Leads Collected</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="daysUntilPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days Until Paid</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes..."
                        className="resize-none h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/events/${id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Entry</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default EventEntryForm;
