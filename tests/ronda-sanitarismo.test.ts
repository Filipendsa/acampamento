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
  it('carrega os 12 turnos da Ronda Noturna e as 6 escalas de Sanitarismo do cartaz oficial', () => {
    const controle = ControleRondaSanitarismo.criar(
      RONDA_NOTURNA_OFICIAL_SEED,
      SANITARISMO_OFICIAL_SEED
    );

    expect(controle.turnosRonda).toHaveLength(12);
    expect(controle.escalasSanitarismo).toHaveLength(6);

    const turnosFilipe = controle.turnosRonda.filter((t) => t.pertenceAoOperador('Filipe'));
    expect(turnosFilipe.map((t) => t.id)).toEqual(['ronda-d1-23h', 'ronda-d3-05h']);

    const escalasPeck = controle.escalasSanitarismo.filter((e) => e.pertenceAoOperador('Peck'));
    expect(escalasPeck).toHaveLength(2);
  });

  it('alterna conclusão de ronda e sanitarismo e converge via SyncEvent', () => {
    const estadoInicial: EstadoAcampamentoPersistido = {
      versaoSchema: 1,
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
      author: 'Filipe',
      createdAt: '2026-11-20T23:05:00Z',
      payload: {
        kind: 'RONDA_TURNO_ALTERNADO',
        turnoId: 'ronda-d1-23h',
        concluido: true,
        concluidoPor: 'Filipe',
        concluidoEm: '2026-11-20T23:05:00Z',
      },
    };

    const evtSanit: SyncEvent = {
      id: 'evt-sanit-1',
      deviceId: 'dev-2',
      author: 'Dani',
      createdAt: '2026-11-20T12:55:00Z',
      payload: {
        kind: 'SANITARISMO_ESCALA_ALTERNADA',
        escalaId: 'san-sexta-1245',
        concluido: true,
        concluidoPor: 'Dani',
        concluidoEm: '2026-11-20T12:55:00Z',
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

    expect(controle.obterTurnoRonda('ronda-d1-23h')?.concluido).toBe(true);
    expect(controle.obterTurnoRonda('ronda-d1-23h')?.concluidoPor).toBe('Filipe');
    expect(controle.obterEscalaSanitarismo('san-sexta-1245')?.concluido).toBe(true);
    expect(controle.obterEscalaSanitarismo('san-sexta-1245')?.concluidoPor).toBe('Dani');
  });
});
