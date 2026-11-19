export type GeneroUnidade = 'FEMININO' | 'MASCULINO';

export function labelGeneroUnidade(genero: GeneroUnidade): string {
  return genero === 'FEMININO' ? 'Feminina' : 'Masculina';
}
