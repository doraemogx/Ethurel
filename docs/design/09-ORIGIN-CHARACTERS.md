# 09 — Personagens de Origem

## Conceito

Um segundo ponto de entrada de "Novo Jogo", ao lado da criação customizada
(Homem/Mulher → Nome → Classe → Origem). Um Personagem de Origem já tem
passado, classe, origem, motivação, conflito e um segredo não revelado — mas
o jogador ainda decide quem ele se torna: Índole continua emergindo do jogo,
não do texto de ficha (`startingIndoleBias` só empurra o ponto de partida,
não trava o resultado).

Modelo de dados: `OriginCharacter` em `src/characters/types.ts` —
`id, name, gender, classId, originId, shortHook, background, personalGoal,
fear, secret, startingRelationships, uniqueTags, personalQuestId?,
voiceStyle, startingIndoleBias, visualProfile`. `createCharacterFromOrigin`
(`src/domain/characterFactory.ts`) converte um `OriginCharacter` num
`CharacterModel` jogável, aplicando o viés de Índole via `applyIndoleDelta`.

## Os 3 implementados (demonstração — `src/content/originCharacters.ts`)

Todos marcados **[PROPOSTA]** — usam só cânone já existente (classes/origens
de `03-GAMEPLAY-E-COMBATE.md`), não são verdade cosmológica absoluta.
Escritos para terem conflito real, não o anti-exemplo genérico citado no
spec ("guerreiro bondoso que perdeu a família"):

1. **Serel Doventh** — Guardião do Bastião / Bastião Caído. Guarda um posto
   que já não existe; cresceu ouvindo que a queda da Casa Doventh foi um
   ataque arcano, doze anos atrás, mas encontrou registros que sugerem outra
   coisa. Objetivo: restaurar o nome da Casa, nem que seja só aos próprios
   olhos. Medo: que restaurar o nome signifique admitir que a vergonha é
   real. Segredo (não revelado ao jogador na criação): ele suspeita que a
   Casa não caiu para uma incursão — caiu porque um antepassado seu negociou
   com o Culto do Selo para "conter" algo, e o preço saiu caro demais. Ele
   procura provas fingindo procurar vingança.

2. **Ynara Voss** — Andarilho do Selo / Culto do Selo. Recrutada jovem pelo
   Culto, aprendeu os nós que prendem vontade; fugiu — ou disse que fugiu —
   e foi recrutada pela Vigília logo depois para vigiar de dentro o que
   sobrou dos seus contatos antigos. Objetivo: provar a si mesma que saiu
   por escolha, não por ter sido descartada. Medo: que a Vigília descubra
   que ela não discorda mais tanto do Culto quanto finge. Segredo: depois de
   ver o que a Ruptura realmente faz a uma pessoa, ela não tem mais certeza
   de que o Culto está errado sobre ela ser uma revelação, não um perigo.

3. **Doran Kessig** — Lançador de Ossos / Cinzas Longas. Refugiado de uma
   guerra de fronteira que ainda não terminou de verdade; perdeu um
   companheiro numa retirada que ele mesmo aconselhou, e guarda os ossos
   dele desde então para "ler" o que Arcane decide. Objetivo: pagar uma
   dívida que ninguém mais cobra dele além de si mesmo. Medo: que suas
   leituras não sejam profecia nenhuma — só ele empurrando as coisas para
   onde já esperava que fossem. Segredo: pelo menos duas vezes, algo que ele
   "previu" só aconteceu porque ele agiu como se já fosse verdade; ele não
   sabe dizer se tem um dom ou se é só bom em se convencer.

## Estrutura para expandir a 5-6

`ORIGIN_CHARACTERS` é um array simples em `src/content/originCharacters.ts` —
adicionar um 4º/5º/6º é só um novo objeto `OriginCharacter` no array; a tela
(`OriginCharacterScreen.tsx`) e `createCharacterFromOrigin` já são genéricos
e não precisam de nenhuma mudança de código.

## Diferença real na abertura (replay)

Os 3 diferem na primeira cena por classe (ação contextual gated por
`requiresClassId`/`requiresOriginId` em `src/content/firstChapterScenes.ts`)
e por origem — Serel (Bastião Caído), Ynara (Culto do Selo) e Doran (Cinzas
Longas) têm cada um uma ação exclusiva na cena `toward-clearing` que um
personagem customizado sem essa origem nunca vê. Isso já é a prova concreta
de replay pedida no spec: "se eu tivesse escolhido outra pessoa, isso teria
acontecido diferente."

**Limitação conhecida**: `startingRelationships` (ex.: Tolven frio com
Ynara, cauteloso com Serel) já existe no dado de cada Personagem de Origem,
mas ainda não é lido pela `SceneScreen`/diálogo do primeiro capítulo — o
diálogo de Tolven é hoje o mesmo texto para qualquer personagem. Consumir
`startingRelationships` para variar a primeira fala de Tolven é a extensão
natural mais óbvia desta fatia vertical, não implementada por escopo/tempo.
