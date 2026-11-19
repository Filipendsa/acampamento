import { ManualAtividadeProps } from '../domain/ManualAtividade';

export const MANUAIS_CAMPORI_SEED: ManualAtividadeProps[] = [
  {
    id: 'manual-sex-dinamica',
    dia: '2026-11-20',
    horario: '10h00 – 11h00',
    titulo: 'Dinâmica de Integração',
    coordenacao: 'Filipe, Marco e Dani',
    pegada: 'Quebra-gelo dinâmico ("A alegria de estar juntos")',
    inspiracaoCampori: 'Sempre no Alvo (aquecimento leve) + Labirinto das Classes (cooperação rápida)',
    usoEspaco: 'Gramado + borda da área de areia',
    notaSeguranca:
      'Sem pressão excessiva — foco em entrosar as equipes logo no início do acampamento.',
    estacoes: [
      {
        titulo: 'Como Fazer — Revezamento Curto',
        passos: [
          'Organizar revezamento curto entre unidades na área gramada.',
          'Cada dupla ou trio cumpre um mini-desafio de memória rápida (versículos curtos ou lemas/ideais).',
          'Cruzar uma linha de cordas baixas na areia para passar o bastão para a próxima dupla.',
          'Celebrar todas as equipes para criar clima de amizade desde a chegada.',
        ],
      },
    ],
  },
  {
    id: 'manual-sex-desafio',
    dia: '2026-11-20',
    horario: '14h00',
    titulo: 'Desafio de Equipes / Recreação (Sexta)',
    coordenacao: 'Filipe e Marco',
    pegada: 'Recreativa e agitada (com parada para suco e pipoca)',
    inspiracaoCampori: 'Labirinto das Classes + Desafio do Cross (versão recreativa)',
    usoEspaco: 'Área de areia cercada + gramado ao redor',
    notaSeguranca:
      'Rastejar SOBRE a areia por baixo de cordas/fios esticados (nunca enterrar ou cobrir com areia).',
    possuiTabelaClasses: true,
    estacoes: [
      {
        titulo: '1. Rastejo na Areia',
        passos: [
          'Três integrantes por vez avançam rastejando sob cordas esticadas na área de areia.',
          'Objetivo: resgatar "esferas" ou fichas representando as 6 classes (Amigo, Companheiro, Pesquisador, Pioneiro, Excursionista e Guia).',
        ],
      },
      {
        titulo: '2. Recuperação Recreativa ("Estilingue / Arremesso")',
        passos: [
          'Quem não pegar todas as fichas no rastejo tenta acertar os alvos/cores correspondentes às classes em um painel ou cesto.',
          'Adapta a lógica de recuperação de pontuação do manual de forma bem dinâmica.',
        ],
      },
      {
        titulo: '3. Fechamento',
        passos: ['Pausa merecida para o suco e a pipoca celebrando o esforço das equipes.'],
      },
    ],
  },
  {
    id: 'manual-sab-desafio',
    dia: '2026-11-21',
    horario: '14h30',
    titulo: 'Desafio de Equipes / Recreação (Sábado)',
    coordenacao: 'Filipe e Marco',
    pegada: 'Espiritual, bíblica e técnica ("A alegria de viver com Jesus")',
    inspiracaoCampori:
      'Sempre no Alvo + Sempre Aguardando a Volta do Fiel e Verdadeiro + Desafio das Portas',
    usoEspaco: 'Gramado / área sombreada',
    notaSeguranca:
      'Ritmo mais reflexivo, bíblico e aderente ao manual, sem água/queda. Usar setas de ventosa ou bolinhas controladas.',
    possuiRoletaClasses: true,
    possuiTabelaClasses: true,
    possuiNosAsCegas: true,
    estacoes: [
      {
        titulo: 'Estação 1 — Memória Bíblica e Ideais (Sempre no Alvo)',
        passos: [
          'Cada classe/idade responde seu desafio direto do manual (consulte a tabela interativa abaixo).',
          'Cada acerto libera tentativas de acerto num alvo seguro (setas de ventosa ou bolinhas/arremesso controlado).',
        ],
      },
      {
        titulo: 'Estação 2 — Roleta das Classes e Nós (Volta do Fiel e Verdadeiro)',
        passos: [
          'A equipe gira a roleta (física ou aqui no app!) para sortear uma classe.',
          'Representantes respondem a uma pergunta bíblica ou de conhecimento das classes.',
          'Em seguida, executam nós às cegas (com venda ou dentro de caixa/saco) usando os nós clássicos: direito, lais de guia, pescador, simples ou oito.',
        ],
      },
      {
        titulo: 'Estação 3 — As Portas do Serviço (Desafio das Portas)',
        passos: [
          'As equipes escolhem portas temáticas ligadas ao manual:',
          '• Porta 1: Arrumando a Mochila (espiritual / acampamento)',
          '• Porta 2: Primeiros Socorros (cuidado ao próximo)',
          '• Porta 3: Vestindo o Desbravador (identidade e armadura de Deus)',
          'Desafios curtos de raciocínio, aplicação bíblica e trabalho em equipe.',
        ],
      },
      {
        titulo: 'Encerramento',
        passos: [
          'Parada para suco e pipoca com reflexão rápida conectando tudo à comunhão com Jesus.',
        ],
      },
    ],
  },
  {
    id: 'manual-dom-pista-fio',
    dia: '2026-11-22',
    horario: '09h00',
    titulo: 'Desafio de Equipes — Pista de Fio (Domingo)',
    coordenacao: 'Filipe e Marco',
    pegada: 'Dinâmica, rápida e energética ("A alegria de ser desbravador")',
    inspiracaoCampori: 'Desafio do Cross + Labirinto das Classes',
    usoEspaco: 'Área de areia + trecho curto no gramado',
    notaSeguranca:
      'Transporte de objeto/maca leve sem risco de queda. Cronometrar por bateria abaixo!',
    possuiCronometroBateria: true,
    estacoes: [
      {
        titulo: 'Circuito Cronometrado por Bateria (4 Etapas)',
        passos: [
          '1. Rastejo na areia sob fios/cordas: passagem baixa na areia exigindo coordenação sem encostar ou derrubar o fio guia.',
          '2. Equilíbrio / ponte cooperativa: deslocamento curto apoiado em linha/sarrafo baixo ou passagem em dupla com apoio mútuo.',
          '3. Transporte em equipe: levar um objeto/carga leve (ou maca improvisada leve) por um trecho curto até o ponto de chegada.',
          '4. Fechamento coletivo: toda a equipe cruza a linha final junto para somar bônus de união e espírito desbravador antes do banho e desmontagem.',
        ],
      },
    ],
  },
];
