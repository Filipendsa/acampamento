export type TipoOcorrencia = 'COMPORTAMENTO' | 'SAUDE' | 'INCIDENTE' | 'OBSERVACAO';

export type GravidadeOcorrencia = 'LEVE' | 'MODERADA' | 'URGENTE';

export type StatusOcorrencia = 'ABERTA' | 'ACOMPANHANDO' | 'RESOLVIDA';

export const TIPOS_OCORRENCIA: Array<{
  valor: TipoOcorrencia;
  rotulo: string;
  exemplo: string;
}> = [
  { valor: 'COMPORTAMENTO', rotulo: 'Comportamento / Xingamento', exemplo: 'Xingou, desrespeito, desobediência' },
  { valor: 'SAUDE', rotulo: 'Saúde / Doença', exemplo: 'Febre, dor de cabeça, mal-estar, medicação' },
  { valor: 'INCIDENTE', rotulo: 'Incidente / Acidente', exemplo: 'Ralado na pista, perda de item' },
  { valor: 'OBSERVACAO', rotulo: 'Observação Geral', exemplo: 'Recado para os pais ou conselheiro' },
];
