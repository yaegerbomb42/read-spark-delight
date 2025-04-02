
import { useState, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Settings
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AudioPlayerProps {
  bookTitle?: string;
  chapter?: string;
  onFinish?: () => void;
}

export function AudioPlayer({
  bookTitle = "No book selected",
  chapter = "Chapter 1",
  onFinish
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [speed, setSpeed] = useState(1.0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // This would be connected to actual audio in a real implementation
  const currentTime = formatTime(progress * 300); // Assuming 5 minutes total
  const totalTime = formatTime(300);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleProgressChange = (value: number[]) => {
    setProgress(value[0] / 100);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 50) return <Volume1 className="h-4 w-4" />;
    return <Volume2 className="h-4 w-4" />;
  };

  const speeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background backdrop-blur-lg border-t p-3 z-30">
      <div className="container flex flex-col sm:flex-row items-center">
        <div className="flex-1 min-w-0 flex items-center mb-2 sm:mb-0">
          <div className="truncate">
            <h4 className="font-medium truncate text-sm">{bookTitle}</h4>
            <p className="text-muted-foreground text-xs truncate">{chapter}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center max-w-xl w-full">
          <div className="flex items-center justify-center space-x-4 mb-1">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous section</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button 
              onClick={handlePlayPause} 
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next section</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center w-full space-x-2">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {currentTime}
            </span>
            <Slider
              value={[progress * 100]}
              max={100}
              step={1}
              onValueChange={handleProgressChange}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">
              {totalTime}
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-end space-x-3 mt-2 sm:mt-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVolume(0)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {getVolumeIcon()}
            </button>
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>

          <select
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="bg-muted text-xs rounded px-1.5 py-1 border-none focus:ring-1 focus:ring-primary"
          >
            {speeds.map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
