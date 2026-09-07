import { useState } from 'react';
import { checkD20, type AdvantageState, type D20CheckResult } from '@/domain/dice';
import { MysticButton } from '@/ui/components/MysticButton';

export interface D20CheckProps {
  label: string;
  attribute: string;
  modifier: number;
  dc: number;
  advantageState?: AdvantageState;
  onResolved: (result: D20CheckResult) => void;
}

/**
 * "A interface deve mostrar uma rolagem somente quando ela for relevante"
 * (spec §9) — este componente é montado só quando o GameEngine decidiu que
 * há um teste real acontecendo, nunca para todo diálogo.
 */
export function D20Check({ label, attribute, modifier, dc, advantageState = 'normal', onResolved }: D20CheckProps) {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<D20CheckResult | null>(null);

  const roll = () => {
    setRolling(true);
    window.setTimeout(() => {
      const r = checkD20(modifier, dc, advantageState);
      setResult(r);
      setRolling(false);
      onResolved(r);
    }, 480);
  };

  return (
    <div className="d20">
      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
        [{attribute.toUpperCase()}] {label} · DC {dc}
        {advantageState !== 'normal' && ` · ${advantageState === 'advantage' ? 'vantagem' : 'desvantagem'}`}
      </div>
      {!result ? (
        <MysticButton variant="primary" onClick={roll} disabled={rolling}>
          {rolling ? '...' : 'Rolar'}
        </MysticButton>
      ) : (
        <>
          <div
            className={`d20__die ${result.isCriticalSuccess ? 'd20__die--crit' : ''} ${result.isCriticalFailure ? 'd20__die--fumble' : ''}`.trim()}
          >
            {result.chosenRoll}
          </div>
          <div style={{ fontSize: 13 }}>
            {result.chosenRoll} {result.modifier >= 0 ? '+' : ''}{result.modifier} = {result.total} vs DC {dc}
            <strong style={{ marginLeft: 6, color: result.success ? 'var(--accent-soft)' : 'var(--danger)' }}>
              {result.isCriticalSuccess ? 'CRÍTICO!' : result.isCriticalFailure ? 'FALHA CRÍTICA' : result.success ? 'SUCESSO' : 'FALHA'}
            </strong>
          </div>
        </>
      )}
    </div>
  );
}
