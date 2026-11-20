import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { DomainError } from '../../../shared/domain/DomainError';
import { GravidadeOcorrencia, StatusOcorrencia, TipoOcorrencia } from './TipoOcorrencia';

export interface OcorrenciaIndividualProps {
  id: string;
  participanteId: string;
  participanteNome: string;
  unidadeId: string;
  unidadeNome: string;
  tipo: TipoOcorrencia;
  gravidade: GravidadeOcorrencia;
  status: StatusOcorrencia;
  descricao: string;
  providencia?: string;
  registradoPor: string;
  registradoPorDeviceId?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export class OcorrenciaIndividual extends AggregateRoot<string> {
  public readonly participanteId: string;
  public readonly participanteNome: string;
  public readonly unidadeId: string;
  public readonly unidadeNome: string;
  public readonly tipo: TipoOcorrencia;
  public readonly gravidade: GravidadeOcorrencia;
  private _status: StatusOcorrencia;
  public readonly descricao: string;
  private _providencia?: string;
  public readonly registradoPor: string;
  public readonly registradoPorDeviceId?: string;
  public readonly criadoEm: string;
  private _atualizadoEm: string;

  private constructor(props: OcorrenciaIndividualProps) {
    super(props.id);
    this.participanteId = props.participanteId;
    this.participanteNome = props.participanteNome;
    this.unidadeId = props.unidadeId;
    this.unidadeNome = props.unidadeNome;
    this.tipo = props.tipo;
    this.gravidade = props.gravidade;
    this._status = props.status;
    this.descricao = props.descricao;
    this._providencia = props.providencia;
    this.registradoPor = props.registradoPor;
    this.registradoPorDeviceId = props.registradoPorDeviceId;
    this.criadoEm = props.criadoEm;
    this._atualizadoEm = props.atualizadoEm;
  }

  public static registrar(
    props: Omit<OcorrenciaIndividualProps, 'status' | 'atualizadoEm'>
  ): OcorrenciaIndividual {
    const descLimpa = props.descricao.trim();
    if (descLimpa.length < 3) {
      throw new DomainError(
        'OCORRENCIA_DESCRICAO_INVALIDA',
        'Descreva o ocorrido (mínimo 3 caracteres).'
      );
    }
    if (!props.participanteId) {
      throw new DomainError(
        'OCORRENCIA_PARTICIPANTE_OBRIGATORIO',
        'Selecione a criança/participante para registrar a ocorrência.'
      );
    }

    const ocorrencia = new OcorrenciaIndividual({
      ...props,
      descricao: descLimpa,
      providencia: props.providencia?.trim() || undefined,
      status: 'ABERTA',
      atualizadoEm: props.criadoEm,
    });

    if (props.tipo === 'COMPORTAMENTO') {
      ocorrencia.addDomainEvent({
        eventName: 'OcorrenciaComportamentoRegistrada',
        occurredAt: props.criadoEm,
        aggregateId: ocorrencia.id,
      });
    }

    return ocorrencia;
  }

  public static restaurar(props: OcorrenciaIndividualProps): OcorrenciaIndividual {
    return new OcorrenciaIndividual(props);
  }

  public get status(): StatusOcorrencia {
    return this._status;
  }

  public get providencia(): string | undefined {
    return this._providencia;
  }

  public get atualizadoEm(): string {
    return this._atualizadoEm;
  }

  public atualizarStatus(novoStatus: StatusOcorrencia, providencia: string | undefined, agoraIso: string): void {
    this._status = novoStatus;
    if (providencia !== undefined) {
      this._providencia = providencia.trim() || undefined;
    }
    this._atualizadoEm = agoraIso;
  }

  public toSnapshot(): OcorrenciaIndividualProps {
    return {
      id: this.id,
      participanteId: this.participanteId,
      participanteNome: this.participanteNome,
      unidadeId: this.unidadeId,
      unidadeNome: this.unidadeNome,
      tipo: this.tipo,
      gravidade: this.gravidade,
      status: this._status,
      descricao: this.descricao,
      providencia: this._providencia,
      registradoPor: this.registradoPor,
      registradoPorDeviceId: this.registradoPorDeviceId,
      criadoEm: this.criadoEm,
      atualizadoEm: this._atualizadoEm,
    };
  }
}
