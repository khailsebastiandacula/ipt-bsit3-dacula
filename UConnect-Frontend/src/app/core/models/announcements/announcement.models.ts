export type AnnouncementPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Announcement {
  id: number;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  author_name: string;
  is_active: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementPayload {
  title: string;
  message: string;
  priority: AnnouncementPriority;
  author_name: string;
  is_active: boolean;
}
