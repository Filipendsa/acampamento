import { describe, expect, it } from 'vitest';
import { OcorrenciaIndividual } from '../src/acampamento/prontuario-ocorrencias/domain/OcorrenciaIndividual';
import { RepertorioAcampamento } from '../src/acampamento/repertorio-musical/domain/RepertorioAcampamento';
import { UNIDADES_OFICIAIS_SEED } from '../src/acampamento/unidades-e-desbravadores/infrastructure/UnidadesParticipantesSeed';
import { EstadoAcampamentoPersistido, SyncMetaPersistida } from '../src/shared/infrastructure/persistence/IndexedDbStorage';
import { SyncEngine } from '../src/shared/infrastructure/sync/SyncEngine';
import { SyncEvent } from '../src/shared/infrastructure/sync/SyncEvent';

describe('Ocorrências, Repertório Musical e Sincronização Offline-First (Pull & Push)', () => {
  it('registra ocorrência individual por criança e emite evento quando comportamental', () => {
    const oc = OcorrenciaIndividual.registrar({
      id: 'oc-1',
      participanteId: 'p-bryan-parreira',
      participanteNome: 'BRYAN PARREIRA BORGES',
      unidadeId: 'unidade-1-aguia-real',
      unidadeNome: '1_AGUIA REAL',
      tipo: 'COMPORTAMENTO',
      gravidade: 'MODERADA',
      descricao: 'Xingou o colega durante o revezamento.',
      registradoPor: 'Filipe',
      criadoEm: '2026-11-20T14:20:00Z',
    });

    expect(oc.status).toBe('ABERTA');
    const events = oc.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('OcorrenciaComportamentoRegistrada');
  });

  it('permite adicionar, editar e marcar música como tocada na hora', () => {
    const rep = RepertorioAcampamento.restaurar([]);
    const m = rep.adicionarMusica({
      id: 'mus-1',
      titulo: 'Sempre Desbravador',
      momento: 'Cerimônia de Abertura',
      atualizadaEm: '2026-11-20T19:00:00Z',
    });

    m.editar({ titulo: 'Hino Oficial Sempre Desbravador' }, '2026-11-20T19:05:00Z');
    m.alternarTocada('2026-11-20T20:10:00Z');

    expect(rep.musicasAtivas[0].titulo).toBe('Hino Oficial Sempre Desbravador');
    expect(rep.musicasAtivas[0].tocada).toBe(true);
  });

  it('executa Push da outbox local e Pull de eventos remotos sem duplicar', async () => {
    const estadoInicial: EstadoAcampamentoPersistido = {
      versaoSchema: 1,
      unidades: UNIDADES_OFICIAIS_SEED,
      aliancas: [],
      lancamentosPontuacao: [],
      ocorrencias: [],
      musicas: [],
      avisosManuais: [],
      temposPistaFio: [],
    };

    const eventoLocal: SyncEvent = {
      id: 'evt-local-1',
      deviceId: 'dev-a',
      author: 'Filipe',
      createdAt: '2026-11-20T10:00:00Z',
      payload: {
        kind: 'MUSICA_ADICIONADA',
        musica: {
          id: 'mus-local',
          titulo: 'Música da Fogueira',
          momento: 'Momento na Fogueira',
          tocada: false,
          ordem: 1,
          atualizadaEm: '2026-11-20T10:00:00Z',
        },
      },
    };

    const eventoRemoto: SyncEvent = {
      id: 'evt-remoto-2',
      deviceId: 'dev-b',
      author: 'Dani',
      createdAt: '2026-11-20T10:05:00Z',
      payload: {
        kind: 'OCORRENCIA_REGISTRADA',
        ocorrencia: {
          id: 'oc-remota',
          participanteId: 'p-rayssa',
          participanteNome: 'Rayssa',
          unidadeId: 'unidade-3-aguia-dourada',
          unidadeNome: '3_ÁGUIA DOURADA',
          tipo: 'SAUDE',
          gravidade: 'LEVE',
          status: 'ABERTA',
          descricao: 'Dor de cabeça leve após o almoço.',
          registradoPor: 'Dani',
          criadoEm: '2026-11-20T10:05:00Z',
          atualizadoEm: '2026-11-20T10:05:00Z',
        },
      },
    };

    const metaInicial: SyncMetaPersistida = {
      deviceId: 'dev-a',
      syncEndpointUrl: 'http://localhost:4000/api/sync',
      lastPulledAt: null,
      lastSyncedAt: null,
      outbox: [eventoLocal],
      appliedEventIds: ['evt-local-1'],
    };

    const mockFetch = (async (_url: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return new Response(
          JSON.stringify({ acceptedIds: ['evt-local-1'], serverTime: '2026-11-20T10:06:00Z' }),
          { status: 200 }
        );
      }
      return new Response(
        JSON.stringify({
          events: [eventoLocal, eventoRemoto],
          serverTime: '2026-11-20T10:06:00Z',
        }),
        { status: 200 }
      );
    }) as typeof fetch;

    const resultado = await SyncEngine.pushAndPull(estadoInicial, metaInicial, mockFetch);

    expect(resultado.error).toBeNull();
    expect(resultado.pushedCount).toBe(1);
    expect(resultado.pulledCount).toBe(1); // evt-local-1 já estava aplicado, só puxou evt-remoto-2!
    expect(resultado.meta.outbox).toHaveLength(0);
    expect(resultado.estado.ocorrencias).toHaveLength(1);
    expect(resultado.estado.ocorrencias[0].participanteNome).toBe('Rayssa');
  });
});
