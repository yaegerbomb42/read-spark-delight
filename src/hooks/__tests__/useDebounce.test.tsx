import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';
import { vi } from 'vitest';

vi.useFakeTimers();

describe('useDebounce', () => {
  it('delays value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'a' },
    });
    expect(result.current).toBe('a');

    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('b');
  });
});
