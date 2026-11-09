import type { RowDataPacket } from "mysql2";

export interface LocationModel extends RowDataPacket {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  color: string;
  lat: number | null;
  lng: number | null;
  is_featured: 0 | 1;
  created_at: Date;
}
