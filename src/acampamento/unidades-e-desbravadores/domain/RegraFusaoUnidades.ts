import { DomainError } from '../../../shared/domain/DomainError';
import { AliancaUnidades } from './AliancaUnidades';
import { GeneroUnidade } from './GeneroUnidade';
import { Participante } from './Participante';
import { Unidade } from './Unidade';

export interface EquipeOperacional {
  id: string;
  nome: string;
  genero: GeneroUnidade;
  tipo: 'UNIDADE' | 'ALIANCA';
  unidadeIds: string[];
  membros: Participante[];
}

export class RegraFusaoUnidades {
  public static validarUniaoDisponivel(
    unidadesSelecionadas: Unidade[],
    aliancasAtivas: ReadonlyArray<AliancaUnidades>
  ): void {
    for (const unidade of unidadesSelecionadas) {
      const jaUnida = aliancasAtivas.find((a) => a.contemUnidade(unidade.id));
      if (jaUnida) {
        throw new DomainError(
          'UNIDADE_JA_UNIDA',
          `A unidade ${unidade.nomeExibicao} já faz parte da união "${jaUnida.nome}". Desfaça a união atual antes de criar outra.`
        );
      }
    }
  }

  public static resolverEquipesOperacionais(
    unidades: ReadonlyArray<Unidade>,
    aliancas: ReadonlyArray<AliancaUnidades>
  ): EquipeOperacional[] {
    const aliancasAtivas = aliancas.filter((a) => a.ativa);
    const unidadesConsumidas = new Set<string>();
    const equipes: EquipeOperacional[] = [];

    for (const alianca of aliancasAtivas) {
      const unidadesDaAlianca = unidades.filter((u) => alianca.unidadeIds.includes(u.id));
      if (unidadesDaAlianca.length === 0) continue;

      unidadesDaAlianca.forEach((u) => unidadesConsumidas.add(u.id));
      equipes.push({
        id: alianca.id,
        nome: alianca.nome,
        genero: alianca.genero,
        tipo: 'ALIANCA',
        unidadeIds: unidadesDaAlianca.map((u) => u.id),
        membros: unidadesDaAlianca.flatMap((u) => [...u.membros]),
      });
    }

    for (const unidade of unidades) {
      if (unidadesConsumidas.has(unidade.id)) continue;
      equipes.push({
        id: unidade.id,
        nome: unidade.nomeExibicao,
        genero: unidade.genero,
        tipo: 'UNIDADE',
        unidadeIds: [unidade.id],
        membros: [...unidade.membros],
      });
    }

    return equipes;
  }
}
