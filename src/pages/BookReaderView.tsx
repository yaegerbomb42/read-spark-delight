import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import type { Book } from '@/types';
import { NotesProvider } from '@/contexts/NotesContext';
import { BookNotes } from '@/components/BookNotes';
import { useTTS } from '@/hooks/useTTS';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useBook } from '@/contexts/BookContext';
import { ChevronLeft } from 'lucide-react';

// Dopamine font import (Google Fonts)
// Add this to index.html or via @import in CSS for production
// For now, use className="font-dopamine" for dopamine mode

const DOPAMINE_FONT = '"Baloo 2", "Comic Neue", "Quicksand", sans-serif';

function getBestFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const lowerCaseVoices = voices.map(v => ({ voice: v, name: v.name.toLowerCase() }));
  
  const preferredKeywords = [
    /google\s+us\s+english/,
    /samantha/,
    /female/,
    /whisper/,
    /soft/,
    /calm/,
    /serene/,
    /comfort/,
  ];

  // Prioritize based on keywords and then general female
  for (const keywordRegex of preferredKeywords) {
    const found = lowerCaseVoices.find(v => 
      keywordRegex.test(v.name) && v.voice.lang.startsWith('en')
    );
    if (found) return found.voice;
  }

  // Fallback: any en voice
  return voices.find(v => v.lang.startsWith('en')) || null;
}

