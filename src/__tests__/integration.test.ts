// Integration test for core app functionality
import { describe, test, expect } from 'vitest';

// Mock localStorage for testing
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {}
  }
});

// Mock SpeechSynthesis for TTS testing
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    getVoices: () => [
      { name: 'Test Voice', lang: 'en-US', voiceURI: 'test', localService: true, default: true }
    ],
    speak: () => {},
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    speaking: false,
    paused: false
  }
});

describe('Read Spark Delight Integration Tests', () => {
  test('AI image generator returns fallback URL', async () => {
    const { generateBookCover } = await import('../lib/aiImageGenerator.ts');
    
    const result = await generateBookCover('Test book cover');
    expect(result).toMatch(/^https:\/\/images\.unsplash\.com/);
  });

  test('Default books data is properly structured', async () => {
    const { defaultBooksData } = await import('../lib/defaultBooks.ts');
    
    expect(defaultBooksData.length).toBeGreaterThan(0);
    expect(defaultBooksData[0]).toHaveProperty('id');
    expect(defaultBooksData[0]).toHaveProperty('title');
    expect(defaultBooksData[0]).toHaveProperty('author');
    expect(defaultBooksData[0]).toHaveProperty('tags');
  });

  test('Utils functions work correctly', async () => {
    const { cn } = await import('../lib/utils.ts');
    
    const result = cn('class1', 'class2', undefined, 'class3');
    expect(typeof result).toBe('string');
  });
});