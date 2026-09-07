# Auditoria — fronteira GameEngine ↔ NarrativeEngine (Fase 2 §7)

> Resultado: a fronteira já era estruturalmente sólida (não só por
> convenção) desde a Fase 1/Fase 2 §1-2 desta sessão. Esta auditoria
> verificou e documentou; nenhuma violação encontrada.

## Verificação estrutural (não só documental)

`grep` por qualquer referência a tipos de IA (`NarrativeProvider`,
`narrativeEngine`, `InterpretedAction`, `NarrativeResponse`) dentro de
`src/domain/` e `src/combat/` — **zero ocorrências em ambos**. Isso não é
convenção informal: o motor de regras (`src/domain/`: dice, combat,
characterFactory, worldEvents, indole, knowledge, echoes, passiveInsights,
failureOutcome) e o combate (`src/combat/`) não têm nenhuma linha de código
que sequer importe um tipo relacionado a IA — não há como um valor vindo da
IA entrar nesses módulos, estrutural, não só por disciplina de quem escreve.

## O que o GameEngine continua decidindo sozinho (confirmado, um por um)

| Sistema | Autoridade | Onde |
|---|---|---|
| Checks/dados/DC/vantagem | `checkD20`, `D20Check` (UI) | `src/domain/dice.ts` |
| HP/dano/cura | `SceneScreen`/`CombatScreen` a partir de `ActionResolver` | `src/combat/`, nunca de `interpreted.*` |
| Condições | `RemoveStatusByCategory`/efeitos | `src/effects/` |
| Inventário/loot | Mutação direta em `draft.inventory` na UI, nunca de resposta de IA | `src/ui/screens/*.tsx` |
| XP/progressão | `c.xp += enemy.xp` (fixo, do bestiário) | `src/ui/screens/SceneScreen.tsx` |
| Foco/Tensão/Saturação/Ruptura | `arcaneZone()`, mutação de `c.tension` só a partir de resultado de combate/check | `src/arcane/zone.ts` |
| Marca Arcana | Mesma linha de resultado determinístico | `src/domain/characterFactory.ts` |
| Índole/Reputação | `resolveWorldEvent` — só aceita `WorldEvent` já com deltas decididos pelo código, nunca por um provider de IA | `src/social/indole.ts` |

## O único canal de influência da IA sobre mecânica: `RequestedCheck.suggestedDc`

`src/ai/NarrativeProvider.ts` já documentava isso desde antes desta sessão:
"A IA nunca envia valores finais que o jogo simplesmente aceita" — verificado
em `SceneScreen.submitFreeAction` (Fase 0 §Crítico-2, `LocalNarrativeProvider`):

```ts
const dc = interpreted.requestedCheck?.suggestedDc ?? 12;
```

A IA pode **sugerir** uma DC; se ela não sugerir nada, o fallback é 12 (fixo,
não decidido pela IA). O resultado do check em si (sucesso/falha) sempre
passa pelo `D20Check`/`checkD20` real — rolagem determinística, nunca
inferida pela IA. Isso é o único ponto de contato entre uma sugestão da IA e
um número mecânico, e mesmo esse ponto é uma sugestão que o GameEngine pode
seguir ou ignorar, nunca um valor final aceito sem validação.

## Teste estrutural

`src/ai/gameEngineBoundary.test.ts` (novo, Fase 2 §7) prova via
`import.meta.glob` que nenhum arquivo em `src/domain/` ou `src/combat/`
contém a string `narrativeEngine`/`NarrativeProvider`/`InterpretedAction`/
`NarrativeResponse` — regressão automática, não só uma auditoria pontual.
