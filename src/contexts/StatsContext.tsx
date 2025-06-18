import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import type { UserStats } from '@/types';
import { getCurrentDateYYYYMMDD } from '@/lib/statsUtils';

interface StatsContextType {
  userStats: UserStats;
  recordUserActivity: () => void;
  incrementMinutesRead: (minutes: number) => void;
  incrementMinutesListened: (minutes: number) => void;
  markBookAsCompleted: (bookId: string) => void;
  incrementTotalBooksImported: () => void; // New function
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

const defaultUserStats: UserStats = {
  totalBooksImported: 0,
  completedBookIds: [],
  totalMinutesRead: 0,
  totalMinutesListened: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastReadingDate: null,
};

export const StatsProvider = ({ children }: { children: ReactNode }) => {
  const [userStats, setUserStats] = useState<UserStats>(() => {
    try {
      const storedStats = localStorage.getItem('userAppStats');
      if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        // Ensure all keys from defaultUserStats are present, merge if necessary
        return { ...defaultUserStats, ...parsedStats };
      }
      return defaultUserStats;
    } catch (error) {
      console.error("Failed to parse user stats from localStorage", error);
      return defaultUserStats;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('userAppStats', JSON.stringify(userStats));
    } catch (error) {
      console.error("Failed to save user stats to localStorage", error);
    }
  }, [userStats]);

  const recordUserActivity = useCallback(() => {
    setUserStats(prevStats => {
      const today = getCurrentDateYYYYMMDD();
      if (prevStats.lastReadingDate === today) {
        return prevStats; // Already recorded activity today
      }

      let newCurrentStreak = 1;
      if (prevStats.lastReadingDate) {
        const todayDate = new Date(today); // Convert string YYYY-MM-DD to Date object
        const yesterdayDate = new Date(todayDate);
        yesterdayDate.setDate(todayDate.getDate() - 1);
        const yesterdayStr = getCurrentDateYYYYMMDD(yesterdayDate);

        if (prevStats.lastReadingDate === yesterdayStr) {
          newCurrentStreak = prevStats.currentStreak + 1;
        }
      }
      const newLongestStreak = Math.max(prevStats.longestStreak, newCurrentStreak);
      return {
        ...prevStats,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastReadingDate: today,
      };
    });
  }, []);

  const incrementMinutesRead = useCallback((minutes: number) => {
    setUserStats(prevStats => ({
      ...prevStats,
      totalMinutesRead: prevStats.totalMinutesRead + minutes,
    }));
  }, []);

  const incrementMinutesListened = useCallback((minutes: number) => {
    setUserStats(prevStats => ({
      ...prevStats,
      totalMinutesListened: prevStats.totalMinutesListened + minutes,
    }));
  }, []);

  const markBookAsCompleted = useCallback((bookId: string) => {
    setUserStats(prevStats => {
      if (prevStats.completedBookIds.includes(bookId)) {
        return prevStats; // Already completed
      }
      return {
        ...prevStats,
        completedBookIds: [...prevStats.completedBookIds, bookId],
      };
    });
  }, []);

  const incrementTotalBooksImported = useCallback(() => {
    setUserStats(prevStats => ({
      ...prevStats,
      totalBooksImported: prevStats.totalBooksImported + 1,
    }));
  }, []);

  return (
    <StatsContext.Provider value={{
      userStats,
      recordUserActivity,
      incrementMinutesRead,
      incrementMinutesListened,
      markBookAsCompleted,
      incrementTotalBooksImported, // Add to provider value
    }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = (): StatsContextType => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};
