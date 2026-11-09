export interface Location {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  color: string;
  lat?: number | string | null;
  lng?: number | string | null;
  is_featured: 0 | 1;
  created_at: string;
}
