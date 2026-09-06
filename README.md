# Ethurel

RPG 2D em pixel art, medieval dark fantasy, mobile-first (Android). Reconstrução
do projeto Ethurel a partir de um Artifact narrativo para um jogo jogável de
verdade — ver `docs/design/` para a arquitetura completa e o roadmap por fases.

**Estado atual: Fase 1 (infraestrutura).** Não há gameplay ainda — sem
movimento, sem mapa, sem combate. Isso é esperado; ver `docs/design/04-VERTICAL-SLICE-E-ROADMAP.md`.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. O terminal também mostra um endereço de rede
(`http://SEU-IP-LOCAL:5173`) — é esse endereço que funciona no celular (ver
"Como testar no Android" abaixo).

Outros comandos:

```bash
npm run typecheck   # só checa tipos, não builda
npm run build       # build de produção em dist/
npm run preview     # serve o build de produção (para testar antes de publicar)
```

## Como testar no seu Android

1. No computador onde este projeto está rodando, execute `npm run dev`.
2. O terminal mostra duas URLs: uma `Local` (só funciona no próprio computador)
   e uma `Network` (algo como `http://192.168.x.x:5173`) — é a segunda que
   importa.
3. Seu celular Android precisa estar **na mesma rede Wi-Fi** que o computador.
4. Abra essa URL `Network` no Chrome do celular.
5. Você deve ver a tela "ETHUREL" com um contador de sessão. Feche a aba e
   abra a URL de novo — o número da sessão deve subir. Isso confirma que o
   save está funcionando no seu aparelho.

Se o celular não conseguir acessar a URL de rede, geralmente é o firewall do
computador bloqueando a porta 5173 — nesse caso me avise.

## Estrutura do projeto

Ver `docs/design/02-STACK-E-ARQUITETURA.md §2` para a explicação completa de
cada pasta em `src/`.
