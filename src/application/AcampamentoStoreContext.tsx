import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SessaoDiretoria } from '../acampamento/acesso-diretoria/domain/SessaoDiretoria';
import { CategoriaLancamento } from '../acampamento/pontuacao-e-disciplina/domain/CategoriaLancamento';
import { PlacarUnidade, ResumoRankingEquipe } from '../acampamento/pontuacao-e-disciplina/domain/PlacarUnidade';
import { ItinerarioAcampamento } from '../acampamento/programacao-e-avisos/domain/ItinerarioAcampamento';
import { PanoramaTemporalAcampamento, ServicoAlarmeHorario } from '../acampamento/programacao-e-avisos/domain/ServicoAlarmeHorario';
import { ITINERARIO_OFICIAL_SEED } from '../acampamento/programacao-e-avisos/infrastructure/ItinerarioOficialSeed';
import { OcorrenciaIndividual } from '../acampamento/prontuario-ocorrencias/domain/OcorrenciaIndividual';
import { GravidadeOcorrencia, StatusOcorrencia, TipoOcorrencia } from '../acampamento/prontuario-ocorrencias/domain/TipoOcorrencia';
import { MomentoMusical, MusicaAcampamentoProps } from '../acampamento/repertorio-musical/domain/MusicaAcampamento';
import { RepertorioAcampamento } from '../acampamento/repertorio-musical/domain/RepertorioAcampamento';
import { ManualAtividade } from '../acampamento/treinamento-campori/domain/ManualAtividade';
import { MANUAIS_CAMPORI_SEED } from '../acampamento/treinamento-campori/infrastructure/ManuaisCamporiSeed';
import { AliancaUnidades } from '../acampamento/unidades-e-desbravadores/domain/AliancaUnidades';
import { PapelParticipante } from '../acampamento/unidades-e-desbravadores/domain/PapelParticipante';
import { Participante } from '../acampamento/unidades-e-desbravadores/domain/Participante';
import { EquipeOperacional, RegraFusaoUnidades } from '../acampamento/unidades-e-desbravadores/domain/RegraFusaoUnidades';
import { Unidade } from '../acampamento/unidades-e-desbravadores/domain/Unidade';
import { UNIDADES_OFICIAIS_SEED } from '../acampamento/unidades-e-desbravadores/infrastructure/UnidadesParticipantesSeed';
import { OfflineNotificationAdapter } from '../shared/infrastructure/notifications/OfflineNotificationAdapter';
import {
  AcampamentoLocalStorage,
  EstadoAcampamentoPersistido,
  SyncMetaPersistida,
} from '../shared/infrastructure/persistence/IndexedDbStorage';
import { aplicarSyncEventNoEstado, SyncEngine, SyncStatusSnapshot } from '../shared/infrastructure/sync/SyncEngine';
import { SyncEvent, SyncEventPayload, TempoBateriaPistaFio } from '../shared/infrastructure/sync/SyncEvent';

