import { AvisoCentralProps } from '../../../acampamento/programacao-e-avisos/domain/ItinerarioAcampamento';
import { LancamentoPontuacaoProps } from '../../../acampamento/pontuacao-e-disciplina/domain/LancamentoPontuacao';
import { OcorrenciaIndividualProps } from '../../../acampamento/prontuario-ocorrencias/domain/OcorrenciaIndividual';
import { MusicaAcampamentoProps } from '../../../acampamento/repertorio-musical/domain/MusicaAcampamento';
import { AliancaUnidadesProps } from '../../../acampamento/unidades-e-desbravadores/domain/AliancaUnidades';
import { UnidadeProps } from '../../../acampamento/unidades-e-desbravadores/domain/Unidade';
import { SessaoDiretoriaProps } from '../../../acampamento/acesso-diretoria/domain/SessaoDiretoria';
import { CheckConclusaoItem } from '../../../acampamento/ronda-e-sanitarismo/domain/ControleRondaSanitarismo';
import { SyncEvent, TempoBateriaPistaFio } from '../sync/SyncEvent';

export interface EstadoAcampamentoPersistido {
  versaoSchema: number;
  unidades: UnidadeProps[];
  aliancas: AliancaUnidadesProps[];
  lancamentosPontuacao: LancamentoPontuacaoProps[];
  ocorrencias: OcorrenciaIndividualProps[];
  musicas: MusicaAcampamentoProps[];
  avisosManuais: AvisoCentralProps[];
  temposPistaFio: TempoBateriaPistaFio[];
  rondaChecks?: Record<string, CheckConclusaoItem>;
  sanitarismoChecks?: Record<string, CheckConclusaoItem>;
}

export interface SyncMetaPersistida {
  deviceId: string;
  syncEndpointUrl: string;
  lastPulledAt: string | null;
  lastSyncedAt: string | null;
  outbox: SyncEvent[];
  appliedEventIds: string[];
}

const DB_NAME = 'dorina_acampamento_2026_db';
const DB_VERSION = 1;
const STORE_KV = 'kv_store';

const KEY_ESTADO = 'estado_acampamento';
const KEY_SYNC_META = 'sync_meta';
const KEY_SESSAO = 'sessao_diretoria';
const KEY_ALERTAS_DISPARADOS = 'alertas_disparados';

const memoryFallback = new Map<string, unknown>();

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_KV)) {
        db.createObjectStore(STORE_KV);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | null> {
  if (!hasIndexedDb()) {
    return (memoryFallback.get(key) as T | undefined) ?? null;
  }
  try {
    const db = await openDb();
    return await new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(STORE_KV, 'readonly');
      const store = tx.objectStore(STORE_KV);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return (memoryFallback.get(key) as T | undefined) ?? null;
  }
}

async function idbSet<T>(key: string, value: T): Promise<void> {
  memoryFallback.set(key, value);
  if (!hasIndexedDb()) return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_KV, 'readwrite');
      const store = tx.objectStore(STORE_KV);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // fallback in memory already saved
  }
}

export class AcampamentoLocalStorage {
  public static async carregarEstado(): Promise<EstadoAcampamentoPersistido | null> {
    return idbGet<EstadoAcampamentoPersistido>(KEY_ESTADO);
  }

  public static async salvarEstado(estado: EstadoAcampamentoPersistido): Promise<void> {
    return idbSet(KEY_ESTADO, estado);
  }

  public static async carregarSyncMeta(): Promise<SyncMetaPersistida | null> {
    return idbGet<SyncMetaPersistida>(KEY_SYNC_META);
  }

  public static async salvarSyncMeta(meta: SyncMetaPersistida): Promise<void> {
    return idbSet(KEY_SYNC_META, meta);
  }

  public static async carregarSessao(): Promise<SessaoDiretoriaProps | null> {
    return idbGet<SessaoDiretoriaProps>(KEY_SESSAO);
  }

  public static async salvarSessao(sessao: SessaoDiretoriaProps): Promise<void> {
    return idbSet(KEY_SESSAO, sessao);
  }

  public static async carregarAlertasDisparados(): Promise<string[]> {
    return (await idbGet<string[]>(KEY_ALERTAS_DISPARADOS)) ?? [];
  }

  public static async salvarAlertasDisparados(chaves: string[]): Promise<void> {
    return idbSet(KEY_ALERTAS_DISPARADOS, chaves);
  }
}
