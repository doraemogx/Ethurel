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

export const ORIGIN_CHARACTERS: OriginCharacter[] = [
  {
    id: 'serel-doventh',
    name: 'Serel Doventh',
    gender: 'masculino',
    classId: 'guardiao-do-bastiao',
    originId: 'bastiao-caido',
    approxAge: 'quase trinta',
    catchphrase: 'Um juramento não pergunta se você ainda acredita nele.',
    shortHook: 'O último Doventh guarda um posto que não existe mais.',
    background:
      'Sua Casa jurou proteger uma passagem contra incursões arcanas — até cair, há doze anos, numa noite que ninguém em Varreth quer explicar direito. Serel cresceu ouvindo que foi um ataque. Encontrou registros que sugerem outra coisa.',
    personalGoal: 'Restaurar o nome da Casa Doventh, nem que seja só aos próprios olhos.',
    fear: 'Que o que restaurar signifique admitir que a vergonha é real.',
    knownFact: 'Sabe que o selo partido da própria família ainda abre certas portas em Varreth, mesmo caído.',
    secret:
      'Ele suspeita que a Casa Doventh não caiu para uma incursão — caiu porque um antepassado seu negociou com o Culto do Selo para "conter" algo, e o preço saiu caro demais. Ele procura provas fingindo procurar vingança.',
    traits: ['formal', 'vigilante', 'leal a um nome que talvez não mereça'],
    startingRelationships: [
      { npcId: 'tolven', affinity: 5, note: 'Tolven trata Serel com uma formalidade cautelosa — reconhece o selo da Casa Doventh na sua couraça e não sabe se isso é motivo de respeito ou de cuidado.' },
    ],
    uniqueTags: ['casa-bastiao', 'linhagem-cAida'],
    voiceStyle: 'Formal, medido, escolhe poucas palavras — desconfia de quem fala demais.',
    startingIndoleBias: { honra: 8, autocontrole: 6, impulsividade: -4 },
    visualProfile: { id: 'origin-serel-doventh', visualTheme: 'guardiao-do-bastiao', presentation: 'masculino' },
  },
  {
    id: 'ynara-voss',
    name: 'Ynara Voss',
    gender: 'feminino',
    classId: 'andarilho-do-selo',
    originId: 'culto-do-selo',
    approxAge: 'vinte e poucos',
    catchphrase: 'Eu saí. Isso não significa que entendi por quê.',
    shortHook: 'Ela fugiu do Culto do Selo — ou foi enviada para nunca sair dele de verdade.',
    background:
      'Recrutada ainda jovem pelo Culto do Selo, aprendeu os nós que prendem vontade. Fugiu — ou disse que fugiu. A Vigília a recrutou logo depois, para vigiar de dentro o que sobrou dos seus contatos antigos.',
    personalGoal: 'Provar a si mesma que saiu por escolha, não por ter sido descartada.',
    fear: 'Que a Vigília descubra que ela não discorda mais tanto do Culto quanto finge.',
    knownFact: 'Reconhece qualquer símbolo do Culto do Selo à primeira vista, mesmo desgastado ou incompleto.',
    secret:
      'Depois de ver o que a Ruptura realmente faz a uma pessoa, Ynara não tem mais certeza de que o Culto está errado sobre ela ser uma revelação, não um perigo — e não contou isso a ninguém da Vigília.',
    traits: ['precisa', 'observadora', 'desconfiada de afeto fácil'],
    startingRelationships: [
      { npcId: 'tolven', affinity: -5, note: 'Tolven reconhece os símbolos apagados na corda que ela carrega e fica visivelmente mais frio — não pergunta, mas também não esquece.' },
    ],
    uniqueTags: ['ex-culto', 'agente-vigilia'],
    voiceStyle: 'Precisa, observadora, evita afirmar o que não pode provar.',
    startingIndoleBias: { manipulacao: 6, pragmatismo: 5, lealdade: -3 },
    visualProfile: { id: 'origin-ynara-voss', visualTheme: 'andarilho-do-selo', presentation: 'feminino' },
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
    visualProfile: { id: 'origin-doran-kessig', visualTheme: 'lancador-de-ossos', presentation: 'masculino' },
  },
  {
    id: 'mireth-sable',
    name: 'Mireth Sable',
    gender: 'feminino',
    classId: 'tecelao-do-veu',
    originId: 'arquivo-vertido',
    approxAge: 'vinte e poucos',
    catchphrase: 'Todo padrão que se repete duas vezes está tentando dizer algo.',
    shortHook: 'Ela roubou uma página do Arquivo Vertido que os próprios bibliotecários chamavam de erro de cópia.',
    background:
      'Cresceu catalogando os corredores inferiores do Arquivo Vertido antes de a água os reclamar de vez. Encontrou uma página descrevendo Arcane "dobrando" o espaço — não apenas se movendo por ele — e os mestres insistiram que era um erro de escriba. Ela a levou embora antes que a Vigília selasse o que restava do arquivo.',
    personalGoal: 'Descobrir para onde o padrão da página realmente leva, antes que outra pessoa o encontre primeiro.',
    fear: 'Que completar o padrão termine algo que ela não entende e não consegue desfazer.',
    knownFact: 'Sabe que os porões alagados do Arquivo Vertido guardam pelo menos uma sala inteira que nenhum catalogador vivo já leu.',
    secret:
      'Ela não só encontrou a página — reproduziu a dobra uma vez, em segredo, e algo do outro lado reproduziu de volta. Está esperando para ver se acontece de novo.',
    traits: ['metódica', 'reservada', 'fascinada pelo proibido'],
    startingRelationships: [
      { npcId: 'tolven', affinity: 0, note: 'Tolven acha as perguntas dela educadas demais para serem só curiosidade — não desconfia, mas fica alerta.' },
    ],
    uniqueTags: ['ex-arquivo-vertido', 'pagina-roubada'],
    voiceStyle: 'Precisa, um pouco distante, escolhe as palavras como quem cataloga.',
    startingIndoleBias: { ambicao: 6, pragmatismo: 6, autocontrole: 4 },
    visualProfile: { id: 'origin-mireth-sable', visualTheme: 'tecelao-do-veu', presentation: 'feminino' },
  },
  {
    id: 'corwin-thale',
    name: 'Corwin Thale',
    gender: 'masculino',
    classId: 'cacador-de-fissuras',
    originId: 'fronteira-partida',
    approxAge: 'trinta e poucos',
    catchphrase: 'A fronteira não avisa. Ela só muda.',
    shortHook: 'Ele rastreia a fissura por dinheiro — e por uma irmã que desapareceu perto dela há onze anos.',
    background:
      'Nasceu à vista da fissura arcana permanente, num povoado que trata a deformação como clima: algo que se contorna, não que se explica. Rastreia anomalias por encomenda, em parte porque lê distorção antes de qualquer outra pessoa notar, em parte porque perto da fissura é o único lugar onde não sente que falta algo.',
    personalGoal: 'Mapear toda rota segura por terreno tocado pela fissura antes que ela mude de novo — por dinheiro, mas também porque alguém precisa.',
    fear: 'Que a fissura esteja se movendo devagar, e ninguém em Varreth acreditaria nele se dissesse isso.',
    knownFact: 'Consegue ler padrões de deformação da fissura o bastante para estimar, aproximadamente, há quanto tempo uma anomalia está ativa.',
    secret:
      'Ele não rastreia a fissura só por ofício — sua irmã desapareceu perto da borda dela onze anos atrás, registrada como "perdida para a fronteira", e ele nunca parou de procurar um rastro do que aconteceu com ela.',
    traits: ['observador', 'lacônico', 'teimoso'],
    startingRelationships: [
      { npcId: 'tolven', affinity: 3, note: 'Tolven respeita rastreadores e troca informação com Corwin de vez em quando — o trata como alguém confiável, mas distante.' },
    ],
    uniqueTags: ['fronteira-partida-nativo', 'irma-desaparecida'],
    voiceStyle: 'Direto, econômico, só elabora quando o assunto é a própria fronteira.',
    startingIndoleBias: { pragmatismo: 6, autocontrole: 6, impulsividade: -3 },
    visualProfile: { id: 'origin-corwin-thale', visualTheme: 'cacador-de-fissuras', presentation: 'masculino' },
  },
];
