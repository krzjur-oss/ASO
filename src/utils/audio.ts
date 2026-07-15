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

// TEXT TO SPEECH (TTS) SYSTEM FOR KIDS (GRADES 1-3)
type SpeechListener = (speakingText: string | null) => void;
const speechListeners = new Set<SpeechListener>();
let activeSpeakingText: string | null = null;

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
 * Reads the given Polish text aloud using the browser's SpeechSynthesis API
 */
export function speakText(text: string) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }

  // If already speaking the same text, toggle off / stop speaking
  if (activeSpeakingText === text) {
    stopSpeaking();
    return;
  }

  // Cancel any currently active speech before starting a new one
  stopSpeaking();

  // Clean the text from markdown or layout characters for a smoother vocalization
  const cleanText = text
    .replace(/[*_`#\-•]/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'pl-PL';

  // Attempt to select a native Polish voice if available
  const voices = window.speechSynthesis.getVoices();
  const plVoice = voices.find(voice => voice.lang.includes('pl'));
  if (plVoice) {
    utterance.voice = plVoice;
  }

  utterance.onstart = () => {
    notifySpeechListeners(text);
  };

  utterance.onend = () => {
    if (activeSpeakingText === text) {
      notifySpeechListeners(null);
    }
  };

  utterance.onerror = (e) => {
    console.warn('SpeechSynthesisUtterance error:', e);
    if (activeSpeakingText === text) {
      notifySpeechListeners(null);
    }
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Stops any ongoing text-to-speech output
 */
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    notifySpeechListeners(null);
  }
}

