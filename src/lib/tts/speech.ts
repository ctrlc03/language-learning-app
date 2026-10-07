'use client';

import type { Language } from '@/types';

// Exact lang codes to rank voices by, best first. Chinese is Mandarin only (see MANDARIN_LANG).
const LANG_CODES: Record<Language, string[]> = {
  chinese: ['zh-CN', 'zh-TW'],
  japanese: ['ja-JP', 'ja'],
};

/**
 * Mandarin voices: zh-CN and zh-TW (also with script or region subtags: zh-Hans-CN,
 * zh-CN-liaoning) and cmn-* (Android, eSpeak). Every other Chinese tag — zh-HK, yue-*, a bare
 * "zh" — may be Cantonese, which reads hanzi with the wrong sounds, so for Chinese such voices
 * are never listed and never picked.
 */
const MANDARIN_LANG = /^(?:cmn|zh-(?:hans-|hant-)?(?:cn|tw))(?:-|$)/;

const NO_SPEECH_MESSAGE = "Speech isn't supported in this browser.";
const NO_MANDARIN_VOICE_MESSAGE =
  "No Mandarin voice is installed. Add one in your device's speech settings to hear Chinese.";

/** speak() can't work on this device: no speech engine, or no Mandarin voice installed. */
export class SpeechUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpeechUnavailableError';
  }
}

/** Short text for a failed `speak()`, for showing to the learner. */
export function speechErrorMessage(err: unknown): string {
  return err instanceof SpeechUnavailableError ? err.message : "Couldn't play audio. Try again.";
}

// Preferred voices per language, ranked best-first.
// These are known high-quality voices on macOS, iOS, Windows, Chrome, etc.
const PREFERRED_VOICES: Record<Language, string[]> = {
  chinese: [
    // macOS / iOS premium voices
    'Tingting', // macOS enhanced Mandarin
    'Lili', // macOS Mandarin
    'Meijia', // macOS Mandarin (Taiwan)
    // Google Chrome voices
    'Google 普通话',
    'Google Mandarin',
    // Microsoft voices (Windows / Edge)
    'Microsoft Xiaoxiao',
    'Microsoft Yunyang',
    'Microsoft Xiaoyi',
    'Huihui',
    'Kangkang',
    'Yaoyao',
  ],
  japanese: [
    // macOS / iOS
    'Kyoko', // macOS Japanese (enhanced)
    'Otoya', // macOS Japanese male
    'O-Ren', // macOS Japanese
    // Google
    'Google 日本語',
    'Google Japanese',
    // Microsoft
    'Microsoft Nanami',
    'Microsoft Keita',
    'Haruka',
    'Ichiro',
  ],
};

// Voices to avoid — these produce bad pronunciation (compared case-insensitively)
const VOICE_BLOCKLIST = [
  'Ting-Ting', // old macOS voice, very robotic
  'Sinji', // macOS Cantonese: would read hanzi with Cantonese sounds
  'Sin-ji', // the same voice where it is spelled with a hyphen
];

// English voice config for speaking translations
const ENGLISH_LANG_CODES = ['en-US', 'en-GB', 'en-AU', 'en'];
const PREFERRED_ENGLISH_VOICES = [
  // macOS / iOS premium
  'Samantha', // macOS default, natural sounding
  'Karen', // macOS Australian, clear
  'Daniel', // macOS British male
  'Moira', // macOS Irish
  'Tessa', // macOS South African
  // Google
  'Google US English',
  'Google UK English Female',
  'Google UK English Male',
  // Microsoft
  'Microsoft Zira',
  'Microsoft David',
  'Microsoft Jenny',
  'Microsoft Aria',
];

let cachedVoices: Map<Language, SpeechSynthesisVoice> = new Map();
let cachedEnglishVoice: SpeechSynthesisVoice | null | undefined = undefined; // undefined = not yet looked up
let userPreferredVoices: Map<Language, SpeechSynthesisVoice> = new Map();
let allVoicesLoaded = false;

function normalizeLang(lang: string): string {
  return lang.toLowerCase().replace(/_/g, '-');
}

function matchesLanguage(voice: SpeechSynthesisVoice, language: Language): boolean {
  const lang = normalizeLang(voice.lang);
  if (language === 'chinese') return MANDARIN_LANG.test(lang);
  return LANG_CODES[language].some((code) => {
    const target = code.toLowerCase();
    return lang === target || lang.startsWith(target + '-');
  });
}

