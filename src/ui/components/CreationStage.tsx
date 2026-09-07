import type { ReactNode } from 'react';

export interface CreationStageProps {
  /** Pequeno rótulo acima do título (ex.: "3 DE 9 · ANCESTRALIDADE"). */
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  /** ÁREA PRINCIPAL (Fase 3 §"Layout Base"): personagem/arte/atmosfera —
   * sempre a região que domina a tela, nunca texto. */
  main: ReactNode;
  /** Cor do brilho atrás da arte principal — normalmente o accent da classe/tema atual. */
  mainAccent?: string;
  /** ÁREA SECUNDÁRIA: informação sobre a escolha atual — nunca mais de
   * ~35% da altura (spec: "não deixar 60% da tela ocupada por texto"). */
  secondary?: ReactNode;
  /** CONTROLES: sempre no rodapé, alvo de toque confortável. */
  controls: ReactNode;
}

/**
 * Layout de 3 zonas para a criação de personagem (Fase 3 — Vertical Slice
 * Visual, "Layout Base" + "Princípio Visual"): o personagem é o centro da
 * tela, não uma lista/formulário/dashboard. Reaproveitado por todos os
 * passos que precisam mostrar o personagem reagindo à escolha atual
 * (ancestralidade, variante, aparência, classe). Passos puramente textuais
 * (princípio/desejo/medo/limite) continuam usando `SelectConfirmStep`, sem
 * necessidade de arte — este componente é só para quando há algo visual
 * para mostrar.
 */
export function CreationStage({ eyebrow, title, subtitle, main, mainAccent, secondary, controls }: CreationStageProps) {
  return (
    <div className="creation-stage">
      <div className="creation-stage__header">
        {eyebrow && <p className="creation-stage__eyebrow">{eyebrow}</p>}
        <h2 className="creation-stage__title">{title}</h2>
        {subtitle && <div className="creation-stage__subtitle">{subtitle}</div>}
      </div>

      <div className="creation-stage__main">
        {mainAccent && (
          <div
            className="creation-stage__main-glow"
            style={{ background: `radial-gradient(60% 55% at 50% 65%, ${mainAccent}33, transparent 72%)` }}
          />
        )}
        <div className="creation-stage__main-art">{main}</div>
      </div>

      {secondary && <div className="creation-stage__secondary">{secondary}</div>}

      <div className="creation-stage__controls">{controls}</div>
    </div>
  );
}
