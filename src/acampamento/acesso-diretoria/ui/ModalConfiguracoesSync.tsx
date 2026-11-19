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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0A3D2E]/50 p-0 sm:items-center sm:p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl sm:rounded-3xl border-2 border-[#D8CFBC] bg-[#FAF6EA] p-5 shadow-2xl animate-fade-slide-up">
        <div className="mb-4 flex items-center justify-between border-b border-[#E2DAC7] pb-3">
          <div>
            <h2 className="text-lg font-black text-[#0A3D2E]">
              Configurações, Offline & Sincronização
            </h2>
            <p className="text-xs font-semibold text-[#5C6B64]">
              Clube Dorina Azevedo • Chácara Morete
            </p>
          </div>
          <button
            onClick={onFechar}
            className="rounded-xl p-2 text-[#5C6B64] hover:bg-[#EDE5D3] hover:text-[#0A3D2E]"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {feedback && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}
        {erro && (
          <div className="mb-3 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
            {erro}
          </div>
        )}

        <div className="space-y-4">
          {/* Instalação Offline PWA */}
          <section className="rounded-2xl border-2 border-[#0A3D2E]/20 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#0A3D2E]">
                  <Smartphone className="h-4 w-4 text-[#0E5A36]" />
                  App Offline no Celular e Notebook
                </h3>
                <p className="mt-1 text-xs text-[#4B5B53]">
                  Todo o itinerário, participantes, manuais e registros ficam salvos localmente no
                  aparelho para funcionar 100% sem internet.
                </p>
              </div>
              {podeInstalarPwa && (
                <button
                  onClick={onInstalarPwa}
                  className="shrink-0 rounded-xl bg-[#FACC15] px-3.5 py-2 text-xs font-black text-[#0A3D2E] shadow-sm hover:bg-[#fde047]"
                >
                  Instalar App
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                onClick={handleAtivarNotif}
                className="rounded-xl border border-[#0A3D2E]/25 bg-[#0A3D2E]/10 px-3 py-2 text-xs font-bold text-[#0A3D2E] hover:bg-[#0A3D2E]/15"
              >
                {notifPerm === 'granted'
                  ? 'Notificações Ativas (Testar Alerta)'
                  : 'Ativar Notificações do Navegador'}
              </button>
              <span className="text-[11px] font-semibold text-[#5C6B64]">
                Status: {notifPerm === 'granted' ? 'Permitido' : notifPerm}
              </span>
            </div>
          </section>

          {/* Identificação do Membro da Diretoria */}
          <section className="rounded-2xl border border-[#E2DAC7] bg-white p-4 shadow-sm">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-[#0A3D2E]">
              <UserCheck className="h-4 w-4 text-[#EA580C]" />
              Seu Nome (Assinatura nos Registros)
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={nomeOperador}
                onChange={(e) => setNomeOperador(e.target.value)}
                placeholder="Ex: Filipe, Dani, Marco..."
                className="flex-1 rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2 text-sm font-semibold text-[#0A2E22] focus:border-[#0A3D2E] focus:bg-white focus:outline-none"
              />
              <button
                onClick={salvarOperador}
                className="rounded-xl bg-[#0A3D2E] px-4 py-2 text-sm font-bold text-[#FACC15] hover:bg-[#0F533E]"
              >
                Salvar
              </button>
            </div>
          </section>

          {/* Sincronização Pull & Push (100% gratuita) */}
          <section className="rounded-2xl border border-[#E2DAC7] bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#0A3D2E]">
                {syncStatus.online ? (
                  <Cloud className="h-4 w-4 text-[#0369A1]" />
                ) : (
                  <CloudOff className="h-4 w-4 text-[#EA580C]" />
                )}
                Sincronização Pull & Push (Sem Custo)
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  syncStatus.online
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {syncStatus.online ? 'Internet Conectada' : 'Modo Offline'}
              </span>
            </div>

            <p className="mb-3 text-xs text-[#4B5B53]">
              Eventos pendentes locais (Push):{' '}
              <strong className="text-[#0A3D2E]">{syncStatus.pendingCount}</strong>
              {syncStatus.lastSyncedAt && (
                <>
                  {' '}
                  • Última sync:{' '}
                  <strong className="text-[#0A3D2E]">
                    {new Date(syncStatus.lastSyncedAt).toLocaleTimeString('pt-BR')}
                  </strong>
                </>
              )}
            </p>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C6B64]">
                Endpoint de Sync (Padrão: /api/sync ou Wi-Fi local)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={endpointInput}
                  onChange={(e) => setEndpointInput(e.target.value)}
                  placeholder="/api/sync ou http://192.168.0.10:4000/api/sync"
                  className="flex-1 rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2 text-xs font-medium text-[#0A2E22] focus:border-[#0369A1] focus:bg-white focus:outline-none"
                />
                <button
                  onClick={() => {
                    configurarEndpointSync(endpointInput);
                    setFeedback('Endpoint de sincronização salvo!');
                  }}
                  className="rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2 text-xs font-bold text-[#0A3D2E] hover:bg-[#EFE8D8]"
                >
                  Salvar URL
                </button>
              </div>
              <button
                onClick={() => void sincronizarAgora()}
                disabled={!syncStatus.endpointConfigured || !syncStatus.online || syncStatus.syncing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0369A1] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0284C7] disabled:opacity-40"
              >
                <RefreshCw className={`h-4 w-4 ${syncStatus.syncing ? 'animate-spin' : ''}`} />
                {syncStatus.syncing ? 'Sincronizando Pull & Push...' : 'Sincronizar Agora (Pull / Push)'}
              </button>
              {syncStatus.lastError && (
                <p className="text-xs font-semibold text-rose-600">Erro: {syncStatus.lastError}</p>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-[#E2DAC7] pt-3">
              <button
                onClick={handleBaixarBackup}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2 text-xs font-bold text-[#0A3D2E] hover:bg-[#EFE8D8]"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar Backup JSON
              </button>
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2 text-xs font-bold text-[#0A3D2E] hover:bg-[#EFE8D8]">
                <Upload className="h-3.5 w-3.5" />
                Importar Backup JSON
                <input type="file" accept=".json" onChange={handleImportarBackup} className="hidden" />
              </label>
            </div>
          </section>

          {/* Simulador de Horário */}
          <section className="rounded-2xl border border-[#E2DAC7] bg-white p-4 shadow-sm">
            <h3 className="mb-1.5 flex items-center gap-2 text-sm font-extrabold text-[#0A3D2E]">
              <Clock className="h-4 w-4 text-purple-600" />
              Simulador de Horário (Para Testar Alertas)
            </h3>
            <p className="mb-3 text-xs text-[#4B5B53]">
              Simule qualquer horário dos dias 20, 21 ou 22/11 para testar a Central de Avisos.
            </p>
            <div className="mb-2 flex flex-wrap gap-2">
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
                  className="rounded-lg border border-purple-300 bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-800 hover:bg-purple-100"
                >
                  {preset.rotulo}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="datetime-local"
                value={simIso}
                onChange={(e) => setSimIso(e.target.value)}
                className="flex-1 rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2 text-xs font-semibold text-[#0A2E22]"
              />
              <button
                onClick={() => ativarSimulacaoHorario(simIso)}
                className="rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-700"
              >
                Simular
              </button>
              {simulacaoHorario.ativo && (
                <button
                  onClick={desativarSimulacaoHorario}
                  className="rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2 text-xs font-bold text-[#0A3D2E] hover:bg-[#EFE8D8]"
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
