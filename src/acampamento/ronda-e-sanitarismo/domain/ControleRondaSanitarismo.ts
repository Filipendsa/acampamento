import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { EscalaSanitarismo, EscalaSanitarismoProps } from './EscalaSanitarismo';
import { TurnoRondaNoturna, TurnoRondaNoturnaProps } from './TurnoRondaNoturna';

export interface CheckConclusaoItem {
  concluido: boolean;
  concluidoPor?: string;
  concluidoEm?: string;
}

export class ControleRondaSanitarismo extends AggregateRoot<string> {
  private readonly _turnosRonda: TurnoRondaNoturna[];
  private readonly _escalasSanitarismo: EscalaSanitarismo[];

  private constructor(
    turnosRonda: TurnoRondaNoturna[],
    escalasSanitarismo: EscalaSanitarismo[]
  ) {
    super('controle-ronda-sanitarismo');
    this._turnosRonda = turnosRonda;
    this._escalasSanitarismo = escalasSanitarismo;
  }

  public static criar(
    turnosSeed: ReadonlyArray<TurnoRondaNoturnaProps>,
    escalasSeed: ReadonlyArray<EscalaSanitarismoProps>,
    checksRonda: Record<string, CheckConclusaoItem> = {},
    checksSanitarismo: Record<string, CheckConclusaoItem> = {}
  ): ControleRondaSanitarismo {
    const turnos = turnosSeed.map((t) => {
      const check = checksRonda[t.id];
      return TurnoRondaNoturna.criar({
        ...t,
        concluido: check?.concluido ?? false,
        concluidoPor: check?.concluidoPor,
        concluidoEm: check?.concluidoEm,
      });
    });

    const escalas = escalasSeed.map((e) => {
      const check = checksSanitarismo[e.id];
      return EscalaSanitarismo.criar({
        ...e,
        concluido: check?.concluido ?? false,
        concluidoPor: check?.concluidoPor,
        concluidoEm: check?.concluidoEm,
      });
    });

    return new ControleRondaSanitarismo(turnos, escalas);
  }

  public get turnosRonda(): ReadonlyArray<TurnoRondaNoturna> {
    return this._turnosRonda;
  }

  public get escalasSanitarismo(): ReadonlyArray<EscalaSanitarismo> {
    return this._escalasSanitarismo;
  }

  public obterTurnoRonda(turnoId: string): TurnoRondaNoturna | undefined {
    return this._turnosRonda.find((t) => t.id === turnoId);
  }

  public obterEscalaSanitarismo(escalaId: string): EscalaSanitarismo | undefined {
    return this._escalasSanitarismo.find((e) => e.id === escalaId);
  }
}
