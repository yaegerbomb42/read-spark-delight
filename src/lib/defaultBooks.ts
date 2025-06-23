import type { Book } from '@/types';

export const defaultBooksData: Omit<Book, 'content'>[] = [
  {
    id: 'default-book-1',
    title: 'The First Adventure',
    author: 'AI Storyteller',
    coverUrl: '/placeholder.svg', // You can replace this with actual cover URLs if you have them
    progress: 0,
    rating: 0,
    tags: ['adventure', 'fiction'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'default-book-2',
    title: 'Mysteries of the Cosmos',
    author: 'Cosmic Voyager',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['science', 'non-fiction', 'space'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'default-book-3',
    title: 'A Simple Life',
    author: 'Philosopher Bot',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['philosophy', 'life'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'default-book-4',
    title: 'Chronicles of Code',
    author: 'Dev Scribe',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['technology', 'programming'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'default-book-5',
    title: 'The Last Page',
    author: 'Narrator X',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['meta', 'short-story'],
    isAudiobook: false,
    contentType: 'text',
  },
];

// Function to get the paths for the content files
export const getDefaultBookContentPath = (id: string): string | null => {
  const bookNumber = id.split('-').pop();
  if (bookNumber && parseInt(bookNumber, 10) >= 1 && parseInt(bookNumber, 10) <= 5) {
    return `/books/book${bookNumber}.txt`;
  }
  return null;
};
