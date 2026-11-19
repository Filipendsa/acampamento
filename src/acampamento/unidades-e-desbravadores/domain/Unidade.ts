import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { DomainError } from '../../../shared/domain/DomainError';
import { GeneroUnidade } from './GeneroUnidade';
import { Participante, ParticipanteProps } from './Participante';

export interface UnidadeProps {
  id: string;
  codigo: string;
  nome: string;
  genero: GeneroUnidade;
  membros: ParticipanteProps[];
}

export class Unidade extends AggregateRoot<string> {
  public readonly codigo: string;
  public readonly nome: string;
  public readonly genero: GeneroUnidade;
  private _membros: Participante[];

  private constructor(
    id: string,
    codigo: string,
    nome: string,
    genero: GeneroUnidade,
    membros: Participante[]
  ) {
    super(id);
    this.codigo = codigo;
    this.nome = nome;
    this.genero = genero;
    this._membros = membros;
  }

  public static criar(props: UnidadeProps): Unidade {
    if (!props.nome.trim()) {
      throw new DomainError('UNIDADE_NOME_INVALIDO', 'Nome da unidade é obrigatório.');
    }
    const membros = props.membros.map((m) => Participante.criar(m));
    return new Unidade(props.id, props.codigo, props.nome, props.genero, membros);
  }

  public get nomeExibicao(): string {
    return `${this.codigo}_${this.nome}`;
  }

  public get membros(): ReadonlyArray<Participante> {
    return this._membros;
  }

  public get desbravadores(): ReadonlyArray<Participante> {
    return this._membros.filter((m) => m.isCriancaDesbravador);
  }

  public get diretoria(): ReadonlyArray<Participante> {
    return this._membros.filter((m) => m.isDiretoria);
  }

  public podeUnirCom(outra: Unidade): boolean {
    return this.id !== outra.id && this.genero === outra.genero;
  }

  public adicionarMembro(membro: Participante): void {
    const jaExiste = this._membros.some((m) => m.id === membro.id);
    if (jaExiste) {
      throw new DomainError('MEMBRO_DUPLICADO', `${membro.nome} já pertence à unidade ${this.nomeExibicao}.`);
    }
    this._membros.push(membro);
  }

  public toSnapshot(): UnidadeProps {
    return {
      id: this.id,
      codigo: this.codigo,
      nome: this.nome,
      genero: this.genero,
      membros: this._membros.map((m) => m.toSnapshot()),
    };
  }
}
