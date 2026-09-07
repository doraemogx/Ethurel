/**
 * Ethurel — Narrative Proxy (Cloudflare Worker)
 *
 * Fase 2 §10. Este arquivo NÃO está deployado — é código pronto para
 * deploy quando o usuário decidir ativar a IA remota. Não faz parte do
 * build do Vite (`src/`) nem é testado pela suite do jogo; é um artefato
 * separado, deployado via `wrangler` para a infraestrutura da Cloudflare.
 *
 * REGRA INEGOCIÁVEL: a chave da Anthropic (`ANTHROPIC_API_KEY`) só existe
 * aqui, como Worker Secret (`wrangler secret put ANTHROPIC_API_KEY`) —
 * nunca no código-fonte, nunca no repositório, nunca no bundle do
 * frontend. Ver `docs/architecture/remote-narrative-backend.md` para o
 * passo a passo completo de deploy (precisa de conta Cloudflare + chave da
 * Anthropic — nenhuma das duas eu tenho ou posso criar por você).
 *
 * O contrato de request/response espelha exatamente
 * `src/ai/RemoteNarrativeProvider.ts` — mudar um lado sem o outro quebra a
 * integração.
 */

export interface Env {
  ANTHROPIC_API_KEY: string;
  /** Origem exata do jogo publicado — único valor aceito em CORS/rate limit por origem. Ex.: "https://doraemogx.github.io". */
  ALLOWED_ORIGIN: string;
  /** Namespace de KV usado para rate limiting por IP (ver wrangler.toml.example). */
  RATE_LIMIT_KV: KVNamespace;
}

const MODEL = 'claude-haiku-4-5-20251001'; // classificação/interpretação curta — não precisa do modelo mais caro/lento.
const MAX_TOKENS = 500; // resposta é JSON estruturado curto, não prosa longa — limite de custo por chamada.
const MAX_TEXT_LENGTH = 500; // mesmo limite que o composer do jogo já aplica (SceneScreen: 240) + margem.
const RATE_LIMIT_PER_MINUTE = 20; // por IP — generoso para uso normal, baixo o bastante para não estourar custo com abuso.

const NARRATION_TOOL = {
  name: 'narrative_response',
  description: 'Resposta narrativa estruturada para a cena atual.',
  input_schema: {
    type: 'object',
    properties: {
      narration: { type: 'string' },
      mood: { type: 'string', enum: ['neutral', 'tense', 'hopeful', 'grim', 'mysterious', 'triumphant'] },
      suggestedActions: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, label: { type: 'string' } }, required: ['id', 'label'] } },
      requestedChecks: {
        type: 'array',
        items: {
          type: 'object',
          properties: { attribute: { type: 'string', enum: ['vigor', 'reflexo', 'mente', 'presenca'] }, reason: { type: 'string' }, suggestedDc: { type: 'number' } },
          required: ['attribute', 'reason'],
        },
      },
    },
    required: ['narration', 'mood', 'suggestedActions', 'requestedChecks'],
  },
};

const INTERPRET_TOOL = {
  name: 'interpreted_action',
  description: 'Interpretação estruturada de uma ação livre do jogador — nunca decide DC final, sucesso, dano, inventário ou reputação.',
  input_schema: {
    type: 'object',
    properties: {
      kind: { type: 'string', enum: ['possible', 'impossible', 'requires_check', 'requires_item', 'requires_condition', 'partial'] },
      reason: { type: 'string' },
      requestedCheck: {
        type: 'object',
        properties: { attribute: { type: 'string', enum: ['vigor', 'reflexo', 'mente', 'presenca'] }, reason: { type: 'string' }, suggestedDc: { type: 'number' } },
      },
      intent: {
        type: 'object',
        properties: {
          intent: { type: 'string' },
          target: { type: 'string' },
          attempt: { type: 'string' },
          secondaryIntent: { type: 'string' },
          item: { type: 'string' },
          requiresCheck: { type: 'boolean' },
          suggestedAttribute: { type: 'string', enum: ['vigor', 'reflexo', 'mente', 'presenca'] },
          suggestedDc: { type: 'number' },
        },
        required: ['intent', 'requiresCheck'],
      },
    },
    required: ['kind'],
  },
};

