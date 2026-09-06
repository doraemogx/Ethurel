/**
 * Zonas de Arcane — cada uma com identidade mecânica própria, não apenas graus
 * crescentes de poder. Ver docs/design/03-GAMEPLAY-E-COMBATE.md §4.
 *
 * Fase 1 define só o tipo e o cálculo de zona a partir da Tensão; os mecanismos
 * de gerenciamento/redução de Tensão (descanso, descarga ativa, ambiente) e os
 * bônus/penalidades reais de cada zona são implementados na Fase 5, junto com a
 * especificação de balanceamento (gate obrigatório antes daquele código).
 */
export type ArcaneZone = 'controle' | 'saturacao' | 'ruptura';

export function arcaneZone(tension: number): ArcaneZone {
  if (tension >= 90) return 'ruptura';
  if (tension >= 60) return 'saturacao';
  return 'controle';
}
