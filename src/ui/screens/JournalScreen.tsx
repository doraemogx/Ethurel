import { useState } from 'react';
import { SceneBackdrop } from '@/ui/components/SceneBackdrop';
import { sceneArtFor } from '@/ui/visual/sceneArt';
import { useGame } from '@/app/GameContext';
import { QUEST_ID, QUEST_TITLE, NPC_NAME } from '@/content/firstChapterQuest';
import type { KnowledgeCategory, KnowledgeEntry } from '@/domain/knowledge';
import { IMG } from '@/ui/assetPath';

const CATEGORY_LABEL: Record<KnowledgeCategory, string> = {
  missoes: 'Missões',
  pessoas: 'Pessoas',
  lugares: 'Lugares',
  criaturas: 'Criaturas',
  ecos: 'Ecos',
  codice: 'Códice',
};
const CATEGORIES: KnowledgeCategory[] = ['missoes', 'pessoas', 'lugares', 'criaturas', 'ecos', 'codice'];

const STATE_LABEL: Record<KnowledgeEntry['state'], string> = {
  rumor: 'Rumor',
  confirmed: 'Confirmado',
  disputed: 'Contestado',
  unknown: 'Desconhecido',
};

/**
 * Diário de Campanha (Fase 2 §33-34) — conhecimento do PERSONAGEM, não uma
 * wiki onisciente. Entradas base (o que já se sabe ao chegar em Varreth) +
 * entradas dinâmicas (`save.knowledge`, registradas conforme o jogo avança
 * em SceneScreen) + a quest atual + os Ecos já vividos.
 */
export function JournalScreen() {
  const { save } = useGame();
  const [category, setCategory] = useState<KnowledgeCategory>('missoes');

  const baseline: KnowledgeEntry[] = [
    {
      id: 'npc-tolven',
      category: 'pessoas',
      title: NPC_NAME,
      summary: 'Guarda-caminho de Varreth. Cansado, mas atento — desconfia de coisas que "não são naturais" antes de qualquer outra coisa.',
      state: 'confirmed',
      tags: [],
      discoveredAt: 0,
    },
    {
      id: 'lugar-varreth',
      category: 'lugares',
      title: 'Varreth',
      summary: 'O povoado onde a campanha começa. Pedra, madeira, luzes quentes contra o frio da fronteira.',
      state: 'confirmed',
      tags: [],
      discoveredAt: 0,
    },
  ];

  const questEntries: KnowledgeEntry[] =
    save.quests[QUEST_ID] && save.quests[QUEST_ID] !== 'not_started'
      ? [
          {
            id: `quest-${QUEST_ID}`,
            category: 'missoes',
            title: QUEST_TITLE,
            summary:
              save.quests[QUEST_ID] === 'completed'
                ? 'Resolvido — a raiz arcana não é mais um mistério aberto, seja qual for a decisão tomada sobre ela.'
                : 'Uma raiz rompeu perto da clareira leste. Tolven pediu para investigar.',
            state: 'confirmed',
            tags: ['raiz-sussurrou'],
            discoveredAt: 0,
          },
        ]
      : [];

  const echoEntries: KnowledgeEntry[] = save.echoes.map((e) => ({
    id: `echo-${e.id}`,
    category: 'ecos',
    title: e.title,
    summary: e.description,
    state: 'confirmed',
    tags: e.tags,
    discoveredAt: e.discoveredAt,
  }));

  const all = [...baseline, ...questEntries, ...echoEntries, ...save.knowledge];
  const entries = all.filter((e) => e.category === category);

  return (
    <div className="screen">
      <SceneBackdrop art={sceneArtFor('archive')} />
      <div className="screen__content">
        <h2 style={{ fontWeight: 400, textAlign: 'center', margin: '4px 0 12px' }}>Diário de Campanha</h2>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="mystic-btn"
              style={{
                flex: '0 0 auto',
                padding: '6px 12px',
                fontSize: 12,
                borderColor: category === c ? 'var(--accent-soft)' : undefined,
              }}
            >
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        <div className="stack" style={{ marginTop: 12, overflowY: 'auto', flex: 1 }}>
          {entries.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Nada registrado aqui ainda.</p>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="journal-entry" style={{ backgroundImage: `url('${IMG}/parchment/scroll-folded-b.webp')` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <p className="journal-entry__title">{e.title}</p>
                  {e.state !== 'confirmed' && <span className="status-chip">{STATE_LABEL[e.state]}</span>}
                </div>
                <p className="journal-entry__summary">{e.summary}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
