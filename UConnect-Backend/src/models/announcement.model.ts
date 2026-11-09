import type { RowDataPacket } from "mysql2";

export type AnnouncementPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface AnnouncementModel extends RowDataPacket {
  id: number;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  author_name: string;
  is_active: 0 | 1;
  created_at: Date;
  updated_at: Date;
}

export interface AnnouncementPayload {
  title: string;
  message: string;
  priority: AnnouncementPriority;
  author_name: string;
  is_active?: boolean;
}
