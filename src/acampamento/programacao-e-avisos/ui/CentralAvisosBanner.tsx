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

  const { eventoAtual, proximoEvento, minutosRestantesAtual, minutosParaProximo, progressoAtualPercentual } =
    panorama;

  const horaStr = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dataStr = agora.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });

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
    <section className="space-y-3">
      {/* Alertas automáticos recém-disparados */}
      {alertasBanner.map((alerta) => (
        <div
          key={alerta.id}
          className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 shadow-lg ${
            alerta.tipo === 'INICIO_AGORA'
              ? 'border-amber-400/60 bg-amber-500/15 text-amber-100'
              : 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-amber-300 animate-pulse" />
            <div>
              <p className="text-sm font-bold">{alerta.titulo}</p>
              <p className="text-xs opacity-90">{alerta.corpo}</p>
            </div>
          </div>
          <button
            onClick={() => dispensarAlertaBanner(alerta.id)}
            className="rounded-lg p-1 hover:bg-black/20"
            aria-label="Dispensar alerta"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Central de Avisos Principal baseada no Horário */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-900 p-4 shadow-xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
              Central de Avisos • Agora ({dataStr}, {horaStr})
            </h2>
            {simulacaoHorario.ativo && (
              <button
                onClick={desativarSimulacaoHorario}
                className="rounded-full bg-purple-500/25 px-2 py-0.5 text-[10px] font-bold text-purple-200 border border-purple-400/40"
              >
                Simulado (Sair)
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {permNotif === 'default' && (
              <button
                onClick={handlePedirNotif}
                className="flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200 hover:bg-amber-400/20"
              >
                <Bell className="h-3 w-3" />
                Ativar Alarmes
              </button>
            )}
            <button
              onClick={() => setMostrarFormAviso((v) => !v)}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Aviso Manual
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {/* Card: Acontecendo Agora */}
          <div className="rounded-xl border border-emerald-500/30 bg-slate-950/70 p-3.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Acontecendo Agora
              </span>
              {eventoAtual && minutosRestantesAtual !== null && (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-300">
                  <Clock className="h-3.5 w-3.5" />
                  Restam {formatarMinutos(minutosRestantesAtual)}
                </span>
              )}
            </div>

            {eventoAtual ? (
              <>
                <p className="text-base font-bold text-white leading-snug">
                  {eventoAtual.horarioExibicao} • {eventoAtual.titulo}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Responsável:{' '}
                  <strong className="text-slate-200">{eventoAtual.responsaveis}</strong>
                </p>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{ width: `${progressoAtualPercentual}%` }}
                  />
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {eventoAtual.manualId && (
                    <button
                      onClick={() => onAbrirManual(eventoAtual.manualId!)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-300"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Abrir Manual da Atividade
                    </button>
                  )}
                  {eventoAtual.momentoMusical && (
                    <button
                      onClick={() => onAbrirMusicasMomento(eventoAtual.momentoMusical!)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-300 border border-sky-500/30 hover:bg-sky-500/30"
                    >
                      <Music className="h-3.5 w-3.5" />
                      Ver Músicas
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">
                Nenhuma atividade em andamento neste exato horário (Acampamento: 20 a 22/11/2026).
              </p>
            )}
          </div>

          {/* Card: Próxima Atividade */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                Próximo no Itinerário
              </span>
              {proximoEvento && minutosParaProximo !== null && (
                <span className="text-xs font-semibold text-sky-300">
                  Em {formatarMinutos(minutosParaProximo)}
                </span>
              )}
            </div>

            {proximoEvento ? (
              <>
                <p className="text-sm font-bold text-slate-100 leading-snug">
                  {proximoEvento.horarioExibicao} • {proximoEvento.titulo}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Dia {proximoEvento.dia.split('-').reverse().slice(0, 2).join('/')} • Resp.:{' '}
                  <strong className="text-slate-300">{proximoEvento.responsaveis}</strong>
                </p>
                {proximoEvento.manualId && (
                  <button
                    onClick={() => onAbrirManual(proximoEvento.manualId!)}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-slate-700"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Preparar Manual
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400">
                Todas as atividades do itinerário foram concluídas!
              </p>
            )}
          </div>
        </div>

        {/* Formulário de Novo Aviso Manual */}
        {mostrarFormAviso && (
          <form
            onSubmit={handlePublicar}
            className="mt-3 space-y-2.5 rounded-xl border border-slate-700 bg-slate-950 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Publicar Aviso na Central</span>
              <select
                value={prioridadeAviso}
                onChange={(e) => setPrioridadeAviso(e.target.value as 'NORMAL' | 'URGENTE')}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
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
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500"
            />
            <textarea
              value={msgAviso}
              onChange={(e) => setMsgAviso(e.target.value)}
              placeholder="Detalhes do aviso para toda a diretoria..."
              rows={2}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500"
            />
            {erroAviso && <p className="text-xs text-rose-400">{erroAviso}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMostrarFormAviso(false)}
                className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-emerald-950 hover:bg-emerald-400"
              >
                Publicar Aviso
              </button>
            </div>
          </form>
        )}

        {/* Lista de Avisos Manuais Ativos */}
        {itinerario.avisosManuais.length > 0 && (
          <div className="mt-3 space-y-2">
            {itinerario.avisosManuais.map((av) => (
              <div
                key={av.id}
                className={`flex items-start justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${
                  av.prioridade === 'URGENTE'
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-100'
                    : 'border-slate-700 bg-slate-950/70 text-slate-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {av.prioridade === 'URGENTE' ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                  ) : (
                    <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  )}
                  <div>
                    <p className="font-bold">
                      {av.titulo}{' '}
                      <span className="font-normal text-slate-400">• por {av.autor}</span>
                    </p>
                    <p className="text-slate-300">{av.mensagem}</p>
                  </div>
                </div>
                <button
                  onClick={() => removerAvisoManual(av.id)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
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
