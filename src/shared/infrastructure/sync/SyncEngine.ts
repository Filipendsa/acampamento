import { AliancaUnidades } from '../../../acampamento/unidades-e-desbravadores/domain/AliancaUnidades';
import { Participante } from '../../../acampamento/unidades-e-desbravadores/domain/Participante';
import { Unidade } from '../../../acampamento/unidades-e-desbravadores/domain/Unidade';
import { EstadoAcampamentoPersistido, SyncMetaPersistida } from '../persistence/IndexedDbStorage';
import { SyncEvent } from './SyncEvent';

export interface SyncStatusSnapshot {
  online: boolean;
  syncing: boolean;
  endpointConfigured: boolean;
  endpointUrl: string;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
}

export interface PullResponse {
  events: SyncEvent[];
  serverTime: string;
}

export interface PushResponse {
  acceptedIds: string[];
  serverTime: string;
}

/**
 * Aplica deterministicamente um SyncEvent ao snapshot local de forma idempotente.
 * Se dois celulares editarem offline ao mesmo tempo, ambos os eventos convergem sem perda.
 */
export function aplicarSyncEventNoEstado(
  estado: EstadoAcampamentoPersistido,
  event: SyncEvent,
  appliedIdsSet: Set<string>
): EstadoAcampamentoPersistido {
  if (appliedIdsSet.has(event.id)) {
    return estado;
  }

  const next: EstadoAcampamentoPersistido = {
    ...estado,
    unidades: estado.unidades.map((u) => ({ ...u, membros: [...u.membros] })),
    aliancas: [...estado.aliancas],
    lancamentosPontuacao: [...estado.lancamentosPontuacao],
    ocorrencias: [...estado.ocorrencias],
    musicas: [...estado.musicas],
    avisosManuais: [...estado.avisosManuais],
    temposPistaFio: [...estado.temposPistaFio],
    rondaChecks: { ...(estado.rondaChecks ?? {}) },
    sanitarismoChecks: { ...(estado.sanitarismoChecks ?? {}) },
  };

  const payload = event.payload;

  switch (payload.kind) {
    case 'ALIANCA_CRIADA': {
      const existe = next.aliancas.some((a) => a.id === payload.alianca.id);
      if (!existe) {
        // Revalida invariante de gênero no domínio mesmo ao receber via Pull
        const unidadesDaAlianca = next.unidades
          .filter((u) => payload.alianca.unidadeIds.includes(u.id))
          .map((u) => Unidade.criar(u));
        if (unidadesDaAlianca.length >= 2) {
          AliancaUnidades.unir(
            payload.alianca.id,
            unidadesDaAlianca,
            payload.alianca.criadaEm,
            payload.alianca.nome
          );
          next.aliancas.push(payload.alianca);
        }
      }
      break;
    }

    case 'ALIANCA_DESFEITA': {
      next.aliancas = next.aliancas.map((a) =>
        a.id === payload.aliancaId ? { ...a, ativa: false } : a
      );
      break;
    }

    case 'ALIANCA_RENOMEADA': {
      next.aliancas = next.aliancas.map((a) =>
        a.id === payload.aliancaId ? { ...a, nome: payload.novoNome } : a
      );
      break;
    }

    case 'MEMBRO_ADICIONADO': {
      const membroValido = Participante.criar(payload.membro).toSnapshot();
      next.unidades = next.unidades.map((u) => {
        if (u.id !== membroValido.unidadeId) return u;
        if (u.membros.some((m) => m.id === membroValido.id)) return u;
        return { ...u, membros: [...u.membros, membroValido] };
      });
      break;
    }

    case 'OCORRENCIA_REGISTRADA': {
      if (!next.ocorrencias.some((o) => o.id === payload.ocorrencia.id)) {
        next.ocorrencias.unshift(payload.ocorrencia);
      }
      break;
    }

    case 'OCORRENCIA_STATUS_ATUALIZADO': {
      next.ocorrencias = next.ocorrencias.map((o) =>
        o.id === payload.ocorrenciaId
          ? {
              ...o,
              status: payload.status,
              providencia: payload.providencia ?? o.providencia,
              atualizadoEm: payload.atualizadoEm,
            }
          : o
      );
      break;
    }

    case 'OCORRENCIA_REMOVIDA': {
      next.ocorrencias = next.ocorrencias.filter((o) => o.id !== payload.ocorrenciaId);
      break;
    }

    case 'LANCAMENTO_PONTUACAO': {
      if (!next.lancamentosPontuacao.some((l) => l.id === payload.lancamento.id)) {
        next.lancamentosPontuacao.unshift(payload.lancamento);
      }
      break;
    }

    case 'LANCAMENTO_REMOVIDO': {
      next.lancamentosPontuacao = next.lancamentosPontuacao.map((l) =>
        l.id === payload.lancamentoId ? { ...l, removido: true } : l
      );
      break;
    }

    case 'MUSICA_ADICIONADA': {
      if (!next.musicas.some((m) => m.id === payload.musica.id)) {
        next.musicas.push(payload.musica);
      }
      break;
    }

    case 'MUSICA_EDITADA': {
      next.musicas = next.musicas.map((m) =>
        m.id === payload.musicaId
          ? { ...m, ...payload.dados, atualizadaEm: payload.atualizadaEm }
          : m
      );
      break;
    }

    case 'MUSICA_TOCADA_ALTERNADA': {
      next.musicas = next.musicas.map((m) =>
        m.id === payload.musicaId
          ? { ...m, tocada: payload.tocada, atualizadaEm: payload.atualizadaEm }
          : m
      );
      break;
    }

    case 'MUSICA_REMOVIDA': {
      next.musicas = next.musicas.map((m) =>
        m.id === payload.musicaId
          ? { ...m, removida: true, atualizadaEm: payload.atualizadaEm }
          : m
      );
      break;
    }

    case 'AVISO_PUBLICADO': {
      if (!next.avisosManuais.some((a) => a.id === payload.aviso.id)) {
        next.avisosManuais.unshift(payload.aviso);
      }
      break;
    }

    case 'AVISO_REMOVIDO': {
      next.avisosManuais = next.avisosManuais.filter((a) => a.id !== payload.avisoId);
      break;
    }

    case 'TEMPO_PISTA_FIO_REGISTRADO': {
      if (!next.temposPistaFio.some((t) => t.id === payload.registro.id)) {
        next.temposPistaFio.push(payload.registro);
      }
      break;
    }

    case 'RONDA_TURNO_ALTERNADO': {
      next.rondaChecks = {
        ...(next.rondaChecks ?? {}),
        [payload.turnoId]: {
          concluido: payload.concluido,
          concluidoPor: payload.concluidoPor,
          concluidoEm: payload.concluidoEm,
        },
      };
      break;
    }

    case 'SANITARISMO_ESCALA_ALTERNADA': {
      next.sanitarismoChecks = {
        ...(next.sanitarismoChecks ?? {}),
        [payload.escalaId]: {
          concluido: payload.concluido,
          concluidoPor: payload.concluidoPor,
          concluidoEm: payload.concluidoEm,
        },
      };
      break;
    }
  }

  appliedIdsSet.add(event.id);
  return next;
}

