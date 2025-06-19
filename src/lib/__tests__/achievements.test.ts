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
  it('locks achievements when progress is low', () => {
    const stats: UserStats = {
      totalBooksImported: 0,
      completedBookIds: [],
      totalMinutesRead: 0,
      totalMinutesListened: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastReadingDate: null,
    };

    const achievements = computeAchievements(stats);
    achievements.forEach(a => {
      expect(a.type).toBe('locked');
    });
  });

  it('unlocks achievements when requirements met', () => {
    const stats: UserStats = {
      totalBooksImported: 10,
      completedBookIds: ['1','2','3','4','5'],
      totalMinutesRead: 300,
      totalMinutesListened: 0,
      currentStreak: 10,
      longestStreak: 10,
      lastReadingDate: '2024-01-01',
    };

    const achievements = computeAchievements(stats);
    const ids = Object.fromEntries(achievements.map(a => [a.id, a.type]));
    expect(ids['streak_10']).toBe('gold');
    expect(ids['minutes_300']).toBe('silver');
    expect(ids['books_5']).toBe('bronze');
    expect(ids['import_10']).toBe('bronze');
  });
});
