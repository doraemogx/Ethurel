import type { SaveDataV3, SaveDataV4 } from '@/save/schema';
import { createEmptySaveV4 } from '@/save/schema';

/**
 * v3 (protótipo top-down: posição x/y num tilemap, personagem com aparência
 * skinTone/hairStyle) → v4 (RPG narrativo: `Location`s, `CharacterModel` com
 * portrait). Os dois formatos são estruturalmente incompatíveis — não existe
 * remapeamento sensato de "x=308,y=192 no mapa 'varreth-arredores'" para uma
 * `Location` narrativa, nem de "cabelo castanho curto" para um
 * `CharacterVisualProfile` baseado em portrait.
 *
 * Por isso esta migração NÃO tenta preservar personagem/posição — um save v3
 * migrado nasce como campanha nova (`character: null`), preservando só
 * `createdAt` para não perder o metadado de "há quanto tempo esta pessoa
 * joga Ethurel". Isto é uma decisão de design explícita (o produto mudou de
 * formato — spec da reconstrução §0), não um bug de migração incompleta.
 */
export function migrate003To004(old: SaveDataV3): SaveDataV4 {
  const fresh = createEmptySaveV4();
  return { ...fresh, createdAt: old.createdAt, updatedAt: Date.now() };
}
