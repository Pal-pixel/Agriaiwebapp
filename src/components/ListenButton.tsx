import { useEffect, useState } from 'react';

import { langByCode, useLang } from '../lib/i18n';
import { speak, stopSpeaking, ttsSupported } from '../lib/tts';

/**
 * A small "Listen / Stop" toggle that reads `text` aloud in the current
 * language. Self-manages its speaking state and stops on unmount.
 */
export default function ListenButton({ text, className }: { text: string; className?: string }) {
  const { lang, t } = useLang();
  const [speaking, setSpeaking] = useState(false);

  // Stop any speech if this button unmounts (e.g. tab switch / navigation).
  useEffect(() => () => stopSpeaking(), []);

  if (!ttsSupported() || !text.trim()) return null;

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(text, langByCode(lang).speech, () => setSpeaking(false));
  };

  return (
    <button type="button" className={className ?? 'listen-btn'} onClick={toggle} aria-pressed={speaking}>
      {speaking ? `⏹ ${t('res.stop')}` : `🔊 ${t('res.listen')}`}
    </button>
  );
}
