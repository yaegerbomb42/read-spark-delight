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
  audioSrcDuration?: number; // Duration of audio in seconds
  contentType?: 'text' | 'html';
}

export interface UserStats {
  totalBooksImported: number;
  completedBookIds: string[]; // IDs of books where progress reached 100%
  totalMinutesRead: number;    // Accumulated for text books
  totalMinutesListened: number; // Accumulated for audiobooks
  currentStreak: number;        // Consecutive days of any reading/listening activity
  longestStreak: number;
  lastReadingDate: string | null; // YYYY-MM-DD format
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'gold' | 'silver' | 'bronze' | 'locked';
  progress?: number;
  maxProgress?: number;
  isNew?: boolean;
}

export interface Note {
  id: string;
  bookId: string;
  text: string;
  createdAt: string; // ISO date string
}
