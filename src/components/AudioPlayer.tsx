
import React, { useState, useRef, useEffect } from "react"; // Imported React explicitly for React.FC if needed
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Settings,
  RotateCcw // For reset/replay
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
  audioSrc?: string;
  bookTitle?: string;
  chapter?: string;
  onFinish?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialProgressPercent?: number;
  onDurationAvailable?: (duration: number) => void;
}

export function AudioPlayer({
  audioSrc,
  bookTitle = "No book selected",
  chapter = "Chapter 1",
  onFinish,
  onTimeUpdate,
  initialProgressPercent,
  onDurationAvailable,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7); // HTML5 audio volume is 0 to 1
  const [speed, setSpeed] = useState(1.0);

  // Effect for handling audioSrc changes
  useEffect(() => {
    if (audioRef.current && audioSrc) {
      audioRef.current.src = audioSrc;
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
      // setDuration(0); // Duration will be set by 'loadedmetadata'
    } else if (audioRef.current && !audioSrc) {
      // If audioSrc is removed, reset the player
      audioRef.current.src = "";
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [audioSrc]);

  // Effect for setting up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      if (initialProgressPercent !== undefined && audio.duration > 0) {
        const initialTime = (initialProgressPercent / 100) * audio.duration;
        audio.currentTime = initialTime;
        setCurrentTime(initialTime); // Also update React state
      }
      if (onDurationAvailable) {
        onDurationAvailable(audio.duration);
      }
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onTimeUpdate && audio.duration > 0) { // Ensure duration is available
        onTimeUpdate(audio.currentTime, audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0); // Reset to beginning on end
      if (onFinish) onFinish();
    };
    const handleVolumeChangeEv = () => setVolume(audio.volume); // Reflect external changes to volume
    const handleRateChange = () => setSpeed(audio.playbackRate);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("volumechange", handleVolumeChangeEv);
    audio.addEventListener("ratechange", handleRateChange);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("volumechange", handleVolumeChangeEv);
      audio.removeEventListener("ratechange", handleRateChange);
    };
}, [onFinish, onDurationAvailable, audioSrc]); // Added audioSrc and callback deps


  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !audioSrc) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => console.error("Error playing audio:", error));
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setVolume(newVolume); // Update React state
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime); // Update React state immediately
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
    setSpeed(newSpeed); // Update React state
  };

  const handleSkip = (amount: number) => {
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + amount));
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-4 w-4" />;
    if (volume < 0.5) return <Volume1 className="h-4 w-4" />; // Adjusted for 0-1 range
    return <Volume2 className="h-4 w-4" />;
  };

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const isPlayerDisabled = !audioSrc || duration === 0;


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background backdrop-blur-lg border-t p-3 z-30">
      <audio ref={audioRef}>
        <track kind="captions" src="" label="No captions available" />
      </audio>
      <div className="container flex flex-col sm:flex-row items-center">
        <div className="flex-1 min-w-0 flex items-center mb-2 sm:mb-0">
          <div className="truncate">
            <h4 className="font-medium truncate text-sm">{bookTitle}</h4>
            <p className="text-muted-foreground text-xs truncate">{chapter}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center max-w-xl w-full">
          <div className="flex items-center justify-center space-x-2 mb-1"> {/* Reduced space for replay */}
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSkip(-10)} disabled={isPlayerDisabled}>
                    <SkipBack className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Skip back 10s</TooltipContent>
              </Tooltip>
               <Tooltip>
                <TooltipTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { if(audioRef.current) audioRef.current.currentTime = 0;}} disabled={isPlayerDisabled}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Replay</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              onClick={handlePlayPause}
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isPlayerDisabled}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </Button>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSkip(30)} disabled={isPlayerDisabled}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Skip forward 30s</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center w-full space-x-2">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={duration > 0 ? [(currentTime / duration) * 100] : [0]}
              max={100}
              step={0.1} // Finer step for smoother seeking
              onValueChange={handleProgressChange}
              className="flex-1"
              disabled={isPlayerDisabled}
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-end space-x-3 mt-2 sm:mt-0">
          <div className="flex items-center space-x-2">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleVolumeChange([volume > 0 ? 0 : 0.7 * 100])} // Mute/unmute (to 70%)
                    disabled={isPlayerDisabled}
                  >
                    {getVolumeIcon()}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{volume === 0 ? "Unmute" : "Mute"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Slider
              value={[volume * 100]} // volume is 0-1, slider is 0-100
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-20 sm:w-24" // Adjusted width
              disabled={isPlayerDisabled}
            />
          </div>

          <select
            value={speed}
            onChange={handleSpeedChange}
            className="bg-muted text-xs rounded px-1.5 py-1 border-none focus:ring-1 focus:ring-primary h-8" // Ensure height matches buttons
            disabled={isPlayerDisabled}
          >
            {speeds.map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>

          {/* Settings button can be for future features like track selection, etc. */}
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPlayerDisabled}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
