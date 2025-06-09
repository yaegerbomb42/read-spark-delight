
import { useState } from "react";
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Headphones, Star, X as XIcon } from "lucide-react";
import type { Book as BookType } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface BookCardProps extends BookType {
  onRemoveBook: (bookId: string) => void;
  onPlayAudioBook?: (book: BookType) => void; // Added optional prop
}

export function BookCard(props: BookCardProps) { // Changed to accept props directly
  const {
    id,
    title,
    author,
    coverUrl,
    progress,
    rating,
    tags,
    isAudiobook,
    content, // Destructure all BookType props
    audioSrc, // Destructure all BookType props
    onRemoveBook,
    onPlayAudioBook,
  } = props;
  const navigate = useNavigate();
  const [hovering, setHovering] = useState(false);

  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-achievement-gold fill-achievement-gold' : 'text-muted'}`} 
      />
    );
  }

  return (
    <Card 
  className="group overflow-hidden transition-all duration-300 hover:shadow-lg relative" // Added relative positioning
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Remove Button */}
      {hovering && (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 z-10 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click or other parent events
                  onRemoveBook(id);
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Remove book</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <CardHeader className="p-0 h-[220px] overflow-hidden relative">
        <img 
          src={coverUrl || "https://via.placeholder.com/200x300?text=Book+Cover"} 
          alt={title}
          className="w-full h-full object-cover book-cover transition-all duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2"> {/* Adjusted this to avoid clash if X button is on the right */}
          {isAudiobook && (
            <Badge variant="secondary" className="flex items-center gap-1 mr-8"> {/* Added margin if X is on right */}
              <Headphones className="h-3 w-3" />
              <span>Audio</span>
            </Badge>
          )}
        </div>
        {hovering && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="default"
              size="sm"
              className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/90 hover:bg-primary"
              onClick={(e) => {
                e.stopPropagation();
                if (isAudiobook) {
                  if (onPlayAudioBook) {
                    // Reconstruct the Book object from props to pass to onPlayAudioBook
                    const bookData: BookType = {
                      id, title, author, coverUrl, progress, rating, tags, isAudiobook, content, audioSrc
                    };
                    onPlayAudioBook(bookData);
                  } else {
                    console.log("onPlayAudioBook prop not provided for ID:", id);
                  }
                } else {
                  // Pass the whole book object (props) as route state
                  navigate(`/read/${id}`, { state: { book: props as BookType } });
                  navigate(`/book/${id}`);
                }
              }}
            >
              <Play className="h-6 w-6 ml-1" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <h3 className="font-semibold text-base mb-1 line-clamp-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-1">{author}</p>
        <div className="flex items-center space-x-1 mb-3">
          {stars}
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2" 
            style={{ '--progress-width': `${progress}%` } as React.CSSProperties}
          />
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-4 pt-0 flex flex-wrap gap-1">
        {tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
        {tags.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{tags.length - 2}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
