import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
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

function getBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  
  const lowerCaseVoices = voices.map(v => ({ voice: v, name: v.name.toLowerCase() }));
  
  // Prioritize high-quality voices
  const preferredKeywords = [
    /premium|enhanced|neural|natural/,
    /google\s+(us\s+)?english/,
    /microsoft\s+(zira|hazel|david|mark)/,
    /samantha|alex|victoria|karen|daniel/,
    /whisper|soft|calm|serene|comfort/,
    /female|woman/,
  ];

  // Look for premium/neural voices first (usually higher quality)
  for (const keywordRegex of preferredKeywords) {
    const found = lowerCaseVoices.find(v => 
      keywordRegex.test(v.name) && 
      (v.voice.lang.startsWith('en') || v.voice.lang === 'en-US')
    );
    if (found) return found.voice;
  }

  // Fallback to any English voice, preferring US English
  const usEnglish = voices.find(v => v.lang === 'en-US');
  if (usEnglish) return usEnglish;
  
  const anyEnglish = voices.find(v => v.lang.startsWith('en'));
  if (anyEnglish) return anyEnglish;
  
  // Last resort: any voice
  return voices[0];
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
    const text = book.contentType === 'html'
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
        const best = getBestVoice(voices);
        setVoice(best);
        setVoiceIndex(best ? voices.findIndex(v => v === best) : 0);
        setVoicesLoaded(true);
        console.log("Best voice selected:", best?.name, best?.lang);
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

  // TTS play
  const handlePlay = () => {
    if (!book || !words.length || !voice) return;
    
    console.log("Starting TTS with voice:", voice.name, voice.lang);
    
    const textToSpeak = words.map(w => w === '\n' ? '\n' : w).join('');
    
    // Cancel any existing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setTtsActive(false);
      setCurrentWordIdx(null);
      // Wait a bit before starting new speech
      setTimeout(() => handlePlay(), 100);
      return;
    }
    
    const utterance = new window.SpeechSynthesisUtterance(textToSpeak);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => {
      console.log("TTS started successfully");
      setTtsActive(true);
    };
    
    utterance.onend = () => {
      console.log("TTS ended");
      setTtsActive(false);
      setCurrentWordIdx(null);
    };
    
    utterance.onerror = (event) => {
      console.error("TTS error:", event);
      setTtsActive(false);
      setCurrentWordIdx(null);
    };
    
    utterance.onboundary = (event) => {
      if (!words.length) return;
      const charIndex = event.charIndex;
      let acc = 0;
      for (let i = 0; i < words.length; i++) {
        if (charIndex <= acc) {
          setCurrentWordIdx(i);
          break;
        }
        acc += words[i].length + (words[i] === '\n' ? 0 : 1);
      }
    };

    window.speechSynthesis.speak(utterance);
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
  const dopamineBg = dopamineMode ? 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30' : '';
  const dopamineText = dopamineMode ? 'text-purple-700 dark:text-purple-200' : '';
  const dopamineHighlight = dopamineMode 
    ? 'bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 text-purple-900 scale-110 animate-pulse font-extrabold shadow-lg border-2 border-yellow-400 rounded-lg' 
    : 'bg-blue-200 text-blue-900 font-semibold';
  const dopamineWordHover = dopamineMode 
    ? 'hover:bg-gradient-to-r hover:from-yellow-200 hover:to-pink-200 hover:text-purple-800 hover:scale-105 transform transition-all duration-200 cursor-pointer hover:shadow-md hover:rounded hover:border hover:border-purple-300' 
    : '';

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
              className={`px-4 py-2 rounded font-extrabold shadow-lg transition-all duration-300 border-2 ${
                dopamineMode 
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white animate-pulse border-yellow-400 shadow-yellow-300/50' 
                  : 'bg-primary text-white hover:bg-primary/80 border-primary'
              }`}
              onClick={() => setDopamineMode(m => !m)}
            >
              {dopamineMode ? '✨ DOPAMINE MODE ACTIVE ✨' : '⚡ Activate Dopamine Mode'}
            </Button>
            <Select value={String(voiceIndex)} onValueChange={handleVoiceChange} disabled={!voicesLoaded || allVoices.length === 0}>
              <SelectTrigger className="w-[180px] bg-muted text-primary font-semibold">
                <SelectValue placeholder="Select Voice" />
              </SelectTrigger>
              <SelectContent>
                {isSupported ? (allVoices.length > 0 ? (
                  allVoices.map((v, i) => (
                    <SelectItem key={v.voiceURI} value={String(i)} className={getBestVoice([v]) ? 'font-bold text-purple-600' : ''}>
                      {v.name} ({v.lang}) {/premium|enhanced|neural|natural|google|microsoft/i.test(v.name) ? '⭐' : ''} {/whisper|soft|asmr|calm|serene|comfort/i.test(v.name) ? '✨' : ''}
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
              className={`px-4 py-2 rounded font-semibold shadow-lg transition-all duration-300 ${
                ttsActive 
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white animate-pulse shadow-green-300/50' 
                  : 'bg-secondary text-primary hover:bg-secondary/80'
              }`}
              onClick={handlePlay}
              disabled={isSpeaking || !voicesLoaded || voiceIndex === -1}
            >
              {isSpeaking ? '🔊 Reading...' : '🎵 Read Aloud'}
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
                  className={`inline-block transition-all duration-300 px-1 py-0.5 mx-0.5 rounded ${
                    currentWordIdx === idx && ttsActive
                      ? dopamineHighlight
                      : dopamineMode
                      ? `${dopamineWordHover} text-purple-600 font-semibold`
                      : 'hover:bg-gray-100 hover:text-gray-800'
                  } ${
                    // Add random gentle animations in dopamine mode
                    dopamineMode && Math.random() > 0.8 
                      ? 'animate-bounce' 
                      : dopamineMode && Math.random() > 0.9
                      ? 'animate-pulse'
                      : ''
                  }`}
                  style={{
                    ...dopamineFont,
                    // Add subtle color variations in dopamine mode
                    ...(dopamineMode && currentWordIdx !== idx ? {
                      color: `hsl(${Math.abs(word.charCodeAt(0) * 7) % 360}, 70%, 40%)`,
                      textShadow: '0 0 2px rgba(255,255,255,0.8)'
                    } : {})
                  }}
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
