import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Book } from '@/types';
import { NotesProvider } from '@/contexts/NotesContext';
import { BookNotes } from '@/components/BookNotes';
import { useTTS } from '@/hooks/useTTS';

// Dopamine font import (Google Fonts)
// Add this to index.html or via @import in CSS for production
// For now, use className="font-dopamine" for dopamine mode

const DOPAMINE_FONT = '"Baloo 2", "Comic Neue", "Quicksand", sans-serif';

function getBestFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // Prioritize Google, then Samantha, then any female
  const preferred = [
    /Google US English/i,
    /Samantha/i,
    /female/i,
  ];
  for (const regex of preferred) {
    const found = voices.find(v => regex.test(v.name) && v.lang.startsWith('en'));
    if (found) return found;
  }
  // Fallback: any en voice
  return voices.find(v => v.lang.startsWith('en')) || null;
}

const BookReaderView: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const storedBooks = JSON.parse(localStorage.getItem('myBooks') || '[]') as Book[];
  const book = storedBooks.find(b => b.id === bookId);

  // Dopamine mode state
  const [dopamineMode, setDopamineMode] = useState(false);

  // TTS state
  const { speak, pause, resume, cancel, isSpeaking, isPaused, isSupported } = useTTS();
  const [ttsActive, setTtsActive] = useState(false);
  const [currentWordIdx, setCurrentWordIdx] = useState<number | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Prepare words for highlighting
  useEffect(() => {
    if (!book) return;
    let text = book.contentType === 'html'
      ? (book.content.replace(/<[^>]+>/g, ' ')) // crude strip tags
      : book.content;
    // Split into words, keeping punctuation
    const split = text.match(/\S+|\n/g) || [];
    setWords(split);
    setCurrentWordIdx(null);
  }, [book]);

  // Load voices and pick the best female
  useEffect(() => {
    if (!isSupported) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoice(getBestFemaleVoice(voices));
        setVoicesLoaded(true);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  // TTS boundary event: highlight word
  const handleBoundary = useCallback((event: SpeechSynthesisEvent) => {
    if (!words.length) return;
    // Find which word is being spoken
    const charIndex = event.charIndex;
    let acc = 0;
    for (let i = 0; i < words.length; i++) {
      acc += words[i].length + 1; // +1 for space/newline
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
    let text = words.join(' ');
    const utterOptions = {
      onBoundary: handleBoundary,
      onStart: handleTTSStart,
      onEnd: handleTTSEnd,
    };
    // Use best female voice if available
    if (voice) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.voice = voice;
      utter.lang = voice.lang;
      utter.onboundary = utterOptions.onBoundary;
      utter.onstart = utterOptions.onStart;
      utter.onend = utterOptions.onEnd;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } else {
      speak(text, 'en-US', utterOptions);
    }
  };

  // Dopamine font and color classes
  const dopamineFont = dopamineMode ? { fontFamily: DOPAMINE_FONT } : {};
  const dopamineBg = dopamineMode ? 'bg-dopamine-100 dark:bg-dopamine-900' : '';
  const dopamineText = dopamineMode ? 'text-dopamine-700 dark:text-dopamine-200' : '';

  if (!book) {
    return (
      <div className="container mx-auto p-4">
        <p>Book not found.</p>
        <Link to="/" className="text-blue-500 hover:underline">
          Back to Library
        </Link>
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
            <h1 className={`text-3xl font-bold mb-2 ${dopamineText}`}>{book.title}</h1>
            <h2 className={`text-xl text-muted-foreground mb-4 ${dopamineText}`}>{book.author}</h2>
          </div>
          <div className="flex gap-2 items-center">
            <button
              className={`px-4 py-2 rounded font-semibold shadow transition-all duration-300 ${dopamineMode ? 'bg-dopamine-400 text-white hover:bg-dopamine-500' : 'bg-primary text-white hover:bg-primary/80'}`}
              onClick={() => setDopamineMode(m => !m)}
            >
              {dopamineMode ? 'Dopamine Mode On' : 'Dopamine Mode'}
            </button>
            <button
              className={`px-4 py-2 rounded font-semibold shadow transition-all duration-300 ${ttsActive ? 'bg-dopamine-500 text-white animate-pulse' : 'bg-secondary text-primary hover:bg-secondary/80'}`}
              onClick={handlePlay}
              disabled={isSpeaking || !voicesLoaded}
            >
              {isSpeaking ? 'Reading...' : 'Read Aloud'}
            </button>
            <button
              className="px-2 py-2 rounded bg-muted text-muted-foreground hover:bg-muted/80"
              onClick={pause}
              disabled={!isSpeaking || isPaused}
            >Pause</button>
            <button
              className="px-2 py-2 rounded bg-muted text-muted-foreground hover:bg-muted/80"
              onClick={resume}
              disabled={!isSpeaking || !isPaused}
            >Resume</button>
            <button
              className="px-2 py-2 rounded bg-destructive text-white hover:bg-destructive/80"
              onClick={() => { cancel(); setTtsActive(false); setCurrentWordIdx(null); }}
              disabled={!isSpeaking && !isPaused}
            >Stop</button>
          </div>
        </div>
        <div className={`prose max-w-none text-lg leading-relaxed ${dopamineMode ? 'prose-p:text-dopamine-700 prose-p:font-bold' : ''}`}
          style={dopamineFont}
        >
          {/* Render words with highlight */}
          <div className="flex flex-wrap gap-y-2">
            {words.map((word, idx) => (
              <span
                key={idx}
                className={`inline-block transition-all duration-200 px-1 rounded ${
                  currentWordIdx === idx && ttsActive
                    ? 'bg-dopamine-300 text-dopamine-900 scale-110 animate-pulse font-extrabold shadow-lg'
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
        </div>
        <BookNotes bookId={book.id} />
      </div>
    </NotesProvider>
  );
};

export default BookReaderView;
