/**
 * Ecos (Fase 2 §23-24) — experiências que deixam marca psicológica,
 * narrativa ou Arcana no personagem. Não são conquistas: nunca mostrados
 * como "ACHIEVEMENT UNLOCKED", sempre como algo que passou a fazer parte de
 * quem o personagem é. Estrutura completa + 1 Eco demonstrativo nesta fatia
 * (spec: "não criar 50 Ecos agora").
 */
export type EchoState = 'latent' | 'awakening' | 'integrated';

export interface Echo {
  id: string;
  title: string;
  description: string;
  sourceEvent: string;
  state: EchoState;
  tags: string[];
  mechanicalEffects?: string[];
  narrativeEffects?: string[];
  discoveredAt: number;
}

export interface EchoDefinition {
  id: string;
  title: string;
  description: string;
  sourceEvent: string;
  tags: string[];
  mechanicalEffects?: string[];
  narrativeEffects?: string[];
}

/** Único Eco demonstrativo desta fatia: presenciar de perto a anomalia
 * arcana viva durante o primeiro combate — independe de vitória ou derrota,
 * é sobre o que a experiência deixou, não sobre o resultado mecânico. */
export const ECHO_FIRST_ANOMALY: EchoDefinition = {
  id: 'primeiro-pulso',
  title: 'O Primeiro Pulso',
  description:
    'Você viu Arcane se mover como se estivesse pensando — no Limo da Fissura, perto o bastante para sentir o ar mudar. Não foi magia. Foi outra coisa, e você não sabe nomear o que sentiu além de "viva".',
  sourceEvent: 'combate-limo-da-fissura',
  tags: ['arcane', 'primeiro-combate'],
  narrativeEffects: ['O personagem reconhece a presença de Arcane vivo mesmo à distância, daqui em diante.'],
};

export function instantiateEcho(def: EchoDefinition, state: EchoState = 'latent'): Echo {
  return { ...def, state, discoveredAt: Date.now() };
}
