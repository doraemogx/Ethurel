import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ActionTagKind = 'class' | 'attribute' | 'origin';

const TAG_ICON: Record<ActionTagKind, string> = { class: '✦', attribute: '◈', origin: '◇' };

export interface MysticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'default' | 'ghost' | 'action';
  originLabel?: string;
  /** Categoria da tag (recuperada do handoff — sistema de tags com cor por
   * categoria, ver docs/design/11-LEGACY-RECOVERY.md): classe/atributo/origem. */
  tagKind?: ActionTagKind;
  children: ReactNode;
}

export function MysticButton({ variant = 'default', originLabel, tagKind, children, className, ...rest }: MysticButtonProps) {
  const variantClass = variant === 'primary' ? 'mystic-btn--primary' : variant === 'ghost' ? 'mystic-btn--ghost' : variant === 'action' ? 'mystic-btn--action' : '';
  return (
    <button className={`mystic-btn ${variantClass} ${className ?? ''}`.trim()} {...rest}>
      {originLabel && (
        <span className={`action-origin ${tagKind ? `action-tag--${tagKind}` : ''}`.trim()}>
          {tagKind ? `${TAG_ICON[tagKind]} ` : ''}
          {originLabel}
        </span>
      )}
      {children}
    </button>
  );
}
