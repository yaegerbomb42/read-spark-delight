import { render, fireEvent } from '@testing-library/react';
import { AudioPlayer } from '../AudioPlayer';
import React from 'react';

describe('AudioPlayer', () => {
  it('plays and pauses audio', async () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    const pauseSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});

    const { container } = render(<AudioPlayer audioSrc="test.mp3" />);
    const playButton = container.querySelector('svg.lucide-play')!.closest('button') as HTMLButtonElement;
    await fireEvent.click(playButton);
    expect(playSpy).toHaveBeenCalled();
    expect(container.querySelector('svg.lucide-pause')).toBeTruthy();

    await fireEvent.click(playButton);
    expect(pauseSpy).toHaveBeenCalled();
  });
});
