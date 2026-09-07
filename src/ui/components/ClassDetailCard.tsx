import { useState } from 'react';
import { ArcaneSigil } from '@/ui/components/ArcaneSigil';
import { arcaneIdentityForClass } from '@/arcane/identity';
import { getClassTheme } from '@/ui/visual/classThemes';
import { computeMaxHp, computeMaxFocus } from '@/domain/dice';
import type { ClassDefinition } from '@/classes/types';

const ATTR_LABELS: Record<string, string> = { vigor: 'Vigor', reflexo: 'Reflexo', mente: 'Mente', presenca: 'Presença' };
const TIER_LABELS: Record<string, string> = { controle: 'Controle', saturacao: 'Saturação', ruptura: 'Ruptura' };

/**
 * Vitrine de uma classe (Fase 2 §10-11) — informação revelada
 * progressivamente: o essencial primeiro (nome/sigilo/conceito/dificuldade),
 * o resto atrás de "Ver detalhes" — nunca tudo despejado de uma vez.
 */
export function ClassDetailCard({ classDef }: { classDef: ClassDefinition }) {
  const [expanded, setExpanded] = useState(false);
  const theme = getClassTheme(classDef.id);
  const identity = arcaneIdentityForClass(classDef.id);
  const maxHp = computeMaxHp(classDef.baseAttrs.vigor);
  const maxFocus = computeMaxFocus(classDef.baseAttrs.mente);

  return (
    <div className="stack" style={{ alignItems: 'center', textAlign: 'center' }}>
      <ArcaneSigil identity={identity} zone="controle" size={56} />
      <h3 style={{ margin: '4px 0 0', fontWeight: 400, fontSize: 22 }}>{classDef.name}</h3>
      <p style={{ margin: 0, fontStyle: 'italic', color: theme.accentSoft, fontSize: 13 }}>{classDef.tagline}</p>

      <div style={{ display: 'flex', gap: 4, margin: '2px 0' }}>
        {[1, 2, 3].map((n) => (
          <span key={n} style={{ width: 6, height: 6, borderRadius: '50%', background: n <= classDef.difficulty ? theme.accent : 'rgba(216,211,230,0.2)' }} />
        ))}
      </div>

      <p style={{ margin: '6px 0', fontSize: 14, lineHeight: 1.5, textAlign: 'left' }}>{classDef.concept}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {classDef.mainAttrs.map((a) => (
          <span key={a} className="status-chip">{ATTR_LABELS[a]}</span>
        ))}
        <span className="status-chip">HP {maxHp}</span>
        <span className="status-chip">Foco {maxFocus}</span>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 12, textDecoration: 'underline', marginTop: 6, cursor: 'pointer' }}
      >
        {expanded ? 'Ver menos' : 'Ver detalhes'}
      </button>

      {expanded && (
        <div className="stack" style={{ textAlign: 'left', width: '100%', fontSize: 13, marginTop: 4 }}>
          <p style={{ margin: 0 }}><strong>Estilo:</strong> {classDef.combatStyle}</p>
          <p style={{ margin: 0, color: '#9fd1a8' }}><strong>Forças:</strong> {classDef.strengths}</p>
          <p style={{ margin: 0, color: 'var(--danger)' }}><strong>Fraquezas:</strong> {classDef.weaknesses}</p>
          <p style={{ margin: 0, fontStyle: 'italic', color: theme.accentSoft }}>{classDef.arcaneAffinity}</p>
          <div className="stack" style={{ marginTop: 4 }}>
            {classDef.abilities.map((ab) => (
              <div key={ab.id} className="slot-card" style={{ cursor: 'default', padding: '8px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <strong>{ab.name}</strong>
                  <span style={{ color: 'var(--text-dim)' }}>{TIER_LABELS[ab.tier]}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Foco {ab.cost} · Tensão +{ab.tensionGain}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
