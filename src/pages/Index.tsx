
import React, { useState, useEffect, useRef } from "react"; // Added useRef
import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import { ReaderStats } from "@/components/ReaderStats";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportBookButton } from "@/components/ImportBookButton"; // Import the new component
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, Trophy } from "lucide-react";
import type { Book } from "@/types";
import { useStats } from "@/contexts/StatsContext"; // Import useStats
import { defaultBooksData, getDefaultBookContentPath } from "@/lib/defaultBooks"; // Import default books
import { useDebounce } from "@/hooks/useDebounce";

// Removed UserStats and getCurrentDateYYYYMMDD imports as they are now in StatsContext

// Removed recentBooks and recommendedBooks


const Index = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentAudio, setCurrentAudio] = useState<Book | null>(null);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const {
    userStats,
    recordUserActivity,
    incrementMinutesListened,
    markBookAsCompleted,
    incrementTotalBooksImported, // Import new context function
  } = useStats();

  // Ref to track the last reported audio time for the current playing book
  const lastReportedAudioTimeRef = useRef<{ bookId: string, time: number } | null>(null);


  const handleBookImported = (newBook: Book) => {
    setBooks(prevBooks => [...prevBooks, newBook]);
    if (incrementTotalBooksImported) { // Check if function is available from context
      incrementTotalBooksImported();
    }
    recordUserActivity();
  };

  const handleRemoveBook = (bookIdToRemove: string) => {
    setBooks(prevBooks => {
      const bookToRemove = prevBooks.find(book => book.id === bookIdToRemove);
      if (bookToRemove && bookToRemove.isAudiobook && bookToRemove.audioSrc && bookToRemove.audioSrc.startsWith('blob:')) {
        URL.revokeObjectURL(bookToRemove.audioSrc);
        // console.log("Revoked blob URL:", bookToRemove.audioSrc);
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
      } else if (newCurrentTime > 0) { // First time update for this book session with actual time
        timeDeltaInSeconds = newCurrentTime; // Consider all time from 0 up to now as new
      }

      lastReportedAudioTimeRef.current = { bookId: currentAudio.id, time: newCurrentTime };

      if (timeDeltaInSeconds > 0) {
        incrementMinutesListened(timeDeltaInSeconds / 60);
        // Only record general activity if substantial time has passed (e.g. > 5s to avoid too frequent calls)
        // The existing recordUserActivity already checks for same-day activity.
        // This check is more about "significant enough play to count as activity".
        if (timeDeltaInSeconds > 5) { // Example: count as activity if more than 5s of new playback
          recordUserActivity();
        }
      }

      if (progress >= 100) {
        markBookAsCompleted(currentAudio.id);
      }
    }
  };

  // Effect to reset lastReportedAudioTimeRef when currentAudio changes
  useEffect(() => {
    if (currentAudio) {
      // When a new audio book is selected, set its initial reported time based on its progress.
      // This helps in calculating delta correctly from where it resumed.
      const initialReportedTime = currentAudio.progress && currentAudio.audioSrcDuration
        ? (currentAudio.progress / 100) * currentAudio.audioSrcDuration
        : 0;
      lastReportedAudioTimeRef.current = { bookId: currentAudio.id, time: initialReportedTime };
    } else {
      lastReportedAudioTimeRef.current = null;
    }
  }, [currentAudio]);


  // Load books from localStorage on mount, or load default books if none found
  useEffect(() => {
    const loadBooks = async () => {
      try {
        const storedBooksRaw = localStorage.getItem('myBooks');
        const defaultBooksAlreadyLoaded = localStorage.getItem('defaultBooksLoaded') === 'true';

        if (storedBooksRaw && storedBooksRaw !== '[]') {
          // If books exist in localStorage, parse and use them.
          // Also ensure defaultBooksLoaded flag is true if it wasn't already.
          // This handles cases where user might have old books but not the flag.
          setBooks(JSON.parse(storedBooksRaw));
          if (!defaultBooksAlreadyLoaded) {
            localStorage.setItem('defaultBooksLoaded', 'true');
          }
        } else if (!defaultBooksAlreadyLoaded) {
          // No books in localStorage AND default books haven't been loaded yet.
          console.log("Loading default books for the first time...");
          const booksWithContent: Book[] = [];
          for (const bookData of defaultBooksData) {
            const contentPath = getDefaultBookContentPath(bookData.id);
            let content = "Error loading content.";
            if (contentPath) {
              try {
                const response = await fetch(contentPath); // Assumes files are in public folder
                if (response.ok) {
                  content = await response.text();
                } else {
                  console.error(`Failed to fetch content for ${bookData.title} from ${contentPath}`);
                }
              } catch (fetchError) {
                console.error(`Error fetching content for ${bookData.title}:`, fetchError);
              }
            }
            booksWithContent.push({ ...bookData, content });
          }
          setBooks(booksWithContent);
          localStorage.setItem('myBooks', JSON.stringify(booksWithContent));
          localStorage.setItem('defaultBooksLoaded', 'true');
          // Update stats for imported books
          if (incrementTotalBooksImported && typeof userStats.totalBooksImported === 'number') {
             // Call incrementTotalBooksImported for each default book added
             for (let i = 0; i < booksWithContent.length; i++) {
                incrementTotalBooksImported();
             }
          }
        } else {
          // Default books were loaded in the past (flag is true), but current localStorage is empty or '[]'.
          // This means the user likely cleared their books. Respect this and show an empty library.
          setBooks([]);
        }
      } catch (error) {
        console.error("Failed to parse books from localStorage or load default books", error);
        setBooks([]); // Fallback to empty array on error
      }
    };

    loadBooks();
  }, [incrementTotalBooksImported, userStats.totalBooksImported]); // Added userStats.totalBooksImported

  // Save books to localStorage when books state changes
  useEffect(() => {
    // Only save if books array is not empty or if default books have been loaded
    // This prevents overwriting an intentionally cleared localStorage with an empty array
    // before default books are loaded for the first time.
    const defaultBooksLoaded = localStorage.getItem('defaultBooksLoaded') === 'true';
    if (books.length > 0 || defaultBooksLoaded) {
        try {
            localStorage.setItem('myBooks', JSON.stringify(books));
        } catch (error) {
            console.error("Failed to save books to localStorage", error);
        }
    }
  }, [books]);

  // Update recommended books whenever the library changes
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

  // Cleanup Blob URLs on component unmount
  useEffect(() => {
    // This effect now only depends on the `books` list for iterating at unmount.
    // The `books` dependency means if the list changes, it re-evaluates, which is fine.
    return () => {
      const currentBooks = JSON.parse(localStorage.getItem('myBooks') || '[]') as Book[];
      currentBooks.forEach(book => {
        if (book.isAudiobook && book.audioSrc && book.audioSrc.startsWith('blob:')) {
          URL.revokeObjectURL(book.audioSrc);
          // console.log("Revoked blob URL on unmount for:", book.title);
        }
      });
    };
  }, []); // Empty dependency array: runs only on mount and unmount.

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(debouncedQuery.toLowerCase())
  );
  const booksToShow = debouncedQuery ? filteredBooks : books;

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="flex-1 container py-6">
        <section className="mb-8">
          <Tabs defaultValue="reading" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Your Books</h2>
                <ImportBookButton onBookImported={handleBookImported} />
              </div>
              <TabsList>
                <TabsTrigger value="reading" className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>Reading</span>
                </TabsTrigger>
                <TabsTrigger value="listening" className="flex items-center gap-1.5">
                  <Headphones className="h-4 w-4" />
                  <span>Listening</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4" />
                  <span>Stats</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="reading" className="space-y-6 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {booksToShow.filter(book => !book.isAudiobook).map((book) => (
                  <BookCard key={book.id} {...book} onRemoveBook={handleRemoveBook} />
                ))}
              </div>
              {booksToShow.filter(book => !book.isAudiobook).length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No books in progress</h3>
                  <p className="text-muted-foreground mb-4">Start reading to see your books here</p>
                  <Button>Browse library</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="listening" className="space-y-6 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {booksToShow.filter(book => book.isAudiobook).map((book) => (
                  <BookCard
                    key={book.id}
                    {...book}
                    onRemoveBook={handleRemoveBook}
                    onPlayAudioBook={handlePlayAudioBook}
                  />
                ))}
              </div>
              {booksToShow.filter(book => book.isAudiobook).length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No audiobooks in progress</h3>
                  <p className="text-muted-foreground mb-4">Start listening to see your audiobooks here</p>
                  <Button>Browse audiobooks</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="mt-2">
              <ReaderStats />
            </TabsContent>
          </Tabs>
        </section>

        <Separator className="my-8" />

        {searchQuery === "" && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recommended for you</h2>
              <Button variant="ghost" className="text-sm">
                View all
              </Button>
            </div>
            {recommendedBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {recommendedBooks.map((book) => (
                  <BookCard key={`rec-${book.id}`} {...book} onRemoveBook={handleRemoveBook} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No recommendations available yet. Add some books to your library!</p>
            )}
          </section>
        )}
      </main>

      <AudioPlayer
        audioSrc={currentAudio?.audioSrc}
        bookTitle={currentAudio?.title || "No book selected"}
        chapter={currentAudio ? currentAudio.author : "Unknown author"}
        onTimeUpdate={handleAudioTimeUpdate}
        onDurationAvailable={handleAudioDurationAvailable}
        initialProgressPercent={currentAudio?.progress}
      />
    </div>
  );
};

export default Index;
