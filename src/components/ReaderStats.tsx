
import { Award, BookOpen, Clock, Calendar } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { AchievementBadge } from "./AchievementBadge";

interface ReaderStatsProps {
  dailyGoal: number;
  weeklyGoal: number;
  booksCompleted: number;
  minutesRead: number;
  currentStreak: number;
  longestStreak: number;
  achievements: {
    id: string;
    title: string;
    description: string;
    type: "gold" | "silver" | "bronze" | "locked";
    progress?: number;
    maxProgress?: number;
    isNew?: boolean;
  }[];
}

export function ReaderStats({
  dailyGoal,
  weeklyGoal,
  booksCompleted,
  minutesRead,
  currentStreak,
  longestStreak,
  achievements
}: ReaderStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium">Books Completed</h3>
          </div>
          <p className="text-3xl font-bold">{booksCompleted}</p>
          <p className="text-sm text-muted-foreground mt-1">+2 this month</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium">Reading Time</h3>
          </div>
          <p className="text-3xl font-bold">{minutesRead} min</p>
          <p className="text-sm text-muted-foreground mt-1">+45 min today</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium">Current Streak</h3>
          </div>
          <p className="text-3xl font-bold">{currentStreak} days</p>
          <p className="text-sm text-muted-foreground mt-1">Longest: {longestStreak} days</p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium">Achievements</h3>
          </div>
          <p className="text-3xl font-bold">{achievements.filter(a => a.type !== "locked").length}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {achievements.filter(a => a.type === "locked").length} more to unlock
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Reading Goals</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <ProgressBar 
                value={dailyGoal} 
                label="Daily Goal" 
                colorVariant="success"
                size="md"
              />
            </div>
            <div className="space-y-2">
              <ProgressBar 
                value={weeklyGoal} 
                label="Weekly Goal" 
                colorVariant={weeklyGoal < 30 ? "warning" : "default"}
                size="md"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-4">Latest Achievements</h3>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {achievements.map(achievement => (
              <AchievementBadge
                key={achievement.id}
                id={achievement.id}
                title={achievement.title}
                description={achievement.description}
                type={achievement.type}
                progress={achievement.progress}
                maxProgress={achievement.maxProgress}
                isNew={achievement.isNew}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
