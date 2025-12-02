
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  CLASS_BOARD = 'CLASS_BOARD'
}

export interface UserContext {
  role: UserRole;
  name: string;
  assignedClass?: { std: string; sec: string }; // For Teachers
  linkedStudentId?: string; // For Parents
}

export interface Student {
  id: string;
  admin_no: string;
  name: string;
  std: string;
  sec: string;
  fingerprint_id: number;
  parent_phone: string;
  attendance_percentage: number;
  status: 'Present' | 'Absent' | 'Late';
}

export interface AttendanceRecord {
  id: string;
  student_name: string;
  admin_no: string;
  date: string;
  time?: string;
  recorded_at?: string;
  status: 'Present' | 'Late' | 'Absent';
  device_id: string;
  student_id?: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description?: string;
  target_class: string; // e.g., 'All', '10', '10-A'
  date: string;
  type: 'Vacation Break' | 'Event' | 'Holiday';
}

export interface Stats {
  totalStudents: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
}

export interface DeviceStatus {
  device_id: string;
  last_seen: string;
  wifi_ok: boolean;
  api_ok: boolean;
  queue_size: number;
}

export interface SyncLog {
  id: number;
  device_id: string;
  synced_at: string;
  total_synced: number;
  failed_count: number;
}

export interface DeviceLog {
  id: number;
  device_id: string;
  message: string;
  timestamp: string;
  type: 'info' | 'error' | 'warning';
}