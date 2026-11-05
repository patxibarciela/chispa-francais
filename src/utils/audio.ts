/**
 * Resilient Web Audio and French Speech Synthesis engine for Chispa Français
 */

class SoundEffects {
  private ctx: AudioContext | null = null;

  getContext(): AudioContext | null {
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

  unlock() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  // Soft tactile acoustic tap when clicking cards/buttons
  playTap() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio error suppressed
    }
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
    } catch {
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
    } catch {
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
    } catch {
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
    } catch {
      // Audio error suppressed
    }
  }
}

export const soundEffects = new SoundEffects();

/**
 * Global audio and voice tracking to protect against browser GC bugs and race conditions
 */
let activeAudioElement: HTMLAudioElement | null = null;
let cachedFrenchVoice: SpeechSynthesisVoice | null = null;

if (typeof window !== 'undefined') {
  (window as any).__chispaSpeechSet = (window as any).__chispaSpeechSet || new Set();
}

function findBestFrenchVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  try {
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Google French voice (built into Chromium/Chrome)
    const googleFr = voices.find(
      (v) => v.lang.toLowerCase().startsWith('fr') && v.name.toLowerCase().includes('google')
    );
    if (googleFr) return googleFr;

    // 2. High-quality natural French voices (Amélie, Thomas, Hortense, Julie, etc.)
    const naturalFr = voices.find(
      (v) => v.lang.toLowerCase().startsWith('fr') && (
        v.name.includes('Amélie') || 
        v.name.includes('Thomas') || 
        v.name.includes('Natural') || 
        v.name.includes('Hortense') ||
        v.name.includes('Julie')
      )
    );
    if (naturalFr) return naturalFr;

    // 3. Any standard fr-FR voice
    const frFr = voices.find((v) => v.lang === 'fr-FR' || v.lang === 'fr_FR');
    if (frFr) return frFr;

    // 4. Any French dialect voice (fr-CA, fr-BE, fr-CH)
    const anyFr = voices.find((v) => v.lang.toLowerCase().startsWith('fr'));
    if (anyFr) return anyFr;

    return null;
  } catch {
    return null;
  }
}

function updateFrenchVoiceCache() {
  const voice = findBestFrenchVoice();
  if (voice) {
    cachedFrenchVoice = voice;
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  updateFrenchVoiceCache();
  window.speechSynthesis.onvoiceschanged = () => {
    updateFrenchVoiceCache();
  };
}

/**
 * Native SpeechSynthesis fallback for offline / static host environments
 */
function playNativeSpeechSynthesis(cleanText: string, slow = false): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(false);
      return;
    }

    try {
      // Unfreeze synthesis engine in Chrome
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // If already speaking, safely cancel with brief delay to avoid Chrome race bug
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'fr-FR';
          utterance.rate = slow ? 0.78 : 0.94;
          utterance.pitch = 1.04;

          if (!cachedFrenchVoice) {
            updateFrenchVoiceCache();
          }
          if (cachedFrenchVoice) {
            utterance.voice = cachedFrenchVoice;
          }

          // Retain utterance in global Set to prevent GC premature cut-off in Chromium
          if ((window as any).__chispaSpeechSet) {
            (window as any).__chispaSpeechSet.add(utterance);
          }

          utterance.onend = () => {
            if ((window as any).__chispaSpeechSet) {
              (window as any).__chispaSpeechSet.delete(utterance);
            }
            resolve(true);
          };

          utterance.onerror = () => {
            if ((window as any).__chispaSpeechSet) {
              (window as any).__chispaSpeechSet.delete(utterance);
            }
            resolve(false);
          };

          window.speechSynthesis.speak(utterance);
        } catch {
          resolve(false);
        }
      }, 35);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Universal speakFrench function:
 * 1. Synchronously unlocks AudioContext on click.
 * 2. Attempts studio-quality /api/tts/fr stream via HTML5 Audio.
 * 3. Falls back smoothly to SpeechSynthesis if offline/static.
 * 4. Provides subtle acoustic feedback so clicks are never dead.
 */
export async function speakFrench(text: string, slow = false): Promise<void> {
  if (typeof window === 'undefined') return;

  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  if (!cleanText) return;

  // Immediately unlock audio context in the active user gesture
  soundEffects.unlock();

  // Try Server-side French TTS endpoint first
  try {
    if (activeAudioElement) {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement = null;
    }

    const ttsUrl = `/api/tts/fr?text=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(ttsUrl);
    activeAudioElement = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      await playPromise;
      return; // Played successfully!
    }
  } catch {
    // Server TTS not reachable or static environment, continue to native speech synthesis
  }

  // Fallback to Native SpeechSynthesis
  const synthSuccess = await playNativeSpeechSynthesis(cleanText, slow);
  if (!synthSuccess) {
    // If both failed, provide subtle acoustic feedback so user knows the button registered
    soundEffects.playTap();
  }
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
