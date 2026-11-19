import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { SessaoDiretoria } from '../../acesso-diretoria/domain/SessaoDiretoria';
import { EquipeOperacional } from '../../unidades-e-desbravadores/domain/RegraFusaoUnidades';
import { LancamentoPontuacao, LancamentoPontuacaoProps } from './LancamentoPontuacao';
import { PoliticaAcessoPlacar } from './PoliticaAcessoPlacar';

export interface ResumoRankingEquipe {
  equipe: EquipeOperacional;
  saldoTotal: number;
  totalPositivo: number;
  totalPunicoes: number;
  quantidadeObservacoes: number;
  quantidadeLancamentos: number;
}

export class PlacarUnidade extends AggregateRoot<string> {
  private _lancamentos: LancamentoPontuacao[];

  private constructor(lancamentos: LancamentoPontuacao[]) {
    super('placar-geral-acampamento');
    this._lancamentos = lancamentos;
  }

  public static restaurar(itens: LancamentoPontuacaoProps[]): PlacarUnidade {
    return new PlacarUnidade(itens.map((i) => LancamentoPontuacao.restaurar(i)));
  }

  public get lancamentosAtivos(): ReadonlyArray<LancamentoPontuacao> {
    return this._lancamentos
      .filter((l) => !l.removido)
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  }

  public registrarLancamento(
    sessao: SessaoDiretoria,
    props: LancamentoPontuacaoProps
  ): LancamentoPontuacao {
    PoliticaAcessoPlacar.exigirDiretoriaAdministrativa(sessao);
    const lancamento = LancamentoPontuacao.criar(props);
    this._lancamentos = [lancamento, ...this._lancamentos];
    this.addDomainEvent({
      eventName: 'PontuacaoLancada',
      occurredAt: lancamento.criadoEm,
      aggregateId: lancamento.id,
    });
    return lancamento;
  }

  public removerLancamento(sessao: SessaoDiretoria, lancamentoId: string): void {
    PoliticaAcessoPlacar.exigirDiretoriaAdministrativa(sessao);
    const alvo = this._lancamentos.find((l) => l.id === lancamentoId);
    if (alvo) {
      alvo.marcarRemovido();
    }
  }

  public calcularRanking(
    sessao: SessaoDiretoria,
    equipes: ReadonlyArray<EquipeOperacional>
  ): ResumoRankingEquipe[] {
    PoliticaAcessoPlacar.exigirDiretoriaAdministrativa(sessao);

    const ativos = this.lancamentosAtivos;

    return equipes
      .map((equipe) => {
        const relacionados = ativos.filter(
          (l) =>
            l.equipeAlvoId === equipe.id ||
            l.unidadeIdsEnvolvidas.some((uid) => equipe.unidadeIds.includes(uid))
        );

        let saldoTotal = 0;
        let totalPositivo = 0;
        let totalPunicoes = 0;
        let quantidadeObservacoes = 0;

        for (const item of relacionados) {
          saldoTotal += item.pontos;
          if (item.pontos > 0) totalPositivo += item.pontos;
          if (item.pontos < 0) totalPunicoes += item.pontos;
          if (item.categoria === 'OBSERVACAO') quantidadeObservacoes += 1;
        }

        return {
          equipe,
          saldoTotal,
          totalPositivo,
          totalPunicoes,
          quantidadeObservacoes,
          quantidadeLancamentos: relacionados.length,
        };
      })
      .sort((a, b) => b.saldoTotal - a.saldoTotal);
  }
}
