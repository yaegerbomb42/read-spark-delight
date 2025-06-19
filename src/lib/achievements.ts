export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  type: 'gold' | 'silver' | 'bronze';
  getProgress: (stats: import('../types').UserStats) => { progress: number; max: number };
}

export const achievementDefinitions: AchievementDefinition[] = [
  {
    id: 'streak_10',
    title: 'Bookworm',
    description: 'Maintain a 10 day reading streak',
    type: 'gold',
    getProgress: stats => ({ progress: stats.currentStreak, max: 10 }),
  },
  {
    id: 'minutes_300',
    title: 'Marathon Reader',
    description: 'Read for 300 minutes',
    type: 'silver',
    getProgress: stats => ({ progress: stats.totalMinutesRead, max: 300 }),
  },
  {
    id: 'books_5',
    title: 'Finisher',
    description: 'Finish 5 books',
    type: 'bronze',
    getProgress: stats => ({ progress: stats.completedBookIds.length, max: 5 }),
  },
  {
    id: 'import_10',
    title: 'Collector',
    description: 'Import 10 books',
    type: 'bronze',
    getProgress: stats => ({ progress: stats.totalBooksImported, max: 10 }),
  },
];

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'gold' | 'silver' | 'bronze' | 'locked';
  progress?: number;
  maxProgress?: number;
}

export function computeAchievements(stats: import('../types').UserStats): Achievement[] {
  return achievementDefinitions.map(def => {
    const { progress, max } = def.getProgress(stats);
    const unlocked = progress >= max;
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      type: unlocked ? def.type : 'locked',
      ...(unlocked ? {} : { progress, maxProgress: max }),
    };
  });
}
