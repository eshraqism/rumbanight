
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type DealType = 'Revenue Share' | 'Entrance Deal';

export interface Partner {
  name: string;
  percentage: number;
}

export interface Event {
  id: string;
  name: string;
  dayOfWeek: DayOfWeek;
  date: Date;
  time: string;
  venueName: string;
  location: string;
  dealType: DealType;
  rumbaPercentage: number;
  paymentTerms: string;
  partners: Partner[];
  createdAt: Date;
}

export interface Promoter {
  id: string;
  name: string;
  commission: number;
}

export interface Staff {
  id: string;
  role: string;
  name: string;
  payment: number;
}

export interface EventEntry {
  id: string;
  eventId: string;
  date: Date;
  promoters: Promoter[];
  staff: Staff[];
  tableCommissions: number;
  vipGirlsCommissions: number;
  adSpend: number;
  adReach: number;
  adClicks: number;
  adLeads: number;
  leadsCollected: number;
  doorRevenue?: number;
  totalNightRevenue?: number;
  attendance: number;
  tablesFromRumba: number;
  daysUntilPaid: number;
  notes?: string;
  createdAt: Date;
}

export interface EventReport {
  totalRevenue: number;
  rumbaShare: number;
  totalAttendance: number;
  tablesFromRumba: number;
  totalCommissions: number;
  totalExpenses: number;
  profit: number;
  daysUntilPaid: number;
}
