
import { Event, EventEntry, DayOfWeek, DealType } from "@/types";

// Helper function to get the day of week from a date
const getDayOfWeek = (date: Date): DayOfWeek => {
  const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

// Generate mock events
export const generateMockEvents = (): Event[] => {
  const events: Event[] = [];
  const venues = ["Skyline Lounge", "Pulse Nightclub", "Echo Bar", "Mirage Club", "Velvet Room"];
  const locations = ["Downtown", "Westside", "Marina District", "Old Town", "Uptown"];
  const dealTypes: DealType[] = ["Revenue Share", "Entrance Deal"];
  
  // Create 5 mock events
  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 7)); // Each event is a week apart
    
    const event: Event = {
      id: `evt-${i + 1}`,
      name: `Night Fever ${i + 1}`,
      dayOfWeek: getDayOfWeek(date),
      date: date,
      time: '22:00',
      venueName: venues[i % venues.length],
      location: locations[i % locations.length],
      dealType: dealTypes[i % dealTypes.length],
      rumbaPercentage: 50 + (i * 5), // 50%, 55%, 60%, etc.
      paymentTerms: "50% upfront, weekly payments",
      partners: [
        { name: "Rumba", percentage: 50 + (i * 5) },
        { name: "Local Partner", percentage: 50 - (i * 5) }
      ],
      createdAt: new Date(date.getTime() - (1000 * 60 * 60 * 24 * 2)) // 2 days before the event
    };
    
    events.push(event);
  }
  
  return events;
};

// Generate mock event entries
export const generateMockEventEntries = (events: Event[]): EventEntry[] => {
  const entries: EventEntry[] = [];
  
  // Create entries for each event
  events.forEach((event, eventIndex) => {
    const entry: EventEntry = {
      id: `entry-${eventIndex + 1}`,
      eventId: event.id,
      date: event.date,
      promoters: [
        { id: `promo-${eventIndex}-1`, name: "John Promoter", commission: 500 },
        { id: `promo-${eventIndex}-2`, name: "Sarah Promoter", commission: 350 }
      ],
      staff: [
        { id: `staff-${eventIndex}-1`, role: "Hostess", name: "Alice", payment: 200 },
        { id: `staff-${eventIndex}-2`, role: "Photographer", name: "Bob", payment: 150 }
      ],
      tableCommissions: 800,
      vipGirlsCommissions: 300,
      adSpend: 400,
      adReach: 5000 + (eventIndex * 1000),
      adClicks: 300 + (eventIndex * 50),
      adLeads: 50 + (eventIndex * 10),
      leadsCollected: 30 + (eventIndex * 5),
      attendance: 200 + (eventIndex * 25),
      tablesFromRumba: 3 + (eventIndex % 3),
      daysUntilPaid: 7 + (eventIndex * 2),
      createdAt: new Date()
    };
    
    // Set revenue based on deal type
    if (event.dealType === "Entrance Deal") {
      entry.doorRevenue = 4000 + (eventIndex * 500);
    } else {
      entry.totalNightRevenue = 10000 + (eventIndex * 1000);
    }
    
    entries.push(entry);
  });
  
  return entries;
};

// Initial data load
export const mockEvents = generateMockEvents();
export const mockEventEntries = generateMockEventEntries(mockEvents);
