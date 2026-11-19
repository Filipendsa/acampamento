export type CategoriaLancamento = 'PROVA' | 'BONUS' | 'INSPECAO' | 'PUNICAO' | 'OBSERVACAO';

export const CATEGORIAS_LANCAMENTO: Array<{
  valor: CategoriaLancamento;
  rotulo: string;
  descricao: string;
}> = [
  { valor: 'PROVA', rotulo: 'Prova / Desafio', descricao: 'Pontuação livre obtida em provas e estações' },
  { valor: 'INSPECAO', rotulo: 'Inspeção / Apresentação', descricao: 'Apresentação das unidades, cantinho e barracas' },
  { valor: 'BONUS', rotulo: 'Bônus', descricao: 'Pontuação extra por mérito ou união' },
  { valor: 'PUNICAO', rotulo: 'Punição', descricao: 'Desconto de pontos na unidade por infração' },
  { valor: 'OBSERVACAO', rotulo: 'Observação', descricao: 'Registro na ficha da unidade (0 pts)' },
];
