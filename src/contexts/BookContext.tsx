import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Book } from '@/types';
import { defaultBooksData, getDefaultBookContentPath } from '@/lib/defaultBooks';
import { generateBookCover } from '@/lib/aiImageGenerator';
import { useStats } from './StatsContext';

interface BookContextType {
  books: Book[];
  currentAudio: Book | null;
  recommendedBooks: Book[];
  handleUpdateBookProgress: (bookId: string, newProgress: number) => void;
  handleBookImported: (newBook: Book) => void;
  handleRemoveBook: (bookIdToRemove: string) => void;
  handlePlayAudioBook: (book: Book) => void;
  handleAudioDurationAvailable: (duration: number) => void;
  handleAudioTimeUpdate: (newCurrentTime: number, duration: number) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentAudio, setCurrentAudio] = useState<Book | null>(null);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);

  const {
    userStats,
    recordUserActivity,
    incrementMinutesListened,
    markBookAsCompleted,
    incrementTotalBooksImported,
  } = useStats();

  const lastReportedAudioTimeRef = useRef<{ bookId: string, time: number } | null>(null);

  const handleUpdateBookProgress = useCallback((bookId: string, newProgress: number) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.id === bookId ? { ...book, progress: Math.min(100, Math.max(0, newProgress)) } : book
      )
    );
  }, []);

  const handleBookImported = (newBook: Book) => {
    setBooks(prevBooks => [...prevBooks, newBook]);
    if (incrementTotalBooksImported) {
      incrementTotalBooksImported();
    }
    recordUserActivity();
  };

  const handleRemoveBook = (bookIdToRemove: string) => {
    setBooks(prevBooks => {
      const bookToRemove = prevBooks.find(book => book.id === bookIdToRemove);
      if (bookToRemove && bookToRemove.isAudiobook && bookToRemove.audioSrc && bookToRemove.audioSrc.startsWith('blob:')) {
        URL.revokeObjectURL(bookToRemove.audioSrc);
      }
      return prevBooks.filter(book => book.id !== bookIdToRemove);
    });
    if (currentAudio?.id === bookIdToRemove) {
      setCurrentAudio(null);
    }
  };

  const handlePlayAudioBook = (book: Book) => {
    setCurrentAudio(book);
  };

  const handleAudioDurationAvailable = (duration: number) => {
    if (!currentAudio) return;
    setBooks(prevBooks => prevBooks.map(b => b.id === currentAudio.id ? { ...b, audioSrcDuration: duration } : b));
    setCurrentAudio(prev => prev ? { ...prev, audioSrcDuration: duration } : prev);
    const initialReportedTime = currentAudio.progress ? (currentAudio.progress / 100) * duration : 0;
    lastReportedAudioTimeRef.current = { bookId: currentAudio.id, time: initialReportedTime };
  };

  const handleAudioTimeUpdate = (newCurrentTime: number, duration: number) => {
    if (currentAudio && duration > 0) {
      const progress = (newCurrentTime / duration) * 100;

      setBooks(prevBooks =>
        prevBooks.map(b =>
          b.id === currentAudio.id ? { ...b, progress: Math.min(100, Math.max(0, progress)) } : b
        )
      );

      let timeDeltaInSeconds = 0;
      if (lastReportedAudioTimeRef.current && lastReportedAudioTimeRef.current.bookId === currentAudio.id) {
        if (newCurrentTime > lastReportedAudioTimeRef.current.time) {
          timeDeltaInSeconds = newCurrentTime - lastReportedAudioTimeRef.current.time;
        }
      } else if (newCurrentTime > 0) {
        timeDeltaInSeconds = newCurrentTime;
      }

      lastReportedAudioTimeRef.current = { bookId: currentAudio.id, time: newCurrentTime };

      if (timeDeltaInSeconds > 0) {
        incrementMinutesListened(timeDeltaInSeconds / 60);
        if (timeDeltaInSeconds > 5) {
          recordUserActivity();
        }
      }

      if (progress >= 100) {
        markBookAsCompleted(currentAudio.id);
      }
    }
  };

  useEffect(() => {
    if (currentAudio) {
      const initialReportedTime = currentAudio.progress && currentAudio.audioSrcDuration
        ? (currentAudio.progress / 100) * currentAudio.audioSrcDuration
        : 0;
      lastReportedAudioTimeRef.current = { bookId: currentAudio.id, time: initialReportedTime };
    } else {
      lastReportedAudioTimeRef.current = null;
    }
  }, [currentAudio]);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const storedBooksRaw = localStorage.getItem('myBooks');
        const defaultBooksAlreadyLoaded = localStorage.getItem('defaultBooksLoaded') === 'true';

        if (storedBooksRaw && storedBooksRaw !== '[]') {
          setBooks(JSON.parse(storedBooksRaw));
          if (!defaultBooksAlreadyLoaded) {
            localStorage.setItem('defaultBooksLoaded', 'true');
          }
        } else if (!defaultBooksAlreadyLoaded) {
          console.log("Loading default books for the first time...");
          const booksWithContent: Book[] = [];
          for (const bookData of defaultBooksData) {
            const contentPath = getDefaultBookContentPath(bookData.id);
            let content = "Error loading content.";
            if (contentPath) {
              try {
                const response = await fetch(contentPath);
                if (response.ok) {
                  content = await response.text();
                } else {
                  console.error(`Failed to fetch content for ${bookData.title} from ${contentPath}`);
                }
              } catch (fetchError) {
                console.error(`Error fetching content for ${bookData.title}:`, fetchError);
              }
            }

            let coverUrl = bookData.coverUrl;
            if (coverUrl === '/placeholder.svg') {
              const prompt = `Book cover for '${bookData.title}' by ${bookData.author}, ${bookData.tags.join(', ')}, vibrant, immersive, OpenJourney style, 4k`;
              try {
                const generatedCover = await generateBookCover(prompt);
                coverUrl = generatedCover;
              } catch (aiError) {
                console.error(`Failed to generate AI cover for ${bookData.title}:`, aiError);
                coverUrl = 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80';
              }
            }

            booksWithContent.push({ ...bookData, content, coverUrl });
          }
          setBooks(booksWithContent);
          localStorage.setItem('myBooks', JSON.stringify(booksWithContent));
          localStorage.setItem('defaultBooksLoaded', 'true');
          if (incrementTotalBooksImported && typeof userStats.totalBooksImported === 'number') {
             for (let i = 0; i < booksWithContent.length; i++) {
                incrementTotalBooksImported();
             }
          }
        } else {
          // If default books were already loaded and localStorage is empty, respect that.
          // This prevents re-loading defaults if user intentionally cleared library.
          // However, if the loadBooks useEffect is triggered for other reasons (e.g. state change),
          // and there are no books, we shouldn't clear the library. Let's make sure `setBooks([])` is only
          // called on actual load failure, not on re-renders where `defaultBooksAlreadyLoaded` is true.
          // For now, removing the `else` that sets books to `[]` when `defaultBooksAlreadyLoaded` is true but no `storedBooksRaw`
        }
      } catch (error) {
        console.error("Failed to parse books from localStorage or load default books", error);
        setBooks([]);
      }
    };

    loadBooks();
  }, []); // Empty dependency array to run only once on mount

  useEffect(() => {
    const defaultBooksLoaded = localStorage.getItem('defaultBooksLoaded') === 'true';
    if (books.length > 0 || defaultBooksLoaded) {
        try {
            localStorage.setItem('myBooks', JSON.stringify(books));
        } catch (error) {
            console.error("Failed to save books to localStorage", error);
        }
    }
  }, [books]);

  useEffect(() => {
    if (books.length === 0) {
      setRecommendedBooks([]);
      return;
    }

    const tagCounts: Record<string, number> = {};
    books.forEach(book => {
      book.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
    let recs: Book[] = [];

    if (sortedTags.length > 0) {
      const topTag = sortedTags[0][0];
      recs = books.filter(b => b.tags.includes(topTag));
    }

    if (recs.length < 4) {
      const others = books.filter(b => !recs.includes(b));
      const shuffled = [...others].sort(() => Math.random() - 0.5);
      recs = [...recs, ...shuffled.slice(0, 4 - recs.length)];
    }

    if (recs.length > 4) {
      recs = recs.sort(() => Math.random() - 0.5).slice(0, 4);
    }

    setRecommendedBooks(recs);
  }, [books]);

  return (
    <BookContext.Provider
      value={{
        books,
        currentAudio,
        recommendedBooks,
        handleUpdateBookProgress,
        handleBookImported,
        handleRemoveBook,
        handlePlayAudioBook,
        handleAudioDurationAvailable,
        handleAudioTimeUpdate,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBook = () => {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
}; 