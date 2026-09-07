/**
 * Assinatura visual Arcane do personagem (Fase 2 §12) — recuperada do
 * conceito `SIGIL_SHAPE` do Artifact antigo: um sigilo próprio por classe,
 * puramente decorativo, cuja cor reage à zona Arcana atual (ver
 * docs/design/11-LEGACY-RECOVERY.md). Não altera nenhuma regra/mecânica —
 * é sempre derivada da classe, nunca uma escolha separada que precise de um
 * passo próprio na criação.
 */
import type { ArcaneZone } from '@/arcane/zone';
import { getClassTheme, type ClassTheme } from '@/ui/visual/classThemes';

export interface ArcaneIdentity {
  classId: string;
  /** Nome curto e místico do sigilo pessoal — mostrado na ficha/revisão. */
  label: string;
  motif: ClassTheme['particleMotif'];
}

const SIGIL_LABELS: Record<string, string> = {
  'portador-de-cinza': 'Marca de Brasa',
  'tecelao-do-veu': 'Nó do Véu',
  'cacador-de-fissuras': 'Fenda Lida',
  'lamina-silenciosa': 'Eclipse Curto',
  'guardiao-do-bastiao': 'Runa de Voto',
  'arauto-do-musgo': 'Broto Desperto',
  'andarilho-do-selo': 'Círculo Emprestado',
  'lancador-de-ossos': 'Lance Ósseo',
};

export function arcaneIdentityForClass(classId: string): ArcaneIdentity {
  const theme = getClassTheme(classId);
  return {
    classId,
    label: SIGIL_LABELS[classId] ?? 'Sigilo Sem Nome',
    motif: theme.particleMotif,
  };
}

/**
 * Cor de ressonância por zona — universal (não muda por classe, só o
 * sigilo/motivo muda). Paleta mística do projeto, não o
 * verde/âmbar/vermelho literal do Artifact antigo (verde é identidade
 * descartada, spec §12/13 desta reconstrução).
 *
 * Fase 3 (Vertical Slice Visual): Controle usa aço envelhecido — calmo,
 * metálico, coerente com "metal envelhecido" na direção visual — em vez do
 * roxo/violeta anterior. Progressão Controle→Saturação→Ruptura lê como
 * aço frio → ouro quente → vermelho de perigo.
 */
export function arcaneResonance(zone: ArcaneZone): string {
  if (zone === 'ruptura') return '#b8493f';
  if (zone === 'saturacao') return '#d8b872';
  return '#8a97a3';
}
