import React, { useState } from 'react';
import { BookOpen, Calendar, Image as ImageIcon, MapPin, Music, User, X } from 'lucide-react';
import { useAcampamento } from '../../../application/AcampamentoStoreContext';
import { DIAS_ACAMPAMENTO, DataDiaAcampamento } from '../domain/DiaAcampamento';
import { StatusTemporalEvento } from '../domain/StatusTemporalEvento';

interface TelaProgramacaoProps {
  onAbrirManual: (manualId: string) => void;
  onAbrirMusicasMomento: (momento: string) => void;
}

function estiloStatus(status: StatusTemporalEvento): { badge: string; rotulo: string; borda: string } {
  switch (status) {
    case 'EM_ANDAMENTO':
      return {
        badge: 'bg-emerald-400 text-emerald-950',
        rotulo: 'AGORA',
        borda: 'border-emerald-400/70 bg-emerald-950/30',
      };
    case 'PROXIMO':
      return {
        badge: 'bg-sky-400/20 text-sky-300 border border-sky-400/40',
        rotulo: 'PRÓXIMO',
        borda: 'border-sky-500/40 bg-slate-900',
      };
    case 'CONCLUIDO':
      return {
        badge: 'bg-slate-800 text-slate-400',
        rotulo: 'CONCLUÍDO',
        borda: 'border-slate-800/80 bg-slate-900/40 opacity-75',
      };
    default:
      return {
        badge: 'bg-slate-800 text-slate-300',
        rotulo: 'PROGRAMADO',
        borda: 'border-slate-800 bg-slate-900/80',
      };
  }
}

export const TelaProgramacao: React.FC<TelaProgramacaoProps> = ({
  onAbrirManual,
  onAbrirMusicasMomento,
}) => {
  const { itinerario, agora, panorama } = useAcampamento();
  const [diaSelecionado, setDiaSelecionado] = useState<DataDiaAcampamento>('2026-11-20');
  const [verCartazes, setVerCartazes] = useState(false);

  const infoDia = DIAS_ACAMPAMENTO.find((d) => d.data === diaSelecionado)!;
  const eventosDoDia = itinerario.eventos.filter((e) => e.dia === diaSelecionado);

  return (
    <div className="space-y-4">
      {/* Cabeçalho do Acampamento + Local + Cartazes */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div>
          <h1 className="text-lg font-extrabold text-white">
            Programação Geral — Treinamento Campori
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5 text-amber-400" />
            Chácara Morete • Hortolândia/SP • 20 a 22/11/2026 • João 15:11
          </p>
        </div>
        <button
          onClick={() => setVerCartazes(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400/20"
        >
          <ImageIcon className="h-4 w-4" />
          Ver Cartazes Oficiais
        </button>
      </div>

      {/* Seletor dos 3 dias */}
      <div className="grid grid-cols-3 gap-2">
        {DIAS_ACAMPAMENTO.map((dia) => {
          const ativo = dia.data === diaSelecionado;
          return (
            <button
              key={dia.data}
              onClick={() => setDiaSelecionado(dia.data)}
              className={`rounded-2xl border px-3 py-2.5 text-left transition ${
                ativo
                  ? 'border-emerald-400 bg-emerald-500/15 text-white shadow-md'
                  : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-extrabold">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                {dia.rotuloCurto}
              </div>
              <p className="mt-0.5 truncate text-[11px] opacity-85">{dia.tema}</p>
            </button>
          );
        })}
      </div>

      {/* Banner do Tema do Dia */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3">
        <p className="text-xs font-semibold text-slate-400">{infoDia.tituloDia}</p>
        <p className="text-base font-extrabold tracking-wide text-amber-300">
          “{infoDia.tema}”
        </p>
      </div>

      {/* Timeline de Eventos */}
      <div className="space-y-2.5">
        {eventosDoDia.map((ev) => {
          const status = ev.statusEm(agora, panorama.proximoEvento?.id);
          const estilo = estiloStatus(status);

          return (
            <div
              key={ev.id}
              className={`rounded-2xl border p-4 transition ${estilo.borda}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-xl bg-slate-950 px-3 py-1.5 text-sm font-extrabold text-amber-300 border border-slate-800">
                    {ev.horarioExibicao}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${estilo.badge}`}>
                    {estilo.rotulo}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-300">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>{ev.responsaveis}</span>
                </div>
              </div>

              <h3 className="mt-2.5 text-base font-bold text-white leading-snug">{ev.titulo}</h3>

              {(ev.manualId || ev.momentoMusical) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {ev.manualId && (
                    <button
                      onClick={() => onAbrirManual(ev.manualId!)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-300"
                    >
                      <BookOpen className="h-4 w-4" />
                      Abrir Guia / Manual da Prova
                    </button>
                  )}
                  {ev.momentoMusical && (
                    <button
                      onClick={() => onAbrirMusicasMomento(ev.momentoMusical!)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/15 px-3.5 py-2 text-xs font-semibold text-sky-300 hover:bg-sky-500/25"
                    >
                      <Music className="h-4 w-4" />
                      Músicas: {ev.momentoMusical}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Offline dos Cartazes Oficiais */}
      {verCartazes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Cartazes Oficiais (Salvos Offline no App)
              </h3>
              <button
                onClick={() => setVerCartazes(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-amber-300">1. O Chamado — Dorina Azevedo</p>
                <img
                  src="/images/cartaz-chamado.jpg"
                  alt="Cartaz do Acampamento A Alegria de Ser Desbravador"
                  className="w-full rounded-2xl border border-slate-700"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-emerald-300">2. Programação Geral</p>
                <img
                  src="/images/itinerario-oficial.jpg"
                  alt="Programação Geral 20 a 22 de Novembro"
                  className="w-full rounded-2xl border border-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
