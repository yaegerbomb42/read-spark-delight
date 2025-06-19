import { render, fireEvent, waitFor } from '@testing-library/react';
import { ImportBookButton } from '../ImportBookButton';
import React from 'react';

vi.mock('epubjs', () => ({ default: vi.fn() }));
vi.mock('pdfjs-dist/build/pdf.mjs', () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: {},
}));
vi.mock('jsmediatags', () => ({ default: { read: vi.fn() } }));

describe('ImportBookButton', () => {
  it('imports plain text files', async () => {
    const onBookImported = vi.fn();
    const { container } = render(<ImportBookButton onBookImported={onBookImported} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    await fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(onBookImported).toHaveBeenCalled());
    const book = onBookImported.mock.calls[0][0];
    expect(book.title).toBe('test');
    expect(book.content).toBe('hello world');
    expect(book.isAudiobook).toBe(false);
  });
});
