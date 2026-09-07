export interface PortraitProps {
  name: string;
  imageUrl?: string;
  size?: number;
  accent?: string;
  /** Aro sutil de destaque — usado para indicar "quem está falando agora". */
  active?: boolean;
}

/**
 * Sem arte final: silhueta artística — nunca uma letra dentro de um círculo
 * (rejeitado explicitamente na Fase 2 §15) nem pixel art procedural (spec
 * §65/§22). Quando `imageUrl` existir (arte futura), é usado sem mudar o
 * layout.
 */
export function Portrait({ name, imageUrl, size = 52, accent = '#9f7fe0', active }: PortraitProps) {
  return (
    <div
      className="portrait"
      title={name}
      style={{
        width: size,
        height: size,
        borderColor: active ? accent : undefined,
        boxShadow: active ? `0 0 16px ${accent}66` : undefined,
      }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} loading="lazy" decoding="async" />
      ) : (
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden>
          <defs>
            <radialGradient id={`portrait-glow-${size}`} cx="45%" cy="30%" r="70%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.06" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="32" fill={`url(#portrait-glow-${size})`} />
          {/* Silhueta simples — cabeça + ombros, nunca um rosto desenhado. */}
          <path
            d="M32 14 C39 14 44 19.5 44 27 C44 33 40.5 37.5 36.5 39.5 C48 42 54 49 54 58 L10 58 C10 49 16 42 27.5 39.5 C23.5 37.5 20 33 20 27 C20 19.5 25 14 32 14 Z"
            fill={accent}
            fillOpacity="0.5"
          />
        </svg>
      )}
    </div>
  );
}
