import type { UserStats, Achievement } from '@/types';

interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  type: 'gold' | 'silver' | 'bronze';
  maxProgress: number;
  getProgress: (stats: UserStats) => number;
}

export const achievementDefinitions: AchievementDefinition[] = [
  {
    id: 'import-5-books',
    title: 'Book Collector',
    description: 'Import 5 books',
    type: 'bronze',
    maxProgress: 5,
    getProgress: stats => stats.totalBooksImported,
  },
  {
    id: 'complete-1-book',
    title: 'First Finish',
    description: 'Finish your first book',
    type: 'silver',
    maxProgress: 1,
    getProgress: stats => stats.completedBookIds.length,
  },
  {
    id: 'read-100-minutes',
    title: 'Page Turner',
    description: 'Read for 100 minutes',
    type: 'gold',
    maxProgress: 100,
    getProgress: stats => stats.totalMinutesRead,
  },
  {
    id: 'listen-100-minutes',
    title: 'Audio Aficionado',
    description: 'Listen for 100 minutes',
    type: 'silver',
    maxProgress: 100,
    getProgress: stats => stats.totalMinutesListened,
  },
  {
    id: 'streak-3',
    title: 'Streak of 3',
    description: 'Maintain a 3-day streak',
    type: 'bronze',
    maxProgress: 3,
    getProgress: stats => stats.longestStreak,
  },
  {
    id: 'streak-7',
    title: 'Streak of 7',
    description: 'Maintain a 7-day streak',
    type: 'gold',
    maxProgress: 7,
    getProgress: stats => stats.longestStreak,
  },
  {
    id: 'streak_10',
    title: 'Bookworm',
    description: 'Maintain a 10 day reading streak',
    type: 'gold',
    maxProgress: 10,
    getProgress: stats => stats.currentStreak,
  },
  {
    id: 'minutes_300',
    title: 'Marathon Reader',
    description: 'Read for 300 minutes',
    type: 'silver',
    maxProgress: 300,
    getProgress: stats => stats.totalMinutesRead,
  },
  {
    id: 'books_5',
    title: 'Finisher',
    description: 'Finish 5 books',
    type: 'bronze',
    maxProgress: 5,
    getProgress: stats => stats.completedBookIds.length,
  },
  {
    id: 'import_10',
    title: 'Collector',
    description: 'Import 10 books',
    type: 'bronze',
    maxProgress: 10,
    getProgress: stats => stats.totalBooksImported,
  },
];

export function computeAchievements(stats: UserStats): Achievement[] {
  return achievementDefinitions.map(def => {
    const progress = def.getProgress(stats);
    const unlocked = progress >= def.maxProgress;
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      type: unlocked ? def.type : 'locked',
      ...(unlocked ? {} : { progress, maxProgress: def.maxProgress }),
    } as Achievement;
  });
}
