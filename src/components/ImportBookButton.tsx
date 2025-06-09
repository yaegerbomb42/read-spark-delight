import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { Book } from '@/types'; // Updated import path

interface ImportBookButtonProps {
  onBookImported: (book: Book) => void;
}

export function ImportBookButton({ onBookImported }: ImportBookButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        const filename = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

        const newBook: Book = {
          id: Date.now().toString(),
          title: filename,
          author: "Unknown Author",
          coverUrl: "/placeholder.svg", // Assumes placeholder.svg is in public directory
          progress: 0,
          rating: 0,
          tags: [],
          isAudiobook: false,
          content: fileContent,
          audioSrc: undefined,
        };
        onBookImported(newBook);
      };
      reader.readAsText(file);
      // Reset file input value to allow importing the same file again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        accept=".txt"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Button onClick={handleButtonClick} variant="outline">
        Import .txt Book
      </Button>
    </>
  );
}
