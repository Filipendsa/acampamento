import { EscalaSanitarismoProps } from '../domain/EscalaSanitarismo';
import { TurnoRondaNoturnaProps } from '../domain/TurnoRondaNoturna';

export const RONDA_NOTURNA_OFICIAL_SEED: TurnoRondaNoturnaProps[] = [
  // DIA 1 — MATEUS (Preparação e Identidade)
  {
    id: 'ronda-d1-23h',
    diaNumero: 1,
    tituloDia: 'DIA 1 — MATEUS',
    subtituloTema: 'Preparação e Identidade',
    corTema: 'indigo',
    dataReferencia: '2026-11-20',
    horarioExibicao: '23h - 01h',
    duplaResponsaveis: 'Filipe e Gabrielle',
  },
  {
    id: 'ronda-d1-01h',
    diaNumero: 1,
    tituloDia: 'DIA 1 — MATEUS',
    subtituloTema: 'Preparação e Identidade',
    corTema: 'indigo',
    dataReferencia: '2026-11-20',
    horarioExibicao: '01h - 03h',
    duplaResponsaveis: 'Gabriel e Eliene',
  },
  {
    id: 'ronda-d1-03h',
    diaNumero: 1,
    tituloDia: 'DIA 1 — MATEUS',
    subtituloTema: 'Preparação e Identidade',
    corTema: 'indigo',
    dataReferencia: '2026-11-20',
    horarioExibicao: '03h - 05h',
    duplaResponsaveis: 'Marco F e Adriane',
  },
  {
    id: 'ronda-d1-05h',
    diaNumero: 1,
    tituloDia: 'DIA 1 — MATEUS',
    subtituloTema: 'Preparação e Identidade',
    corTema: 'indigo',
    dataReferencia: '2026-11-20',
    horarioExibicao: '05h - 07h',
    duplaResponsaveis: 'Samuel e Rebeca',
  },

  // DIA 2 — MARCOS (Ação e Serviço)
  {
    id: 'ronda-d2-23h',
    diaNumero: 2,
    tituloDia: 'DIA 2 — MARCOS',
    subtituloTema: 'Ação e Serviço',
    corTema: 'emerald',
    dataReferencia: '2026-11-21',
    horarioExibicao: '23h - 01h',
    duplaResponsaveis: 'Peck e Daniela',
  },
  {
    id: 'ronda-d2-01h',
    diaNumero: 2,
    tituloDia: 'DIA 2 — MARCOS',
    subtituloTema: 'Ação e Serviço',
    corTema: 'emerald',
    dataReferencia: '2026-11-21',
    horarioExibicao: '01h - 03h',
    duplaResponsaveis: 'Matheus e Jaqueline',
  },
  {
    id: 'ronda-d2-03h',
    diaNumero: 2,
    tituloDia: 'DIA 2 — MARCOS',
    subtituloTema: 'Ação e Serviço',
    corTema: 'emerald',
    dataReferencia: '2026-11-21',
    horarioExibicao: '03h - 05h',
    duplaResponsaveis: 'Marco G e Camila',
  },
  {
    id: 'ronda-d2-05h',
    diaNumero: 2,
    tituloDia: 'DIA 2 — MARCOS',
    subtituloTema: 'Ação e Serviço',
    corTema: 'emerald',
    dataReferencia: '2026-11-21',
    horarioExibicao: '05h - 07h',
    duplaResponsaveis: 'Luciano e Melissa',
  },

  // DIA 3 — LUCAS (Amor e Transformação)
  {
    id: 'ronda-d3-23h',
    diaNumero: 3,
    tituloDia: 'DIA 3 — LUCAS',
    subtituloTema: 'Amor e Transformação',
    corTema: 'purple',
    dataReferencia: '2026-11-22',
    horarioExibicao: '23h - 01h',
    duplaResponsaveis: 'Marco G e Evelly',
  },
  {
    id: 'ronda-d3-01h',
    diaNumero: 3,
    tituloDia: 'DIA 3 — LUCAS',
    subtituloTema: 'Amor e Transformação',
    corTema: 'purple',
    dataReferencia: '2026-11-22',
    horarioExibicao: '01h - 03h',
    duplaResponsaveis: 'Samuel e Christiane',
  },
  {
    id: 'ronda-d3-03h',
    diaNumero: 3,
    tituloDia: 'DIA 3 — LUCAS',
    subtituloTema: 'Amor e Transformação',
    corTema: 'purple',
    dataReferencia: '2026-11-22',
    horarioExibicao: '03h - 05h',
    duplaResponsaveis: 'Vinicius e Stefani',
  },
  {
    id: 'ronda-d3-05h',
    diaNumero: 3,
    tituloDia: 'DIA 3 — LUCAS',
    subtituloTema: 'Amor e Transformação',
    corTema: 'purple',
    dataReferencia: '2026-11-22',
    horarioExibicao: '05h - 07h',
    duplaResponsaveis: 'Filipe e Helena',
  },
];

export const SANITARISMO_OFICIAL_SEED: EscalaSanitarismoProps[] = [
  // DIA 02 - QUINTA • Resp. Eliene / Marco
  {
    id: 'san-quinta-1245',
    rotuloDia: 'DIA 02 - QUINTA',
    responsaveisDiretoria: 'Eliene / Marco',
    horarioExibicao: '12h45',
    unidadesEscaladas: 'Coruja',
  },
  {
    id: 'san-quinta-1745',
    rotuloDia: 'DIA 02 - QUINTA',
    responsaveisDiretoria: 'Eliene / Marco',
    horarioExibicao: '17h45',
    unidadesEscaladas: 'Falcão Peregrino',
  },

  // DIA 01 - SEXTA • Resp. Peck / Dani
  {
    id: 'san-sexta-1245',
    rotuloDia: 'DIA 01 - SEXTA',
    dataReferencia: '2026-11-20',
    responsaveisDiretoria: 'Peck / Dani',
    horarioExibicao: '12h45',
    unidadesEscaladas: 'Harpia',
  },
  {
    id: 'san-sexta-1845',
    rotuloDia: 'DIA 01 - SEXTA',
    dataReferencia: '2026-11-20',
    responsaveisDiretoria: 'Peck / Dani',
    horarioExibicao: '18h45',
    unidadesEscaladas: 'Aguia Real / Gavião',
  },

  // DIA 01 - SÁBADO • Resp. Frederico / Chris
  {
    id: 'san-sabado-1845',
    rotuloDia: 'DIA 01 - SÁBADO',
    dataReferencia: '2026-11-21',
    responsaveisDiretoria: 'Frederico / Chris',
    horarioExibicao: '18h45',
    unidadesEscaladas: 'Águia Negra',
  },

  // DIA 01 - DOMINGO • Resp. Filipe / Luciano
  {
    id: 'san-domingo-1245',
    rotuloDia: 'DIA 01 - DOMINGO',
    dataReferencia: '2026-11-22',
    responsaveisDiretoria: 'Filipe / Luciano',
    horarioExibicao: '12h45',
    unidadesEscaladas: 'Águia Dourada',
  },
];