export class SyncEngine {
  public static async pushAndPull(
    estadoAtual: EstadoAcampamentoPersistido,
    metaAtual: SyncMetaPersistida,
    fetchImpl: typeof fetch = fetch
  ): Promise<{
    estado: EstadoAcampamentoPersistido;
    meta: SyncMetaPersistida;
    pulledCount: number;
    pushedCount: number;
    error: string | null;
  }> {
    const endpoint = metaAtual.syncEndpointUrl.trim();
    if (!endpoint) {
      return {
        estado: estadoAtual,
        meta: metaAtual,
        pulledCount: 0,
        pushedCount: 0,
        error: null,
      };
    }

    const appliedSet = new Set(metaAtual.appliedEventIds);
    let outbox = [...metaAtual.outbox];
    let pushedCount = 0;

    try {
      // 1. PUSH: envia eventos locais pendentes para o servidor
      if (outbox.length > 0) {
        const pushRes = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: metaAtual.deviceId,
            events: outbox,
          }),
        });

        if (!pushRes.ok) {
          throw new Error(`Push falhou (HTTP ${pushRes.status})`);
        }

        const pushData = (await pushRes.json()) as PushResponse;
        const accepted = new Set(pushData.acceptedIds ?? outbox.map((e) => e.id));
        pushedCount = accepted.size;
        outbox = outbox.filter((e) => !accepted.has(e.id));
      }

      // 2. PULL: busca eventos de outros dispositivos desde o último pull
      const sep = endpoint.includes('?') ? '&' : '?';
      const pullUrl = metaAtual.lastPulledAt
        ? `${endpoint}${sep}since=${encodeURIComponent(metaAtual.lastPulledAt)}`
        : endpoint;

      const pullRes = await fetchImpl(pullUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!pullRes.ok) {
        throw new Error(`Pull falhou (HTTP ${pullRes.status})`);
      }

      const pullData = (await pullRes.json()) as PullResponse;
      const incoming = (pullData.events ?? []).sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt)
      );

      let nextEstado = estadoAtual;
      let pulledCount = 0;

      for (const evt of incoming) {
        if (!appliedSet.has(evt.id)) {
          nextEstado = aplicarSyncEventNoEstado(nextEstado, evt, appliedSet);
          pulledCount += 1;
        }
      }

      const nowIso = pullData.serverTime ?? new Date().toISOString();
      const nextMeta: SyncMetaPersistida = {
        ...metaAtual,
        outbox,
        appliedEventIds: Array.from(appliedSet).slice(-1500),
        lastPulledAt: nowIso,
        lastSyncedAt: new Date().toISOString(),
      };

      return {
        estado: nextEstado,
        meta: nextMeta,
        pulledCount,
        pushedCount,
        error: null,
      };
    } catch (err) {
      return {
        estado: estadoAtual,
        meta: metaAtual,
        pulledCount: 0,
        pushedCount: 0,
        error: err instanceof Error ? err.message : 'Falha de conexão ao sincronizar.',
      };
    }
  }
}
