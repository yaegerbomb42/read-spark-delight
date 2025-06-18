
import React, { useState, useEffect } from "react"; // Added React, useState, useEffect
import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import { ReaderStats } from "@/components/ReaderStats";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportBookButton } from "@/components/ImportBookButton"; // Import the new component
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, Trophy } from "lucide-react";
import type { Book } from "@/types"; // Updated import path

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

  const handleBookImported = (newBook: Book) => {
    setBooks(prevBooks => [...prevBooks, newBook]);
  };

  const handleRemoveBook = (bookIdToRemove: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== bookIdToRemove));
    if (currentAudio?.id === bookIdToRemove) {
      setCurrentAudio(null); // Clear current audio if it's the one being removed
    }
  };

  const handlePlayAudioBook = (book: Book) => {
    setCurrentAudio(book);
  };

  const handleAudioTimeUpdate = (currentTime: number, duration: number) => {
    if (currentAudio && duration > 0) {
      const progress = (currentTime / duration) * 100;
      setBooks(prevBooks =>
        prevBooks.map(b =>
          b.id === currentAudio.id ? { ...b, progress: Math.min(100, Math.max(0, progress)) } : b
        )
      );
      // Note: This directly updates books state, which triggers localStorage save.
      // For performance on very frequent updates, debouncing localStorage save might be considered.
    }
  };

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
    // console.log("Saving books to localStorage", books); // For debugging
    try {
      localStorage.setItem('myBooks', JSON.stringify(books));
    } catch (error) {
      console.error("Failed to save books to localStorage", error);
    }
  }, [books]);

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
                dailyGoal={75}
                weeklyGoal={28}
                booksCompleted={12}
                minutesRead={1345}
                currentStreak={10}
                longestStreak={15}
                achievements={achievements}
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
          {/* Recommended books section - can be populated later or removed */}
          {books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {/* Placeholder: map over some recommended books if available or show empty state */}
              {/* For now, let's show a few from the existing books as placeholders if any exist */}
              {/* books.slice(0, 4).map((book) => (
                <BookCard key={`rec-${book.id}`} {...book} onRemoveBook={handleRemoveBook} />
              ))*/}
               <p className="col-span-full text-center text-muted-foreground">Recommendations will appear here.</p>
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
