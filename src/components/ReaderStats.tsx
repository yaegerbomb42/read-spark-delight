import { Headphones, Award, BookOpen, Clock, Calendar } from "lucide-react";
import { AchievementBadge } from "./AchievementBadge";
import { useStats } from "@/contexts/StatsContext";
import { computeAchievements } from "@/lib/achievements";
export function ReaderStats() {
  const { userStats } = useStats();
  const achievements = computeAchievements(userStats);

  const booksCompleted = userStats.completedBookIds.length;
  const minutesRead = Math.round(userStats.totalMinutesRead);
  const minutesListened = Math.round(userStats.totalMinutesListened);
  const currentStreak = userStats.currentStreak;
  const longestStreak = userStats.longestStreak;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"> {/* Adjusted grid for 5 items */}
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium">Books Completed</h3>
          </div>
          <p className="text-3xl font-bold">{booksCompleted}</p>
          {/* <p className="text-sm text-muted-foreground mt-1">+2 this month</p> */} {/* Static text removed */}
        </div>
        
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium">Time (E-books)</h3>
          </div>
          <p className="text-3xl font-bold">{minutesRead} min</p>
          {/* <p className="text-sm text-muted-foreground mt-1">+45 min today</p> */} {/* Static text removed */}
        </div>

        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Headphones className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium">Time (Audio)</h3>
          </div>
          <p className="text-3xl font-bold">{minutesListened} min</p>
          {/* <p className="text-sm text-muted-foreground mt-1">+30 min today</p> */} {/* Static text removed */}
        </div>
        
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium">Activity Streak</h3>
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
            {achievements.filter(a => a.type === "locked").length} more to unlock {/* Simplified: based on static data */}
          </p>
        </div>
      </div>
      
      {/* Reading Goals section removed */}

      <div>
        <h3 className="font-semibold text-lg mb-4">Achievements</h3> {/* Changed title from Latest Achievements */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2"> {/* More responsive grid */}
          {achievements.map((achievement) => (
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
  );
}
