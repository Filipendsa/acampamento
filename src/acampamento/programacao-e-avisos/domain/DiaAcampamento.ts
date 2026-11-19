export type DataDiaAcampamento = '2026-11-20' | '2026-11-21' | '2026-11-22';

export interface DiaAcampamentoInfo {
  data: DataDiaAcampamento;
  rotuloCurto: string;
  tituloDia: string;
  tema: string;
  corBadge: 'emerald' | 'sky' | 'rose';
}

export const DIAS_ACAMPAMENTO: DiaAcampamentoInfo[] = [
  {
    data: '2026-11-20',
    rotuloCurto: 'Sex • 20/11',
    tituloDia: '20 de novembro • Sexta-feira',
    tema: 'A ALEGRIA DE ESTAR JUNTOS',
    corBadge: 'emerald',
  },
  {
    data: '2026-11-21',
    rotuloCurto: 'Sáb • 21/11',
    tituloDia: '21 de novembro • Sábado',
    tema: 'A ALEGRIA DE VIVER COM JESUS',
    corBadge: 'sky',
  },
  {
    data: '2026-11-22',
    rotuloCurto: 'Dom • 22/11',
    tituloDia: '22 de novembro • Domingo',
    tema: 'A ALEGRIA DE SER DESBRAVADOR',
    corBadge: 'rose',
  },
];
