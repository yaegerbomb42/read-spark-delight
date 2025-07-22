
import React, { useState } from "react";
import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import { ReaderStats } from "@/components/ReaderStats";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportBookButton } from "@/components/ImportBookButton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, Trophy } from "lucide-react";
import { useBook } from "@/contexts/BookContext"; // Import useBook hook
import { useDebounce } from "@/hooks/useDebounce";
// No longer directly importing defaultBooksData, getDefaultBookContentPath, generateBookCover

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const {
    books,
    currentAudio,
    recommendedBooks,
    handleBookImported,
    handleRemoveBook,
    handlePlayAudioBook,
    handleAudioDurationAvailable,
    handleAudioTimeUpdate,
  } = useBook();

  // Refactored: No longer need internal state for books, currentAudio, recommendedBooks, or related effects
  // These are now managed by BookContext.

  const booksToShow = searchQuery
    ? books.filter(
        (book) =>
          book.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : books;

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
