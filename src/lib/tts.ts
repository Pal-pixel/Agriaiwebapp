/**
 * tts.ts — read-aloud via the browser Web Speech API. Free, no tokens.
 * Helps low-literacy farmers hear the diagnosis in their own language.
 */

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Pick the best installed voice for a BCP-47 code (e.g. "hi-IN"). */
function pickVoice(speechLang: string): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  const base = speechLang.split('-')[0];
  return (
    voices.find((v) => v.lang === speechLang) ||
    voices.find((v) => v.lang?.startsWith(base))
  );
}

/** Speak `text` in `speechLang`. `onEnd` fires when playback stops. */
export function speak(text: string, speechLang: string, onEnd?: () => void): void {
  if (!ttsSupported() || !text.trim()) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel(); // never overlap utterances
  const u = new SpeechSynthesisUtterance(text);
  u.lang = speechLang;
  const voice = pickVoice(speechLang);
  if (voice) u.voice = voice;
  u.rate = 0.95;
  if (onEnd) {
    u.onend = onEnd;
    u.onerror = onEnd;
  }
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}