const SYSTEM_PROMPT = `Você é o narrador de Ethurel, um RPG narrativo. Regras inegociáveis:
- Você INTERPRETA intenção e NARRA. Você NUNCA decide HP, dano, cura, XP, loot, atributos, Foco, Tensão, Ruptura, Marca Arcana, Índole, Reputação, sucesso/falha de teste, ou mudança de inventário — isso é sempre decidido por código determinístico do lado do jogo.
- Quando uma ação do jogador exigir mecânica, você produz uma intenção/proposta estruturada (kind=requires_check, ou um "intent" com requiresCheck=true) — nunca inventa um resultado.
- suggestedDc é só uma sugestão — o jogo decide a DC final.
- Nunca invente fatos que contradigam o CANON_CORE ou os fatos canônicos fornecidos no contexto.
- Nunca use um fallback genérico para ações compreensíveis — cada ação livre recebe interpretação específica ao contexto (local, NPC presente, o que foi dito).`;

function jsonResponse(body: unknown, status: number, origin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin },
  });
}

async function checkRateLimit(env: Env, ip: string): Promise<boolean> {
  const key = `rl:${ip}:${Math.floor(Date.now() / 60_000)}`;
  const current = Number((await env.RATE_LIMIT_KV.get(key)) ?? '0');
  if (current >= RATE_LIMIT_PER_MINUTE) return false;
  await env.RATE_LIMIT_KV.put(key, String(current + 1), { expirationTtl: 90 });
  return true;
}

async function callAnthropic(env: Env, system: string, userMessage: string, tool: typeof NARRATION_TOOL) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: [{ role: 'user', content: userMessage }],
      tools: [tool],
      tool_choice: { type: 'tool', name: tool.name },
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API respondeu ${res.status}`);
  const data = (await res.json()) as { content: Array<{ type: string; input?: unknown }> };
  const toolUse = data.content.find((c) => c.type === 'tool_use');
  if (!toolUse) throw new Error('Resposta da Anthropic sem tool_use.');
  return toolUse.input;
}

function buildContextMessage(context: Record<string, unknown>): string {
  const canonSummary = Array.isArray(context.canonSummary) ? (context.canonSummary as string[]).join('\n') : '';
  return [
    `Cena: ${context.sceneId ?? ''} — ${context.locationName ?? ''} (${context.locationDescription ?? ''})`,
    `Personagem: ${context.characterName ?? ''}, ${context.className ?? ''}, origem ${context.originName ?? ''}`,
    context.npcName ? `NPC presente: ${context.npcName}` : 'Nenhum NPC presente.',
    canonSummary ? `Fatos canônicos relevantes:\n${canonSummary}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = env.ALLOWED_ORIGIN;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') return jsonResponse({ error: 'method not allowed' }, 405, origin);

    const requestOrigin = request.headers.get('Origin');
    if (requestOrigin !== origin) return jsonResponse({ error: 'origin not allowed' }, 403, origin);

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (!(await checkRateLimit(env, ip))) return jsonResponse({ error: 'rate limit exceeded' }, 429, origin);

    let body: { type: 'narration' | 'interpret'; request?: { context: Record<string, unknown> }; text?: string; context?: Record<string, unknown> };
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'invalid json' }, 400, origin);
    }

    try {
      if (body.type === 'narration' && body.request) {
        const userMessage = buildContextMessage(body.request.context);
        const result = await callAnthropic(env, SYSTEM_PROMPT, userMessage, NARRATION_TOOL);
        return jsonResponse(result, 200, origin);
      }

      if (body.type === 'interpret' && typeof body.text === 'string' && body.context) {
        if (body.text.length > MAX_TEXT_LENGTH) return jsonResponse({ error: 'text too long' }, 400, origin);
        const userMessage = `Ação livre do jogador: "${body.text}"\n\n${buildContextMessage(body.context)}`;
        const result = await callAnthropic(env, SYSTEM_PROMPT, userMessage, INTERPRET_TOOL);
        return jsonResponse(result, 200, origin);
      }

      return jsonResponse({ error: 'invalid request shape' }, 400, origin);
    } catch (err) {
      return jsonResponse({ error: 'upstream failure', detail: String(err) }, 502, origin);
    }
  },
};
