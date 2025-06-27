import { render, fireEvent } from '@testing-library/react';
import { Header } from '../Header';
import React from 'react';

describe('Header', () => {
  it('calls onSearchChange when typing', async () => {
    const onSearchChange = vi.fn();
    const { getByPlaceholderText } = render(
      <Header searchQuery="" onSearchChange={onSearchChange} />
    );
    const input = getByPlaceholderText('Search books...') as HTMLInputElement;
    await fireEvent.input(input, { target: { value: 'foo' } });
    expect(onSearchChange).toHaveBeenCalledWith('foo');
  });
});
