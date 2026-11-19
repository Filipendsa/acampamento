import { Entity } from '../../../shared/domain/Entity';
import { DataDiaAcampamento } from './DiaAcampamento';
import { StatusTemporalEvento } from './StatusTemporalEvento';

export interface EventoProgramacaoProps {
  id: string;
  dia: DataDiaAcampamento;
  horaInicio: string; // HH:mm
  horaFim: string; // HH:mm
  horarioExibicao: string; // ex: "7h00", "9h - 10h"
  titulo: string;
  responsaveis: string;
  manualId?: string;
  momentoMusical?: string;
  categoria?: 'GERAL' | 'DESAFIO' | 'ESPIRITUAL' | 'REFEICAO' | 'DIRETORIA';
}

function parseHorarioParaDate(dia: DataDiaAcampamento, hhmm: string): Date {
  const [ano, mes, d] = dia.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  return new Date(ano, mes - 1, d, hh, mm, 0, 0);
}

export class EventoProgramacao extends Entity<string> {
  public readonly dia: DataDiaAcampamento;
  public readonly horaInicio: string;
  public readonly horaFim: string;
  public readonly horarioExibicao: string;
  public readonly titulo: string;
  public readonly responsaveis: string;
  public readonly manualId?: string;
  public readonly momentoMusical?: string;
  public readonly categoria: NonNullable<EventoProgramacaoProps['categoria']>;

  private constructor(props: EventoProgramacaoProps) {
    super(props.id);
    this.dia = props.dia;
    this.horaInicio = props.horaInicio;
    this.horaFim = props.horaFim;
    this.horarioExibicao = props.horarioExibicao;
    this.titulo = props.titulo;
    this.responsaveis = props.responsaveis;
    this.manualId = props.manualId;
    this.momentoMusical = props.momentoMusical;
    this.categoria = props.categoria ?? 'GERAL';
  }

  public static criar(props: EventoProgramacaoProps): EventoProgramacao {
    return new EventoProgramacao(props);
  }

  public inicioDate(): Date {
    return parseHorarioParaDate(this.dia, this.horaInicio);
  }

  public fimDate(): Date {
    return parseHorarioParaDate(this.dia, this.horaFim);
  }

  public statusEm(agora: Date, proximoId?: string): StatusTemporalEvento {
    const t = agora.getTime();
    const inicio = this.inicioDate().getTime();
    const fim = this.fimDate().getTime();

    if (t >= inicio && t < fim) {
      return 'EM_ANDAMENTO';
    }
    if (t >= fim) {
      return 'CONCLUIDO';
    }
    if (proximoId && proximoId === this.id) {
      return 'PROXIMO';
    }
    return 'FUTURO';
  }

  public toSnapshot(): EventoProgramacaoProps {
    return {
      id: this.id,
      dia: this.dia,
      horaInicio: this.horaInicio,
      horaFim: this.horaFim,
      horarioExibicao: this.horarioExibicao,
      titulo: this.titulo,
      responsaveis: this.responsaveis,
      manualId: this.manualId,
      momentoMusical: this.momentoMusical,
      categoria: this.categoria,
    };
  }
}
