
import { Stats } from './types';

export const MOCK_STATS: Stats = {
  totalStudents: 0,
  presentToday: 0,
  lateToday: 0,
  absentToday: 0,
};

// Data from PM SHRI KENDRIYA VIDYALAYA SULUR Calendar
export const HOLIDAY_LIST: any[] = [
  { title: 'Bohi', date: '2025-01-13', type: 'Holiday' },
  { title: 'Pongal', date: '2025-01-14', type: 'Holiday' },
  { title: 'Thiruvalluvar Day', date: '2025-01-15', type: 'Holiday' },
  { title: 'Republic Day', date: '2025-01-26', type: 'Holiday' },
  { title: 'Holi', date: '2025-03-14', type: 'Holiday' },
  { title: 'Id-Ul-Fitr', date: '2025-03-31', type: 'Holiday' },
  { title: 'Mahavir Jayanti', date: '2025-04-10', type: 'Holiday' },
  { title: 'Good Friday', date: '2025-04-18', type: 'Holiday' },
  { title: 'Budha Purnima', date: '2025-05-12', type: 'Holiday' },
  { title: 'Id-Ul-Zuha (Bakrid)', date: '2025-06-07', type: 'Holiday' },
  { title: 'Muharram', date: '2025-07-06', type: 'Holiday' },
  { title: 'Independence Day', date: '2025-08-15', type: 'Holiday' },
  { title: 'Ganesh Chaturthi', date: '2025-08-27', type: 'Holiday' },
  { title: 'Milad-Un-Nabi', date: '2025-09-05', type: 'Holiday' },
  { title: 'Mahatma Gandhi Birthday', date: '2025-10-02', type: 'Holiday' },
  { title: 'Vijaya Dashami', date: '2025-10-02', type: 'Holiday' },
  { title: 'Diwali', date: '2025-10-20', type: 'Holiday' },
  { title: 'Govardhan Puja', date: '2025-10-22', type: 'Holiday' },
  { title: 'Bhai Dhuj', date: '2025-10-23', type: 'Holiday' },
  { title: 'Guru Nanak Birthday', date: '2025-11-05', type: 'Holiday' },
  { title: 'Christmas', date: '2025-12-25', type: 'Holiday' },
];

export const VACATION_LIST: any[] = [
  { title: 'Summer Vacation', date: '2025-05-02', type: 'Vacation Break', description: '50 Days (Ends 20-06-2025)' },
  { title: 'Autumn Break', date: '2025-09-27', type: 'Vacation Break', description: '10 Days (Ends 06-10-2025)' },
  { title: 'Winter Break', date: '2025-12-23', type: 'Vacation Break', description: '10 Days (Ends 01-01-2026)' },
];