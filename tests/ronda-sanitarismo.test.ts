import { describe, expect, it } from 'vitest';
import { ControleRondaSanitarismo } from '../src/acampamento/ronda-e-sanitarismo/domain/ControleRondaSanitarismo';
import {
  RONDA_NOTURNA_OFICIAL_SEED,
  SANITARISMO_OFICIAL_SEED,
} from '../src/acampamento/ronda-e-sanitarismo/infrastructure/RondaSanitarismoOficialSeed';
import { UNIDADES_OFICIAIS_SEED } from '../src/acampamento/unidades-e-desbravadores/infrastructure/UnidadesParticipantesSeed';
import { EstadoAcampamentoPersistido } from '../src/shared/infrastructure/persistence/IndexedDbStorage';
import { aplicarSyncEventNoEstado } from '../src/shared/infrastructure/sync/SyncEngine';
import { SyncEvent } from '../src/shared/infrastructure/sync/SyncEvent';

describe('Domínio de Ronda Noturna & Sanitarismo', () => {
  it('carrega os 8 turnos da Ronda Noturna (Sexta e Sábado) e as 3 escalas de Sanitarismo do cartaz oficial', () => {
    const controle = ControleRondaSanitarismo.criar(
      RONDA_NOTURNA_OFICIAL_SEED,
      SANITARISMO_OFICIAL_SEED
    );

    expect(controle.turnosRonda).toHaveLength(8);
    expect(controle.escalasSanitarismo).toHaveLength(3);

    const turnosEliene = controle.turnosRonda.filter((t) => t.pertenceAoOperador('Eliene'));
    expect(turnosEliene.map((t) => t.id)).toEqual(['ronda-sex-01h']);

    const escalasEliene = controle.escalasSanitarismo.filter((e) => e.pertenceAoOperador('Eliene'));
    expect(escalasEliene.map((e) => e.id)).toEqual(['san-sexta-1940']);
  });

  it('alterna conclusão de ronda e sanitarismo e converge via SyncEvent', () => {
    const estadoInicial: EstadoAcampamentoPersistido = {
      versaoSchema: 2,
      unidades: UNIDADES_OFICIAIS_SEED,
      aliancas: [],
      lancamentosPontuacao: [],
      ocorrencias: [],
      musicas: [],
      avisosManuais: [],
      temposPistaFio: [],
      rondaChecks: {},
      sanitarismoChecks: {},
    };

    const applied = new Set<string>();
    const evtRonda: SyncEvent = {
      id: 'evt-ronda-1',
      deviceId: 'dev-1',
      author: 'Evelly',
      createdAt: '2026-11-20T23:05:00Z',
      payload: {
        kind: 'RONDA_TURNO_ALTERNADO',
        turnoId: 'ronda-sex-23h',
        concluido: true,
        concluidoPor: 'Evelly',
        concluidoEm: '2026-11-20T23:05:00Z',
      },
    };

    const evtSanit: SyncEvent = {
      id: 'evt-sanit-1',
      deviceId: 'dev-2',
      author: 'Eliene',
      createdAt: '2026-11-20T19:50:00Z',
      payload: {
        kind: 'SANITARISMO_ESCALA_ALTERNADA',
        escalaId: 'san-sexta-1940',
        concluido: true,
        concluidoPor: 'Eliene',
        concluidoEm: '2026-11-20T19:50:00Z',
      },
    };

    let next = aplicarSyncEventNoEstado(estadoInicial, evtRonda, applied);
    next = aplicarSyncEventNoEstado(next, evtSanit, applied);

    const controle = ControleRondaSanitarismo.criar(
      RONDA_NOTURNA_OFICIAL_SEED,
      SANITARISMO_OFICIAL_SEED,
      next.rondaChecks,
      next.sanitarismoChecks
    );

    expect(controle.obterTurnoRonda('ronda-sex-23h')?.concluido).toBe(true);
    expect(controle.obterTurnoRonda('ronda-sex-23h')?.concluidoPor).toBe('Evelly');
    expect(controle.obterEscalaSanitarismo('san-sexta-1940')?.concluido).toBe(true);
    expect(controle.obterEscalaSanitarismo('san-sexta-1940')?.concluidoPor).toBe('Eliene');
  });
});
