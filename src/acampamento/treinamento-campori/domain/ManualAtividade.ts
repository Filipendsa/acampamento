import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { DataDiaAcampamento } from '../../programacao-e-avisos/domain/DiaAcampamento';

export interface EstacaoManual {
  titulo: string;
  subtitulo?: string;
  passos: string[];
}

export interface ManualAtividadeProps {
  id: string;
  dia: DataDiaAcampamento;
  horario: string;
  titulo: string;
  coordenacao: string;
  pegada: string;
  inspiracaoCampori: string;
  usoEspaco: string;
  notaSeguranca?: string;
  estacoes: EstacaoManual[];
  possuiRoletaClasses?: boolean;
  possuiTabelaClasses?: boolean;
  possuiNosAsCegas?: boolean;
  possuiCronometroBateria?: boolean;
}

export class ManualAtividade extends AggregateRoot<string> {
  public readonly dia: DataDiaAcampamento;
  public readonly horario: string;
  public readonly titulo: string;
  public readonly coordenacao: string;
  public readonly pegada: string;
  public readonly inspiracaoCampori: string;
  public readonly usoEspaco: string;
  public readonly notaSeguranca?: string;
  public readonly estacoes: ReadonlyArray<EstacaoManual>;
  public readonly possuiRoletaClasses: boolean;
  public readonly possuiTabelaClasses: boolean;
  public readonly possuiNosAsCegas: boolean;
  public readonly possuiCronometroBateria: boolean;

  private constructor(props: ManualAtividadeProps) {
    super(props.id);
    this.dia = props.dia;
    this.horario = props.horario;
    this.titulo = props.titulo;
    this.coordenacao = props.coordenacao;
    this.pegada = props.pegada;
    this.inspiracaoCampori = props.inspiracaoCampori;
    this.usoEspaco = props.usoEspaco;
    this.notaSeguranca = props.notaSeguranca;
    this.estacoes = props.estacoes;
    this.possuiRoletaClasses = Boolean(props.possuiRoletaClasses);
    this.possuiTabelaClasses = Boolean(props.possuiTabelaClasses);
    this.possuiNosAsCegas = Boolean(props.possuiNosAsCegas);
    this.possuiCronometroBateria = Boolean(props.possuiCronometroBateria);
  }

  public static criar(props: ManualAtividadeProps): ManualAtividade {
    return new ManualAtividade(props);
  }
}
