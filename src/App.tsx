
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StatsProvider } from "./contexts/StatsContext";
import { BookProvider } from "./contexts/BookContext"; // Import BookProvider
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BookReaderView from "./pages/BookReaderView";
import SettingsPage from "./pages/SettingsPage"; // Import SettingsPage
import ProfilePage from "./pages/ProfilePage";   // Import ProfilePage
import { NotesProvider } from "./contexts/NotesContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StatsProvider>
        <NotesProvider>
          <BookProvider> {/* Wrap with BookProvider */}
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/read/:bookId" element={<BookReaderView />} />
                <Route path="/settings" element={<SettingsPage />} /> {/* New Route */}
                <Route path="/profile" element={<ProfilePage />} />   {/* New Route */}
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </BookProvider>
        </NotesProvider>
      </StatsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