function isBlocked(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase();
  return VOICE_BLOCKLIST.some((blocked) => name.includes(blocked.toLowerCase()));
}

function scoreVoice(voice: SpeechSynthesisVoice, language: Language): number {
  const name = voice.name;

  // Block known bad voices
  if (isBlocked(voice)) return -1;

  const preferred = PREFERRED_VOICES[language];
  const targetCodes = LANG_CODES[language];

  let score = 0;

  // Exact lang code match (zh-CN > zh-TW)
  for (let i = 0; i < targetCodes.length; i++) {
    if (voice.lang.toLowerCase().replace('_', '-') === targetCodes[i].toLowerCase()) {
      score += (targetCodes.length - i) * 100;
      break;
    }
  }

  // Check against preferred voice names (higher index = lower priority)
  for (let i = 0; i < preferred.length; i++) {
    if (name.includes(preferred[i])) {
      score += (preferred.length - i) * 10;
      break;
    }
  }

  // Prefer non-default voices (usually higher quality)
  if (!voice.default) score += 5;

  // Prefer local voices over remote (more reliable)
  if (voice.localService) score += 3;

  return score;
}

/** The voice picked in Settings, if it is still installed and still allowed for this language. */
function getSavedVoice(language: Language): SpeechSynthesisVoice | null {
  const name = localStorage.getItem(`langbot:voice:${language}`);
  if (!name) return null;
  return getAvailableVoices(language).find((v) => v.name === name) ?? null;
}

function getBestVoice(language: Language): SpeechSynthesisVoice | null {
  // User-selected voice takes absolute priority
  const userPref = userPreferredVoices.get(language);
  if (userPref) return userPref;

  // Check saved preference in localStorage
  const saved = getSavedVoice(language);
  if (saved) {
    userPreferredVoices.set(language, saved);
    return saved;
  }

  const cached = cachedVoices.get(language);
  if (cached) return cached;

  const matching = speechSynthesis.getVoices().filter((v) => matchesLanguage(v, language));
  if (matching.length === 0) return null;

  // Score and sort
  const scored = matching
    .map((v) => ({ voice: v, score: scoreVoice(v, language) }))
    .filter((v) => v.score >= 0) // remove blocklisted
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    // Every voice for this language is blocklisted: a poor voice beats none
    cachedVoices.set(language, matching[0]);
    return matching[0];
  }

  const best = scored[0].voice;
  cachedVoices.set(language, best);

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[TTS] Selected voice for ${language}: "${best.name}" (${best.lang}, score: ${scored[0].score})`,
      '\nAll candidates:',
      scored.map((s) => `${s.voice.name} (${s.voice.lang}) = ${s.score}`).join(', '),
    );
  }

  return best;
}

function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  if (cachedEnglishVoice !== undefined) return cachedEnglishVoice;

  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const matching = voices.filter((v) =>
    ENGLISH_LANG_CODES.some((code) => {
      const norm = v.lang.toLowerCase().replace('_', '-');
      return norm === code.toLowerCase() || norm.startsWith(code.toLowerCase() + '-');
    }),
  );

  if (matching.length === 0) {
    cachedEnglishVoice = null;
    return null;
  }

  // Score: preferred name match + exact lang code match + local service bonus
  const scored = matching
    .map((v) => {
      let score = 0;
      for (let i = 0; i < ENGLISH_LANG_CODES.length; i++) {
        if (v.lang.toLowerCase().replace('_', '-') === ENGLISH_LANG_CODES[i].toLowerCase()) {
          score += (ENGLISH_LANG_CODES.length - i) * 100;
          break;
        }
      }
      for (let i = 0; i < PREFERRED_ENGLISH_VOICES.length; i++) {
        if (v.name.includes(PREFERRED_ENGLISH_VOICES[i])) {
          score += (PREFERRED_ENGLISH_VOICES.length - i) * 10;
          break;
        }
      }
      if (v.localService) score += 3;
      return { voice: v, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0].voice;
  cachedEnglishVoice = best;

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[TTS] Selected English voice: "${best.name}" (${best.lang}, score: ${scored[0].score})`,
    );
  }

  return best;
}

// Chrome/Safari bug: after cancel(), the synth engine can get stuck.
// A small delay + resume() nudge fixes it.
let resumeTimer: ReturnType<typeof setInterval> | null = null;

