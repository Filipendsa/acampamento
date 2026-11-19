import { describe, expect, it } from 'vitest';
import { ItinerarioAcampamento } from '../src/acampamento/programacao-e-avisos/domain/ItinerarioAcampamento';
import { ServicoAlarmeHorario } from '../src/acampamento/programacao-e-avisos/domain/ServicoAlarmeHorario';
import { ITINERARIO_OFICIAL_SEED } from '../src/acampamento/programacao-e-avisos/infrastructure/ItinerarioOficialSeed';

describe('Domínio de Programação, Itinerário e Motor de Alertas', () => {
  const itinerario = ItinerarioAcampamento.criar(ITINERARIO_OFICIAL_SEED);

  it('identifica evento em andamento e próximo evento na Sexta às 13:52', () => {
    const agora = new Date(2026, 10, 20, 13, 52, 0); // 20/11/2026 13:52
    const panorama = ServicoAlarmeHorario.calcularPanorama(itinerario.eventos, agora);

    expect(panorama.eventoAtual?.id).toBe('sex-1300');
    expect(panorama.minutosRestantesAtual).toBe(8);
    expect(panorama.proximoEvento?.id).toBe('sex-1400');
    expect(panorama.minutosParaProximo).toBe(8);
  });

  it('dispara alerta 10 minutos antes e na hora exata sem duplicar', () => {
    const jaDisparadas = new Set<string>();
    const preDesafio = new Date(2026, 10, 20, 13, 52, 0);

    const alertas1 = ServicoAlarmeHorario.verificarAlertasParaDisparo(
      itinerario.eventos,
      preDesafio,
      jaDisparadas
    );
    expect(alertas1).toHaveLength(1);
    expect(alertas1[0].tipo).toBe('PREPARO_10MIN');
    expect(alertas1[0].evento.id).toBe('sex-1400');

    alertas1.forEach((a) => jaDisparadas.add(a.chaveUnica));

    // Mesmo horário novamente não dispara duplicado
    const alertasRep = ServicoAlarmeHorario.verificarAlertasParaDisparo(
      itinerario.eventos,
      preDesafio,
      jaDisparadas
    );
    expect(alertasRep).toHaveLength(0);

    // Na hora exata (14:00) dispara o alerta INICIO_AGORA
    const naHora = new Date(2026, 10, 20, 14, 0, 0);
    const alertasInicio = ServicoAlarmeHorario.verificarAlertasParaDisparo(
      itinerario.eventos,
      naHora,
      jaDisparadas
    );
    expect(alertasInicio).toHaveLength(1);
    expect(alertasInicio[0].tipo).toBe('INICIO_AGORA');
  });
});
