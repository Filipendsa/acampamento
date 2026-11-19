import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { DomainError } from '../../../shared/domain/DomainError';
import { GeneroUnidade } from './GeneroUnidade';
import { Unidade } from './Unidade';

export interface AliancaUnidadesProps {
  id: string;
  nome: string;
  genero: GeneroUnidade;
  unidadeIds: string[];
  criadaEm: string;
  ativa: boolean;
}

export class AliancaUnidades extends AggregateRoot<string> {
  private _nome: string;
  public readonly genero: GeneroUnidade;
  private _unidadeIds: string[];
  public readonly criadaEm: string;
  private _ativa: boolean;

  private constructor(props: AliancaUnidadesProps) {
    super(props.id);
    this._nome = props.nome;
    this.genero = props.genero;
    this._unidadeIds = [...props.unidadeIds];
    this.criadaEm = props.criadaEm;
    this._ativa = props.ativa;
  }

  /**
   * Invariante de Domínio:
   * - Exige ao menos 2 unidades distintas.
   * - Somente unidades do MESMO gênero podem ser unidas (Masculina+Masculina ou Feminina+Feminina).
   */
  public static unir(
    id: string,
    unidades: Unidade[],
    criadaEm: string,
    nomePersonalizado?: string
  ): AliancaUnidades {
    if (unidades.length < 2) {
      throw new DomainError(
        'FUSAO_QUANTIDADE_INSUFICIENTE',
        'Selecione pelo menos 2 unidades para formar uma união.'
      );
    }

    const idsUnicos = new Set(unidades.map((u) => u.id));
    if (idsUnicos.size !== unidades.length) {
      throw new DomainError('FUSAO_UNIDADE_DUPLICADA', 'Não é possível unir uma unidade com ela mesma.');
    }

    const generoBase = unidades[0].genero;
    const possuiGeneroDiferente = unidades.some((u) => u.genero !== generoBase);
    if (possuiGeneroDiferente) {
      throw new DomainError(
        'FUSAO_GENERO_INCOMPATIVEL',
        'Regra do Acampamento: somente é permitido unir unidade feminina com feminina e masculina com masculina.'
      );
    }

    const nomeAuto = unidades.map((u) => u.nomeExibicao).join(' + ');
    const nome = nomePersonalizado?.trim() ? nomePersonalizado.trim() : nomeAuto;

    const alianca = new AliancaUnidades({
      id,
      nome,
      genero: generoBase,
      unidadeIds: unidades.map((u) => u.id),
      criadaEm,
      ativa: true,
    });

    alianca.addDomainEvent({
      eventName: 'AliancaUnidadesCriada',
      occurredAt: criadaEm,
      aggregateId: id,
    });

    return alianca;
  }

  public static restaurar(props: AliancaUnidadesProps): AliancaUnidades {
    return new AliancaUnidades(props);
  }

  public get nome(): string {
    return this._nome;
  }

  public get unidadeIds(): ReadonlyArray<string> {
    return this._unidadeIds;
  }

  public get ativa(): boolean {
    return this._ativa;
  }

  public contemUnidade(unidadeId: string): boolean {
    return this._ativa && this._unidadeIds.includes(unidadeId);
  }

  public renomear(novoNome: string): void {
    const limpo = novoNome.trim();
    if (!limpo) {
      throw new DomainError('ALIANCA_NOME_INVALIDO', 'O nome da união de unidades não pode ser vazio.');
    }
    this._nome = limpo;
  }

  public desfazer(): void {
    this._ativa = false;
  }

  public toSnapshot(): AliancaUnidadesProps {
    return {
      id: this.id,
      nome: this._nome,
      genero: this.genero,
      unidadeIds: [...this._unidadeIds],
      criadaEm: this.criadaEm,
      ativa: this._ativa,
    };
  }
}
