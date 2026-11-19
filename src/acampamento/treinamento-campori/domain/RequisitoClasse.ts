export interface RequisitoClasse {
  classe: 'Amigo' | 'Companheiro' | 'Pesquisador' | 'Pioneiro' | 'Excursionista' | 'Guia';
  idade: number;
  corHex: string;
  temaPrincipal: string;
  detalhes: string[];
  dicaConferencia: string;
}

export const REQUISITOS_CLASSES_CAMPORI: RequisitoClasse[] = [
  {
    classe: 'Amigo',
    idade: 10,
    corHex: '#2563eb',
    temaPrincipal: 'Daniel 1:8 e Mateus 7:12',
    detalhes: [
      'Daniel 1:8 — Propósito de Daniel em seu coração não se contaminar.',
      'Mateus 7:12 — A Regra Áurea: fazer aos outros o que quer que façam a você.',
    ],
    dicaConferencia: 'Verificar se o desbravador sabe explicar ou recitar a essência dos 2 versículos.',
  },
  {
    classe: 'Companheiro',
    idade: 11,
    corHex: '#dc2626',
    temaPrincipal: 'Voto do Desbravador e 1 Coríntios 9:24-27',
    detalhes: [
      'Voto: "Pela graça de Deus, serei puro, bondoso e leal; guardarei a Lei do Desbravador; serei servo de Deus e amigo de todos."',
      '1 Coríntios 9:24-27 — Correr para alcançar o prêmio incorruptível, com domínio próprio.',
    ],
    dicaConferencia: 'Conferir Voto completo sem pular frases e a analogia do atleta cristão em 1Co 9.',
  },
  {
    classe: 'Pesquisador',
    idade: 12,
    corHex: '#16a34a',
    temaPrincipal: 'Lei do Desbravador',
    detalhes: [
      '1. Observar a devoção matinal',
      '2. Cumprir fielmente a parte que me corresponde',
      '3. Cuidar do meu corpo',
      '4. Manter a consciência limpa',
      '5. Ser cortês e obediente',
      '6. Andar com reverência na casa de Deus',
      '7. Ter sempre um cântico no coração',
      '8. Ir aonde Deus mandar',
    ],
    dicaConferencia: 'Os 8 itens da Lei do Desbravador em sequência.',
  },
  {
    classe: 'Pioneiro',
    idade: 13,
    corHex: '#64748b',
    temaPrincipal: 'Alvo, Lema e Bem-Aventuranças (Mateus 5:3-10)',
    detalhes: [
      'Alvo: A mensagem do advento a todo o mundo em minha geração.',
      'Lema: O amor de Cristo me motiva.',
      'Mateus 5:3-10 — Os 8 bem-aventurados (humildes de espírito, os que choram, mansos, etc.).',
    ],
    dicaConferencia: 'Pedir Alvo + Lema e ao menos 4 a 8 bem-aventuranças de Mateus 5.',
  },
  {
    classe: 'Excursionista',
    idade: 14,
    corHex: '#7c3aed',
    temaPrincipal: 'Os 12 Apóstolos e o Fruto do Espírito (Gálatas 5:22, 23)',
    detalhes: [
      '12 Apóstolos: Pedro, André, Tiago (filho de Zebedeu), João, Filipe, Bartolomeu, Tomé, Mateus, Tiago (filho de Alfeu), Tadeu (Judas), Simão o Zelote, Judas Iscariotes (substituído por Matias).',
      'Fruto do Espírito (Gl 5:22-23): Amor, alegria, paz, paciência, amabilidade, bondade, fidelidade, mansidão e domínio próprio.',
    ],
    dicaConferencia: 'Atenção aos dois Tiagos e aos 9 aspectos do Fruto do Espírito.',
  },
  {
    classe: 'Guia',
    idade: 15,
    corHex: '#eab308',
    temaPrincipal: 'Três Mensagens Angélicas (Ap 14) e Sete Igrejas do Apocalipse em ordem',
    detalhes: [
      '3 Mensagens Angélicas (Ap 14:6-12): (1) Temei a Deus e dai-Lhe glória, hora do juízo; (2) Caiu Babilônia; (3) Alerta contra a besta/imagem e perseverança dos santos.',
      '7 Igrejas em ordem (Ap 2-3): 1. Éfeso • 2. Esmirna • 3. Pérgamo • 4. Tiatira • 5. Sardes • 6. Filadélfia • 7. Laodiceia.',
    ],
    dicaConferencia: 'As 7 igrejas devem estar na ordem exata de Apocalipse 2 e 3.',
  },
];

export const NOS_CLASSICOS_MANUAL = [
  {
    nome: 'Nó Direito',
    uso: 'Unir duas cordas de mesma espessura; clássico para amarrações e primeiros socorros.',
  },
  {
    nome: 'Lais de Guia',
    uso: 'Alça fixa que não corre nem aperta; usado em resgates.',
  },
  {
    nome: 'Nó de Pescador',
    uso: 'Unir duas cordas finas, lisas ou escorregadias.',
  },
  {
    nome: 'Nó Simples',
    uso: 'Batente básico na ponta da corda para evitar que deslize.',
  },
  {
    nome: 'Nó Oito',
    uso: 'Batente mais seguro que o nó simples; fácil de desatar após tensão.',
  },
];
