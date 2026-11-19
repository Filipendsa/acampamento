import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { MomentoMusical, MusicaAcampamento, MusicaAcampamentoProps } from './MusicaAcampamento';

export class RepertorioAcampamento extends AggregateRoot<string> {
  private _musicas: MusicaAcampamento[];

  private constructor(musicas: MusicaAcampamento[]) {
    super('repertorio-acampamento-2026');
    this._musicas = musicas;
  }

  public static restaurar(itens: MusicaAcampamentoProps[]): RepertorioAcampamento {
    return new RepertorioAcampamento(itens.map((m) => MusicaAcampamento.criar(m)));
  }

  public get musicasAtivas(): ReadonlyArray<MusicaAcampamento> {
    return this._musicas
      .filter((m) => !m.removida)
      .sort((a, b) => a.ordem - b.ordem || a.titulo.localeCompare(b.titulo));
  }

  public porMomento(momento: MomentoMusical): ReadonlyArray<MusicaAcampamento> {
    return this.musicasAtivas.filter((m) => m.momento === momento);
  }

  public adicionarMusica(
    props: Omit<MusicaAcampamentoProps, 'ordem' | 'tocada'>
  ): MusicaAcampamento {
    const proximaOrdem =
      this.musicasAtivas.length > 0
        ? Math.max(...this.musicasAtivas.map((m) => m.ordem)) + 1
        : 1;

    const musica = MusicaAcampamento.criar({
      ...props,
      tocada: false,
      ordem: proximaOrdem,
    });
    this._musicas = [...this._musicas, musica];
    return musica;
  }

  public obterPorId(id: string): MusicaAcampamento | undefined {
    return this._musicas.find((m) => m.id === id);
  }
}
