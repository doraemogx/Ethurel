/**
 * Personagens de Origem — [PROPOSTA], usando somente o cânone existente
 * (docs/design/06-WORLD-NARRATIVE-BIBLE.md). Ver docs/design/09-ORIGIN-CHARACTERS.md
 * para a justificativa de cada um. Passado próprio, mas Índole ainda emerge
 * do jogo — `startingIndoleBias` é só uma inclinação inicial pequena, não um
 * valor fixo definitivo.
 *
 * Fase 2 (§13/§53): apresentação enriquecida — `catchphrase`/`approxAge`/
 * `knownFact`/`traits` vendem o personagem sem revelar o segredo. 5 no
 * total agora (eram 3), cobrindo as 2 classes/origens que ainda não tinham
 * representante: Tecelão do Véu/Arquivo Vertido e Caçador de
 * Fissuras/Fronteira Partida.
 *
 * Cada um tem uma ação contextual exclusiva na primeira cena (ver
 * src/content/firstChapterScenes.ts) — a prova de replay pedida (spec §58).
 */
import type { OriginCharacter } from '@/characters/types';
import { IMG } from '@/ui/assetPath';

export const ORIGIN_CHARACTERS: OriginCharacter[] = [
  {
    // Nome canônico é "Sera Doventh" (Bíblia V7, Livro VI.1) — o jogo tinha
    // "Serel" (typo de uma sessão anterior sem acesso à Bíblia). Classe
    // (Guardião do Bastião) e origem/facção (Bastião Caído) já batiam
    // exatamente com o cânone, corrigido só o nome. `id`/`visualProfile.id`
    // mantidos ('serel-doventh') por estabilidade — não referenciados fora
    // deste arquivo, mas trocar id sem necessidade não traz benefício.
    id: 'serel-doventh',
    name: 'Sera Doventh',
    gender: 'masculino',
    classId: 'guardiao-do-bastiao',
    originId: 'bastiao-caido',
    approxAge: 'quase trinta',
    catchphrase: 'Um juramento não pergunta se você ainda acredita nele.',
    shortHook: 'O último Doventh guarda um posto que não existe mais.',
    background:
      'Sua Casa jurou proteger uma passagem contra incursões arcanas — até cair, há doze anos, numa noite que ninguém em Varreth quer explicar direito. Sera cresceu ouvindo que foi um ataque. Encontrou registros que sugerem outra coisa.',
    personalGoal: 'Restaurar o nome da Casa Doventh, nem que seja só aos próprios olhos.',
    fear: 'Que o que restaurar signifique admitir que a vergonha é real.',
    knownFact: 'Sabe que o selo partido da própria família ainda abre certas portas em Varreth, mesmo caído.',
    secret:
      'Ele suspeita que a Casa Doventh não caiu para uma incursão — caiu porque um antepassado seu negociou com o Culto do Selo para "conter" algo, e o preço saiu caro demais. Ele procura provas fingindo procurar vingança.',
    traits: ['formal', 'vigilante', 'leal a um nome que talvez não mereça'],
    startingRelationships: [
      { npcId: 'tolven', affinity: 5, note: 'Tolven trata Sera com uma formalidade cautelosa — reconhece o selo da Casa Doventh na sua couraça e não sabe se isso é motivo de respeito ou de cuidado.' },
    ],
    uniqueTags: ['casa-bastiao', 'linhagem-cAida'],
    voiceStyle: 'Formal, medido, escolhe poucas palavras — desconfia de quem fala demais.',
    startingIndoleBias: { honra: 8, autocontrole: 6, impulsividade: -4 },
    visualProfile: { id: 'origin-serel-doventh', portrait: `${IMG}/portraits/vampire-neutral.webp`, visualTheme: 'guardiao-do-bastiao', presentation: 'masculino' },
  },
  {
    // BLOCKER CANÔNICO A resolvido (docs/canon/origin-characters/COMPARISON.md):
    // Bíblia (Livro VI.2, sem conflito interno) liga Ynara a Arquivo Vertido,
    // não Culto do Selo. `classId` já batia (Andarilho do Selo) e foi mantido.
    // A Bíblia só confirma o par classe+origem, não fornece prosa biográfica
    // (as 8 sub-entradas de cada Personagem de Origem repetem um texto-modelo
    // genérico — ver CANON_CONFLICTS.md §0) — o background abaixo foi
    // adaptado para a origem correta, mantendo o tema de "selar" que já
    // conectava com a classe.
    id: 'ynara-voss',
    name: 'Ynara Voss',
    gender: 'feminino',
    classId: 'andarilho-do-selo',
    originId: 'arquivo-vertido',
    approxAge: 'vinte e poucos',
    catchphrase: 'Um selo que ninguém vê não deixa de ter sido rompido.',
    shortHook: 'Ela mesma enfraqueceu um selo do Arquivo Vertido — e nunca contou a ninguém o que escapou.',
    background:
      'Cresceu nos corredores alagados do Arquivo Vertido aprendendo a arte de selar: não pessoas, textos — qualquer página que os catalogadores julgassem perigosa demais para circular. A Vigília a recrutou quando um selo que ela mesma aplicou falhou, e algo que devia ficar contido não ficou.',
    personalGoal: 'Encontrar o que escapou do próprio selo antes que outra pessoa o encontre primeiro.',
    fear: 'Que o que escapou já tenha encontrado outro par de mãos.',
    knownFact: 'Reconhece à primeira vista quando um selo de contenção foi rompido, mesmo que pareça intacto por fora.',
    secret:
      'O selo não falhou por acidente — ela o enfraqueceu de propósito, convencida de que sabia melhor que os catalogadores o que aquela página continha. Ainda não sabe se estava certa.',
    traits: ['precisa', 'observadora', 'carrega uma culpa que não divide com ninguém'],
    startingRelationships: [
      { npcId: 'tolven', affinity: 0, note: 'Tolven repara no jeito como ela lê qualquer coisa duas vezes antes de confiar — não desconfia dela, mas não entende de onde vem esse hábito.' },
    ],
    uniqueTags: ['ex-arquivo-vertido', 'agente-vigilia', 'selo-rompido'],
    voiceStyle: 'Precisa, observadora, evita afirmar o que não pode provar.',
    startingIndoleBias: { manipulacao: 4, pragmatismo: 5, lealdade: -2 },
    visualProfile: { id: 'origin-ynara-voss', portrait: `${IMG}/portraits/darkprincess-neutral.webp`, visualTheme: 'andarilho-do-selo', presentation: 'feminino' },
  },
  {
    id: 'doran-kessig',
    name: 'Doran Kessig',
    gender: 'masculino',
    classId: 'lancador-de-ossos',
    originId: 'cinzas-longas',
    approxAge: 'quarenta e poucos',
    catchphrase: 'Os ossos não mentem. Eu, às vezes, minto por eles.',
    shortHook: 'Ele carrega os ossos de um amigo morto e finge que isso é só superstição.',
    background:
      'Refugiado de uma guerra de fronteira que ainda não terminou de verdade. Perdeu um companheiro de armas numa retirada que ele mesmo aconselhou. Guarda os ossos dele desde então, e lança fragmentos deles para "ler" o que Arcane decide.',
    personalGoal: 'Pagar uma dívida que ninguém mais cobra dele além de si mesmo.',
    fear: 'Que suas leituras não sejam profecia nenhuma — só ele empurrando as coisas para onde já esperava que fossem.',
    knownFact: 'Sabe reconhecer o cheiro de pólvora arcana rançosa à distância — sobreviveu a campo de batalha suficiente para isso.',
    secret:
      'Pelo menos duas vezes, algo que ele "previu" só aconteceu porque ele agiu como se já fosse verdade. Não sabe dizer se tem um dom ou se é só bom em se convencer — e em convencer os outros.',
    traits: ['teatral', 'supersticioso por necessidade', 'esconde luto atrás de piada'],
    startingRelationships: [
      { npcId: 'tolven', affinity: 2, note: 'Tolven já viu gente como Doran de sobra — trata-o com uma implicância cansada, mas não o afasta.' },
    ],
    uniqueTags: ['refugiado-cinzas-longas', 'divida-nao-paga'],
    voiceStyle: 'Informal, ligeiramente teatral, esconde desconforto atrás de piadas.',
    startingIndoleBias: { impulsividade: 6, pragmatismo: -3, compaixao: 3 },
    visualProfile: { id: 'origin-doran-kessig', portrait: `${IMG}/portraits/viajante-b-neutral.webp`, visualTheme: 'lancador-de-ossos', presentation: 'masculino' },
  },
  {
    // BLOCKER CANÔNICO B resolvido (docs/canon/origin-characters/COMPARISON.md):
    // Bíblia (Livro VI.4, sem conflito interno) liga Mireth a Portadora de
    // Cinza / Culto do Selo. O jogo tinha Tecelão do Véu / Arquivo Vertido —
    // por coincidência, exatamente o par canônico de Asera Morn (Livro VI.6,
    // não implementada). Classe E origem corrigidas; background reescrito
    // (não existe prosa biográfica na Bíblia além do par classe+origem — ver
    // nota em Ynara Voss acima) usando a própria identidade da nova classe
    // ("a ferida vira porta; a dor vira poder", src/data/classes.ts) e da
    // nova origem (Culto do Selo venera Ruptura como revelação).
    id: 'mireth-sable',
    name: 'Mireth Sable',
    gender: 'feminino',
    classId: 'portador-de-cinza',
    originId: 'culto-do-selo',
    approxAge: 'vinte e poucos',
    catchphrase: 'Eu decido até onde vou. Não o Culto.',
    shortHook: 'A primeira do Culto do Selo a sobreviver à "queima" — e a primeira a sair depois de sobreviver.',
    background:
      'Cresceu dentro do Culto do Selo ouvindo que Ruptura não é catástrofe, é revelação. Foi a primeira do próprio grupo a sobreviver ao que os mais velhos chamam de "a queima" — deixar a Arcane arder pelo corpo até quase o limite, de propósito. Saiu não por descrença, mas para decidir sozinha até onde ir.',
    personalGoal: 'Provar, com o próprio corpo, até onde dá para chegar sem cruzar para o outro lado — sem que o Culto decida isso por ela.',
    fear: 'Que o Culto estivesse certo sobre ela ser feita para atravessar, não para resistir.',
    knownFact: 'Reconhece o padrão de queimadura ritual do Culto do Selo em qualquer pele, mesmo cicatrizada há anos.',
    secret:
      'Nas noites mais silenciosas ainda sente falta da certeza que o Culto oferecia — a de que o que ela é tem propósito, não é só risco sem direção. Não admite isso nem para si mesma na maior parte do tempo.',
    traits: ['intensa', 'disciplinada por escolha própria, não por hábito', 'desconfia de quem promete certeza fácil'],
    startingRelationships: [
      { npcId: 'tolven', affinity: -2, note: 'Tolven reconhece as marcas rituais que ela tenta esconder sob a manga — não pergunta, mas mede a distância.' },
    ],
    uniqueTags: ['ex-culto-do-selo', 'queima-sobrevivida'],
    voiceStyle: 'Direta, intensa, fala pouco sobre o próprio corpo mas muito sobre limites.',
    startingIndoleBias: { autocontrole: 7, impulsividade: 4, honra: -2 },
    visualProfile: { id: 'origin-mireth-sable', portrait: `${IMG}/portraits/pyromancer.webp`, visualTheme: 'portador-de-cinza', presentation: 'feminino' },
  },
  {
    // BLOCKER CANÔNICO C resolvido (docs/canon/origin-characters/COMPARISON.md):
    // Bíblia (Livro VI.5, sem conflito interno) liga Corwin a Arauto do
    // Musgo, não Caçador de Fissuras (essa é a classe canônica de Kael
    // Orren, Livro VI.7, não implementado). Origem (Fronteira Partida) já
    // batia — mantida, então o gancho da irmã desaparecida (ligado à
    // origem, não à classe) permanece válido. Só a profissão/classe foi
    // reescrita, usando a identidade real de Arauto do Musgo (cura
    // simbiótica com vida ao redor, src/data/classes.ts) em vez de
    // rastreamento de fissuras por dinheiro.
    id: 'corwin-thale',
    name: 'Corwin Thale',
    gender: 'masculino',
    classId: 'arauto-do-musgo',
    originId: 'fronteira-partida',
    approxAge: 'trinta e poucos',
    catchphrase: 'A fronteira não avisa. O musgo, sim.',
    shortHook: 'Ele cuida de quem vive na borda da fissura — e nunca parou de procurar a irmã que desapareceu ali.',
    background:
      'Nasceu à vista da fissura arcana permanente, num povoado onde quase nada cresce direito — exceto o musgo, que parece se dar melhor perto da distorção do que longe dela. Aprendeu a ouvir essa vida teimosa antes de aprender a temer a fissura. Hoje cuida de quem vive na borda, com as próprias mãos e o que o musgo empresta.',
    personalGoal: 'Manter viva a franja de vegetação que ainda cresce perto da fissura — e, com ela, quem depende dela para não adoecer.',
    fear: 'Que a fissura esteja se movendo devagar o bastante para matar o musgo antes que alguém perceba a mudança.',
    knownFact: 'Sabe dizer, só pelo estado do musgo numa área, se a distorção arcana ali está piorando ou se estabilizando.',
    secret:
      'Sua irmã desapareceu perto da borda da fissura onze anos atrás, registrada como "perdida para a fronteira". Ele aprendeu a curar em parte porque não conseguiu salvá-la, e nunca parou de procurar um rastro do que aconteceu com ela.',
    traits: ['paciente', 'observador', 'teimoso'],
    startingRelationships: [
      { npcId: 'tolven', affinity: 4, note: 'Tolven confia em quem cuida de gente sem cobrar — troca notícia da fronteira com Corwin sempre que os caminhos cruzam.' },
    ],
    uniqueTags: ['fronteira-partida-nativo', 'irma-desaparecida'],
    voiceStyle: 'Calmo, econômico, só se alonga quando fala do musgo ou da fronteira.',
    startingIndoleBias: { compaixao: 6, autocontrole: 5, pragmatismo: 2 },
    visualProfile: { id: 'origin-corwin-thale', portrait: `${IMG}/portraits/oracle.webp`, visualTheme: 'arauto-do-musgo', presentation: 'masculino' },
  },
];
