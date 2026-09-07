# Auditoria — separação Índole/Reputação (Fase 2 §6)

> Resultado: a separação já estava correta arquiteturalmente desde a Fase 1
> (`src/social/indole.ts`). Esta rodada só formalizou os dois invariantes
> pedidos com testes explícitos (`src/social/indole.test.ts`) — nenhuma
> mudança de código foi necessária.

## Os dois invariantes pedidos

1. **"Ações sem testemunhas não devem gerar reputação pública automaticamente."**
   Confirmado por `resolveWorldEvent`: `reputationDelta` só é aplicado
   quando `event.witnesses !== 'none'`. Testado inclusive no caso adversarial
   — um evento com `witnesses: 'none'` MAS `reputationDelta` preenchido
   (erro de quem gera o evento) ainda assim não altera reputação.

2. **"Rumores podem gerar reputação sem alterar Índole."**
   Confirmado: `indoleDelta` é opcional em `WorldEvent`
   (`src/social/indole.ts`) — um evento pode ter só `reputationDelta` +
   `witnesses: 'public'`. Testado com um caso concreto (rumor negativo sobre
   Ynara Voss) que muda `reputation` sem tocar `indole`.

## Por que a arquitetura já suportava isso

`resolveWorldEvent` trata os dois deltas de forma totalmente independente:

```ts
const indole = event.indoleDelta ? applyIndoleDelta(...) : state.indole;
const reputation = event.witnesses !== 'none' && event.reputationDelta
  ? applyReputationDelta(...)
  : state.reputation;
```

Não há acoplamento nenhum entre as duas linhas — cada uma só olha para o
campo do evento que lhe diz respeito. Isso já refletia a regra canônica
citada em `CANON_CORE.md` §7 (Livro 0.07): "Índole registra padrão interno
inferido de ações; Reputação é conhecimento social distribuído e exige
testemunho ou transmissão."

## O que NÃO existe ainda (fora do escopo desta rodada)

Não há um sistema de propagação de rumor (um NPC "espalhando" o que viu para
outro NPC ao longo do tempo) — `witnesses: 'public'` é uma decisão tomada no
momento em que o evento é criado por quem escreve a cena/quest, não uma
simulação. Isso é consistente com o que `src/social/indole.ts` já documentava
("não é uma simulação social... é uma decisão tomada por quem desenha a
quest") — não mudou nesta rodada.
