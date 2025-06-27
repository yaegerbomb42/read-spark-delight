import React from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Book } from '@/types';
import { NotesProvider } from '@/contexts/NotesContext';
import { BookNotes } from '@/components/BookNotes';

const BookReaderView: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const storedBooks = JSON.parse(localStorage.getItem('myBooks') || '[]') as Book[];
  const book = storedBooks.find(b => b.id === bookId);

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
      <div className="container mx-auto p-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <h2 className="text-xl text-muted-foreground mb-4">{book.author}</h2>
          {book.contentType === 'html' ? (
            <div dangerouslySetInnerHTML={{ __html: book.content }} />
          ) : (
            <pre>{book.content}</pre>
          )}
        </div>
        <BookNotes bookId={book.id} />
      </div>
    </NotesProvider>
  );
};

export default BookReaderView;
