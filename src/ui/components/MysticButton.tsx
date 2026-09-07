import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface MysticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'default' | 'ghost' | 'action';
  originLabel?: string;
  children: ReactNode;
}

export function MysticButton({ variant = 'default', originLabel, children, className, ...rest }: MysticButtonProps) {
  const variantClass = variant === 'primary' ? 'mystic-btn--primary' : variant === 'ghost' ? 'mystic-btn--ghost' : variant === 'action' ? 'mystic-btn--action' : '';
  return (
    <button className={`mystic-btn ${variantClass} ${className ?? ''}`.trim()} {...rest}>
      {originLabel && <span className="action-origin">{originLabel}</span>}
      {children}
    </button>
  );
}
