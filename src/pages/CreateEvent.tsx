
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { X, Plus, CalendarIcon, Save, PercentIcon } from 'lucide-react';
import { DayOfWeek, DealType, Partner, Event } from '@/types';
import { createEvent } from '@/services/eventService';
import { format } from 'date-fns';

const dayOptions: DayOfWeek[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const dealTypeOptions: DealType[] = ['Revenue Share', 'Entrance Deal'];

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    name: string;
    dayOfWeek: DayOfWeek | '';
    date: Date | undefined;
    time: string;
    venueName: string;
    location: string;
    dealType: DealType | '';
    rumbaPercentage: number;
    paymentTerms: string;
    partners: Partner[];
  }>({
    name: '',
    dayOfWeek: '',
    date: undefined,
    time: '',
    venueName: '',
    location: '',
    dealType: '',
    rumbaPercentage: 50,
    paymentTerms: '',
    partners: [{ name: 'Rumba', percentage: 50 }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    const dayOfWeek = dayOptions[date.getDay()];
    setFormData(prev => ({ 
      ...prev, 
      date, 
      dayOfWeek
    }));
  };

  const handleRumbaPercentageChange = (value: string) => {
    const percentage = parseInt(value) || 0;
    
    // Update Rumba percentage
    setFormData(prev => {
      // Find and update Rumba in partners array
      const updatedPartners = [...prev.partners];
      const rumbaIndex = updatedPartners.findIndex(p => p.name === 'Rumba');
      
      if (rumbaIndex >= 0) {
        updatedPartners[rumbaIndex] = { ...updatedPartners[rumbaIndex], percentage };
      } else {
        updatedPartners.push({ name: 'Rumba', percentage });
      }
      
      // Recalculate other partners' percentages if necessary
      const remainingPercentage = 100 - percentage;
      const otherPartners = updatedPartners.filter(p => p.name !== 'Rumba');
      
      if (otherPartners.length > 0) {
        const totalOtherPercentage = otherPartners.reduce((sum, p) => sum + p.percentage, 0);
        if (totalOtherPercentage > 0) {
          const ratio = remainingPercentage / totalOtherPercentage;
          otherPartners.forEach(p => {
            const index = updatedPartners.findIndex(up => up.name === p.name);
            if (index >= 0) {
              updatedPartners[index].percentage = Math.round(p.percentage * ratio);
            }
          });
        }
      }
      
      return { ...prev, rumbaPercentage: percentage, partners: updatedPartners };
    });
  };

  const addPartner = () => {
    // Calculate remaining percentage
    const usedPercentage = formData.partners.reduce((sum, p) => sum + p.percentage, 0);
    const remainingPercentage = Math.max(0, 100 - usedPercentage);
    
    setFormData(prev => ({
      ...prev,
      partners: [...prev.partners, { name: '', percentage: remainingPercentage }]
    }));
  };

  const updatePartner = (index: number, field: 'name' | 'percentage', value: string | number) => {
    setFormData(prev => {
      const updatedPartners = [...prev.partners];
      updatedPartners[index] = { 
        ...updatedPartners[index], 
        [field]: field === 'percentage' ? (parseInt(value as string) || 0) : value 
      };
      
      // Update Rumba percentage if Rumba partner is updated
      if (updatedPartners[index].name === 'Rumba' && field === 'percentage') {
        return { ...prev, partners: updatedPartners, rumbaPercentage: updatedPartners[index].percentage };
      }
      
      return { ...prev, partners: updatedPartners };
    });
  };

  const removePartner = (index: number) => {
    // Don't allow removing the Rumba partner
    if (formData.partners[index].name === 'Rumba') {
      toast({
        title: "Cannot remove Rumba",
        description: "The Rumba partner is required and cannot be removed.",
        variant: "destructive"
      });
      return;
    }
    
    setFormData(prev => {
      const updatedPartners = prev.partners.filter((_, i) => i !== index);
      return { ...prev, partners: updatedPartners };
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name) {
      toast({
        title: "Event name required",
        description: "Please enter a name for the event.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.date) {
      toast({
        title: "Date required",
        description: "Please select a date for the event.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.time) {
      toast({
        title: "Time required",
        description: "Please enter a time for the event.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.venueName) {
      toast({
        title: "Venue name required",
        description: "Please enter a venue name for the event.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!formData.dealType) {
      toast({
        title: "Deal type required",
        description: "Please select a deal type for the event.",
        variant: "destructive"
      });
      return false;
    }
    
    // Validate that partners add up to 100%
    const totalPercentage = formData.partners.reduce((sum, p) => sum + p.percentage, 0);
    if (totalPercentage !== 100) {
      toast({
        title: "Invalid partner percentages",
        description: `Partner percentages must add up to 100% (currently ${totalPercentage}%).`,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Make sure all required fields are present
      if (!formData.date || !formData.dealType || !formData.dayOfWeek) {
        throw new Error('Missing required fields');
      }
      
      const eventData: Omit<Event, 'id' | 'createdAt'> = {
        name: formData.name,
        dayOfWeek: formData.dayOfWeek as DayOfWeek,
        date: formData.date,
        time: formData.time,
        venueName: formData.venueName,
        location: formData.location,
        dealType: formData.dealType as DealType,
        rumbaPercentage: formData.rumbaPercentage,
        paymentTerms: formData.paymentTerms,
        partners: formData.partners
      };
      
      const newEvent = await createEvent(eventData);
      
      toast({
        title: "Event created",
        description: `${newEvent.name} has been created successfully.`
      });
      
      navigate(`/events/${newEvent.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error creating event",
        description: "There was a problem creating the event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create a new event
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-nightlife-800 border-nightlife-700 lg:col-span-2">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>
                Basic information about the event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter event name"
                    className="bg-nightlife-700 border-nightlife-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal bg-nightlife-700 border-nightlife-600 ${!formData.date && 'text-muted-foreground'}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(formData.date, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-nightlife-800 border-nightlife-700" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={handleDateChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="bg-nightlife-700 border-nightlife-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venueName">Venue Name</Label>
                    <Input
                      id="venueName"
                      name="venueName"
                      value={formData.venueName}
                      onChange={handleChange}
                      placeholder="Enter venue name"
                      className="bg-nightlife-700 border-nightlife-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Area / City"
                      className="bg-nightlife-700 border-nightlife-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dayOfWeek">Day of Week</Label>
                    <Select
                      value={formData.dayOfWeek}
                      onValueChange={(value) => handleSelectChange('dayOfWeek', value)}
                      disabled={!!formData.date} // Disable if date is selected
                    >
                      <SelectTrigger className="bg-nightlife-700 border-nightlife-600">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent className="bg-nightlife-800 border-nightlife-700">
                        {dayOptions.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dealType">Deal Type</Label>
                    <Select
                      value={formData.dealType}
                      onValueChange={(value) => handleSelectChange('dealType', value)}
                    >
                      <SelectTrigger className="bg-nightlife-700 border-nightlife-600">
                        <SelectValue placeholder="Select deal type" />
                      </SelectTrigger>
                      <SelectContent className="bg-nightlife-800 border-nightlife-700">
                        {dealTypeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Textarea
                    id="paymentTerms"
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    placeholder="e.g., 50% upfront, weekly payments"
                    className="bg-nightlife-700 border-nightlife-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-nightlife-800 border-nightlife-700">
            <CardHeader>
              <CardTitle>Revenue Split</CardTitle>
              <CardDescription>
                Define how revenue is shared between partners
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rumbaPercentage" className="flex items-center">
                  Rumba Percentage
                  <PercentIcon className="ml-2 h-4 w-4 text-muted-foreground" />
                </Label>
                <Input
                  id="rumbaPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.rumbaPercentage}
                  onChange={(e) => handleRumbaPercentageChange(e.target.value)}
                  className="bg-nightlife-700 border-nightlife-600"
                />
              </div>

              <div className="space-y-4">
                <Label>Partners & Percentage Splits</Label>
                
                <div className="space-y-3">
                  {formData.partners.map((partner, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={partner.name}
                        onChange={(e) => updatePartner(index, 'name', e.target.value)}
                        placeholder="Partner name"
                        className="flex-1 bg-nightlife-700 border-nightlife-600"
                        disabled={partner.name === 'Rumba'} // Don't allow changing Rumba name
                      />
                      <div className="relative w-20">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={partner.percentage}
                          onChange={(e) => updatePartner(index, 'percentage', e.target.value)}
                          className="pr-8 bg-nightlife-700 border-nightlife-600"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          %
                        </span>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => removePartner(index)}
                        disabled={partner.name === 'Rumba'} // Don't allow removing Rumba
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPartner}
                  className="w-full mt-2 bg-nightlife-700 border-nightlife-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Partner
                </Button>
              </div>

              <div className="pt-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">Total Percentage:</p>
                  <p className={`text-lg font-bold ${
                    formData.partners.reduce((sum, p) => sum + p.percentage, 0) === 100
                      ? 'text-green-500'
                      : 'text-destructive'
                  }`}>
                    {formData.partners.reduce((sum, p) => sum + p.percentage, 0)}%
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formData.partners.reduce((sum, p) => sum + p.percentage, 0) === 100
                    ? 'Valid split'
                    : 'Must equal 100%'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/events')}
            className="bg-nightlife-700 border-nightlife-600"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Event...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Event
              </>
            )}
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default CreateEvent;
