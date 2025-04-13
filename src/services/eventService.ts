
import { Event, EventEntry, EventReport, Partner } from "@/types";
import { mockEvents, mockEventEntries } from "./mockData";
import { toast } from "@/hooks/use-toast";

// NOTE: This is currently using mock data
// TODO: Replace with MySQL backend implementation
// MySQL backend will require:
// 1. Setting up a Node.js/Express or Python/Flask server
// 2. Configuring MySQL database connection
// 3. Creating tables for events, entries, partners, promoters, staff
// 4. Implementing RESTful API endpoints for CRUD operations

// In-memory storage for mock data
let events: Event[] = [...mockEvents];
let eventEntries: EventEntry[] = [...mockEventEntries];

// Event CRUD operations
export const getEvents = (): Promise<Event[]> => {
  // TODO: Replace with MySQL query
  // Example MySQL query: SELECT * FROM events ORDER BY date DESC
  console.log("Fetching events:", events);
  return Promise.resolve([...events].sort((a, b) => b.date.getTime() - a.date.getTime()));
};

export const getEvent = (id: string): Promise<Event | undefined> => {
  // TODO: Replace with MySQL query
  // Example MySQL query: SELECT * FROM events WHERE id = ?
  console.log("Finding event with ID:", id);
  const event = events.find(e => e.id === id);
  console.log("Found event:", event);
  return Promise.resolve(event);
};

