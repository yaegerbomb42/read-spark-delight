import { renderHook, act } from '@testing-library/react';
import { NotesProvider, useNotes } from '../NotesContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotesProvider>{children}</NotesProvider>
);

describe('NotesContext', () => {
  it('adds and deletes notes', () => {
    const { result } = renderHook(() => useNotes(), { wrapper });
    act(() => {
      result.current.addNote('book1', 'First note');
    });
    const note = result.current.notes[0];
    expect(note.text).toBe('First note');

    act(() => {
      result.current.deleteNote(note.id);
    });
    expect(result.current.notes.length).toBe(0);
  });
});
