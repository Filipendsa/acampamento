import React, { useState } from 'react';
import {
  Bell,
  BookOpen,
  Clock,
  Megaphone,
  Music,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { useAcampamento } from '../../../application/AcampamentoStoreContext';
import { OfflineNotificationAdapter } from '../../../shared/infrastructure/notifications/OfflineNotificationAdapter';

interface CentralAvisosBannerProps {
  onAbrirManual: (manualId: string) => void;
  onAbrirMusicasMomento: (momento: string) => void;
}

function formatarMinutos(min: number | null): string {
  if (min === null) return '';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export const CentralAvisosBanner: React.FC<CentralAvisosBannerProps> = ({
  onAbrirManual,
  onAbrirMusicasMomento,
}) => {
  const {
    agora,
    simulacaoHorario,
    desativarSimulacaoHorario,
    panorama,
    alertasBanner,
    dispensarAlertaBanner,
    itinerario,
    publicarAvisoManual,
    removerAvisoManual,
  } = useAcampamento();

  const [mostrarFormAviso, setMostrarFormAviso] = useState(false);
  const [tituloAviso, setTituloAviso] = useState('');
  const [msgAviso, setMsgAviso] = useState('');
  const [prioridadeAviso, setPrioridadeAviso] = useState<'NORMAL' | 'URGENTE'>('NORMAL');
  const [erroAviso, setErroAviso] = useState<string | null>(null);
  const [permNotif, setPermNotif] = useState(OfflineNotificationAdapter.permissaoAtual());

  const {
    eventoAtual,
    proximoEvento,
    minutosRestantesAtual,
    minutosParaProximo,
    progressoAtualPercentual,
  } = panorama;

  const horaStr = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dataStr = agora.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });

  const handlePublicar = (e: React.FormEvent) => {
    e.preventDefault();
    setErroAviso(null);
    try {
      publicarAvisoManual(tituloAviso, msgAviso, prioridadeAviso);
      setTituloAviso('');
      setMsgAviso('');
      setMostrarFormAviso(false);
    } catch (err) {
      setErroAviso(err instanceof Error ? err.message : 'Erro ao publicar aviso.');
    }
  };

  const handlePedirNotif = async () => {
    const p = await OfflineNotificationAdapter.solicitarPermissao();
    setPermNotif(p);
  };

  return (
    <section className="space-y-3 animate-fade-slide-up">
      {/* Alertas automáticos recém-disparados */}
      {alertasBanner.map((alerta) => (
        <div
          key={alerta.id}
          className={`flex items-start justify-between gap-3 rounded-2xl border-2 p-3.5 shadow-lg animate-glow-pulse ${
            alerta.tipo === 'INICIO_AGORA'
              ? 'border-[#FACC15] bg-[#FEF9C3] text-[#0A3D2E]'
              : 'border-[#0E5A36] bg-[#ECFDF5] text-[#0A3D2E]'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0A3D2E] text-[#FACC15]">
              <Bell className="h-4 w-4 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-black">{alerta.titulo}</p>
              <p className="text-xs font-medium text-[#2C3E36]">{alerta.corpo}</p>
            </div>
          </div>
          <button
            onClick={() => dispensarAlertaBanner(alerta.id)}
            className="rounded-lg p-1 text-[#0A3D2E]/70 hover:bg-black/5 hover:text-[#0A3D2E]"
            aria-label="Dispensar alerta"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Painel Principal Central de Avisos (Tema Claro Cartaz) */}
      <div className="rounded-3xl border-2 border-[#0A3D2E]/15 bg-white p-4 shadow-lg shadow-[#0A3D2E]/10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A3D2E] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#FACC15]">
              <Flame className="h-3.5 w-3.5 text-[#F97316]" />
              Central de Avisos • {dataStr}, {horaStr}
            </span>
            {simulacaoHorario.ativo && (
              <button
                onClick={desativarSimulacaoHorario}
                className="rounded-full border border-purple-300 bg-purple-100 px-2.5 py-0.5 text-[10px] font-extrabold text-purple-800 hover:bg-purple-200"
              >
                Modo Simulação (Sair)
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {permNotif === 'default' && (
              <button
                onClick={handlePedirNotif}
                className="flex items-center gap-1 rounded-xl bg-[#FACC15] px-3 py-1.5 text-[11px] font-black text-[#0A3D2E] shadow-sm hover:bg-[#fde047]"
              >
                <Bell className="h-3.5 w-3.5" />
                Ativar Alarmes
              </button>
            )}
            <button
              onClick={() => setMostrarFormAviso((v) => !v)}
              className="flex items-center gap-1 rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-1.5 text-[11px] font-bold text-[#0A3D2E] hover:bg-[#EFE8D8]"
            >
              <Plus className="h-3.5 w-3.5" />
              Novo Aviso
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {/* Card: Acontecendo Agora */}
          <div
            className={`rounded-2xl border-2 p-3.5 transition ${
              eventoAtual
                ? 'border-[#0E5A36]/40 bg-gradient-to-br from-[#F0FDF4] to-[#FEFCE8] animate-glow-pulse'
                : 'border-[#E2DAC7] bg-[#FAF6EA]'
            }`}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="rounded-md bg-[#0E5A36] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                Acontecendo Agora
              </span>
              {eventoAtual && minutosRestantesAtual !== null && (
                <span className="flex items-center gap-1 text-xs font-extrabold text-[#EA580C]">
                  <Clock className="h-3.5 w-3.5" />
                  Restam {formatarMinutos(minutosRestantesAtual)}
                </span>
              )}
            </div>

            {eventoAtual ? (
              <>
                <p className="text-base font-extrabold text-[#0A3D2E] leading-snug">
                  {eventoAtual.horarioExibicao} • {eventoAtual.titulo}
                </p>
                <p className="mt-1 text-xs text-[#4B5B53]">
                  Responsável:{' '}
                  <strong className="text-[#0A3D2E]">{eventoAtual.responsaveis}</strong>
                </p>
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#E2DAC7]">
                  <div
                    className="h-full rounded-full animate-shimmer transition-all"
                    style={{ width: `${progressoAtualPercentual}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {eventoAtual.manualId && (
                    <button
                      onClick={() => onAbrirManual(eventoAtual.manualId!)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#FACC15] px-3 py-1.5 text-xs font-black text-[#0A3D2E] shadow-sm hover:bg-[#fde047] active:scale-[0.98]"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Abrir Manual da Atividade
                    </button>
                  )}
                  {eventoAtual.momentoMusical && (
                    <button
                      onClick={() => onAbrirMusicasMomento(eventoAtual.momentoMusical!)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0369A1] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#0284C7]"
                    >
                      <Music className="h-3.5 w-3.5" />
                      Ver Músicas
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm font-medium text-[#5C6B64]">
                Nenhuma atividade em andamento neste horário (Acampamento: 20 a 22/11/2026).
              </p>
            )}
          </div>

          {/* Card: Próxima Atividade */}
          <div className="rounded-2xl border border-[#E2DAC7] bg-[#FAF6EA] p-3.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="rounded-md bg-[#0369A1] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                Próximo no Itinerário
              </span>
              {proximoEvento && minutosParaProximo !== null && (
                <span className="text-xs font-extrabold text-[#0369A1]">
                  Em {formatarMinutos(minutosParaProximo)}
                </span>
              )}
            </div>

            {proximoEvento ? (
              <>
                <p className="text-sm font-extrabold text-[#0A3D2E] leading-snug">
                  {proximoEvento.horarioExibicao} • {proximoEvento.titulo}
                </p>
                <p className="mt-1 text-xs text-[#4B5B53]">
                  Dia {proximoEvento.dia.split('-').reverse().slice(0, 2).join('/')} • Resp.:{' '}
                  <strong className="text-[#0A3D2E]">{proximoEvento.responsaveis}</strong>
                </p>
                {proximoEvento.manualId && (
                  <button
                    onClick={() => onAbrirManual(proximoEvento.manualId!)}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl border border-[#0A3D2E]/20 bg-white px-3 py-1.5 text-xs font-bold text-[#0A3D2E] shadow-sm hover:bg-[#FACC15]/25"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-[#0E5A36]" />
                    Preparar Manual
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm font-medium text-[#5C6B64]">
                Todas as atividades do itinerário foram concluídas!
              </p>
            )}
          </div>
        </div>

        {/* Formulário de Novo Aviso Manual */}
        {mostrarFormAviso && (
          <form
            onSubmit={handlePublicar}
            className="mt-3 space-y-2.5 rounded-2xl border border-[#D8CFBC] bg-[#FAF6EA] p-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#0A3D2E]">
                Publicar Aviso na Central
              </span>
              <select
                value={prioridadeAviso}
                onChange={(e) => setPrioridadeAviso(e.target.value as 'NORMAL' | 'URGENTE')}
                className="rounded-lg border border-[#D8CFBC] bg-white px-2.5 py-1 text-xs font-bold text-[#0A3D2E]"
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
            <input
              type="text"
              value={tituloAviso}
              onChange={(e) => setTituloAviso(e.target.value)}
              placeholder="Título (ex: Trazer lanternas para a fogueira)"
              className="w-full rounded-xl border border-[#D8CFBC] bg-white px-3 py-2 text-sm text-[#0A2E22] placeholder-[#8B8574]"
            />
            <textarea
              value={msgAviso}
              onChange={(e) => setMsgAviso(e.target.value)}
              placeholder="Detalhes do aviso para toda a diretoria..."
              rows={2}
              className="w-full rounded-xl border border-[#D8CFBC] bg-white px-3 py-2 text-sm text-[#0A2E22] placeholder-[#8B8574]"
            />
            {erroAviso && <p className="text-xs font-semibold text-rose-600">{erroAviso}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMostrarFormAviso(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#5C6B64] hover:text-[#0A3D2E]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#0A3D2E] px-4 py-1.5 text-xs font-extrabold text-[#FACC15] hover:bg-[#0F533E]"
              >
                Publicar Aviso
              </button>
            </div>
          </form>
        )}

        {/* Lista de Avisos Manuais */}
        {itinerario.avisosManuais.length > 0 && (
          <div className="mt-3 space-y-2">
            {itinerario.avisosManuais.map((av) => (
              <div
                key={av.id}
                className={`flex items-start justify-between gap-2 rounded-2xl border px-3.5 py-2.5 text-xs ${
                  av.prioridade === 'URGENTE'
                    ? 'border-rose-300 bg-rose-50 text-rose-900'
                    : 'border-[#E2DAC7] bg-[#FAF6EA] text-[#0A2E22]'
                }`}
              >
                <div className="flex items-start gap-2">
                  {av.prioridade === 'URGENTE' ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  ) : (
                    <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-[#EA580C]" />
                  )}
                  <div>
                    <p className="font-extrabold">
                      {av.titulo}{' '}
                      <span className="font-normal text-[#5C6B64]">• por {av.autor}</span>
                    </p>
                    <p className="text-[#2C3E36]">{av.mensagem}</p>
                  </div>
                </div>
                <button
                  onClick={() => removerAvisoManual(av.id)}
                  className="rounded p-1 text-[#5C6B64] hover:bg-black/5 hover:text-rose-600"
                  aria-label="Remover aviso"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
