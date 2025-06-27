import { useState } from 'react';
import { useNotes } from '@/contexts/NotesContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface BookNotesProps {
  bookId: string;
}

export function BookNotes({ bookId }: BookNotesProps) {
  const { addNote, updateNote, deleteNote, getNotesForBook } = useNotes();
  const notes = getNotesForBook(bookId);
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Notes</h3>
      <ul className="space-y-2">
        {notes.map(n => (
          <li key={n.id} className="border p-2 rounded">
            {editingId === n.id ? (
              <div className="space-y-2">
                <Textarea value={editText} onChange={e => setEditText(e.target.value)} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => {updateNote(n.id, editText); setEditingId(null);}}>Save</Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between">
                <p className="whitespace-pre-line">{n.text}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => {setEditingId(n.id); setEditText(n.text);}}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteNote(n.id)}>Delete</Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="space-y-2">
        <Textarea value={newText} onChange={e => setNewText(e.target.value)} placeholder="Add note" />
        <Button onClick={() => {if(newText.trim()){addNote(bookId, newText.trim()); setNewText('');}}}>Add Note</Button>
      </div>
    </div>
  );
}
