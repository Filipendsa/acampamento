import { EventoProgramacao } from './EventoProgramacao';

export interface AlertaHorarioDisparo {
  chaveUnica: string;
  tipo: 'PREPARO_10MIN' | 'INICIO_AGORA';
  evento: EventoProgramacao;
  titulo: string;
  corpo: string;
}

export interface PanoramaTemporalAcampamento {
  eventoAtual: EventoProgramacao | null;
  proximoEvento: EventoProgramacao | null;
  minutosRestantesAtual: number | null;
  minutosParaProximo: number | null;
  progressoAtualPercentual: number;
}

export class ServicoAlarmeHorario {
  public static calcularPanorama(
    eventos: ReadonlyArray<EventoProgramacao>,
    agora: Date
  ): PanoramaTemporalAcampamento {
    const ordenados = [...eventos].sort(
      (a, b) => a.inicioDate().getTime() - b.inicioDate().getTime()
    );
    const t = agora.getTime();

    const eventoAtual =
      ordenados.find((ev) => t >= ev.inicioDate().getTime() && t < ev.fimDate().getTime()) ?? null;

    const proximoEvento =
      ordenados.find((ev) => ev.inicioDate().getTime() > t) ?? null;

    let minutosRestantesAtual: number | null = null;
    let progressoAtualPercentual = 0;

    if (eventoAtual) {
      const inicio = eventoAtual.inicioDate().getTime();
      const fim = eventoAtual.fimDate().getTime();
      const total = Math.max(1, fim - inicio);
      minutosRestantesAtual = Math.max(0, Math.ceil((fim - t) / 60000));
      progressoAtualPercentual = Math.min(100, Math.max(0, Math.round(((t - inicio) / total) * 100)));
    }

    const minutosParaProximo = proximoEvento
      ? Math.max(0, Math.ceil((proximoEvento.inicioDate().getTime() - t) / 60000))
      : null;

    return {
      eventoAtual,
      proximoEvento,
      minutosRestantesAtual,
      minutosParaProximo,
      progressoAtualPercentual,
    };
  }

  public static verificarAlertasParaDisparo(
    eventos: ReadonlyArray<EventoProgramacao>,
    agora: Date,
    chavesJaDisparadas: Set<string>
  ): AlertaHorarioDisparo[] {
    const t = agora.getTime();
    const disparos: AlertaHorarioDisparo[] = [];

    for (const evento of eventos) {
      const inicio = evento.inicioDate().getTime();
      const diffMinutos = (inicio - t) / 60000;

      // Aviso de preparo: entre 0.5 e 10 minutos antes de começar
      if (diffMinutos > 0.5 && diffMinutos <= 10) {
        const chave = `${evento.id}_PREP_10`;
        if (!chavesJaDisparadas.has(chave)) {
          disparos.push({
            chaveUnica: chave,
            tipo: 'PREPARO_10MIN',
            evento,
            titulo: `Em ${Math.ceil(diffMinutos)} min: ${evento.titulo}`,
            corpo: `Horário: ${evento.horarioExibicao}${
              evento.responsaveis !== '—' ? ` • Resp.: ${evento.responsaveis}` : ''
            }`,
          });
        }
      }

      // Aviso na hora exata: entre -2 minutos e +0.5 minutos do início
      if (diffMinutos <= 0.5 && diffMinutos >= -2) {
        const chave = `${evento.id}_INICIO`;
        if (!chavesJaDisparadas.has(chave)) {
          disparos.push({
            chaveUnica: chave,
            tipo: 'INICIO_AGORA',
            evento,
            titulo: `Agora (${evento.horarioExibicao}): ${evento.titulo}`,
            corpo:
              evento.responsaveis !== '—'
                ? `Responsáveis: ${evento.responsaveis}`
                : 'Atenção diretoria: atividade iniciando agora!',
          });
        }
      }
    }

    return disparos;
  }
}
