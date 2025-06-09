import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom'; // Imported useLocation
import type { Book } from '@/types';
import { useTTS } from '@/hooks/useTTS';
import { Button } from '@/components/ui/button';

const BookReaderView: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const location = useLocation(); // Get location object
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { speak, pause, resume, cancel, isSpeaking, isPaused, isSupported } = useTTS();
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to save scroll progress
  const saveScrollProgress = () => {
    if (contentRef.current && book) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollHeight - clientHeight <= 0) return; // Avoid division by zero if not scrollable

      const scrollPercentage = Math.min(100, Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100));

      try {
        const storedBooks = localStorage.getItem('myBooks');
        if (storedBooks) {
          const booksArray: Book[] = JSON.parse(storedBooks);
          const bookIndex = booksArray.findIndex(b => b.id === bookId);
          if (bookIndex !== -1) {
            booksArray[bookIndex].progress = scrollPercentage;
            localStorage.setItem('myBooks', JSON.stringify(booksArray));
            // console.log(`Scroll progress for ${book.title}: ${scrollPercentage.toFixed(2)}%`);
          }
        }
      } catch (err) {
        console.error("Failed to save scroll progress to localStorage", err);
      }
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (isSpeaking || isPaused) {
      cancel();
    }

    const bookFromState = location.state?.book as Book | undefined;

    if (bookFromState && bookFromState.id === bookId) {
      setBook(bookFromState);
      setLoading(false);
      setError(null);
      // console.log("Book loaded from route state:", bookFromState.title);
      return; // Book found in state, no need to fetch from localStorage
    }

    // console.log("Book not in route state or ID mismatch, fetching from localStorage for bookId:", bookId);
    try {
      const storedBooks = localStorage.getItem('myBooks');
      if (storedBooks) {
        const booksArray: Book[] = JSON.parse(storedBooks);
        const foundBook = booksArray.find(b => b.id === bookId);
        if (foundBook) {
          setBook(foundBook);
        } else {
          setError(`Book with ID "${bookId}" not found in localStorage.`);
        }
      } else {
        setError('No books found in localStorage.');
      }
    } catch (err) {
      console.error("Failed to load or parse book from localStorage", err);
      setError('Failed to load book data.');
      cancel();
    } finally {
      setLoading(false);
    }
  }, [bookId, cancel, isSpeaking, isPaused, location.state]); // Added location.state to dependency array

  // Effect for restoring scroll position
  useEffect(() => {
    if (book && contentRef.current && book.progress > 0) {
      const { scrollHeight, clientHeight } = contentRef.current;
      if (scrollHeight - clientHeight > 0) { // Ensure content is scrollable
        const attemptRestoreScroll = () => {
          if(contentRef.current) { // Check ref again inside rAF
            const newScrollTop = (book.progress / 100) * (contentRef.current.scrollHeight - contentRef.current.clientHeight);
            contentRef.current.scrollTop = newScrollTop;
            // console.log(`Restored scroll for ${book.title} to ${book.progress}% (${newScrollTop}px)`);
          }
        };
        // Delay to allow content to render and scrollHeight to be accurate
        // Using requestAnimationFrame or a small timeout can help
        requestAnimationFrame(attemptRestoreScroll);
      }
    }
  }, [book]); // Depends on book object (after it's loaded)

  // Effect for scroll event listener and unmount cleanup
  useEffect(() => {
    const currentContentRef = contentRef.current;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(saveScrollProgress, 500); // Debounce save
    };

    if (currentContentRef) {
      currentContentRef.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentContentRef) {
        currentContentRef.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeoutRef.current) { // Clear timeout on unmount
        clearTimeout(scrollTimeoutRef.current);
      }
      saveScrollProgress(); // Save one last time on unmount
      if (isSpeaking || isPaused) { // Cancel TTS on unmount
        cancel();
      }
    };
  }, [book, saveScrollProgress, cancel, isSpeaking, isPaused]); // saveScrollProgress is memoized by useCallback if defined with it


  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-red-500">{error}</p>
        <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Library
        </Link>
      </div>
    );
  }

  if (!book) {
    // This case should ideally be covered by the error state from useEffect
    return (
      <div className="container mx-auto p-4">
        <p>Book not found.</p>
        <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col h-screen">
      <div className="mb-4 flex justify-between items-center">
        <Link to="/" className="text-blue-500 hover:underline">
          &larr; Back to Library
        </Link>
        {isSupported && book && (
          <div className="flex items-center gap-2">
            {!isSpeaking && !isPaused && (
              <Button
                onClick={() => {
                  let textForTTS = book.content;
                  if (book.contentType === 'html') {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = book.content;
                    textForTTS = tempDiv.textContent || tempDiv.innerText || "";
                  }
                  speak(textForTTS, 'en-US');
                }}
                variant="outline"
              >
                Speak
              </Button>
            )}
            {isSpeaking && !isPaused && (
              <Button onClick={pause} variant="outline">Pause</Button>
            )}
            {isPaused && (
              <Button onClick={resume} variant="outline">Resume</Button>
            )}
            {(isSpeaking || isPaused) && (
              <Button onClick={cancel} variant="destructive">Stop</Button>
            )}
          </div>
        )}
      </div>

      {isSupported && (isSpeaking || isPaused) && (
        <div className="mb-2 text-sm text-muted-foreground">
          TTS Status: {isSpeaking && !isPaused ? "Speaking..." : isPaused ? "Paused." : "Idle."}
        </div>
      )}
      {!isSupported && (
         <div className="mb-2 text-sm text-red-500">
          Text-to-Speech is not supported in your browser.
        </div>
      )}

      <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
      <h2 className="text-xl text-muted-foreground mb-4">{book.author}</h2>

      <div
        ref={contentRef} // Ensure ref is attached once
        className="flex-grow overflow-y-auto p-4 border rounded-md bg-muted/20 prose dark:prose-invert max-w-full" // Added prose for basic HTML styling
        style={{
          // whiteSpace: 'pre-wrap', // Not needed for HTML content
          maxHeight: 'calc(100vh - 250px)',
        }}
      >
        {book.contentType === 'html' ? (
          <div dangerouslySetInnerHTML={{ __html: book.content }} />
        ) : (
          // Fallback for 'text' or undefined contentType
          book.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph || <>&nbsp;</>}</p>
          ))
        )}
      </div>
    </div>
  );
};

export default BookReaderView;
