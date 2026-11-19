import { DomainError } from '../../../shared/domain/DomainError';
import { Entity } from '../../../shared/domain/Entity';

export const MOMENTOS_MUSICAIS = [
  'Cerimônia de Abertura',
  'Momento na Fogueira',
  'Culto de Sábado',
  'Especialidade de Música',
  'Coquetel e Oscar DBV 2026',
  'Louvor de Domingo',
  'Cerimônia de Encerramento',
  'Geral / Livre',
] as const;

export type MomentoMusical = (typeof MOMENTOS_MUSICAIS)[number];

export interface MusicaAcampamentoProps {
  id: string;
  titulo: string;
  interpreteOuOrigem?: string;
  momento: MomentoMusical;
  observacao?: string;
  tocada: boolean;
  ordem: number;
  atualizadaEm: string;
  removida?: boolean;
}

export class MusicaAcampamento extends Entity<string> {
  private _titulo: string;
  private _interpreteOuOrigem?: string;
  private _momento: MomentoMusical;
  private _observacao?: string;
  private _tocada: boolean;
  private _ordem: number;
  private _atualizadaEm: string;
  private _removida: boolean;

  private constructor(props: MusicaAcampamentoProps) {
    super(props.id);
    this._titulo = props.titulo;
    this._interpreteOuOrigem = props.interpreteOuOrigem;
    this._momento = props.momento;
    this._observacao = props.observacao;
    this._tocada = props.tocada;
    this._ordem = props.ordem;
    this._atualizadaEm = props.atualizadaEm;
    this._removida = Boolean(props.removida);
  }

  public static criar(props: MusicaAcampamentoProps): MusicaAcampamento {
    const tituloLimpo = props.titulo.trim();
    if (tituloLimpo.length < 2) {
      throw new DomainError('MUSICA_TITULO_INVALIDO', 'Informe o nome da música.');
    }
    return new MusicaAcampamento({
      ...props,
      titulo: tituloLimpo,
      interpreteOuOrigem: props.interpreteOuOrigem?.trim() || undefined,
      observacao: props.observacao?.trim() || undefined,
    });
  }

  public get titulo(): string {
    return this._titulo;
  }

  public get interpreteOuOrigem(): string | undefined {
    return this._interpreteOuOrigem;
  }

  public get momento(): MomentoMusical {
    return this._momento;
  }

  public get observacao(): string | undefined {
    return this._observacao;
  }

  public get tocada(): boolean {
    return this._tocada;
  }

  public get ordem(): number {
    return this._ordem;
  }

  public get atualizadaEm(): string {
    return this._atualizadaEm;
  }

  public get removida(): boolean {
    return this._removida;
  }

  public editar(
    dados: Partial<Pick<MusicaAcampamentoProps, 'titulo' | 'interpreteOuOrigem' | 'momento' | 'observacao' | 'ordem'>>,
    agoraIso: string
  ): void {
    if (dados.titulo !== undefined) {
      const limpo = dados.titulo.trim();
      if (limpo.length < 2) {
        throw new DomainError('MUSICA_TITULO_INVALIDO', 'O título da música é obrigatório.');
      }
      this._titulo = limpo;
    }
    if (dados.interpreteOuOrigem !== undefined) {
      this._interpreteOuOrigem = dados.interpreteOuOrigem.trim() || undefined;
    }
    if (dados.momento !== undefined) {
      this._momento = dados.momento;
    }
    if (dados.observacao !== undefined) {
      this._observacao = dados.observacao.trim() || undefined;
    }
    if (dados.ordem !== undefined) {
      this._ordem = dados.ordem;
    }
    this._atualizadaEm = agoraIso;
  }

  public alternarTocada(agoraIso: string): void {
    this._tocada = !this._tocada;
    this._atualizadaEm = agoraIso;
  }

  public remover(agoraIso: string): void {
    this._removida = true;
    this._atualizadaEm = agoraIso;
  }

  public toSnapshot(): MusicaAcampamentoProps {
    return {
      id: this.id,
      titulo: this._titulo,
      interpreteOuOrigem: this._interpreteOuOrigem,
      momento: this._momento,
      observacao: this._observacao,
      tocada: this._tocada,
      ordem: this._ordem,
      atualizadaEm: this._atualizadaEm,
      removida: this._removida,
    };
  }
}
