
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
// Removed UserStats and getCurrentDateYYYYMMDD imports as they are now in StatsContext

// Removed recentBooks and recommendedBooks

const achievements = [ // Kept achievements as it's not part of this subtask's scope to remove
  {
    id: "a1",
    title: "Bookworm",
    description: "Read for 10 days in a row",
    type: "gold" as const,
    isNew: true,
  },
  {
    id: "a2",
    title: "Chapter Master",
    description: "Complete 50 chapters",
    type: "silver" as const,
  },
  {
    id: "a3",
    title: "Early Bird",
    description: "Read before 7 AM for 5 days",
    type: "bronze" as const,
  },
  {
    id: "a4",
    title: "Book Collector",
    description: "Add 20 books to your library",
    type: "bronze" as const,
  },
  {
    id: "a5",
    title: "Night Owl",
    description: "Read after 10 PM for 7 days",
    type: "locked" as const,
    progress: 4,
    maxProgress: 7,
  },
  {
    id: "a6",
    title: "Marathon Reader",
    description: "Read for 3 hours straight",
    type: "locked" as const,
    progress: 90,
    maxProgress: 180,
  },
  {
    id: "a7",
    title: "Critic",
    description: "Leave reviews for 10 books",
    type: "locked" as const,
    progress: 3,
    maxProgress: 10,
  },
  {
    id: "a8",
    title: "Genre Explorer",
    description: "Read books from 5 different genres",
    type: "locked" as const,
    progress: 3,
    maxProgress: 5,
  },
  {
    id: "a9",
    title: "Audiobook Enthusiast",
    description: "Listen to 5 audiobooks",
    type: "locked" as const,
    progress: 2,
    maxProgress: 5,
  },
  {
    id: "a10",
    title: "Social Reader",
    description: "Share 3 quotes on social media",
    type: "locked" as const,
    progress: 0,
    maxProgress: 3,
  },
];

const Index = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentAudio, setCurrentAudio] = useState<Book | null>(null);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
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
      const initialReportedTime = currentAudio.progress && currentAudio.audioSrcDuration // Assuming audioSrcDuration is available
        ? (currentAudio.progress / 100) * currentAudio.audioSrcDuration
        : 0;
      lastReportedAudioTimeRef.current = { bookId: currentAudio.id, time: initialReportedTime };
    } else {
      lastReportedAudioTimeRef.current = null;
    }
  }, [currentAudio]);


  // Load books from localStorage on mount
  useEffect(() => {
    try {
      const storedBooks = localStorage.getItem('myBooks');
      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      }
    } catch (error) {
      console.error("Failed to parse books from localStorage", error);
    }
  }, []);

  // Save books to localStorage when books state changes
  useEffect(() => {
    try {
      localStorage.setItem('myBooks', JSON.stringify(books));
    } catch (error) {
      console.error("Failed to save books to localStorage", error);
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

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header />
      
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
                {books.filter(book => !book.isAudiobook).map((book) => (
                  <BookCard key={book.id} {...book} onRemoveBook={handleRemoveBook} />
                ))}
              </div>
              {books.filter(book => !book.isAudiobook).length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No books in progress</h3>
                  <p className="text-muted-foreground mb-4">Start reading to see your books here</p>
                  <Button>Browse library</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="listening" className="space-y-6 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {books.filter(book => book.isAudiobook).map((book) => (
                  <BookCard
                    key={book.id}
                    {...book}
                    onRemoveBook={handleRemoveBook}
                    onPlayAudioBook={handlePlayAudioBook}
                  />
                ))}
              </div>
              {books.filter(book => book.isAudiobook).length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No audiobooks in progress</h3>
                  <p className="text-muted-foreground mb-4">Start listening to see your audiobooks here</p>
                  <Button>Browse audiobooks</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="mt-2">
              <ReaderStats
                booksCompleted={userStats.completedBookIds.length}
                minutesRead={Math.round(userStats.totalMinutesRead)}
                minutesListened={Math.round(userStats.totalMinutesListened)}
                currentStreak={userStats.currentStreak}
                longestStreak={userStats.longestStreak}
                achievements={achievements} // Keep passing static achievements
              />
            </TabsContent>
          </Tabs>
        </section>

        <Separator className="my-8" />

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
      </main>

      <AudioPlayer
        audioSrc={currentAudio?.audioSrc}
        bookTitle={currentAudio?.title || "No book selected"}
        chapter={currentAudio ? currentAudio.author : "Unknown author"}
        onTimeUpdate={handleAudioTimeUpdate}
        initialProgressPercent={currentAudio?.progress}
      />
    </div>
  );
};

export default Index;
