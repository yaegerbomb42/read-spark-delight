import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { Book } from '@/types';
// Use explicit path to the ESM build of epubjs so Vite can resolve it
import ePub from 'epubjs/dist/epub.js';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/build/pdf.mjs'; // Import from modern build

// Configure PDF.js worker
// This path assumes the worker file is copied to the public root directory.
GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';


interface ImportBookButtonProps {
  onBookImported: (book: Book) => void;
}

export function ImportBookButton({ onBookImported }: ImportBookButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const filename = file.name.replace(/\.[^/.]+$/, ""); // Remove extension for title fallback

    if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (e_reader) => {
        const fileContent = e_reader.target?.result as string;
        const newBook: Book = {
          id: Date.now().toString(),
          title: filename,
          author: "Unknown Author",
          coverUrl: "/placeholder.svg",
          progress: 0,
          rating: 0,
          tags: [],
          isAudiobook: false,
          content: fileContent,
          audioSrc: undefined,
          contentType: 'text',
        };
        onBookImported(newBook);
      };
      reader.readAsText(file);
    } else if (file.name.toLowerCase().endsWith(".epub")) {
      const reader = new FileReader();
      reader.onload = async (e_reader) => {
        try {
          const arrayBuffer = e_reader.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            console.error("Failed to read EPUB file as ArrayBuffer.");
            // TODO: Provide user feedback
            return;
          }
          const epubBook = ePub(arrayBuffer);
          const metadata = await epubBook.loaded.metadata;

          const title = metadata.title || filename;
          const author = metadata.creator || "Unknown Author";

          let coverImageUrl: string | undefined = undefined;
          try {
            const rawCoverUrl = await epubBook.coverUrl(); // This can return null or blob URL
            if (rawCoverUrl) {
              // If it's a blob URL, create an object URL. For now, assume it might be directly usable or needs fetching.
              // For simplicity, we'll directly assign it. If it's a blob, it might need to be read into a data URL.
              // This part might need refinement based on how epubjs provides the URL and how it's stored/used.
              // For now, let's assume it might be a URL string or convert blob to data URL if possible.
              // For this increment, we'll just pass it. A more robust solution might involve fetching blob and converting.
              coverImageUrl = rawCoverUrl;
            }
          } catch (coverError) {
            console.warn("Error getting EPUB cover:", coverError);
          }

          let htmlContent = "";
          await epubBook.ready; // Ensure all sections are loaded and parsed

          for (const section of epubBook.spine.sections) {
            try {
              const sectionDoc = await section.load(); // Loads section XML/HTML (Document object)
              const sectionHtml = new XMLSerializer().serializeToString(sectionDoc); // Serialize Document to string
              htmlContent += sectionHtml;
            } catch (sectionError) {
              console.warn("Error loading EPUB section:", section.idref, sectionError);
              // htmlContent += `<p>Error loading section: ${section.idref}</p>`; // Or skip
            }
          }

          // A very basic cleanup to make it more readable for now, might need more robust sanitization/styling
          // This is a placeholder - actual HTML content from EPUBs can be complex
          if (htmlContent === "") {
            htmlContent = "<p>Could not extract content from EPUB.</p>";
          }

          const newBookAppFormat: Book = {
            id: Date.now().toString(),
            title: title,
            author: author,
            coverUrl: coverImageUrl || "/placeholder.svg",
            progress: 0,
            rating: 0,
            tags: [],
            isAudiobook: false,
            content: htmlContent,
            audioSrc: undefined,
            contentType: 'html',
          };
          onBookImported(newBookAppFormat);

        } catch (epubError) {
          console.error("Error parsing EPUB:", epubError);
          // TODO: Provide user feedback about failed EPUB import
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.name.toLowerCase().endsWith(".pdf")) {
      const reader = new FileReader();
      reader.onload = async (e_reader) => {
        try {
          const arrayBuffer = e_reader.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            console.error("Failed to read PDF file as ArrayBuffer.");
            return;
          }

          const loadingTask = getDocument({ data: arrayBuffer });
          const pdfDoc = await loadingTask.promise;

          const pdfMetadata = await pdfDoc.getMetadata();
          const title = pdfMetadata.info?.Title || filename;
          const author = pdfMetadata.info?.Author || "Unknown Author";

          let fullText = "";
          for (let i = 1; i <= pdfDoc.numPages; i++) {
            try {
              const page = await pdfDoc.getPage(i);
              const textContent = await page.getTextContent();
              // Ensure item.str is correctly accessed, even if 'item' is typed implicitly as any by some setups
              textContent.items.forEach(item => { fullText += (item as any).str + " "; });
              fullText += "\n"; // Add a newline between pages
            } catch (pageError) {
              console.warn(`Error processing page ${i} of PDF:`, pageError);
              fullText += `\n[Error processing page ${i}]\n`;
            }
          }

          const newBookAppFormat: Book = {
            id: Date.now().toString(),
            title: title,
            author: author,
            coverUrl: "/placeholder.svg", // PDFs generally don't have a simple cover image like ePubs
            progress: 0,
            rating: 0,
            tags: [],
            isAudiobook: false,
            content: fullText.trim(),
            audioSrc: undefined,
            contentType: 'text', // PDF text extraction results in plain text
          };
          onBookImported(newBookAppFormat);

        } catch (pdfError) {
          console.error("Error parsing PDF:", pdfError);
          // TODO: Provide user feedback about failed PDF import
        }
      };
      reader.readAsArrayBuffer(file);
    }
     else {
      console.warn("Unsupported file type:", file.type || file.name);
      // TODO: Provide user feedback
    }

    // Reset file input value to allow importing the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        accept=".txt,.epub,.pdf" // Updated accept attribute
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Button onClick={handleButtonClick} variant="outline">
        Import Book (.txt, .epub, .pdf)
      </Button>
    </>
  );
}
