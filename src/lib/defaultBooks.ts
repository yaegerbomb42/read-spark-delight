import type { Book } from '@/types';

export const defaultBooksData: Omit<Book, 'content'>[] = [
  {
    id: 'pride-and-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverUrl: '/placeholder.svg', // Will be replaced by AI cover
    progress: 0,
    rating: 0,
    tags: ['classic', 'romance', 'society'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'alice-in-wonderland',
    title: 'Alice in Wonderland',
    author: 'Lewis Carroll',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['classic', 'fantasy', 'adventure'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'moby-dick',
    title: 'Moby Dick',
    author: 'Herman Melville',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['classic', 'adventure', 'sea'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'sherlock-holmes',
    title: 'The Adventures of Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['classic', 'mystery', 'detective'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'book1',
    title: 'The Art of Simple Reading',
    author: 'Digital Library',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['modern', 'educational', 'simple'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'book2',
    title: 'Reading in the Digital Age',
    author: 'Tech Authors',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['modern', 'technology', 'educational'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'book3',
    title: 'Words and Wonder',
    author: 'Creative Writers',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['modern', 'creative', 'inspiration'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'book4',
    title: 'The Flow of Ideas',
    author: 'Thought Leaders',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['modern', 'philosophy', 'ideas'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'book5',
    title: 'Digital Reading Journey',
    author: 'App Developers',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['modern', 'technology', 'journey'],
    isAudiobook: false,
    contentType: 'text',
  },
];

// Function to get the paths for the content files
export const getDefaultBookContentPath = (id: string): string | null => {
  switch (id) {
    case 'pride-and-prejudice':
      return '/books/pride_and_prejudice.txt';
    case 'alice-in-wonderland':
      return '/books/alice_in_wonderland.txt';
    case 'moby-dick':
      return '/books/moby_dick.txt';
    case 'sherlock-holmes':
      return '/books/sherlock_holmes.txt';
    case 'book1':
      return '/books/book1.txt';
    case 'book2':
      return '/books/book2.txt';
    case 'book3':
      return '/books/book3.txt';
    case 'book4':
      return '/books/book4.txt';
    case 'book5':
      return '/books/book5.txt';
    default:
      return null;
  }
};
