import type {
  InterpretedAction,
  NarrativeContext,
  NarrativeProvider,
  NarrativeRequest,
  NarrativeResponse,
  SuggestedAction,
} from '@/ai/NarrativeProvider';
import type { NarrativeActionIntent } from '@/ai/actionContract';

/**
 * Sugestões genéricas por ambiente (Rodada de Recuperação §O) — cobrem o
 * caso "o roteiro fixo da cena acabou, ou o jogador já usou Outra Ação, e a
 * tela não pode ficar sem nada além de 'Fazer outra coisa...'". Não
 * substituem as ações autorais da cena (`FIRST_CHAPTER_SCENES`, ainda
 * escritas à mão e mostradas primeiro) — são o complemento sempre
 * disponível, filtrado por presença de NPC e sem repetir uma pergunta já
 * feita nesta localização (`recentEvents`, memória real do WorldEventLog).
 */
const AMBIENT_SUGGESTIONS: Record<string, { id: string; label: string; unlockedBy?: string }[]> = {
  village: [
    { id: 'local-observe', label: 'Observar o povoado com atenção', unlockedBy: 'Mente' },
    { id: 'local-listen', label: 'Prestar atenção nas conversas ao redor', unlockedBy: 'Presença' },
    { id: 'local-market', label: 'Perguntar sobre notícias recentes' },
  ],
  forest: [
    { id: 'local-observe', label: 'Observar a vegetação com atenção', unlockedBy: 'Mente' },
    { id: 'local-listen', label: 'Escutar o que se move na mata', unlockedBy: 'Reflexo' },
    { id: 'local-tracks', label: 'Procurar rastros no chão' },
  ],
  road: [
    { id: 'local-observe', label: 'Observar a estrada em busca de marcos', unlockedBy: 'Mente' },
    { id: 'local-listen', label: 'Ficar atento a quem se aproxima', unlockedBy: 'Reflexo' },
  ],
  cave: [
    { id: 'local-observe', label: 'Observar as paredes de pedra', unlockedBy: 'Mente' },
    { id: 'local-listen', label: 'Escutar o eco ao redor', unlockedBy: 'Presença' },
  ],
  fissure: [
    { id: 'local-observe', label: 'Observar a distorção no ar', unlockedBy: 'Mente' },
    { id: 'local-feel', label: 'Sentir a reação da Arcane em você' },
  ],
  ashlands: [
    { id: 'local-observe', label: 'Observar as cinzas com atenção', unlockedBy: 'Mente' },
  ],
  archive: [
    { id: 'local-observe', label: 'Procurar algo relevante nos registros', unlockedBy: 'Mente' },
  ],
};

const MOOD_BY_DANGER_WORDS = [
  { words: ['fissura', 'ruptura', 'arcane'], mood: 'mysterious' as const },
  { words: ['ferido', 'sangue', 'dor'], mood: 'grim' as const },
  { words: ['vitória', 'venceu'], mood: 'triumphant' as const },
];

/**
 * Implementação local e determinística — sem rede. É o provider padrão: o
 * jogo abre e é jogável por completo sem nenhuma IA configurada. Não é um
 * fallback pobre — diálogo e quest essenciais são escritos à mão em
 * src/content/, não gerados aqui. Este provider só cobre a parte
 * opcional por natureza: flavor de eventos mecânicos e a interpretação de
 * texto livre ("Outra ação...").
 *
 * HONESTIDADE DE ESCOPO (Fase 0 §Crítico-2, `docs/production/REPO_AUDIT.md`):
 * isto é reconhecimento de padrão por categoria semântica (radicais de verbo +
 * entidades do contexto), não compreensão de linguagem natural real — não há
 * LLM aqui. É uma melhoria real sobre "3 regex + fallback genérico" (mais
 * categorias, reconhece o NPC presente por nome, nunca devolve a MESMA frase
 * para intenções diferentes), mas continua sendo determinístico e limitado
 * por natureza. `NarrativeEngine.connectionState` expõe isso à UI
 * ('local' vs 'remote') — o composer mostra qual dos dois está em uso, nunca
 * finge que uma interpretação local é IA remota operacional.
 */
export class LocalNarrativeProvider implements NarrativeProvider {
  readonly isAvailable = true;

  async requestNarration(request: NarrativeRequest): Promise<NarrativeResponse> {
    const { context } = request;
    const mood = this.inferMood(context);
    const narration = context.mechanicalResult
      ? context.mechanicalResult
      : `Você está em ${context.locationName}. ${context.locationDescription}`;

    return {
      narration,
      suggestedActions: this.buildSuggestions(context),
      mood,
      requestedChecks: [],
    };
  }

