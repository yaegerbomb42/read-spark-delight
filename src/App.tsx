
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StatsProvider } from "./contexts/StatsContext"; // Import StatsProvider
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BookReaderView from "./pages/BookReaderView"; // Import BookReaderView
import { NotesProvider } from "./contexts/NotesContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StatsProvider>
        <NotesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/read/:bookId" element={<BookReaderView />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NotesProvider>
      </StatsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
