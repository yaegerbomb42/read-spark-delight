import { useState, useEffect, useRef, useCallback } from 'react';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  // Using a ref for synth instance to avoid re-checking window.speechSynthesis
  const synthRef = useRef<SpeechSynthesis | null>(null);
  // Using a ref for the current utterance to manage its events and state
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);

      // Check for voices, sometimes they load asynchronously
      const voices = synthRef.current.getVoices();
      if (voices.length === 0) {
        synthRef.current.onvoiceschanged = () => {
          // Voices loaded
        };
      }
    } else {
      setIsSupported(false);
      console.warn("SpeechSynthesis API is not supported in this browser.");
    }

    // Cleanup function to cancel speech when the component unmounts
    return () => {
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
      // Clear any lingering utterance event listeners manually if necessary
      if (currentUtteranceRef.current) {
        currentUtteranceRef.current.onstart = null;
        currentUtteranceRef.current.onend = null;
        currentUtteranceRef.current.onpause = null;
        currentUtteranceRef.current.onresume = null;
        currentUtteranceRef.current.onerror = null;
      }
    };
  }, []);

  // Removed handleStateUpdate as utterance events now directly set state.

  interface SpeakOptions {
    onBoundary?: (event: SpeechSynthesisEvent) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onPause?: () => void;
    onResume?: () => void;
  }

  const speak = useCallback((text: string, lang: string = 'en-US', options?: SpeakOptions) => {
    if (!synthRef.current || !isSupported) {
      console.error("SpeechSynthesis is not initialized or supported.");
      return;
    }

    if (synthRef.current.speaking) {
      synthRef.current.cancel(); // Stop previous speech
      if (currentUtteranceRef.current) { // Clean up old utterance listeners
        currentUtteranceRef.current.onstart = null;
        currentUtteranceRef.current.onend = null;
        currentUtteranceRef.current.onpause = null;
        currentUtteranceRef.current.onresume = null;
        currentUtteranceRef.current.onerror = null;
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    utterance.onstart = () => {
      console.log("TTS started");
      setIsSpeaking(true);
      setIsPaused(false);
      options?.onStart?.();
    };
    utterance.onend = () => {
      console.log("TTS ended");
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
      options?.onEnd?.();
    };
    utterance.onpause = () => {
      console.log("TTS paused");
      setIsSpeaking(true); // Still "speaking" in the sense that it's active but paused
      setIsPaused(true);
      options?.onPause?.();
    };
    utterance.onresume = () => {
      console.log("TTS resumed");
      setIsSpeaking(true);
      setIsPaused(false);
      options?.onResume?.();
    };
    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance.onerror", event);
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
    };
    if (options?.onBoundary) {
      utterance.onboundary = options.onBoundary;
    }

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking && !synthRef.current.paused) {
      synthRef.current.pause();
      // State update will be triggered by 'onpause' event
    }
  }, []);

  const resume = useCallback(() => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      // State update will be triggered by 'onresume' event
    }
  }, []);

  const cancel = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      // State update will be triggered by 'onend' event (or error)
      // but also reset manually just in case onend is not always fired on cancel.
    }
    // Manual reset because onend might not fire consistently on cancel
    setIsSpeaking(false);
    setIsPaused(false);
    if (currentUtteranceRef.current) { // Clean up old utterance listeners
      currentUtteranceRef.current.onstart = null;
      currentUtteranceRef.current.onend = null;
      currentUtteranceRef.current.onpause = null;
      currentUtteranceRef.current.onresume = null;
      currentUtteranceRef.current.onerror = null;
      currentUtteranceRef.current = null;
    }
  }, []);

  // This effect listens to synth's global speaking state changes
  // This is useful if speech is cancelled by browser controls or other means
  useEffect(() => {
    const synth = synthRef.current;
    if (synth) {
        const updateSpeechState = () => {
            setIsSpeaking(synth.speaking && !synth.paused);
            setIsPaused(synth.paused);
        };
        // Periodically check state as there isn't a global 'onspeakingchange' event
        const intervalId = setInterval(updateSpeechState, 250);
        return () => clearInterval(intervalId);
    }
  }, []);


  return { speak, pause, resume, cancel, isSpeaking, isPaused, isSupported };
}
