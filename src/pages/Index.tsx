
import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import { ReaderStats } from "@/components/ReaderStats";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, Trophy } from "lucide-react";

// Mock data - in real app would come from API/database
const recentBooks = [
  {
    id: "1",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    coverUrl: "https://m.media-amazon.com/images/I/71sylUetxxL._AC_UF1000,1000_QL80_.jpg",
    progress: 65,
    rating: 4,
    tags: ["Finance", "Psychology", "Self-Help"],
    isAudiobook: true,
  },
  {
    id: "2",
    title: "Atomic Habits",
    author: "James Clear",
    coverUrl: "https://m.media-amazon.com/images/I/81bGKUa1e0L._AC_UF1000,1000_QL80_.jpg",
    progress: 42,
    rating: 5,
    tags: ["Productivity", "Self-Help"],
    isAudiobook: false,
  },
  {
    id: "3",
    title: "The Midnight Library",
    author: "Matt Haig",
    coverUrl: "https://m.media-amazon.com/images/I/81tCtHFtOgL._AC_UF1000,1000_QL80_.jpg",
    progress: 23,
    rating: 3,
    tags: ["Fiction", "Fantasy"],
    isAudiobook: true,
  },
  {
    id: "4",
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverUrl: "https://m.media-amazon.com/images/I/91vS2L5YfEL._AC_UF1000,1000_QL80_.jpg",
    progress: 87,
    rating: 5,
    tags: ["Sci-Fi", "Adventure"],
    isAudiobook: true,
  },
];

const recommendedBooks = [
  {
    id: "5",
    title: "Dune",
    author: "Frank Herbert",
    coverUrl: "https://m.media-amazon.com/images/I/81ym3QUd3KL._AC_UF1000,1000_QL80_.jpg",
    progress: 0,
    rating: 4,
    tags: ["Sci-Fi", "Classic"],
    isAudiobook: true,
  },
  {
    id: "6",
    title: "The Four Agreements",
    author: "Don Miguel Ruiz",
    coverUrl: "https://m.media-amazon.com/images/I/81hHy5XrdKL._AC_UF1000,1000_QL80_.jpg",
    progress: 0,
    rating: 4,
    tags: ["Self-Help", "Spirituality"],
    isAudiobook: false,
  },
  {
    id: "7",
    title: "The Alchemist",
    author: "Paulo Coelho",
    coverUrl: "https://m.media-amazon.com/images/I/51Z0nLAfLmL.jpg",
    progress: 12,
    rating: 5,
    tags: ["Fiction", "Philosophy"],
    isAudiobook: true,
  },
  {
    id: "8",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    coverUrl: "https://m.media-amazon.com/images/I/71N3-2sYxSL._AC_UF1000,1000_QL80_.jpg",
    progress: 0,
    rating: 5,
    tags: ["History", "Science", "Anthropology"],
    isAudiobook: true,
  },
];

const achievements = [
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

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header />
      
      <main className="flex-1 container py-6">
        <section className="mb-8">
          <Tabs defaultValue="reading" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Your Books</h2>
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
                {recentBooks.filter(book => !book.isAudiobook).map((book) => (
                  <BookCard key={book.id} {...book} />
                ))}
              </div>
              {recentBooks.filter(book => !book.isAudiobook).length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No books in progress</h3>
                  <p className="text-muted-foreground mb-4">Start reading to see your books here</p>
                  <Button>Browse library</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="listening" className="space-y-6 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {recentBooks.filter(book => book.isAudiobook).map((book) => (
                  <BookCard key={book.id} {...book} />
                ))}
              </div>
              {recentBooks.filter(book => book.isAudiobook).length === 0 && (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {recommendedBooks.map((book) => (
              <BookCard key={book.id} {...book} />
            ))}
          </div>
        </section>
      </main>

      <AudioPlayer 
        bookTitle="The Psychology of Money"
        chapter="Chapter 5: Wealth vs Getting Rich"
      />
    </div>
  );
};

export default Index;
