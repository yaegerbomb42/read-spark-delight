import { render, screen, fireEvent } from '@testing-library/react';
import { BookNotes } from '../BookNotes';
import { NotesProvider } from '@/contexts/NotesContext';

describe('BookNotes', () => {
  it('adds a note', () => {
    render(
      <NotesProvider>
        <BookNotes bookId="b1" />
      </NotesProvider>
    );
    const textarea = screen.getByPlaceholderText('Add note');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByText('Add Note'));
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
