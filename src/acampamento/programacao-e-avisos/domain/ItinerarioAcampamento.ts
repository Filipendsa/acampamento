import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { DomainError } from '../../../shared/domain/DomainError';
import { EventoProgramacao, EventoProgramacaoProps } from './EventoProgramacao';

export interface AvisoCentralProps {
  id: string;
  titulo: string;
  mensagem: string;
  criadoEm: string;
  autor: string;
  prioridade: 'NORMAL' | 'URGENTE';
}

export class ItinerarioAcampamento extends AggregateRoot<string> {
  private _eventos: EventoProgramacao[];
  private _avisosManuais: AvisoCentralProps[];

  private constructor(eventos: EventoProgramacao[], avisosManuais: AvisoCentralProps[]) {
    super('itinerario-oficial-2026');
    this._eventos = eventos;
    this._avisosManuais = avisosManuais;
  }

  public static criar(
    eventosProps: EventoProgramacaoProps[],
    avisosManuais: AvisoCentralProps[] = []
  ): ItinerarioAcampamento {
    const eventos = eventosProps
      .map((e) => EventoProgramacao.criar(e))
      .sort((a, b) => a.inicioDate().getTime() - b.inicioDate().getTime());

    return new ItinerarioAcampamento(eventos, avisosManuais);
  }

  public get eventos(): ReadonlyArray<EventoProgramacao> {
    return this._eventos;
  }

  public get avisosManuais(): ReadonlyArray<AvisoCentralProps> {
    return this._avisosManuais;
  }

  public publicarAvisoManual(aviso: AvisoCentralProps): void {
    if (!aviso.titulo.trim() || !aviso.mensagem.trim()) {
      throw new DomainError('AVISO_INVALIDO', 'Título e mensagem do aviso são obrigatórios.');
    }
    this._avisosManuais = [aviso, ...this._avisosManuais];
  }

  public removerAvisoManual(id: string): void {
    this._avisosManuais = this._avisosManuais.filter((a) => a.id !== id);
  }
}
