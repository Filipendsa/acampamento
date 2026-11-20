import { Entity } from '../../../shared/domain/Entity';
import { DataDiaAcampamento } from '../../programacao-e-avisos/domain/DiaAcampamento';

export interface EscalaSanitarismoProps {
  id: string;
  rotuloDia: string;
  dataReferencia?: DataDiaAcampamento;
  responsaveisDiretoria: string;
  horarioExibicao: string;
  unidadesEscaladas: string;
  concluido?: boolean;
  concluidoPor?: string;
  concluidoEm?: string;
}

export class EscalaSanitarismo extends Entity<string> {
  public readonly rotuloDia: string;
  public readonly dataReferencia?: DataDiaAcampamento;
  public readonly responsaveisDiretoria: string;
  public readonly horarioExibicao: string;
  public readonly unidadesEscaladas: string;
  private _concluido: boolean;
  private _concluidoPor?: string;
  private _concluidoEm?: string;

  private constructor(props: EscalaSanitarismoProps) {
    super(props.id);
    this.rotuloDia = props.rotuloDia;
    this.dataReferencia = props.dataReferencia;
    this.responsaveisDiretoria = props.responsaveisDiretoria;
    this.horarioExibicao = props.horarioExibicao;
    this.unidadesEscaladas = props.unidadesEscaladas;
    this._concluido = Boolean(props.concluido);
    this._concluidoPor = props.concluidoPor;
    this._concluidoEm = props.concluidoEm;
  }

  public static criar(props: EscalaSanitarismoProps): EscalaSanitarismo {
    return new EscalaSanitarismo(props);
  }

  public get concluido(): boolean {
    return this._concluido;
  }

  public get concluidoPor(): string | undefined {
    return this._concluidoPor;
  }

  public get concluidoEm(): string | undefined {
    return this._concluidoEm;
  }

  public alternarConclusao(operador: string, agoraIso: string): void {
    this._concluido = !this._concluido;
    if (this._concluido) {
      this._concluidoPor = operador;
      this._concluidoEm = agoraIso;
    } else {
      this._concluidoPor = undefined;
      this._concluidoEm = undefined;
    }
  }

  public pertenceAoOperador(nomeOperador: string): boolean {
    const termo = nomeOperador.trim().toLowerCase();
    if (termo.length < 2 || termo === 'diretoria em campo') return false;
    return this.responsaveisDiretoria.toLowerCase().includes(termo);
  }

  public toSnapshot(): EscalaSanitarismoProps {
    return {
      id: this.id,
      rotuloDia: this.rotuloDia,
      dataReferencia: this.dataReferencia,
      responsaveisDiretoria: this.responsaveisDiretoria,
      horarioExibicao: this.horarioExibicao,
      unidadesEscaladas: this.unidadesEscaladas,
      concluido: this._concluido,
      concluidoPor: this._concluidoPor,
      concluidoEm: this._concluidoEm,
    };
  }
}