export const createEvent = (eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> => {
  // TODO: Replace with MySQL query
  // Example MySQL query: INSERT INTO events (...) VALUES (...)
  const newEvent: Event = {
    ...eventData,
    id: `evt-${Date.now()}`,
    createdAt: new Date()
  };
  
  events.push(newEvent);
  toast({
    title: "Event created",
    description: `${newEvent.name} has been created successfully.`
  });
  
  return Promise.resolve(newEvent);
};

export const updateEvent = (id: string, eventData: Partial<Event>): Promise<Event | undefined> => {
  // TODO: Replace with MySQL query
  // Example MySQL query: UPDATE events SET ... WHERE id = ?
  const index = events.findIndex(e => e.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  const updatedEvent = {
    ...events[index],
    ...eventData
  };
  
  events[index] = updatedEvent;
  toast({
    title: "Event updated",
    description: `${updatedEvent.name} has been updated successfully.`
  });
  
  return Promise.resolve(updatedEvent);
};

export const deleteEvent = (id: string): Promise<boolean> => {
  // TODO: Replace with MySQL query
  // Example MySQL queries: 
  // 1. DELETE FROM event_entries WHERE event_id = ?
  // 2. DELETE FROM events WHERE id = ?
  const initialLength = events.length;
  events = events.filter(e => e.id !== id);
  
  if (events.length < initialLength) {
    eventEntries = eventEntries.filter(entry => entry.eventId !== id);
    toast({
      title: "Event deleted",
      description: "Event and all associated data have been deleted."
    });
    return Promise.resolve(true);
  }
  
  return Promise.resolve(false);
};

// Event Entry CRUD operations
export const getEventEntries = (eventId?: string): Promise<EventEntry[]> => {
  // TODO: Replace with MySQL query
  // Example MySQL query: SELECT * FROM event_entries WHERE event_id = ? ORDER BY date DESC
  console.log("Fetching entries for eventId:", eventId);
  let filteredEntries = [...eventEntries];
  if (eventId) {
    filteredEntries = filteredEntries.filter(entry => entry.eventId === eventId);
  }
  console.log("Filtered entries:", filteredEntries);
  return Promise.resolve(filteredEntries.sort((a, b) => b.date.getTime() - a.date.getTime()));
};

export const getEventEntry = (id: string): Promise<EventEntry | undefined> => {
  // TODO: Replace with MySQL query
  // Example MySQL query: SELECT * FROM event_entries WHERE id = ?
  const entry = eventEntries.find(e => e.id === id);
  return Promise.resolve(entry);
};

export const createEventEntry = (entryData: Omit<EventEntry, 'id' | 'createdAt'>): Promise<EventEntry> => {
  // TODO: Replace with MySQL query
  // Example MySQL queries:
  // 1. INSERT INTO event_entries (...) VALUES (...)
  // 2. INSERT INTO promoters (entry_id, name, commission) VALUES (...)
  // 3. INSERT INTO staff (entry_id, role, name, payment) VALUES (...)
  console.log("Creating new event entry:", entryData);
  
  const newEntry: EventEntry = {
    ...entryData,
    id: `entry-${Date.now()}`,
    createdAt: new Date()
  };
  
  eventEntries.push(newEntry);
  console.log("New entry created:", newEntry);
  console.log("Updated entries list:", eventEntries);
  
  toast({
    title: "Entry created",
    description: `Event entry for ${new Date(newEntry.date).toLocaleDateString()} has been created.`
  });
  
  return Promise.resolve(newEntry);
};

export const updateEventEntry = (id: string, entryData: Partial<EventEntry>): Promise<EventEntry | undefined> => {
  // TODO: Replace with MySQL query
  // Example MySQL query: UPDATE event_entries SET ... WHERE id = ?
  const index = eventEntries.findIndex(e => e.id === id);
  if (index === -1) return Promise.resolve(undefined);
  
  const updatedEntry = {
    ...eventEntries[index],
    ...entryData
  };
  
  eventEntries[index] = updatedEntry;
  toast({
    title: "Entry updated",
    description: `Event entry for ${new Date(updatedEntry.date).toLocaleDateString()} has been updated.`
  });
  
  return Promise.resolve(updatedEntry);
};

export const deleteEventEntry = (id: string): Promise<boolean> => {
  // TODO: Replace with MySQL query
  // Example MySQL queries:
  // 1. DELETE FROM promoters WHERE entry_id = ?
  // 2. DELETE FROM staff WHERE entry_id = ?
  // 3. DELETE FROM event_entries WHERE id = ?
  const initialLength = eventEntries.length;
  eventEntries = eventEntries.filter(e => e.id !== id);
  
  if (eventEntries.length < initialLength) {
    toast({
      title: "Entry deleted",
      description: "Event entry has been deleted."
    });
    return Promise.resolve(true);
  }
  
  return Promise.resolve(false);
};

// Calculate event report
export const calculateEventReport = async (eventId: string, entryId?: string): Promise<EventReport | null> => {
  // TODO: Replace with MySQL query
  // Example MySQL query: Use JOINs to get event and entry data together
  console.log("Calculating report for event:", eventId);
  const event = await getEvent(eventId);
  if (!event) {
    console.log("Event not found");
    return null;
  }
  
  let entries: EventEntry[];
  
  if (entryId) {
    const entry = await getEventEntry(entryId);
    entries = entry ? [entry] : [];
  } else {
    entries = await getEventEntries(eventId);
  }
  
  if (entries.length === 0) {
    console.log("No entries found for event");
    return null;
  }
  
  console.log("Found entries:", entries);
  
  // For this example, we'll just use the first entry if there are multiple
  const entry = entries[0];
  
  // Calculate total commissions
  const promoterCommissions = entry.promoters.reduce((sum, p) => sum + p.commission, 0);
  const staffPayments = entry.staff.reduce((sum, s) => sum + s.payment, 0);
  const totalCommissions = promoterCommissions + staffPayments + entry.tableCommissions + entry.vipGirlsCommissions;
  
  // Calculate total expenses
  const totalExpenses = entry.adSpend + totalCommissions;
  
  // Calculate total revenue and Rumba's share
  let totalRevenue = 0;
  if (event.dealType === "Entrance Deal" && entry.doorRevenue) {
    totalRevenue = entry.doorRevenue;
  } else if (event.dealType === "Revenue Share" && entry.totalNightRevenue) {
    totalRevenue = entry.totalNightRevenue;
  }
  
  const rumbaShare = totalRevenue * (event.rumbaPercentage / 100);
  
  // Calculate profit
  const profit = rumbaShare - totalExpenses;
  
  const report = {
    totalRevenue,
    rumbaShare,
    totalAttendance: entry.attendance,
    tablesFromRumba: entry.tablesFromRumba,
    totalCommissions,
    totalExpenses,
    profit,
    daysUntilPaid: entry.daysUntilPaid
  };
  
  console.log("Generated report:", report);
  return report;
};
