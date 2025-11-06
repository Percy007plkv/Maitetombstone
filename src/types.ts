export interface ImageData {
  id: string;
  bucket: string;
  path: string;
  title: string | null;
  tags: string[];
  width: number | null;
  height: number | null;
  bytes: number | null;
  created_at: string;
}
