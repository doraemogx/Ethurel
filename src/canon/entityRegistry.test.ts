import { describe, it, expect } from 'vitest';
import { CANON_ENTITY_REGISTRY, resolveCanonEntity, findCanonEntitiesByKind, canonBlockers } from '@/canon/entityRegistry';

describe('CANON_ENTITY_REGISTRY — integridade estrutural', () => {
  it('todo canonicalId é único (Fase 1 §IDs estáveis)', () => {
    const ids = CANON_ENTITY_REGISTRY.map((e) => e.canonicalId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda entrada tem source (nenhum fato canônico sem referência auditável)', () => {
    for (const e of CANON_ENTITY_REGISTRY) {
      expect(e.source.length).toBeGreaterThan(0);
    }
  });

  it('toda entrada status=blocker tem notes explicando o que está pendente', () => {
    for (const e of CANON_ENTITY_REGISTRY.filter((e) => e.status === 'blocker')) {
      expect(e.notes).toBeTruthy();
    }
  });
});

describe('resolveCanonEntity — nunca deixa nome legado virar entidade separada', () => {
  it('resolve pelo nome canônico exato', () => {
    expect(resolveCanonEntity('Varreth')?.canonicalId).toBe('varreth');
  });

  it('resolve case-insensitive', () => {
    expect(resolveCanonEntity('varreth')?.canonicalId).toBe('varreth');
    expect(resolveCanonEntity('VARRETH')?.canonicalId).toBe('varreth');
  });

  it('resolve por alias válido', () => {
    expect(resolveCanonEntity('Tolven')?.canonicalId).toBe('tolven-marr');
  });

  it('resolve nome legado/depreciado para a MESMA entidade canônica, não uma nova', () => {
    const legacy = resolveCanonEntity('Serel Doventh');
    const canon = resolveCanonEntity('Sera Doventh');
    expect(legacy?.canonicalId).toBe('sera-doventh');
    expect(legacy?.canonicalId).toBe(canon?.canonicalId);
  });

  it('"Enraizados" (nome antigo da Fase 3) resolve para a mesma entidade que "Guardiões de Raiz"', () => {
    const legacy = resolveCanonEntity('Enraizados');
    const canon = resolveCanonEntity('Guardiões de Raiz');
    expect(legacy?.canonicalId).toBe(canon?.canonicalId);
  });

  it('nome desconhecido retorna undefined, não lança erro', () => {
    expect(resolveCanonEntity('Nome Que Nunca Existiu')).toBeUndefined();
  });
});

describe('recorte seletivo por tipo (base para NarrativeContextBuilder consultar só o necessário)', () => {
  it('findCanonEntitiesByKind traz só a fatia pedida, não o registro inteiro', () => {
    const classes = findCanonEntitiesByKind('class');
    expect(classes.length).toBe(8);
    expect(classes.every((c) => c.kind === 'class')).toBe(true);
    expect(classes.length).toBeLessThan(CANON_ENTITY_REGISTRY.length);
  });

  it('canonBlockers() traz exatamente as entidades com decisão humana pendente', () => {
    const blockers = canonBlockers();
    const ids = blockers.map((b) => b.canonicalId).sort();
    expect(ids).toEqual(['mireth-sable', 'tolven-marr', 'ynara-voss', 'corwin-thale'].sort());
  });
});
