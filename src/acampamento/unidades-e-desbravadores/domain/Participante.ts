import { DomainError } from '../../../shared/domain/DomainError';
import { Entity } from '../../../shared/domain/Entity';
import { PapelParticipante } from './PapelParticipante';

export interface ParticipanteProps {
  id: string;
  nome: string;
  papel: PapelParticipante;
  unidadeId: string;
}

export class Participante extends Entity<string> {
  private _nome: string;
  private _papel: PapelParticipante;
  private _unidadeId: string;

  private constructor(props: ParticipanteProps) {
    super(props.id);
    this._nome = props.nome;
    this._papel = props.papel;
    this._unidadeId = props.unidadeId;
  }

  public static criar(props: ParticipanteProps): Participante {
    const nomeLimpo = props.nome.trim();
    if (nomeLimpo.length < 2) {
      throw new DomainError('PARTICIPANTE_NOME_INVALIDO', 'O nome do participante é obrigatório.');
    }
    return new Participante({
      ...props,
      nome: nomeLimpo,
    });
  }

  public get nome(): string {
    return this._nome;
  }

  public get papel(): PapelParticipante {
    return this._papel;
  }

  public get unidadeId(): string {
    return this._unidadeId;
  }

  public get isDiretoria(): boolean {
    return this._papel === 'DIRETORIA';
  }

  public get isCriancaDesbravador(): boolean {
    return this._papel === 'DESBRAVADOR';
  }

  public transferirParaUnidade(novaUnidadeId: string): void {
    this._unidadeId = novaUnidadeId;
  }

  public toSnapshot(): ParticipanteProps {
    return {
      id: this.id,
      nome: this._nome,
      papel: this._papel,
      unidadeId: this._unidadeId,
    };
  }
}
