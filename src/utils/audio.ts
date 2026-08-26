/**
 * Utility for Web Audio API sound synthesis
 * Provides native synthesized audio feedback for user actions and mission completion.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Synthesizes a clean 'click' sound for navigation/folder change
 */
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Start at 800Hz and drop rapidly to 150Hz
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

    // Short envelope
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (error) {
    console.warn('Audio click sound failed to play:', error);
  }
}

/**
 * Synthesizes an elegant, upbeat success chime when a mission is completed
 */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a sequence of notes: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const duration = 0.12; // duration of each note
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const startTime = now + idx * 0.08;
      const stopTime = startTime + duration;
      
      // Volume envelope for a gentle bell-like sound
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, stopTime);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(stopTime);
    });
  } catch (error) {
    console.warn('Audio success sound failed to play:', error);
  }
}

// TEXT TO SPEECH (TTS) SYSTEM FOR KIDS & STUDENTS
type SpeechListener = (speakingText: string | null) => void;
const speechListeners = new Set<SpeechListener>();
let activeSpeakingText: string | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let speechQueue: string[] = [];
let queueIndex = 0;
let heartbeatTimer: any = null;

export function subscribeSpeech(listener: SpeechListener) {
  speechListeners.add(listener);
  listener(activeSpeakingText);
  return () => {
    speechListeners.delete(listener);
  };
}

function notifySpeechListeners(text: string | null) {
  activeSpeakingText = text;
  speechListeners.forEach(listener => listener(text));
}

/**
 * Finds the best Polish voice available in the browser
 */
function getPolishVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Exact match for pl-PL or pl_PL
  const exactPl = voices.find(v => v.lang === 'pl-PL' || v.lang === 'pl_PL');
  if (exactPl) return exactPl;

  // 2. Contains 'pl' in lang
  const containsPl = voices.find(v => v.lang.toLowerCase().includes('pl'));
  if (containsPl) return containsPl;

  // 3. Contains 'polish' or 'polski' in name
  const namePl = voices.find(v => /polish|polski/i.test(v.name));
  if (namePl) return namePl;

  return null;
}

/**
 * Splits text into natural sentence chunks (max ~150 chars)
 * This prevents Chromium's native TTS engine buffer overflow and 15-second cut-off bug.
 */
function splitTextIntoSentences(text: string, maxChunkLength = 150): string[] {
  // Clean markup and special formatting characters
  const sanitized = text
    .replace(/[*_`#~•]/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\\/g, ' ukośnik ')
    .replace(/\//g, ' ukośnik ')
    .replace(/:/g, ' dwukropek ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!sanitized) return [];

  // Match sentences ending in punctuation
  const sentenceRegex = /[^.!?;\n]+[.!?;\n]*/g;
  const rawMatches = sanitized.match(sentenceRegex) || [sanitized];

  const chunks: string[] = [];

  for (const raw of rawMatches) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxChunkLength) {
      chunks.push(trimmed);
    } else {
      // Split long compound sentences on commas or spaces
      const parts = trimmed.split(/([,]\s+)/);
      let currentPart = '';

      for (const segment of parts) {
        if ((currentPart + segment).length <= maxChunkLength) {
          currentPart += segment;
        } else {
          if (currentPart.trim()) {
            chunks.push(currentPart.trim());
          }
          currentPart = segment;
        }
      }
      if (currentPart.trim()) {
        chunks.push(currentPart.trim());
      }
    }
  }

  // Fallback if no punctuation was present
  if (chunks.length === 0 && sanitized.length > 0) {
    for (let i = 0; i < sanitized.length; i += maxChunkLength) {
      chunks.push(sanitized.slice(i, i + maxChunkLength).trim());
    }
  }

  return chunks.filter(c => c.length > 0);
}

function speakNextInQueue() {
  if (!activeSpeakingText || queueIndex >= speechQueue.length) {
    stopSpeaking();
    return;
  }

  const chunk = speechQueue[queueIndex];
  const utterance = new SpeechSynthesisUtterance(chunk);
  activeUtterance = utterance;
  // Store reference on window to prevent Chrome's Garbage Collection bug from killing audio mid-speech
  (window as any).__activeSpeechUtterance = utterance;

  utterance.lang = 'pl-PL';
  const voice = getPolishVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onend = () => {
    queueIndex++;
    if (activeSpeakingText) {
      // Brief pause between sentences for natural breathing cadence
      setTimeout(() => {
        if (activeSpeakingText) {
          speakNextInQueue();
        }
      }, 50);
    }
  };

  utterance.onerror = (e) => {
    if (e.error === 'canceled' || e.error === 'interrupted') {
      return;
    }
    console.warn('SpeechSynthesis chunk error:', e);
    queueIndex++;
    if (queueIndex < speechQueue.length && activeSpeakingText) {
      speakNextInQueue();
    } else {
      stopSpeaking();
    }
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Reads Polish text aloud using SpeechSynthesis with reliable chunking & keep-alive
 */
export function speakText(text: string) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }

  // If clicking the currently speaking item, stop/toggle it
  if (activeSpeakingText === text) {
    stopSpeaking();
    return;
  }

  // Stop any ongoing speech first
  stopSpeaking();

  const chunks = splitTextIntoSentences(text);
  if (chunks.length === 0) return;

  activeSpeakingText = text;
  speechQueue = chunks;
  queueIndex = 0;
  notifySpeechListeners(text);

  // Chromium keep-alive heartbeat: Chrome has an old bug where speechSynthesis
  // can pause or freeze after ~14 seconds without pause/resume heartbeat
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }
  }, 5000);

  // Ensure voices are loaded (e.g. async in Chrome)
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      speakNextInQueue();
    };
  }

  speakNextInQueue();
}

/**
 * Stops any ongoing text-to-speech output
 */
export function stopSpeaking() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  speechQueue = [];
  queueIndex = 0;
  activeUtterance = null;
  (window as any).__activeSpeechUtterance = null;

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  if (activeSpeakingText !== null) {
    notifySpeechListeners(null);
  }
}

