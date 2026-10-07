/**
 * Microphone capture for speaking practice, in two independent parts: speech
 * recognition (Mandarin, zh-CN) turns what was said into characters, and a
 * recording of the learner's voice plays back beside the model. Either can be
 * missing — Firefox has no recognition, Chrome's needs the network, a blocked
 * microphone stops both — so a capture reports what it got, and callers fall
 * back to self-rating against the model answer.
 */

// lib.dom declares the recognition result types but not the recognizer itself.
interface RecognitionResultEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface RecognitionErrorEvent extends Event {
  readonly error: string;
}

interface Recognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type RecognizerClass = new () => Recognizer;

function recognizerClass(): RecognizerClass | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognizerClass;
    webkitSpeechRecognition?: RecognizerClass;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** The browser can turn Mandarin speech into characters. */
export function canRecognize(): boolean {
  return recognizerClass() !== null;
}

/** The browser can record the microphone for playback. */
export function canRecord(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia
  );
}

export interface CaptureResult {
  /** What recognition heard, final results joined; '' when nothing was heard or it is unavailable. */
  transcript: string;
  /** Readings of the last utterance, best first: a near-miss may be among them. */
  alternatives: string[];
  /** Object URL of the recording, or null. The owner revokes it. */
  audioUrl: string | null;
  /** Why recognition or recording didn't work, in words for the learner. */
  problem: string | null;
}

export interface CaptureOptions {
  /** Keep listening across pauses until stop() (long answers). Otherwise one utterance ends it. */
  continuous?: boolean;
  /** Hard stop, in ms. */
  maxMs?: number;
  /** Live transcript while speaking. */
  onInterim?: (text: string) => void;
  /** Recognition failed mid-capture; recording (if any) goes on until stop(). */
  onProblem?: (message: string) => void;
}

export interface Capture {
  stop(): void;
  /** Settles once recognition and recording have both stopped. */
  done: Promise<CaptureResult>;
}

const RECOGNITION_PROBLEMS: Record<string, string> = {
  'not-allowed': 'The microphone is blocked. Allow it for this site to practise aloud.',
  'service-not-allowed': 'Speech recognition is turned off in this browser.',
  'audio-capture': 'No microphone was found.',
  network: 'Speech recognition needs an internet connection.',
  'language-not-supported': "This browser can't recognise Mandarin.",
};

function microphoneProblem(err: unknown): string {
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return RECOGNITION_PROBLEMS['not-allowed'];
  }
  if (name === 'NotFoundError') return RECOGNITION_PROBLEMS['audio-capture'];
  return "The microphone couldn't start.";
}

/**
 * Start listening. Rejects (with a message for the learner) only when neither
 * recognition nor recording could start.
 */
export async function startCapture(opts: CaptureOptions = {}): Promise<Capture> {
  const { continuous = false, onInterim, onProblem } = opts;
  const maxMs = opts.maxMs ?? (continuous ? 120_000 : 20_000);
  let problem: string | null = null;
  let stopped = false;

  // ---- recording ----
  let recorder: MediaRecorder | null = null;
  let recorded: Promise<string | null> = Promise.resolve(null);
  let micFailed = false;
  if (canRecord()) {
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      const tracks = stream.getTracks();
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      const saved = Promise.withResolvers<string | null>();
      rec.onstop = () => {
        tracks.forEach((t) => t.stop());
        saved.resolve(
          chunks.length > 0
            ? URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || chunks[0].type }))
            : null,
        );
      };
      recorded = saved.promise;
      rec.start();
      recorder = rec;
    } catch (err) {
      stream?.getTracks().forEach((t) => t.stop());
      problem = microphoneProblem(err);
      micFailed = true;
    }
  }

  // ---- recognition ----
  const Recognizer = recognizerClass();
  const finals: string[] = [];
  let alternatives: string[] = [];
  let recognizer: Recognizer | null = null;
  let recognized: Promise<void> = Promise.resolve();
  if (Recognizer && !micFailed) {
    try {
      const r = new Recognizer();
      r.lang = 'zh-CN';
      r.continuous = continuous;
      r.interimResults = !!onInterim;
      r.maxAlternatives = 5;
      let failed = false;
      const ended = Promise.withResolvers<void>();
      r.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finals.push(result[0].transcript);
            alternatives = Array.from({ length: result.length }, (_, k) => result[k].transcript);
          } else {
            interim += result[0].transcript;
          }
        }
        onInterim?.(finals.join('') + interim);
      };
      r.onerror = (event) => {
        const message = RECOGNITION_PROBLEMS[event.error];
        if (!message) return; // no-speech, aborted: nothing heard, not a fault
        failed = true;
        problem ??= message;
        onProblem?.(message);
      };
      r.onend = () => {
        if (!stopped && continuous && !failed) {
          // Chrome ends even continuous recognition after a long pause: carry on until stop().
          try {
            r.start();
            return;
          } catch {
            /* finish below */
          }
        }
        // One utterance is the whole answer, so its end ends the capture. A failed
        // recognizer leaves the recording running, if there is one, until stop().
        if (!recorder || (!continuous && !failed)) stop();
        ended.resolve();
      };
      recognized = ended.promise;
      r.start();
      recognizer = r;
    } catch {
      recognized = Promise.resolve();
    }
  }

  if (!recorder && !recognizer) {
    throw new Error(problem ?? 'This browser has no microphone access for speaking practice.');
  }

  // Every handler above fires on a later task, after this line has run.
  const timer = window.setTimeout(stop, maxMs);
  function stop() {
    if (stopped) return;
    stopped = true;
    window.clearTimeout(timer);
    try {
      recognizer?.stop();
    } catch {
      /* already stopped */
    }
    if (recorder && recorder.state !== 'inactive') recorder.stop();
  }

  const done = Promise.all([recorded, recognized]).then(([audioUrl]) => ({
    transcript: finals.join(''),
    alternatives,
    audioUrl,
    problem,
  }));

  return { stop, done };
}