function gerarId(prefixo: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefixo}-${Date.now()}-${rand}`;
}

function criarEstadoInicial(): EstadoAcampamentoPersistido {
  return {
    versaoSchema: 1,
    unidades: UNIDADES_OFICIAIS_SEED,
    aliancas: [],
    lancamentosPontuacao: [],
    ocorrencias: [],
    musicas: [],
    avisosManuais: [],
    temposPistaFio: [],
  };
}

function criarSyncMetaInicial(): SyncMetaPersistida {
  const defaultEndpoint =
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SYNC_API_URL ??
    '/api/sync';
  return {
    deviceId: gerarId('dev'),
    syncEndpointUrl: defaultEndpoint,
    lastPulledAt: null,
    lastSyncedAt: null,
    outbox: [],
    appliedEventIds: [],
  };
}

export interface AlertaBannerItem {
  id: string;
  titulo: string;
  corpo: string;
  tipo: 'PREPARO_10MIN' | 'INICIO_AGORA' | 'AVISO_MANUAL';
  criadoEm: string;
}

interface AcampamentoContextValue {
  carregando: boolean;
  agora: Date;
  simulacaoHorario: { ativo: boolean; iso: string };
  ativarSimulacaoHorario: (iso: string) => void;
  desativarSimulacaoHorario: () => void;

  sessao: SessaoDiretoria;
  definirOperador: (nome: string) => void;
  autenticarAdmin: (senha: string) => void;
  bloquearAdmin: () => void;

  unidades: Unidade[];
  aliancas: AliancaUnidades[];
  equipesOperacionais: EquipeOperacional[];
  unirUnidades: (unidadeIds: string[], nomePersonalizado?: string) => void;
  aplicarUnioesPlanejadas: () => void;
  desfazerAlianca: (aliancaId: string) => void;
  renomearAlianca: (aliancaId: string, novoNome: string) => void;
  adicionarMembro: (unidadeId: string, nome: string, papel: PapelParticipante) => void;

  itinerario: ItinerarioAcampamento;
  panorama: PanoramaTemporalAcampamento;
  alertasBanner: AlertaBannerItem[];
  dispensarAlertaBanner: (id: string) => void;
  publicarAvisoManual: (titulo: string, mensagem: string, prioridade: 'NORMAL' | 'URGENTE') => void;
  removerAvisoManual: (id: string) => void;

  manuais: ManualAtividade[];
  temposPistaFio: TempoBateriaPistaFio[];
  registrarTempoPistaFio: (equipeId: string, nomeEquipe: string, duracaoMs: number) => void;

  ocorrencias: OcorrenciaIndividual[];
  registrarOcorrencia: (dados: {
    participanteId: string;
    tipo: TipoOcorrencia;
    gravidade: GravidadeOcorrencia;
    descricao: string;
    providencia?: string;
  }) => OcorrenciaIndividual;
  atualizarStatusOcorrencia: (
    ocorrenciaId: string,
    status: StatusOcorrencia,
    providencia?: string
  ) => void;

  placar: PlacarUnidade;
  rankingEquipes: ResumoRankingEquipe[];
  registrarLancamentoPontuacao: (dados: {
    equipeAlvoId: string;
    categoria: CategoriaLancamento;
    pontos: number;
    motivo: string;
    atividadeRelacionada?: string;
    ocorrenciaOrigemId?: string;
  }) => void;
  removerLancamentoPontuacao: (lancamentoId: string) => void;

  repertorio: RepertorioAcampamento;
  adicionarMusica: (dados: {
    titulo: string;
    interpreteOuOrigem?: string;
    momento: MomentoMusical;
    observacao?: string;
  }) => void;
  editarMusica: (
    musicaId: string,
    dados: Partial<
      Pick<MusicaAcampamentoProps, 'titulo' | 'interpreteOuOrigem' | 'momento' | 'observacao' | 'ordem'>
    >
  ) => void;
  alternarMusicaTocada: (musicaId: string) => void;
  removerMusica: (musicaId: string) => void;

  syncStatus: SyncStatusSnapshot;
  sincronizarAgora: () => Promise<void>;
  configurarEndpointSync: (url: string) => void;
  exportarBackupJson: () => string;
  importarBackupJson: (jsonStr: string) => void;
}

const AcampamentoContext = createContext<AcampamentoContextValue | null>(null);

export const AcampamentoStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [carregando, setCarregando] = useState(true);
  const [estado, setEstado] = useState<EstadoAcampamentoPersistido>(criarEstadoInicial);
  const [syncMeta, setSyncMeta] = useState<SyncMetaPersistida>(criarSyncMetaInicial);
  const [sessao, setSessao] = useState<SessaoDiretoria>(() => SessaoDiretoria.iniciarPadrao());
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncing, setSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [agoraReal, setAgoraReal] = useState<Date>(() => new Date());
  const [simulacaoHorario, setSimulacaoHorario] = useState<{ ativo: boolean; iso: string }>({
    ativo: false,
    iso: '2026-11-20T13:52:00',
  });
  const [alertasBanner, setAlertasBanner] = useState<AlertaBannerItem[]>([]);

  const estadoRef = useRef(estado);
  const metaRef = useRef(syncMeta);
  const sessaoRef = useRef(sessao);
  const alertasDisparadosRef = useRef<Set<string>>(new Set());

  estadoRef.current = estado;
  metaRef.current = syncMeta;
  sessaoRef.current = sessao;

  // Hidratação inicial 100% offline via IndexedDB
  useEffect(() => {
    let ativo = true;
    (async () => {
      const [estadoSalvo, metaSalva, sessaoSalva, alertasSalvos] = await Promise.all([
        AcampamentoLocalStorage.carregarEstado(),
        AcampamentoLocalStorage.carregarSyncMeta(),
        AcampamentoLocalStorage.carregarSessao(),
        AcampamentoLocalStorage.carregarAlertasDisparados(),
      ]);

      if (!ativo) return;

      if (estadoSalvo) {
        setEstado(estadoSalvo);
      } else {
        const inicial = criarEstadoInicial();
        setEstado(inicial);
        await AcampamentoLocalStorage.salvarEstado(inicial);
      }

      if (metaSalva) {
        setSyncMeta(metaSalva);
      } else {
        const metaInicial = criarSyncMetaInicial();
        setSyncMeta(metaInicial);
        await AcampamentoLocalStorage.salvarSyncMeta(metaInicial);
      }

      if (sessaoSalva) {
        setSessao(SessaoDiretoria.restaurar(sessaoSalva));
      }

      alertasDisparadosRef.current = new Set(alertasSalvos);
      setCarregando(false);
    })();

    return () => {
      ativo = false;
    };
  }, []);

  // Relógio de campo a cada 10s
  useEffect(() => {
    const timer = setInterval(() => {
      setAgoraReal(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const executarPushPull = useCallback(async () => {
    const metaAtual = metaRef.current;
    if (!metaAtual.syncEndpointUrl.trim()) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    setSyncing(true);
    const resultado = await SyncEngine.pushAndPull(estadoRef.current, metaAtual);
    setSyncing(false);

    if (resultado.error) {
      setLastSyncError(resultado.error);
      return;
    }

    setLastSyncError(null);
    setEstado(resultado.estado);
    setSyncMeta(resultado.meta);
    await Promise.all([
      AcampamentoLocalStorage.salvarEstado(resultado.estado),
      AcampamentoLocalStorage.salvarSyncMeta(resultado.meta),
    ]);
  }, []);

  // Detecta reconexão com a internet (Wi-Fi da chácara) e dispara Push/Pull automático
  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      void executarPushPull();
    };
    const onOffline = () => setOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    const poll = setInterval(() => {
      if (navigator.onLine && metaRef.current.syncEndpointUrl.trim()) {
        void executarPushPull();
      }
    }, 25000);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      clearInterval(poll);
    };
  }, [executarPushPull]);

  const despacharEventoLocal = useCallback(
    (payload: SyncEventPayload) => {
      const evt: SyncEvent = {
        id: gerarId('evt'),
        deviceId: metaRef.current.deviceId,
        author: sessaoRef.current.nomeOperador,
        createdAt: new Date().toISOString(),
        payload,
      };

      const appliedSet = new Set(metaRef.current.appliedEventIds);
      const nextEstado = aplicarSyncEventNoEstado(estadoRef.current, evt, appliedSet);
      const nextMeta: SyncMetaPersistida = {
        ...metaRef.current,
        outbox: [...metaRef.current.outbox, evt],
        appliedEventIds: Array.from(appliedSet).slice(-1500),
      };

      estadoRef.current = nextEstado;
      metaRef.current = nextMeta;
      setEstado(nextEstado);
      setSyncMeta(nextMeta);

      void AcampamentoLocalStorage.salvarEstado(nextEstado);
      void AcampamentoLocalStorage.salvarSyncMeta(nextMeta);

      if (
        typeof navigator !== 'undefined' &&
        navigator.onLine &&
        nextMeta.syncEndpointUrl.trim()
      ) {
        void executarPushPull();
      }
    },
    [executarPushPull]
  );

  // Construção dos Agregados de Domínio a partir do estado persistido
  const unidades = useMemo(
    () => estado.unidades.map((u) => Unidade.criar(u)),
    [estado.unidades]
  );

  const aliancas = useMemo(
    () => estado.aliancas.map((a) => AliancaUnidades.restaurar(a)),
    [estado.aliancas]
  );

  const equipesOperacionais = useMemo(
    () => RegraFusaoUnidades.resolverEquipesOperacionais(unidades, aliancas),
    [unidades, aliancas]
  );

  const itinerario = useMemo(
    () => ItinerarioAcampamento.criar(ITINERARIO_OFICIAL_SEED, estado.avisosManuais),
    [estado.avisosManuais]
  );

  const manuais = useMemo(
    () => MANUAIS_CAMPORI_SEED.map((m) => ManualAtividade.criar(m)),
    []
  );

  const ocorrencias = useMemo(
    () =>
      estado.ocorrencias
        .map((o) => OcorrenciaIndividual.restaurar(o))
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
    [estado.ocorrencias]
  );

  const placar = useMemo(
    () => PlacarUnidade.restaurar(estado.lancamentosPontuacao),
    [estado.lancamentosPontuacao]
  );

  const repertorio = useMemo(
    () => RepertorioAcampamento.restaurar(estado.musicas),
    [estado.musicas]
  );

  const agora = useMemo(() => {
    if (simulacaoHorario.ativo) {
      return new Date(simulacaoHorario.iso);
    }
    return agoraReal;
  }, [agoraReal, simulacaoHorario]);

  const panorama = useMemo(
    () => ServicoAlarmeHorario.calcularPanorama(itinerario.eventos, agora),
    [itinerario.eventos, agora]
  );

  // Motor de verificação automática de alertas do itinerário
  useEffect(() => {
    if (carregando) return;
    const disparos = ServicoAlarmeHorario.verificarAlertasParaDisparo(
      itinerario.eventos,
      agora,
      alertasDisparadosRef.current
    );
    if (disparos.length === 0) return;

    const novosBanners: AlertaBannerItem[] = [];
    for (const d of disparos) {
      alertasDisparadosRef.current.add(d.chaveUnica);
      novosBanners.push({
        id: d.chaveUnica,
        titulo: d.titulo,
        corpo: d.corpo,
        tipo: d.tipo,
        criadoEm: new Date().toISOString(),
      });
      void OfflineNotificationAdapter.notificar(d.titulo, d.corpo, d.chaveUnica);
    }

    setAlertasBanner((prev) => [...novosBanners, ...prev].slice(0, 6));
    void AcampamentoLocalStorage.salvarAlertasDisparados(
      Array.from(alertasDisparadosRef.current)
    );
  }, [agora, itinerario.eventos, carregando]);

  // Ações de Sessão & RBAC
  const atualizarSessao = useCallback((novaSessao: SessaoDiretoria) => {
    setSessao(novaSessao);
    sessaoRef.current = novaSessao;
    void AcampamentoLocalStorage.salvarSessao(novaSessao.toSnapshot());
  }, []);

  const definirOperador = useCallback(
    (nome: string) => {
      const clone = SessaoDiretoria.restaurar(sessaoRef.current.toSnapshot());
      clone.definirOperador(nome);
      atualizarSessao(clone);
    },
    [atualizarSessao]
  );

  const autenticarAdmin = useCallback(
    (senha: string) => {
      const clone = SessaoDiretoria.restaurar(sessaoRef.current.toSnapshot());
      clone.autenticarAdministrativa(senha, new Date().toISOString());
      atualizarSessao(clone);
    },
    [atualizarSessao]
  );

  const bloquearAdmin = useCallback(() => {
    const clone = SessaoDiretoria.restaurar(sessaoRef.current.toSnapshot());
    clone.bloquearAdministrativa();
    atualizarSessao(clone);
  }, [atualizarSessao]);

  // Ações de Unidades & Alianças
  const unirUnidades = useCallback(
    (unidadeIds: string[], nomePersonalizado?: string) => {
      const selecionadas = unidades.filter((u) => unidadeIds.includes(u.id));
      RegraFusaoUnidades.validarUniaoDisponivel(selecionadas, aliancas);
      const alianca = AliancaUnidades.unir(
        gerarId('alianca'),
        selecionadas,
        new Date().toISOString(),
        nomePersonalizado
      );
      despacharEventoLocal({ kind: 'ALIANCA_CRIADA', alianca: alianca.toSnapshot() });
    },
    [unidades, aliancas, despacharEventoLocal]
  );

  const aplicarUnioesPlanejadas = useCallback(() => {
    const pares = [
      ['unidade-1-harpia', 'unidade-2-coruja'],
      ['unidade-3-aguia-dourada', 'unidade-4-falcao-peregrino'],
      ['unidade-1-aguia-real', 'unidade-3-aguia-negra'],
    ];
    for (const par of pares) {
      const jaTemAlgumaUnida = aliancas.some(
        (a) => a.ativa && par.some((uid) => a.unidadeIds.includes(uid))
      );
      if (jaTemAlgumaUnida) continue;
      const selecionadas = unidades.filter((u) => par.includes(u.id));
      if (selecionadas.length === 2) {
        const alianca = AliancaUnidades.unir(
          gerarId('alianca'),
          selecionadas,
          new Date().toISOString()
        );
        despacharEventoLocal({ kind: 'ALIANCA_CRIADA', alianca: alianca.toSnapshot() });
      }
    }
  }, [unidades, aliancas, despacharEventoLocal]);

  const desfazerAlianca = useCallback(
    (aliancaId: string) => {
      despacharEventoLocal({ kind: 'ALIANCA_DESFEITA', aliancaId });
    },
    [despacharEventoLocal]
  );

  const renomearAlianca = useCallback(
    (aliancaId: string, novoNome: string) => {
      const alvo = aliancas.find((a) => a.id === aliancaId);
      if (!alvo) return;
      alvo.renomear(novoNome);
      despacharEventoLocal({ kind: 'ALIANCA_RENOMEADA', aliancaId, novoNome: alvo.nome });
    },
    [aliancas, despacharEventoLocal]
  );

  const adicionarMembro = useCallback(
    (unidadeId: string, nome: string, papel: PapelParticipante) => {
      const novo = Participante.criar({
        id: gerarId('membro'),
        nome,
        papel,
        unidadeId,
      });
      despacharEventoLocal({ kind: 'MEMBRO_ADICIONADO', membro: novo.toSnapshot() });
    },
    [despacharEventoLocal]
  );

  // Ações de Ocorrências
  const registrarOcorrencia = useCallback(
    (dados: {
      participanteId: string;
      tipo: TipoOcorrencia;
      gravidade: GravidadeOcorrencia;
      descricao: string;
      providencia?: string;
    }) => {
      let participanteEncontrado: Participante | undefined;
      let unidadeEncontrada: Unidade | undefined;

      for (const u of unidades) {
        const m = u.membros.find((x) => x.id === dados.participanteId);
        if (m) {
          participanteEncontrado = m;
          unidadeEncontrada = u;
          break;
        }
      }

      const nova = OcorrenciaIndividual.registrar({
        id: gerarId('ocorr'),
        participanteId: participanteEncontrado?.id ?? '',
        participanteNome: participanteEncontrado?.nome ?? '',
        unidadeId: unidadeEncontrada?.id ?? '',
        unidadeNome: unidadeEncontrada?.nomeExibicao ?? '',
        tipo: dados.tipo,
        gravidade: dados.gravidade,
        descricao: dados.descricao,
        providencia: dados.providencia,
        registradoPor: sessaoRef.current.nomeOperador,
        criadoEm: new Date().toISOString(),
      });

      despacharEventoLocal({ kind: 'OCORRENCIA_REGISTRADA', ocorrencia: nova.toSnapshot() });
      return nova;
    },
    [unidades, despacharEventoLocal]
  );

  const atualizarStatusOcorrencia = useCallback(
    (ocorrenciaId: string, status: StatusOcorrencia, providencia?: string) => {
      const alvo = ocorrencias.find((o) => o.id === ocorrenciaId);
      if (!alvo) return;
      const agoraIso = new Date().toISOString();
      alvo.atualizarStatus(status, providencia, agoraIso);
      despacharEventoLocal({
        kind: 'OCORRENCIA_STATUS_ATUALIZADO',
        ocorrenciaId,
        status,
        providencia: alvo.providencia,
        atualizadoEm: agoraIso,
      });
    },
    [ocorrencias, despacharEventoLocal]
  );

  // Ações de Pontuação (Restritas à Diretoria Administrativa)
  const rankingEquipes = useMemo(() => {
    if (!sessao.isAdministrativa) return [];
    return placar.calcularRanking(sessao, equipesOperacionais);
  }, [sessao, placar, equipesOperacionais]);

  const registrarLancamentoPontuacao = useCallback(
    (dados: {
      equipeAlvoId: string;
      categoria: CategoriaLancamento;
      pontos: number;
      motivo: string;
      atividadeRelacionada?: string;
      ocorrenciaOrigemId?: string;
    }) => {
      const equipe = equipesOperacionais.find((e) => e.id === dados.equipeAlvoId);
      const lancamento = placar.registrarLancamento(sessaoRef.current, {
        id: gerarId('pts'),
        equipeAlvoId: dados.equipeAlvoId,
        unidadeIdsEnvolvidas: equipe ? equipe.unidadeIds : [dados.equipeAlvoId],
        nomeEquipe: equipe ? equipe.nome : dados.equipeAlvoId,
        categoria: dados.categoria,
        pontos: dados.pontos,
        motivo: dados.motivo,
        atividadeRelacionada: dados.atividadeRelacionada,
        autor: sessaoRef.current.nomeOperador,
        criadoEm: new Date().toISOString(),
        ocorrenciaOrigemId: dados.ocorrenciaOrigemId,
      });
      despacharEventoLocal({ kind: 'LANCAMENTO_PONTUACAO', lancamento: lancamento.toSnapshot() });
    },
    [equipesOperacionais, placar, despacharEventoLocal]
  );

  const removerLancamentoPontuacao = useCallback(
    (lancamentoId: string) => {
      placar.removerLancamento(sessaoRef.current, lancamentoId);
      despacharEventoLocal({ kind: 'LANCAMENTO_REMOVIDO', lancamentoId });
    },
    [placar, despacharEventoLocal]
  );

  // Ações de Repertório Musical
  const adicionarMusica = useCallback(
    (dados: {
      titulo: string;
      interpreteOuOrigem?: string;
      momento: MomentoMusical;
      observacao?: string;
    }) => {
      const musica = repertorio.adicionarMusica({
        id: gerarId('mus'),
        titulo: dados.titulo,
        interpreteOuOrigem: dados.interpreteOuOrigem,
        momento: dados.momento,
        observacao: dados.observacao,
        atualizadaEm: new Date().toISOString(),
      });
      despacharEventoLocal({ kind: 'MUSICA_ADICIONADA', musica: musica.toSnapshot() });
    },
    [repertorio, despacharEventoLocal]
  );

  const editarMusica = useCallback(
    (
      musicaId: string,
      dados: Partial<
        Pick<MusicaAcampamentoProps, 'titulo' | 'interpreteOuOrigem' | 'momento' | 'observacao' | 'ordem'>
      >
    ) => {
      const alvo = repertorio.obterPorId(musicaId);
      if (!alvo) return;
      const agoraIso = new Date().toISOString();
      alvo.editar(dados, agoraIso);
      despacharEventoLocal({
        kind: 'MUSICA_EDITADA',
        musicaId,
        dados,
        atualizadaEm: agoraIso,
      });
    },
    [repertorio, despacharEventoLocal]
  );

  const alternarMusicaTocada = useCallback(
    (musicaId: string) => {
      const alvo = repertorio.obterPorId(musicaId);
      if (!alvo) return;
      const agoraIso = new Date().toISOString();
      alvo.alternarTocada(agoraIso);
      despacharEventoLocal({
        kind: 'MUSICA_TOCADA_ALTERNADA',
        musicaId,
        tocada: alvo.tocada,
        atualizadaEm: agoraIso,
      });
    },
    [repertorio, despacharEventoLocal]
  );

  const removerMusica = useCallback(
    (musicaId: string) => {
      const alvo = repertorio.obterPorId(musicaId);
      if (!alvo) return;
      const agoraIso = new Date().toISOString();
      alvo.remover(agoraIso);
      despacharEventoLocal({
        kind: 'MUSICA_REMOVIDA',
        musicaId,
        atualizadaEm: agoraIso,
      });
    },
    [repertorio, despacharEventoLocal]
  );

  // Avisos Manuais & Tempos Pista de Fio
  const publicarAvisoManual = useCallback(
    (titulo: string, mensagem: string, prioridade: 'NORMAL' | 'URGENTE') => {
      const aviso = {
        id: gerarId('aviso'),
        titulo: titulo.trim(),
        mensagem: mensagem.trim(),
        criadoEm: new Date().toISOString(),
        autor: sessaoRef.current.nomeOperador,
        prioridade,
      };
      itinerario.publicarAvisoManual(aviso);
      despacharEventoLocal({ kind: 'AVISO_PUBLICADO', aviso });
    },
    [itinerario, despacharEventoLocal]
  );

  const removerAvisoManual = useCallback(
    (avisoId: string) => {
      despacharEventoLocal({ kind: 'AVISO_REMOVIDO', avisoId });
    },
    [despacharEventoLocal]
  );

  const registrarTempoPistaFio = useCallback(
    (equipeId: string, nomeEquipe: string, duracaoMs: number) => {
      const registro: TempoBateriaPistaFio = {
        id: gerarId('tempo'),
        equipeId,
        nomeEquipe,
        duracaoMs,
        registradoEm: new Date().toISOString(),
        registradoPor: sessaoRef.current.nomeOperador,
      };
      despacharEventoLocal({ kind: 'TEMPO_PISTA_FIO_REGISTRADO', registro });
    },
    [despacharEventoLocal]
  );

  // Sync Manual + Export/Import JSON
  const configurarEndpointSync = useCallback((url: string) => {
    const nextMeta: SyncMetaPersistida = {
      ...metaRef.current,
      syncEndpointUrl: url.trim(),
    };
    metaRef.current = nextMeta;
    setSyncMeta(nextMeta);
    void AcampamentoLocalStorage.salvarSyncMeta(nextMeta);
  }, []);

  const exportarBackupJson = useCallback(() => {
    return JSON.stringify(
      {
        exportadoEm: new Date().toISOString(),
        clube: 'Dorina Azevedo',
        estado: estadoRef.current,
      },
      null,
      2
    );
  }, []);

  const importarBackupJson = useCallback((jsonStr: string) => {
    const parsed = JSON.parse(jsonStr) as { estado?: EstadoAcampamentoPersistido };
    if (!parsed.estado || !Array.isArray(parsed.estado.unidades)) {
      throw new Error('Arquivo de backup inválido.');
    }
    estadoRef.current = parsed.estado;
    setEstado(parsed.estado);
    void AcampamentoLocalStorage.salvarEstado(parsed.estado);
  }, []);

  const syncStatus: SyncStatusSnapshot = useMemo(
    () => ({
      online,
      syncing,
      endpointConfigured: Boolean(syncMeta.syncEndpointUrl.trim()),
      endpointUrl: syncMeta.syncEndpointUrl,
      pendingCount: syncMeta.outbox.length,
      lastSyncedAt: syncMeta.lastSyncedAt,
      lastError: lastSyncError,
    }),
    [online, syncing, syncMeta, lastSyncError]
  );

  const value: AcampamentoContextValue = {
    carregando,
    agora,
    simulacaoHorario,
    ativarSimulacaoHorario: (iso: string) => setSimulacaoHorario({ ativo: true, iso }),
    desativarSimulacaoHorario: () => setSimulacaoHorario((s) => ({ ...s, ativo: false })),
    sessao,
    definirOperador,
    autenticarAdmin,
    bloquearAdmin,
    unidades,
    aliancas,
    equipesOperacionais,
    unirUnidades,
    aplicarUnioesPlanejadas,
    desfazerAlianca,
    renomearAlianca,
    adicionarMembro,
    itinerario,
    panorama,
    alertasBanner,
    dispensarAlertaBanner: (id: string) =>
      setAlertasBanner((prev) => prev.filter((a) => a.id !== id)),
    publicarAvisoManual,
    removerAvisoManual,
    manuais,
    temposPistaFio: estado.temposPistaFio,
    registrarTempoPistaFio,
    ocorrencias,
    registrarOcorrencia,
    atualizarStatusOcorrencia,
    placar,
    rankingEquipes,
    registrarLancamentoPontuacao,
    removerLancamentoPontuacao,
    repertorio,
    adicionarMusica,
    editarMusica,
    alternarMusicaTocada,
    removerMusica,
    syncStatus,
    sincronizarAgora: executarPushPull,
    configurarEndpointSync,
    exportarBackupJson,
    importarBackupJson,
  };

  return <AcampamentoContext.Provider value={value}>{children}</AcampamentoContext.Provider>;
};

export function useAcampamento(): AcampamentoContextValue {
  const ctx = useContext(AcampamentoContext);
  if (!ctx) {
    throw new Error('useAcampamento deve ser usado dentro de AcampamentoStoreProvider');
  }
  return ctx;
}
