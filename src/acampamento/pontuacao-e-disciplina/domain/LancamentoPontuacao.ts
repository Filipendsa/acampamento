import { DomainError } from '../../../shared/domain/DomainError';
import { Entity } from '../../../shared/domain/Entity';
import { CategoriaLancamento } from './CategoriaLancamento';

export interface LancamentoPontuacaoProps {
  id: string;
  equipeAlvoId: string;
  unidadeIdsEnvolvidas: string[];
  nomeEquipe: string;
  categoria: CategoriaLancamento;
  pontos: number;
  motivo: string;
  atividadeRelacionada?: string;
  autor: string;
  criadoEm: string;
  ocorrenciaOrigemId?: string;
  removido?: boolean;
}

export class LancamentoPontuacao extends Entity<string> {
  public readonly equipeAlvoId: string;
  public readonly unidadeIdsEnvolvidas: string[];
  public readonly nomeEquipe: string;
  public readonly categoria: CategoriaLancamento;
  public readonly pontos: number;
  public readonly motivo: string;
  public readonly atividadeRelacionada?: string;
  public readonly autor: string;
  public readonly criadoEm: string;
  public readonly ocorrenciaOrigemId?: string;
  private _removido: boolean;

  private constructor(props: LancamentoPontuacaoProps) {
    super(props.id);
    this.equipeAlvoId = props.equipeAlvoId;
    this.unidadeIdsEnvolvidas = [...props.unidadeIdsEnvolvidas];
    this.nomeEquipe = props.nomeEquipe;
    this.categoria = props.categoria;
    this.pontos = props.pontos;
    this.motivo = props.motivo;
    this.atividadeRelacionada = props.atividadeRelacionada;
    this.autor = props.autor;
    this.criadoEm = props.criadoEm;
    this.ocorrenciaOrigemId = props.ocorrenciaOrigemId;
    this._removido = Boolean(props.removido);
  }

  public static criar(props: LancamentoPontuacaoProps): LancamentoPontuacao {
    const motivoLimpo = props.motivo.trim();
    if (motivoLimpo.length < 3) {
      throw new DomainError(
        'LANCAMENTO_MOTIVO_OBRIGATORIO',
        'Informe o motivo ou descrição (mínimo 3 caracteres).'
      );
    }
    if (!props.equipeAlvoId) {
      throw new DomainError('LANCAMENTO_EQUIPE_OBRIGATORIA', 'Selecione uma unidade ou união.');
    }
    if (!Number.isFinite(props.pontos)) {
      throw new DomainError('LANCAMENTO_PONTOS_INVALIDO', 'Pontuação deve ser um número válido.');
    }

    let pontosNormalizados = Math.round(props.pontos);

    if (props.categoria === 'OBSERVACAO') {
      pontosNormalizados = 0;
    } else if (props.categoria === 'PUNICAO') {
      if (pontosNormalizados === 0) {
        throw new DomainError(
          'PUNICAO_SEM_VALOR',
          'Informe quantos pontos serão descontados na punição.'
        );
      }
      pontosNormalizados = -Math.abs(pontosNormalizados);
    } else {
      if (pontosNormalizados === 0) {
        throw new DomainError(
          'PONTUACAO_ZERO',
          'Informe uma pontuação diferente de zero (ou use a categoria Observação).'
        );
      }
    }

    return new LancamentoPontuacao({
      ...props,
      motivo: motivoLimpo,
      pontos: pontosNormalizados,
    });
  }

  public static restaurar(props: LancamentoPontuacaoProps): LancamentoPontuacao {
    return new LancamentoPontuacao(props);
  }

  public get removido(): boolean {
    return this._removido;
  }

  public marcarRemovido(): void {
    this._removido = true;
  }

  public toSnapshot(): LancamentoPontuacaoProps {
    return {
      id: this.id,
      equipeAlvoId: this.equipeAlvoId,
      unidadeIdsEnvolvidas: [...this.unidadeIdsEnvolvidas],
      nomeEquipe: this.nomeEquipe,
      categoria: this.categoria,
      pontos: this.pontos,
      motivo: this.motivo,
      atividadeRelacionada: this.atividadeRelacionada,
      autor: this.autor,
      criadoEm: this.criadoEm,
      ocorrenciaOrigemId: this.ocorrenciaOrigemId,
      removido: this._removido,
    };
  }
}
