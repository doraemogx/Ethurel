import { useEffect, useRef, useState } from 'react';
import type { TextSpeed } from '@/save/schema';

export interface TypewriterProps {
  text: string;
  speed: TextSpeed;
  reduceMotion?: boolean;
  onDone?: () => void;
  className?: string;
}

const CHAR_MS: Record<TextSpeed, number> = { instant: 0, fast: 9, cinematic: 24 };
const PAUSE_CHARS = new Set(['.', ',', '!', '?', '—', ';', ':']);
const PAUSE_MS: Record<TextSpeed, number> = { instant: 0, fast: 40, cinematic: 140 };

/**
 * Typewriter recuperado do Artifact antigo (`typeInto()`, pausa maior em
 * pontuação — ver docs/design/11-LEGACY-RECOVERY.md), reimplementado:
 * nunca bloqueia além do necessário, toque revela na hora, não reinicia se
 * `text` não mudou entre renders, respeita reduceMotion (spec Fase 2 §17).
 */
export function Typewriter({ text, speed, reduceMotion, onDone, className }: TypewriterProps) {
  const [shown, setShown] = useState(reduceMotion || speed === 'instant' ? text.length : 0);
  const lastText = useRef<string | null>(null);
  const doneRef = useRef(false);
  const handleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lastText.current === text) return;
    lastText.current = text;
    doneRef.current = false;

    if (reduceMotion || speed === 'instant') {
      setShown(text.length);
      doneRef.current = true;
      onDone?.();
      return;
    }

    setShown(0);
    let i = 0;

    const step = () => {
      i += 1;
      setShown(i);
      if (i >= text.length) {
        doneRef.current = true;
        handleRef.current = null;
        onDone?.();
        return;
      }
      const delay = PAUSE_CHARS.has(text[i - 1]) ? PAUSE_MS[speed] : CHAR_MS[speed];
      handleRef.current = setTimeout(step, delay);
    };
    handleRef.current = setTimeout(step, CHAR_MS[speed]);

    return () => {
      if (handleRef.current) clearTimeout(handleRef.current);
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, reduceMotion]);

  const reveal = () => {
    if (doneRef.current) return;
    if (handleRef.current) {
      clearTimeout(handleRef.current);
      handleRef.current = null;
    }
    doneRef.current = true;
    setShown(text.length);
    onDone?.();
  };

  return (
    <p className={className} onClick={reveal} style={{ cursor: shown < text.length ? 'pointer' : 'default' }}>
      {text.slice(0, shown)}
    </p>
  );
}
