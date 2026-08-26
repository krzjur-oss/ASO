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
let currentSessionId = 0;
let chunkWatchdogTimer: any = null;

// Global array to prevent Chromium from garbage collecting active utterances
if (typeof window !== 'undefined') {
  (window as any).__speechUtterances = (window as any).__speechUtterances || [];
}

export function subscribeSpeech(listener: SpeechListener) {
  speechListeners.add(listener);
  listener(activeSpeakingText);
  return () => {
    speechListeners.delete(listener);
  };
}

function notifySpeechListeners(text: string | null) {
  activeSpeakingText = text;
  speechListeners.forEach(listener => {
    try {
      listener(text);
    } catch {
      // ignore
    }
  });
}

/**
 * Finds the best Polish voice available in the browser
 */
function getPolishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Exact Polish match (pl-PL, pl_PL, pl)
  const exactPl = voices.find(v => v.lang === 'pl-PL' || v.lang === 'pl_PL' || v.lang.toLowerCase() === 'pl');
  if (exactPl) return exactPl;

  // 2. Contains 'pl' in lang code
  const containsPl = voices.find(v => v.lang.toLowerCase().startsWith('pl'));
  if (containsPl) return containsPl;

  // 3. Contains 'polish' or 'polski' in name
  const namePl = voices.find(v => /polish|polski/i.test(v.name));
  if (namePl) return namePl;

  return null;
}

/**
 * Splits text into natural, digestible Polish speech phrases (max ~120 chars)
 * This prevents speech engine buffer overflows, memory cut-offs, and phonetic stutter.
 */
function cleanAndSplitText(text: string): string[] {
  if (!text) return [];

  // Replace tech symbols and paths with natural spoken Polish words
  const sanitized = text
    .replace(/C:\\/gi, ' dysk C, ')
    .replace(/D:\\/gi, ' dysk D, ')
    .replace(/E:\\/gi, ' dysk E, ')
    .replace(/C:/gi, ' dysk C ')
    .replace(/D:/gi, ' dysk D ')
    .replace(/System32/gi, ' System 32 ')
    .replace(/Program Files/gi, ' Program Files ')
    .replace(/ProgramData/gi, ' Program Data ')
    .replace(/\.txt\b/gi, ' kropka te iks te ')
    .replace(/\.exe\b/gi, ' kropka e iks e ')
    .replace(/\.png\b/gi, ' kropka pe en gie ')
    .replace(/\.jpg\b/gi, ' kropka jot pe gie ')
    .replace(/\.mp3\b/gi, ' kropka em pe trzy ')
    .replace(/\.wav\b/gi, ' kropka wav ')
    .replace(/[*_`#~•]/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\\/g, ' ukośnik ')
    .replace(/\//g, ' ukośnik ')
    .replace(/:/g, ' dwukropek ')
    .replace(/[„"”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!sanitized) return [];

  // Split by sentence boundaries (. ! ?)
  const rawSentences = sanitized.match(/[^.!?]+[.!?]*/g) || [sanitized];
  const chunks: string[] = [];

  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if (trimmed.length <= 130) {
      chunks.push(trimmed);
    } else {
      // Split long compound sentences on commas, semicolons, or natural pauses
      const parts = trimmed.split(/([,;]\s+)/);
      let cur = '';
      for (const p of parts) {
        if ((cur + p).length <= 130) {
          cur += p;
        } else {
          if (cur.trim()) chunks.push(cur.trim());
          cur = p;
        }
      }
      if (cur.trim()) chunks.push(cur.trim());
    }
  }

  return chunks.filter(c => c.length > 0);
}

function clearWatchdog() {
  if (chunkWatchdogTimer) {
    clearTimeout(chunkWatchdogTimer);
    chunkWatchdogTimer = null;
  }
}

/**
 * Speaks a list of chunked strings sequentially with rock-solid session handling
 */
function playSessionQueue(sessionId: number, fullOriginalText: string, chunks: string[], index: number) {
  if (sessionId !== currentSessionId) return;

  if (index >= chunks.length) {
    // All chunks finished cleanly
    if (activeSpeakingText === fullOriginalText) {
      stopSpeaking();
    }
    return;
  }

  const chunk = chunks[index];
  const utterance = new SpeechSynthesisUtterance(chunk);
  utterance.lang = 'pl-PL';

  const voice = getPolishVoice();
  if (voice) {
    utterance.voice = voice;
  }

  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Protect utterance from garbage collection by anchoring it globally
  if (typeof window !== 'undefined') {
    (window as any).__speechUtterances = (window as any).__speechUtterances || [];
    (window as any).__speechUtterances.push(utterance);
  }

  let hasEnded = false;
  const finishChunk = () => {
    if (hasEnded) return;
    hasEnded = true;
    clearWatchdog();

    // Clean up reference
    if (typeof window !== 'undefined' && (window as any).__speechUtterances) {
      const arr = (window as any).__speechUtterances;
      const idx = arr.indexOf(utterance);
      if (idx > -1) arr.splice(idx, 1);
    }

    if (sessionId === currentSessionId && activeSpeakingText === fullOriginalText) {
      // Short 40ms pause between chunks for natural cadence
      setTimeout(() => {
        if (sessionId === currentSessionId) {
          playSessionQueue(sessionId, fullOriginalText, chunks, index + 1);
        }
      }, 40);
    }
  };

  utterance.onend = () => {
    finishChunk();
  };

  utterance.onerror = (e) => {
    if (e.error === 'canceled' || e.error === 'interrupted') {
      clearWatchdog();
      return;
    }
    console.warn(`TTS Chunk ${index + 1}/${chunks.length} warning:`, e.error);
    finishChunk();
  };

  // Watchdog timer: If a browser speech engine hangs or misses the onend event,
  // ensure we automatically advance to the next chunk after expected duration + buffer.
  const estimatedMs = Math.max(3000, (chunk.length / 7) * 1000 + 4000);
  clearWatchdog();
  chunkWatchdogTimer = setTimeout(() => {
    if (!hasEnded && sessionId === currentSessionId) {
      finishChunk();
    }
  }, estimatedMs);

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('speechSynthesis.speak failed:', err);
    finishChunk();
  }
}

/**
 * Reads Polish text aloud using SpeechSynthesis with robust chunking & session isolation
 */
export function speakText(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this environment');
    return;
  }

  // If clicking the currently speaking item, stop / toggle it off
  if (activeSpeakingText === text) {
    stopSpeaking();
    return;
  }

  // Stop any active speech first
  stopSpeaking();

  const chunks = cleanAndSplitText(text);
  if (chunks.length === 0) return;

  const sessionId = ++currentSessionId;
  notifySpeechListeners(text);

  // Allow browser speech subsystem 50ms to cleanly reset after cancel() before feeding new utterances
  setTimeout(() => {
    if (sessionId === currentSessionId) {
      // If voices are not yet loaded, wait for voiceschanged
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          if (sessionId === currentSessionId) {
            playSessionQueue(sessionId, text, chunks, 0);
          }
        };
      }
      playSessionQueue(sessionId, text, chunks, 0);
    }
  }, 50);
}

/**
 * Stops any ongoing text-to-speech output immediately
 */
export function stopSpeaking() {
  currentSessionId++;
  clearWatchdog();

  if (typeof window !== 'undefined') {
    (window as any).__speechUtterances = [];
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  if (activeSpeakingText !== null) {
    notifySpeechListeners(null);
  }
}

