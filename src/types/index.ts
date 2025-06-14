export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  progress: number;
  rating: number;
  tags: string[];
  isAudiobook: boolean;
  content: string; // For text of e-books
  contentUrl?: string; // URL to full content
  audioSrc?: string; // For audio file URL
  contentType?: 'text' | 'html'; // New field for content type
  currentPage?: number;
  totalPages?: number;
  readTimeMinutes?: number;
  chapter?: number;
}
