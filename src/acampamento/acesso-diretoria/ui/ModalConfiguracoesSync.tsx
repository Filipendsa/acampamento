import React, { useState } from 'react';
import {
  Cloud,
  CloudOff,
  Download,
  RefreshCw,
  Upload,
  UserCheck,
  Clock,
  X,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { useAcampamento } from '../../../application/AcampamentoStoreContext';
import { OfflineNotificationAdapter } from '../../../shared/infrastructure/notifications/OfflineNotificationAdapter';

interface ModalConfiguracoesSyncProps {
  aberto: boolean;
  onFechar: () => void;
  podeInstalarPwa: boolean;
  onInstalarPwa: () => void;
}

export const ModalConfiguracoesSync: React.FC<ModalConfiguracoesSyncProps> = ({
  aberto,
  onFechar,
  podeInstalarPwa,
  onInstalarPwa,
}) => {
  const {
    sessao,
    definirOperador,
    syncStatus,
    sincronizarAgora,
    configurarEndpointSync,
    exportarBackupJson,
    importarBackupJson,
    simulacaoHorario,
    ativarSimulacaoHorario,
    desativarSimulacaoHorario,
  } = useAcampamento();

  const [nomeOperador, setNomeOperador] = useState(sessao.nomeOperador);
  const [endpointInput, setEndpointInput] = useState(syncStatus.endpointUrl);
  const [simIso, setSimIso] = useState(simulacaoHorario.iso);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [notifPerm, setNotifPerm] = useState(OfflineNotificationAdapter.permissaoAtual());

  if (!aberto) return null;

  const salvarOperador = () => {
    try {
      setErro(null);
      definirOperador(nomeOperador);
      setFeedback('Nome do membro da diretoria atualizado!');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar nome.');
    }
  };

  const handleBaixarBackup = () => {
    const json = exportarBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acampamento-dorina-backup-${new Date().toISOString().slice(0, 16)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback('Backup JSON exportado!');
  };

  const handleImportarBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importarBackupJson(String(reader.result));
        setFeedback('Backup restaurado neste aparelho com sucesso!');
        setErro(null);
      } catch (err) {
        setErro(err instanceof Error ? err.message : 'Arquivo inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleAtivarNotif = async () => {
    const perm = await OfflineNotificationAdapter.solicitarPermissao();
    setNotifPerm(perm);
    if (perm === 'granted') {
      await OfflineNotificationAdapter.notificar(
        'Alertas do Acampamento Ativos!',
        'Você receberá avisos 10 min antes e na hora de cada atividade.',
        'teste-notif'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white">Configurações, Offline & Sincronização</h2>
            <p className="text-xs text-slate-400">Clube Dorina Azevedo • Chácara Morete</p>
          </div>
          <button
            onClick={onFechar}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {feedback && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
        {erro && (
          <div className="mb-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {erro}
          </div>
        )}

        <div className="space-y-5">
          {/* Instalação Offline PWA */}
          <section className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                  <Smartphone className="h-4 w-4" />
                  App Offline no Celular e Notebook
                </h3>
                <p className="mt-1 text-xs text-slate-300">
                  Todo o itinerário, participantes, manuais e seus registros ficam salvos localmente
                  neste aparelho para funcionar mesmo sem internet.
                </p>
              </div>
              {podeInstalarPwa && (
                <button
                  onClick={onInstalarPwa}
                  className="shrink-0 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-emerald-950 hover:bg-emerald-400"
                >
                  Instalar App
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={handleAtivarNotif}
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25"
              >
                {notifPerm === 'granted'
                  ? 'Notificações Ativas (Testar Alerta)'
                  : 'Ativar Notificações do Navegador'}
              </button>
              <span className="text-[11px] text-slate-400">
                Status: {notifPerm === 'granted' ? 'Permitido' : notifPerm}
              </span>
            </div>
          </section>

          {/* Identificação do Membro da Diretoria */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
              <UserCheck className="h-4 w-4 text-amber-400" />
              Seu Nome (Assinatura nos Registros)
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={nomeOperador}
                onChange={(e) => setNomeOperador(e.target.value)}
                placeholder="Ex: Filipe, Dani, Marco..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
              <button
                onClick={salvarOperador}
                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Salvar
              </button>
            </div>
          </section>

          {/* Sincronização Pull & Push */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                {syncStatus.online ? (
                  <Cloud className="h-4 w-4 text-sky-400" />
                ) : (
                  <CloudOff className="h-4 w-4 text-amber-400" />
                )}
                Sincronização Automática (Pull & Push)
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  syncStatus.online
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-amber-500/15 text-amber-300'
                }`}
              >
                {syncStatus.online ? 'Internet Conectada' : 'Modo Offline'}
              </span>
            </div>

            <p className="mb-3 text-xs text-slate-400">
              Armazenamento local ativo. Eventos pendentes para enviar (Push):{' '}
              <strong className="text-white">{syncStatus.pendingCount}</strong>
              {syncStatus.lastSyncedAt && (
                <>
                  {' '}
                  • Última sincronização:{' '}
                  <strong className="text-slate-200">
                    {new Date(syncStatus.lastSyncedAt).toLocaleTimeString('pt-BR')}
                  </strong>
                </>
              )}
            </p>

            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                URL do Servidor de Sync (Opcional — Wi-Fi local ou Nuvem)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={endpointInput}
                  onChange={(e) => setEndpointInput(e.target.value)}
                  placeholder="Ex: http://192.168.0.10:4000/api/sync ou /api/sync"
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                />
                <button
                  onClick={() => {
                    configurarEndpointSync(endpointInput);
                    setFeedback('Endpoint de sincronização salvo!');
                  }}
                  className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Salvar URL
                </button>
              </div>
              <button
                onClick={() => void sincronizarAgora()}
                disabled={!syncStatus.endpointConfigured || !syncStatus.online || syncStatus.syncing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500/20 px-4 py-2.5 text-sm font-semibold text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 disabled:opacity-40"
              >
                <RefreshCw className={`h-4 w-4 ${syncStatus.syncing ? 'animate-spin' : ''}`} />
                {syncStatus.syncing ? 'Sincronizando Pull & Push...' : 'Sincronizar Agora (Pull / Push)'}
              </button>
              {syncStatus.lastError && (
                <p className="text-xs text-rose-400">Erro no sync: {syncStatus.lastError}</p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={handleBaixarBackup}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar Backup JSON
              </button>
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800">
                <Upload className="h-3.5 w-3.5" />
                Importar Backup JSON
                <input type="file" accept=".json" onChange={handleImportarBackup} className="hidden" />
              </label>
            </div>
          </section>

          {/* Simulador de Horário para Testes */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="mb-1.5 flex items-center gap-2 text-sm font-bold text-white">
              <Clock className="h-4 w-4 text-purple-400" />
              Simulador de Horário do Acampamento (Teste)
            </h3>
            <p className="mb-3 text-xs text-slate-400">
              Teste a Central de Avisos e notificações simulando um horário dos dias 20, 21 ou 22/11.
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { rotulo: 'Sex 13:52 (Pré-Desafio)', iso: '2026-11-20T13:52:00' },
                { rotulo: 'Sáb 14:30 (Desafio Sáb)', iso: '2026-11-21T14:30:00' },
                { rotulo: 'Dom 08:55 (Pré-Pista Fio)', iso: '2026-11-22T08:55:00' },
              ].map((preset) => (
                <button
                  key={preset.iso}
                  onClick={() => {
                    setSimIso(preset.iso);
                    ativarSimulacaoHorario(preset.iso);
                  }}
                  className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[11px] font-medium text-purple-200 hover:bg-purple-500/20"
                >
                  {preset.rotulo}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={simIso}
                onChange={(e) => setSimIso(e.target.value)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
              />
              <button
                onClick={() => ativarSimulacaoHorario(simIso)}
                className="rounded-xl bg-purple-500 px-3 py-2 text-xs font-bold text-white hover:bg-purple-400"
              >
                Simular
              </button>
              {simulacaoHorario.ativo && (
                <button
                  onClick={desativarSimulacaoHorario}
                  className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  Hora Real
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
