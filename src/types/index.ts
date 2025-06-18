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
  audioSrc?: string; // For audio file URL
  contentType?: 'text' | 'html'; // New field for content type
}
