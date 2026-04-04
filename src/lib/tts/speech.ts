'use client';

import type { Language } from '@/types';

// Exact lang codes to match, in priority order
const LANG_CODES: Record<Language, string[]> = {
  chinese: ['zh-CN', 'zh-TW', 'zh-HK', 'zh'],
  japanese: ['ja-JP', 'ja'],
};

// Preferred voices per language, ranked best-first.
// These are known high-quality voices on macOS, iOS, Windows, Chrome, etc.
const PREFERRED_VOICES: Record<Language, string[]> = {
  chinese: [
    // macOS / iOS premium voices
    'Tingting',         // macOS enhanced Mandarin
    'Lili',             // macOS Mandarin
    'Meijia',           // macOS Mandarin (Taiwan)
    'Sinji',            // macOS Cantonese (fallback)
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
    'Kyoko',            // macOS Japanese (enhanced)
    'Otoya',            // macOS Japanese male
    'O-Ren',            // macOS Japanese
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

// Voices to avoid — these produce bad Chinese pronunciation
const VOICE_BLOCKLIST = [
  'Ting-Ting', // old macOS voice, very robotic
  'Sin-ji',    // Cantonese, not Mandarin
];

// English voice config for speaking translations
const ENGLISH_LANG_CODES = ['en-US', 'en-GB', 'en-AU', 'en'];
const PREFERRED_ENGLISH_VOICES = [
  // macOS / iOS premium
  'Samantha',          // macOS default, natural sounding
  'Karen',             // macOS Australian, clear
  'Daniel',            // macOS British male
  'Moira',             // macOS Irish
  'Tessa',             // macOS South African
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

function matchesLangCode(voiceLang: string, targetCodes: string[]): boolean {
  const normalized = voiceLang.toLowerCase().replace('_', '-');
  return targetCodes.some(code => normalized === code.toLowerCase() || normalized.startsWith(code.toLowerCase() + '-'));
}

function scoreVoice(voice: SpeechSynthesisVoice, language: Language): number {
  const name = voice.name;

  // Block known bad voices
  if (VOICE_BLOCKLIST.some(blocked => name.includes(blocked))) return -1;

  const preferred = PREFERRED_VOICES[language];
  const targetCodes = LANG_CODES[language];

  let score = 0;

  // Exact lang code match (zh-CN > zh-TW > zh)
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

function getBestVoice(language: Language): SpeechSynthesisVoice | null {
  // User-selected voice takes absolute priority
  const userPref = userPreferredVoices.get(language);
  if (userPref) return userPref;

  // Check saved preference in localStorage
  const savedName = typeof window !== 'undefined'
    ? localStorage.getItem(`langbot:voice:${language}`)
    : null;
  if (savedName) {
    const voices = speechSynthesis.getVoices();
    const saved = voices.find(v => v.name === savedName);
    if (saved) {
      userPreferredVoices.set(language, saved);
      return saved;
    }
  }

  const cached = cachedVoices.get(language);
  if (cached) return cached;

  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const targetCodes = LANG_CODES[language];

  // Filter to voices that match our target language codes
  const matching = voices.filter(v => matchesLangCode(v.lang, targetCodes));

  if (matching.length === 0) return null;

  // Score and sort
  const scored = matching
    .map(v => ({ voice: v, score: scoreVoice(v, language) }))
    .filter(v => v.score >= 0) // remove blocklisted
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    // All were blocklisted, just use first matching
    cachedVoices.set(language, matching[0]);
    return matching[0];
  }

  const best = scored[0].voice;
  cachedVoices.set(language, best);

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[TTS] Selected voice for ${language}: "${best.name}" (${best.lang}, score: ${scored[0].score})`,
      '\nAll candidates:',
      scored.map(s => `${s.voice.name} (${s.voice.lang}) = ${s.score}`).join(', ')
    );
  }

  return best;
}

function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  if (cachedEnglishVoice !== undefined) return cachedEnglishVoice;

  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const matching = voices.filter(v =>
    ENGLISH_LANG_CODES.some(code => {
      const norm = v.lang.toLowerCase().replace('_', '-');
      return norm === code.toLowerCase() || norm.startsWith(code.toLowerCase() + '-');
    })
  );

  if (matching.length === 0) {
    cachedEnglishVoice = null;
    return null;
  }

  // Score: preferred name match + exact lang code match + local service bonus
  const scored = matching.map(v => {
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
  }).sort((a, b) => b.score - a.score);

  const best = scored[0].voice;
  cachedEnglishVoice = best;

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[TTS] Selected English voice: "${best.name}" (${best.lang}, score: ${scored[0].score})`
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
      reject(new Error('Speech synthesis not available'));
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();
    stopResumeWatchdog();

    // Small delay after cancel() to let the engine reset —
    // without this, Chrome/Safari silently drop the next utterance.
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      // Set lang to the primary code for this language
      utterance.lang = LANG_CODES[language][0];
      utterance.rate = rate;
      utterance.pitch = 1.0;

      const voice = getBestVoice(language);
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

export function getAvailableVoices(language: Language): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = speechSynthesis.getVoices();
  const targetCodes = LANG_CODES[language];
  return voices
    .filter(v => matchesLangCode(v.lang, targetCodes))
    .filter(v => !VOICE_BLOCKLIST.some(blocked => v.name.includes(blocked)));
}

export function setPreferredVoice(language: Language, voice: SpeechSynthesisVoice | null): void {
  if (voice) {
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
  return localStorage.getItem(`langbot:voice:${language}`);
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
    speechSynthesis.addEventListener('voiceschanged', () => {
      cachedVoices = new Map();
      loadVoices();
    }, { once: true });
  }
}
