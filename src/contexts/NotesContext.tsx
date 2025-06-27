import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Note } from '@/types';

interface NotesContextType {
  notes: Note[];
  addNote: (bookId: string, text: string) => void;
  updateNote: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
  getNotesForBook: (bookId: string) => Note[];
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const stored = localStorage.getItem('bookNotes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bookNotes', JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);

  const addNote = (bookId: string, text: string) => {
    const newNote: Note = { id: crypto.randomUUID(), bookId, text, createdAt: new Date().toISOString() };
    setNotes(prev => [...prev, newNote]);
  };

  const updateNote = (id: string, text: string) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, text } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const getNotesForBook = (bookId: string) => notes.filter(n => n.bookId === bookId);

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, getNotesForBook }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = (): NotesContextType => {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
};
