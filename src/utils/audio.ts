/**
 * Web Speech API and Web Audio API utilities for Chispa Français
 */

class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Cheerful chime for correct answers
  playCorrect() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.22); // G5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      // Audio error suppressed
    }
  }

  // Gentle low tone for incorrect answers
  playIncorrect() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {
      // Audio error suppressed
    }
  }

  // Victory fanfare on lesson/session completion
  playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.15, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.32);
      });
    } catch (e) {
      // Audio error suppressed
    }
  }

  // Subtle pop when flipping cards
  playCardFlip() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {
      // Audio error suppressed
    }
  }
}

export const soundEffects = new SoundEffects();

/**
 * Text-to-Speech using native French voices
 */
export function speakFrench(text: string, slow = false) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel(); // Stop any pending speech

  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'fr-FR';
  utterance.rate = slow ? 0.75 : 0.95; // Slightly measured pace for young beginners
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();
  const frenchVoice = voices.find(
    (v) => v.lang.startsWith('fr') && (v.name.includes('Amélie') || v.name.includes('Thomas') || v.name.includes('Google') || v.name.includes('Natural'))
  ) || voices.find((v) => v.lang.startsWith('fr'));

  if (frenchVoice) {
    utterance.voice = frenchVoice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Speech Recognition check
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function createSpeechRecognizer(
  onResult: (text: string) => void,
  onError?: (err: any) => void
) {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognizer = new SpeechRec();
  recognizer.lang = 'fr-FR';
  recognizer.continuous = false;
  recognizer.interimResults = false;

  recognizer.onresult = (event: any) => {
    const transcript = event.results[0]?.[0]?.transcript;
    if (transcript) {
      onResult(transcript);
    }
  };

  if (onError) {
    recognizer.onerror = onError;
  }

  return recognizer;
}
