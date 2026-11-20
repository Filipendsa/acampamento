import { Entity } from '../../../shared/domain/Entity';
import { DataDiaAcampamento } from '../../programacao-e-avisos/domain/DiaAcampamento';

export interface TurnoRondaNoturnaProps {
  id: string;
  diaNumero: 1 | 2 | 3;
  tituloDia: string;
  subtituloTema: string;
  corTema: 'indigo' | 'emerald' | 'purple';
  dataReferencia: DataDiaAcampamento;
  horarioExibicao: string;
  duplaResponsaveis: string;
  concluido?: boolean;
  concluidoPor?: string;
  concluidoEm?: string;
}

export class TurnoRondaNoturna extends Entity<string> {
  public readonly diaNumero: 1 | 2 | 3;
  public readonly tituloDia: string;
  public readonly subtituloTema: string;
  public readonly corTema: 'indigo' | 'emerald' | 'purple';
  public readonly dataReferencia: DataDiaAcampamento;
  public readonly horarioExibicao: string;
  public readonly duplaResponsaveis: string;
  private _concluido: boolean;
  private _concluidoPor?: string;
  private _concluidoEm?: string;

  private constructor(props: TurnoRondaNoturnaProps) {
    super(props.id);
    this.diaNumero = props.diaNumero;
    this.tituloDia = props.tituloDia;
    this.subtituloTema = props.subtituloTema;
    this.corTema = props.corTema;
    this.dataReferencia = props.dataReferencia;
    this.horarioExibicao = props.horarioExibicao;
    this.duplaResponsaveis = props.duplaResponsaveis;
    this._concluido = Boolean(props.concluido);
    this._concluidoPor = props.concluidoPor;
    this._concluidoEm = props.concluidoEm;
  }

  public static criar(props: TurnoRondaNoturnaProps): TurnoRondaNoturna {
    return new TurnoRondaNoturna(props);
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
    return this.duplaResponsaveis.toLowerCase().includes(termo);
  }

  public toSnapshot(): TurnoRondaNoturnaProps {
    return {
      id: this.id,
      diaNumero: this.diaNumero,
      tituloDia: this.tituloDia,
      subtituloTema: this.subtituloTema,
      corTema: this.corTema,
      dataReferencia: this.dataReferencia,
      horarioExibicao: this.horarioExibicao,
      duplaResponsaveis: this.duplaResponsaveis,
      concluido: this._concluido,
      concluidoPor: this._concluidoPor,
      concluidoEm: this._concluidoEm,
    };
  }
}