function startResumeWatchdog() {
  stopResumeWatchdog();
  // Chrome pauses synthesis after ~15s; periodic resume() prevents that
  resumeTimer = setInterval(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      speechSynthesis.resume();
    }
  }, 5000);
}

function stopResumeWatchdog() {
  if (resumeTimer) {
    clearInterval(resumeTimer);
    resumeTimer = null;
  }
}

export function speak(text: string, language: Language, rate: number = 1.0): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      reject(new SpeechUnavailableError(NO_SPEECH_MESSAGE));
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();
    stopResumeWatchdog();

    // Small delay after cancel() to let the engine reset —
    // without this, Chrome/Safari silently drop the next utterance.
    setTimeout(() => {
      const voice = getBestVoice(language);
      // With no Mandarin voice the browser would read hanzi in its default voice: wrong sounds or
      // silence. Say so once voices have loaded (an empty list just means they haven't yet).
      if (!voice && language === 'chinese' && speechSynthesis.getVoices().length > 0) {
        reject(new SpeechUnavailableError(NO_MANDARIN_VOICE_MESSAGE));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      // Set lang to the primary code for this language
      utterance.lang = LANG_CODES[language][0];
      utterance.rate = rate;
      utterance.pitch = 1.0;

      if (voice) {
        utterance.voice = voice;
        // Override lang to match the selected voice exactly
        utterance.lang = voice.lang;
      }

      utterance.onend = () => {
        stopResumeWatchdog();
        resolve();
      };
      utterance.onerror = (event) => {
        stopResumeWatchdog();
        if (event.error === 'canceled' || event.error === 'interrupted') {
          resolve();
        } else {
          reject(new Error(`Speech error: ${event.error}`));
        }
      };

      speechSynthesis.speak(utterance);
      startResumeWatchdog();
    }, 50);
  });
}

export function speakEnglish(text: string, rate: number = 1.0): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not available'));
      return;
    }

    speechSynthesis.cancel();
    stopResumeWatchdog();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;
      utterance.pitch = 1.0;

      const voice = getBestEnglishVoice();
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }

      utterance.onend = () => {
        stopResumeWatchdog();
        resolve();
      };
      utterance.onerror = (event) => {
        stopResumeWatchdog();
        if (event.error === 'canceled' || event.error === 'interrupted') {
          resolve();
        } else {
          reject(new Error(`Speech error: ${event.error}`));
        }
      };

      speechSynthesis.speak(utterance);
      startResumeWatchdog();
    }, 50);
  });
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    stopResumeWatchdog();
    speechSynthesis.cancel();
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Voices to list in Settings for a language. Chinese is Mandarin only, and blocklisted voices are
 * left out.
 */
export function getAvailableVoices(language: Language): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return speechSynthesis.getVoices().filter((v) => matchesLanguage(v, language) && !isBlocked(v));
}

export function setPreferredVoice(language: Language, voice: SpeechSynthesisVoice | null): void {
  if (voice) {
    // Only voices Settings lists may be chosen: never a Cantonese voice for Chinese.
    if (!matchesLanguage(voice, language) || isBlocked(voice)) return;
    userPreferredVoices.set(language, voice);
    localStorage.setItem(`langbot:voice:${language}`, voice.name);
  } else {
    userPreferredVoices.delete(language);
    localStorage.removeItem(`langbot:voice:${language}`);
    // Clear auto-cache so it re-selects
    cachedVoices.delete(language);
  }
}

export function getPreferredVoiceName(language: Language): string | null {
  if (typeof window === 'undefined') return null;
  // A choice that is no longer allowed (a Cantonese voice picked before Chinese was limited to
  // Mandarin) reads as unset, so Settings shows "Auto-select" instead of a blank select.
  return getSavedVoice(language)?.name ?? null;
}

// Pre-load voices (some browsers load them asynchronously)
export function initVoices(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Clear cache to allow re-detection
  cachedVoices = new Map();
  cachedEnglishVoice = undefined;
  allVoicesLoaded = false;

  const loadVoices = () => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      allVoicesLoaded = true;
      cachedVoices = new Map();
      cachedEnglishVoice = undefined;
    }
  };

  loadVoices();

  if (!allVoicesLoaded) {
    speechSynthesis.addEventListener(
      'voiceschanged',
      () => {
        cachedVoices = new Map();
        loadVoices();
      },
      { once: true },
    );
  }
}
