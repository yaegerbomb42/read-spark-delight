import { describe, it, expect } from 'vitest';
import { computeAchievements } from '../achievements';
import type { UserStats } from '@/types';

describe('computeAchievements', () => {
  it('marks achievements as completed when thresholds are met', () => {
    const stats: UserStats = {
      totalBooksImported: 5,
      completedBookIds: ['1'],
      totalMinutesRead: 120,
      totalMinutesListened: 30,
      currentStreak: 2,
      longestStreak: 7,
      lastReadingDate: null,
    };

    const result = computeAchievements(stats);

    const importAchievement = result.find(a => a.id === 'import-5-books');
    expect(importAchievement?.type).toBe('bronze');

    const streakAchievement = result.find(a => a.id === 'streak-7');
    expect(streakAchievement?.type).toBe('gold');
  });
});