  /** Gera as sugestões genéricas (ver AMBIENT_SUGGESTIONS acima) — nunca
   * repete uma ação cujo texto já apareceu como `action` num WorldEvent
   * recente nesta localização (memória real, spec §30: "não sugerir
   * repetidamente a mesma pergunta"). Acrescenta uma opção de NPC quando
   * há um presente. */
  private buildSuggestions(context: NarrativeContext): SuggestedAction[] {
    const pool = AMBIENT_SUGGESTIONS[context.ambientProfile] ?? AMBIENT_SUGGESTIONS.village;
    const alreadyDone = new Set(context.recentEvents.map((e) => e.action));
    const suggestions: SuggestedAction[] = pool.filter((s) => !alreadyDone.has(s.label)).slice(0, 3);

    if (context.npcName && !alreadyDone.has(`Perguntar a ${context.npcName} o que ele sabe sobre este lugar`)) {
      suggestions.unshift({ id: 'local-ask-npc', label: `Perguntar a ${context.npcName} o que ele sabe sobre este lugar` });
    }

    return suggestions.slice(0, 4);
  }

  async interpretFreeText(text: string, context: NarrativeContext): Promise<InterpretedAction> {
    const normalized = text.trim().toLowerCase();
    if (!normalized) return { kind: 'impossible', reason: 'Ação vazia.' };
    if (normalized.length > 240) {
      return { kind: 'partial', reason: 'Isso é ambicioso demais para agora — tente algo mais direto.' };
    }

    const npc = context.npcName;
    const mentionsNpc = npc ? normalized.includes(npc.toLowerCase()) || /\bdel[ea]\b/.test(normalized) : false;

    // Ordem importa: social/pergunta primeiro (mais específico — depende de
    // um NPC presente), depois checks mecânicos (existente), depois
    // expressão emocional/física sem alvo, por fim item, por fim o
    // fallback honesto (contextual, nunca a mesma frase para tudo).

    if (/\b(abra[çc]|toc|beij|segur|cumpriment)\w*/.test(normalized)) {
      if (!npc) return { kind: 'impossible', reason: 'Não há ninguém aqui para isso agora.' };
      if (!mentionsNpc) return { kind: 'possible', reason: `Você se aproxima, mas ${npc} não parece ser quem você tinha em mente. O gesto fica sem destino claro.` };
      return { kind: 'possible', reason: `Você se aproxima de ${npc}. ${npc} nota o gesto — não recua, mas também não relaxa de todo.` };
    }

    if (/\bempurr\w*/.test(normalized) && mentionsNpc) {
      // Narrative Action Contract (Fase 2 §8): "empurro Tolven e tento pegar
      // a chave" é uma intenção composta — física primária + adquirir item
      // secundária. `intent`/`secondaryIntent` carregam essa leitura
      // estruturada; `resolveNarrativeAction` (src/ai/actionContract.ts) é
      // quem decide de verdade, nunca este provider.
      const wantsItemToo = /\b(peg|roub|furt|agarr)\w*/.test(normalized);
      const intent: NarrativeActionIntent = {
        intent: 'physical_interaction',
        target: context.npcId,
        attempt: 'push',
        requiresCheck: true,
        suggestedAttribute: 'vigor',
        ...(wantsItemToo ? { secondaryIntent: 'acquire_item' as const } : {}),
      };
      return { kind: 'requires_check', requestedCheck: { attribute: 'vigor', reason: `Empurrar ${npc} não é um gesto pequeno.` }, intent };
    }

    if (/\b(roub|furt)\w*/.test(normalized)) {
      const intent: NarrativeActionIntent = { intent: 'acquire_item', attempt: 'steal', requiresCheck: true, suggestedAttribute: 'reflexo' };
      return { kind: 'requires_check', requestedCheck: { attribute: 'reflexo', reason: 'Pegar algo sem ser notado exige discrição.' }, intent };
    }

    if (normalized.includes('?') || /\bpergunt\w*/.test(normalized)) {
      if (!npc) return { kind: 'possible', reason: 'Você fala a pergunta em voz alta. Ninguém por perto para responder.' };
      return { kind: 'possible', reason: `${npc} ouve a pergunta e considera antes de responder — o que exatamente ${npc} diz depende do que já houve entre vocês.` };
    }

    if (/\bn[ãa]o\s+(respond\w*|fa[çc]o\s+nada|digo\s+nada)\b/.test(normalized) || /\bme\s+recus\w*/.test(normalized)) {
      return {
        kind: 'possible',
        reason: npc
          ? `Você fica em silêncio. ${npc} nota — a ausência de resposta também diz algo, mesmo sem palavra nenhuma.`
          : `Você não faz nada. O momento passa sem reação — e isso, por si, também é uma escolha registrada.`,
      };
    }

    if (/\b(fug|foge)\w*/.test(normalized) || /\bsa[ií]\w*\s+corr\w*/.test(normalized)) {
      return { kind: 'requires_check', requestedCheck: { attribute: 'reflexo', reason: 'Fugir sem escolher rota, só distância.' } };
    }

    if (/\b(examin|observ|investig|olh)\w*/.test(normalized)) {
      return { kind: 'requires_check', requestedCheck: { attribute: 'mente', reason: 'Examinar algo com atenção.' } };
    }
    if (/\b(escut|ouv)\w*/.test(normalized)) {
      return { kind: 'requires_check', requestedCheck: { attribute: 'presenca', reason: 'Perceber algo pelo som.' } };
    }
    if (/\b(sob|escal|esquiv|corr)\w*/.test(normalized)) {
      return { kind: 'requires_check', requestedCheck: { attribute: 'reflexo', reason: 'Ação física arriscada.' } };
    }
    if (/\b(for[çc]|quebr|empurr|levant)\w*/.test(normalized)) {
      return { kind: 'requires_check', requestedCheck: { attribute: 'vigor', reason: 'Ação de força.' } };
    }

    if (/\b(chor|solu[cç])\w*/.test(normalized)) {
      return { kind: 'possible', reason: `As lágrimas vêm sem pedir licença. ${npc ? `${npc} percebe, mesmo que finja que não.` : `Ninguém por perto para ver — só ${context.locationName}, quieto ao redor.`}` };
    }
    if (/\b(r[ir]|sorri)\w*/.test(normalized)) {
      return { kind: 'possible', reason: `Um riso escapa, curto. ${npc ? `${npc} olha de canto de olho.` : 'Nada muda ao redor, mas o peso no peito afrouxa um pouco.'}` };
    }
    if (/\bgrit\w*/.test(normalized)) {
      return { kind: 'possible', reason: `O grito sai antes de qualquer decisão consciente. ${npc ? `${npc} se vira na hora.` : `O som se perde em ${context.locationName}, sem eco de volta.`}` };
    }
    if (/\bsuspir\w*/.test(normalized)) {
      return { kind: 'possible', reason: 'Um suspiro longo. Nada muda ao redor, mas alguma coisa em você se acomoda, só um pouco.' };
    }
    if (/\bcant\w*/.test(normalized)) {
      return { kind: 'possible', reason: `Você canta, sem se importar se é a hora certa. ${npc ? `${npc} interrompe o que fazia para ouvir, sem saber bem o que pensar disso.` : `O som se espalha por ${context.locationName}, estranho e um pouco fora de lugar.`}` };
    }

    if (/\b(deit|sent|ajoelh)\w*/.test(normalized)) {
      return { kind: 'possible', reason: `Você se acomoda ali mesmo, em ${context.locationName}. O mundo não espera, mas também não cobra pressa.` };
    }

    if (/\b(jog|larg|arremess)\w*/.test(normalized)) {
      return { kind: 'possible', reason: 'Você solta o que segurava. Cai com um som seco, sem chamar atenção que não devesse.' };
    }
    if (/\bpeg\w*/.test(normalized)) {
      return { kind: 'requires_condition', reason: 'Só se houver algo específico por perto para pegar — descreva o quê.' };
    }

    // Fallback honesto: nunca a mesma frase-padrão para tudo (Fase 0
    // §Crítico-2) — sempre amarrado ao local/NPC reais da cena, mesmo sem
    // reconhecer uma categoria específica.
    return {
      kind: 'possible',
      reason: npc
        ? `Você faz o que descreveu. ${npc} está por perto e registra — mas o gesto, por si, não muda nada visível em ${context.locationName}.`
        : `Você faz o que descreveu, ali em ${context.locationName}. Nada muda de forma perceptível ao redor — mas a tentativa aconteceu, não foi ignorada.`,
    };
  }

  private inferMood(context: NarrativeContext): NarrativeResponse['mood'] {
    const haystack = `${context.locationDescription} ${context.mechanicalResult ?? ''}`.toLowerCase();
    for (const entry of MOOD_BY_DANGER_WORDS) {
      if (entry.words.some((w) => haystack.includes(w))) return entry.mood;
    }
    return 'neutral';
  }
}
