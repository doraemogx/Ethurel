export interface PortraitProps {
  name: string;
  imageUrl?: string;
  size?: number;
}

/** Sem arte final: iniciais sobre um fundo místico — fallback elegante,
 * nunca quadrado colorido nem pixel art procedural (spec §22/§65). Quando
 * `imageUrl` existir (arte futura), é usado sem mudar o layout. */
export function Portrait({ name, imageUrl, size = 52 }: PortraitProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div className="portrait" style={{ width: size, height: size }}>
      {imageUrl ? <img src={imageUrl} alt={name} /> : <span>{initials}</span>}
    </div>
  );
}
