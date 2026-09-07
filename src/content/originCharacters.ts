/**
 * Personagens de Origem — [PROPOSTA], usando somente o cânone existente
 * (docs/design/06-WORLD-NARRATIVE-BIBLE.md). Ver docs/design/09-ORIGIN-CHARACTERS.md
 * para a justificativa de cada um. Passado próprio, mas Índole ainda emerge
 * do jogo — `startingIndoleBias` é só uma inclinação inicial pequena, não um
 * valor fixo definitivo.
 *
 * Os três demonstram diferenças REAIS na abertura (não só texto de ficha):
 * o NPC Tolven reage de forma diferente a cada um (`startingRelationships`),
 * e cada um tem uma ação contextual exclusiva na primeira cena (ver
 * src/content/firstChapterScenes.ts) — a prova de replay pedida (spec §58).
 */
import type { OriginCharacter } from '@/characters/types';

export const ORIGIN_CHARACTERS: OriginCharacter[] = [
  {
    id: 'serel-doventh',
    name: 'Serel Doventh',
    gender: 'homem',
    classId: 'guardiao-do-bastiao',
    originId: 'bastiao-caido',
    shortHook: 'O último Doventh guarda um posto que não existe mais.',
    background:
      'Sua Casa jurou proteger uma passagem contra incursões arcanas — até cair, há doze anos, numa noite que ninguém em Varreth quer explicar direito. Serel cresceu ouvindo que foi um ataque. Encontrou registros que sugerem outra coisa.',
    personalGoal: 'Restaurar o nome da Casa Doventh, nem que seja só aos próprios olhos.',
    fear: 'Que o que restaurar signifique admitir que a vergonha é real.',
    secret:
      'Ele suspeita que a Casa Doventh não caiu para uma incursão — caiu porque um antepassado seu negociou com o Culto do Selo para "conter" algo, e o preço saiu caro demais. Ele procura provas fingindo procurar vingança.',
    startingRelationships: [
      { npcId: 'tolven', affinity: 5, note: 'Tolven trata Serel com uma formalidade cautelosa — reconhece o selo da Casa Doventh na sua couraça e não sabe se isso é motivo de respeito ou de cuidado.' },
    ],
    uniqueTags: ['casa-bastiao', 'linhagem-cAida'],
    voiceStyle: 'Formal, medido, escolhe poucas palavras — desconfia de quem fala demais.',
    startingIndoleBias: { honra: 8, autocontrole: 6, impulsividade: -4 },
    visualProfile: { visualTheme: 'guardiao-do-bastiao' },
  },
  {
    id: 'ynara-voss',
    name: 'Ynara Voss',
    gender: 'mulher',
    classId: 'andarilho-do-selo',
    originId: 'culto-do-selo',
    shortHook: 'Ela fugiu do Culto do Selo — ou foi enviada para nunca sair dele de verdade.',
    background:
      'Recrutada ainda jovem pelo Culto do Selo, aprendeu os nós que prendem vontade. Fugiu — ou disse que fugiu. A Vigília a recrutou logo depois, para vigiar de dentro o que sobrou dos seus contatos antigos.',
    personalGoal: 'Provar a si mesma que saiu por escolha, não por ter sido descartada.',
    fear: 'Que a Vigília descubra que ela não discorda mais tanto do Culto quanto finge.',
    secret:
      'Depois de ver o que a Ruptura realmente faz a uma pessoa, Ynara não tem mais certeza de que o Culto está errado sobre ela ser uma revelação, não um perigo — e não contou isso a ninguém da Vigília.',
    startingRelationships: [
      { npcId: 'tolven', affinity: -5, note: 'Tolven reconhece os símbolos apagados na corda que ela carrega e fica visivelmente mais frio — não pergunta, mas também não esquece.' },
    ],
    uniqueTags: ['ex-culto', 'agente-vigilia'],
    voiceStyle: 'Precisa, observadora, evita afirmar o que não pode provar.',
    startingIndoleBias: { manipulacao: 6, pragmatismo: 5, lealdade: -3 },
    visualProfile: { visualTheme: 'andarilho-do-selo' },
  },
  {
    id: 'doran-kessig',
    name: 'Doran Kessig',
    gender: 'homem',
    classId: 'lancador-de-ossos',
    originId: 'cinzas-longas',
    shortHook: 'Ele carrega os ossos de um amigo morto e finge que isso é só superstição.',
    background:
      'Refugiado de uma guerra de fronteira que ainda não terminou de verdade. Perdeu um companheiro de armas numa retirada que ele mesmo aconselhou. Guarda os ossos dele desde então, e lança fragmentos deles para "ler" o que Arcane decide.',
    personalGoal: 'Pagar uma dívida que ninguém mais cobra dele além de si mesmo.',
    fear: 'Que suas leituras não sejam profecia nenhuma — só ele empurrando as coisas para onde já esperava que fossem.',
    secret:
      'Pelo menos duas vezes, algo que ele "previu" só aconteceu porque ele agiu como se já fosse verdade. Não sabe dizer se tem um dom ou se é só bom em se convencer — e em convencer os outros.',
    startingRelationships: [
      { npcId: 'tolven', affinity: 2, note: 'Tolven já viu gente como Doran de sobra — trata-o com uma implicância cansada, mas não o afasta.' },
    ],
    uniqueTags: ['refugiado-cinzas-longas', 'divida-nao-paga'],
    voiceStyle: 'Informal, ligeiramente teatral, esconde desconforto atrás de piadas.',
    startingIndoleBias: { impulsividade: 6, pragmatismo: -3, compaixao: 3 },
    visualProfile: { visualTheme: 'lancador-de-ossos' },
  },
];
