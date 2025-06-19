import { renderHook, act } from '@testing-library/react';
import { StatsProvider, useStats } from '../StatsContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <StatsProvider>{children}</StatsProvider>
);

describe('StatsContext', () => {
  it('increments imported books and completed ids', () => {
    const { result } = renderHook(() => useStats(), { wrapper });
    act(() => {
      result.current.incrementTotalBooksImported();
      result.current.markBookAsCompleted('1');
    });
    expect(result.current.userStats.totalBooksImported).toBe(1);
    expect(result.current.userStats.completedBookIds).toContain('1');
  });
});
