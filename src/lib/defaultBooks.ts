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
    id: 'digital-reading-guide',
    title: 'The Complete Guide to Digital Reading',
    author: 'Digital Literature Institute',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['technology', 'educational', 'comprehensive'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'storytelling-digital-age',
    title: 'The Art of Storytelling in the Digital Age',
    author: 'Narrative Innovation Lab',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['storytelling', 'technology', 'creative'],
    isAudiobook: false,
    contentType: 'text',
  },
  {
    id: 'mindful-technology',
    title: 'Mindful Technology: A Guide to Digital Wellness',
    author: 'Wellness Technology Institute',
    coverUrl: '/placeholder.svg',
    progress: 0,
    rating: 0,
    tags: ['wellness', 'mindfulness', 'technology'],
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
    case 'digital-reading-guide':
      return '/books/the_complete_guide_to_digital_reading.txt';
    case 'storytelling-digital-age':
      return '/books/the_art_of_storytelling_in_digital_age.txt';
    case 'mindful-technology':
      return '/books/mindful_technology_digital_wellness.txt';
    default:
      return null;
  }
};
