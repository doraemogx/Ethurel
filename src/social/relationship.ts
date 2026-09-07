/**
 * Relacionamentos como estados narrativos (Fase 2 §43, recuperado do
 * `npcRel{trust}` do handoff — antes nunca mostrado ao jogador, agora
 * exposto só como rótulo, nunca como número). `npcTrust` (save v5)
 * continua guardando o número internamente; a UI só lê este rótulo.
 */
export type RelationshipLabel = 'Desconfiado' | 'Neutro' | 'Receptivo' | 'Próximo';

export function relationshipLabel(trust: number): RelationshipLabel {
  if (trust <= -4) return 'Desconfiado';
  if (trust >= 8) return 'Próximo';
  if (trust >= 3) return 'Receptivo';
  return 'Neutro';
}
