
import { useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trophy } from "lucide-react";

type BadgeType = "gold" | "silver" | "bronze" | "locked";

interface AchievementBadgeProps {
  id: string;
  title: string;
  description: string;
  type: BadgeType;
  progress?: number;
  maxProgress?: number;
  icon?: React.ReactNode;
  isNew?: boolean;
}

export function AchievementBadge({
  id,
  title,
  description,
  type,
  progress = 0,
  maxProgress = 100,
  icon,
  isNew = false,
}: AchievementBadgeProps) {
  const [showBadge, setShowBadge] = useState(true);

  const getBadgeColor = () => {
    switch (type) {
      case "gold":
        return "bg-achievement-gold";
      case "silver":
        return "bg-achievement-silver";
      case "bronze":
        return "bg-achievement-bronze";
      case "locked":
        return "bg-gray-300 dark:bg-gray-700";
      default:
        return "bg-gray-300 dark:bg-gray-700";
    }
  };

  const isLocked = type === "locked";
  const percentComplete = Math.min(100, Math.round((progress / maxProgress) * 100));

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div 
            className={`achievement-badge relative flex flex-col items-center justify-center p-1 ${isNew ? 'animate-achievement-unlock' : ''}`}
          >
            <div 
              className={`relative w-14 h-14 rounded-full ${getBadgeColor()} flex items-center justify-center
                ${isLocked ? 'opacity-40 grayscale' : 'shadow-md'}`}
            >
              {icon || <Trophy className="h-7 w-7 text-white" />}
              
              {isLocked && percentComplete > 0 && (
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div 
                    className="absolute bottom-0 bg-white/20 w-full" 
                    style={{ height: `${percentComplete}%` }}
                  />
                </div>
              )}
              
              {isNew && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 animate-pulse">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary"></span>
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-medium text-center line-clamp-1 w-14">{title}</p>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px] p-3">
          <div className="space-y-1.5">
            <p className="font-semibold">{title}</p>
            <p className="text-sm opacity-90">{description}</p>
            {isLocked && progress > 0 && (
              <div className="text-xs text-muted-foreground mt-1.5">
                Progress: {progress}/{maxProgress} ({percentComplete}%)
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