const BookReaderView: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { books, handleUpdateBookProgress } = useBook(); // Use useBook hook
  const book = books.find(b => b.id === bookId);
  const navigate = useNavigate(); // Initialize navigate hook

  // Dopamine mode state
  const [dopamineMode, setDopamineMode] = useState(false);

  // TTS state
  const { speak, pause, resume, cancel, isSpeaking, isPaused, isSupported } = useTTS();
  const [ttsActive, setTtsActive] = useState(false);
  const [currentWordIdx, setCurrentWordIdx] = useState<number | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [voiceIndex, setVoiceIndex] = useState<number>(-1);
  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Ref for the content container to track scroll for progress
  const contentRef = useRef<HTMLDivElement>(null);

  // Prepare words for highlighting
  useEffect(() => {
    if (!book) {
      console.log("Book not found for ID:", bookId);
      return;
    }
    console.log("Loading book content for:", book.title, "Content length:", book.content?.length);
    let text = book.contentType === 'html'
      ? (book.content.replace(/<[^>]+>/g, ' ')) // crude strip tags
      : book.content;
    
    // Handle potential null or undefined content
    if (!text) {
      console.warn("Book content is empty or undefined for:", book.title);
      setWords([]);
      setCurrentWordIdx(null);
      return;
    }

    // Split into words, keeping punctuation
    const split = text.match(/(\S+|\n|\s)/g) || []; // Capture groups to include spaces and newlines as words
    console.log("Split words count:", split.length);
    setWords(split);
    setCurrentWordIdx(null);
    // Scroll to previous position if available
    if (contentRef.current && book.progress) {
      const scrollHeight = contentRef.current.scrollHeight;
      const clientHeight = contentRef.current.clientHeight;
      const scrollableHeight = scrollHeight - clientHeight;
      contentRef.current.scrollTop = (book.progress / 100) * scrollableHeight;
    }
  }, [book, bookId]); // Added bookId to dependencies

  // Load voices and pick the best female
  useEffect(() => {
    if (!isSupported) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAllVoices(voices);
      if (voices.length > 0) {
        const best = getBestFemaleVoice(voices);
        setVoice(best);
        setVoiceIndex(best ? voices.findIndex(v => v === best) : 0);
        setVoicesLoaded(true);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  // Update voice when user selects
  useEffect(() => {
    if (voiceIndex >= 0 && allVoices[voiceIndex]) {
      setVoice(allVoices[voiceIndex]);
    }
  }, [voiceIndex, allVoices]);

  // TTS boundary event: highlight word
  const handleBoundary = useCallback((event: SpeechSynthesisEvent) => {
    if (!words.length) return;
    // Find which word is being spoken
    const charIndex = event.charIndex;
    let acc = 0;
    for (let i = 0; i < words.length; i++) {
      acc += words[i].length + (words[i] === '\n' ? 0 : 1); // Only add 1 for space if not newline
      if (charIndex < acc) {
        setCurrentWordIdx(i);
        break;
      }
    }
  }, [words]);

  // TTS start/end: reset highlight
  const handleTTSStart = () => setTtsActive(true);
  const handleTTSEnd = () => {
    setTtsActive(false);
    setCurrentWordIdx(null);
  };

  // TTS play
  const handlePlay = () => {
    if (!book || !words.length) return;
    const textToSpeak = words.map(w => w === '\n' ? '\n' : w).join(''); // Keep newlines for speech, but no extra spaces
    const utterOptions = {
      onBoundary: handleBoundary,
      onStart: handleTTSStart,
      onEnd: handleTTSEnd,
    };
    
    if (voice) {
      const utter = new window.SpeechSynthesisUtterance(textToSpeak);
      utter.voice = voice;
      utter.lang = voice.lang;
      utter.onboundary = utterOptions.onBoundary;
      utter.onstart = utterOptions.onStart;
      utter.onend = utterOptions.onEnd;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } else {
      // Fallback if no specific voice selected or found (shouldn't happen with default selection)
      speak(textToSpeak, 'en-US', utterOptions);
    }
  };

  // Handle manual voice selection via dropdown
  const handleVoiceChange = (value: string) => {
    const newIndex = Number(value);
    setVoiceIndex(newIndex);
    if (allVoices[newIndex]) {
      setVoice(allVoices[newIndex]);
      // If speaking, restart with new voice
      if (isSpeaking) {
        cancel();
        // Small delay to ensure previous speech is fully cancelled
        setTimeout(handlePlay, 100);
      }
    }
  };

  // Progress tracking
  const calculateProgress = useCallback(() => {
    if (!contentRef.current || !book) return 0;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const scrollableHeight = scrollHeight - clientHeight;
    if (scrollableHeight <= 0) return book.progress; // Avoid division by zero, return existing progress
    
    const newProgress = (scrollTop / scrollableHeight) * 100;
    return Math.min(100, Math.max(0, newProgress));
  }, [book]);

  useEffect(() => {
    const handleScroll = () => {
      if (!book) return;
      const newProgress = calculateProgress();
      // Only update if significant change and different from current book.progress
      if (Math.abs(newProgress - book.progress) > 1) {
        handleUpdateBookProgress(book.id, newProgress); // Call context function to update and save
      }
    };

    const currentContentRef = contentRef.current;
    if (currentContentRef) {
      currentContentRef.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentContentRef) {
        currentContentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [book, calculateProgress, handleUpdateBookProgress]); // Add handleUpdateBookProgress to dependencies

  // Dopamine font and color classes
  const dopamineFont = dopamineMode ? { fontFamily: DOPAMINE_FONT } : {};
  const dopamineBg = dopamineMode ? 'bg-dopamine-100 dark:bg-dopamine-900' : '';
  const dopamineText = dopamineMode ? 'text-dopamine-700 dark:text-dopamine-200' : '';
  const dopamineHighlight = dopamineMode ? 'bg-dopamine-300 text-dopamine-900 scale-110 animate-pulse font-extrabold shadow-lg' : '';

  if (!book) {
    return (
      <div className="container mx-auto p-4">
        <p>Book not found.</p>
        <Button onClick={() => navigate('/')} className="text-blue-500 hover:underline">
          Back to Library
        </Button>
      </div>
    );
  }

  return (
    <NotesProvider>
      <div className={`container mx-auto p-4 space-y-6 transition-all duration-500 ${dopamineBg}`}
        style={dopamineFont}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <Button onClick={() => navigate('/')} className="text-muted-foreground hover:text-primary flex items-center gap-1.5 mb-2">
              <ChevronLeft className="h-5 w-5" />
              Back to Library
            </Button>
            <h1 className={`text-3xl font-bold mb-2 ${dopamineText}`}>{book.title}</h1>
            <h2 className={`text-xl text-muted-foreground mb-4 ${dopamineText}`}>{book.author}</h2>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              className={`px-4 py-2 rounded font-extrabold shadow transition-all duration-300 border-2 border-dopamine-400 ${dopamineMode ? 'bg-dopamine-400 text-white animate-pulse' : 'bg-primary text-white hover:bg-primary/80'}`}
              onClick={() => setDopamineMode(m => !m)}
            >
              {dopamineMode ? 'DOPAMINE MODE ON' : 'Dopamine Mode'}
            </Button>
            <Select value={String(voiceIndex)} onValueChange={handleVoiceChange} disabled={!voicesLoaded || allVoices.length === 0}>
              <SelectTrigger className="w-[180px] bg-muted text-primary font-semibold">
                <SelectValue placeholder="Select Voice" />
              </SelectTrigger>
              <SelectContent>
                {isSupported ? (allVoices.length > 0 ? (
                  allVoices.map((v, i) => (
                    <SelectItem key={v.voiceURI} value={String(i)} className={getBestFemaleVoice([v]) ? 'font-bold text-dopamine-600' : ''}>
                      {v.name} ({v.lang}) {/whisper|soft|asmr|calm|serene|comfort/i.test(v.name) ? '✨' : ''}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-voices" disabled>Loading voices...</SelectItem>
                )) : (
                  <SelectItem value="not-supported" disabled>
                    TTS Not Supported (Try Chrome)
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button
              className={`px-4 py-2 rounded font-semibold shadow transition-all duration-300 ${ttsActive ? 'bg-dopamine-500 text-white animate-pulse' : 'bg-secondary text-primary hover:bg-secondary/80'}`}
              onClick={handlePlay}
              disabled={isSpeaking || !voicesLoaded || voiceIndex === -1}
            >
              {isSpeaking ? 'Reading...' : 'Read Aloud'}
            </Button>
            <Button
              className="px-2 py-2 rounded bg-muted text-muted-foreground hover:bg-muted/80"
              onClick={pause}
              disabled={!isSpeaking || isPaused}
            >Pause</Button>
            <Button
              className="px-2 py-2 rounded bg-muted text-muted-foreground hover:bg-muted/80"
              onClick={resume}
              disabled={!isSpeaking || !isPaused}
            >Resume</Button>
            <Button
              className="px-2 py-2 rounded bg-destructive text-white hover:bg-destructive/80"
              onClick={() => { cancel(); setTtsActive(false); setCurrentWordIdx(null); }}
              disabled={!isSpeaking && !isPaused}
            >Stop</Button>
          </div>
        </div>
        <div 
          className={cn(
            `prose max-w-none text-lg leading-relaxed ${dopamineMode ? 'prose-p:text-dopamine-700 prose-p:font-bold' : ''}`,
            "overflow-y-auto h-[60vh] p-4 border rounded-lg shadow-inner"
          )} // Merged className properties
          style={dopamineFont}
          ref={contentRef} // Attach ref for scroll tracking
        >
          {/* Render words with highlight */}
          {book.contentType === 'html' ? (
            <div dangerouslySetInnerHTML={{ __html: book.content }} /> // Render HTML content directly
          ) : words.length === 0 ? (
            <div className="text-red-600 font-bold text-xl">No content available for this book.</div>
          ) : (
            <div className="flex flex-wrap gap-y-2 text-justify">
              {words.map((word, idx) => (
                <span
                  key={idx}
                  className={`inline-block transition-all duration-200 px-1 rounded ${
                    currentWordIdx === idx && ttsActive
                      ? dopamineHighlight
                      : dopamineMode
                      ? 'hover:bg-dopamine-200 hover:text-dopamine-900 cursor-pointer'
                      : ''
                  }`}
                  style={dopamineFont}
                >
                  {word === '\n' ? <br /> : word + ' '}
                </span>
              ))}
            </div>
          )}
        </div>
        <BookNotes bookId={book.id} />
      </div>
    </NotesProvider>
  );
};

export default BookReaderView;
