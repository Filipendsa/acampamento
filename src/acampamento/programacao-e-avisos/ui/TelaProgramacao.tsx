import React, { useState } from 'react';
import { BookOpen, Calendar, Image as ImageIcon, MapPin, Music, User, X } from 'lucide-react';
import { useAcampamento } from '../../../application/AcampamentoStoreContext';
import { DIAS_ACAMPAMENTO, DataDiaAcampamento } from '../domain/DiaAcampamento';
import { StatusTemporalEvento } from '../domain/StatusTemporalEvento';

interface TelaProgramacaoProps {
  onAbrirManual: (manualId: string) => void;
  onAbrirMusicasMomento: (momento: string) => void;
}

const COR_CABECALHO_DIA: Record<'emerald' | 'sky' | 'rose', { bg: string; border: string; tabAtiva: string }> = {
  emerald: {
    bg: 'from-[#0E5A36] to-[#0A3D2E]',
    border: 'border-[#0E5A36]',
    tabAtiva: 'bg-[#0E5A36] text-white border-[#0E5A36] shadow-md shadow-[#0E5A36]/25',
  },
  sky: {
    bg: 'from-[#0369A1] to-[#075985]',
    border: 'border-[#0369A1]',
    tabAtiva: 'bg-[#0369A1] text-white border-[#0369A1] shadow-md shadow-[#0369A1]/25',
  },
  rose: {
    bg: 'from-[#C81E1E] to-[#991B1B]',
    border: 'border-[#C81E1E]',
    tabAtiva: 'bg-[#C81E1E] text-white border-[#C81E1E] shadow-md shadow-[#C81E1E]/25',
  },
};

function estiloStatus(status: StatusTemporalEvento): { badge: string; rotulo: string; linha: string } {
  switch (status) {
    case 'EM_ANDAMENTO':
      return {
        badge: 'bg-[#FACC15] text-[#0A3D2E] shadow-sm',
        rotulo: 'AGORA',
        linha: 'border-2 border-[#0E5A36] bg-[#F0FDF4] shadow-md',
      };
    case 'PROXIMO':
      return {
        badge: 'bg-[#0369A1] text-white',
        rotulo: 'PRÓXIMO',
        linha: 'border border-[#0369A1]/40 bg-white shadow-sm',
      };
    case 'CONCLUIDO':
      return {
        badge: 'bg-[#E5DEC9] text-[#5C6B64]',
        rotulo: 'CONCLUÍDO',
        linha: 'border border-[#E5DEC9] bg-[#FAF6EA]/60 opacity-75',
      };
    default:
      return {
        badge: 'bg-[#EFE8D8] text-[#0A3D2E]',
        rotulo: 'PROGRAMADO',
        linha: 'border border-[#E2DAC7] bg-white card-camp-hover',
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
  const temaDia = COR_CABECALHO_DIA[infoDia.corBadge];
  const eventosDoDia = itinerario.eventos.filter((e) => e.dia === diaSelecionado);

  return (
    <div className="space-y-4 animate-fade-slide-up">
      {/* Cabeçalho estilo Cartaz */}
      <div className="card-camp flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="ribbon-yellow inline-block rounded-lg px-2.5 py-0.5 text-[11px] font-black uppercase">
              Programação Geral
            </span>
            <h1 className="text-lg font-black text-[#0A3D2E]">
              Treinamento para o Campori
            </h1>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#4B5B53]">
            <MapPin className="h-3.5 w-3.5 text-[#EA580C]" />
            Chácara Morete • Hortolândia/SP • 20 a 22/11/2026 • João 15:11
          </p>
        </div>
        <button
          onClick={() => setVerCartazes(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0A3D2E] px-4 py-2.5 text-xs font-extrabold text-[#FACC15] shadow-md transition hover:bg-[#0F533E] active:scale-[0.98]"
        >
          <ImageIcon className="h-4 w-4" />
          Ver Cartazes Oficiais
        </button>
      </div>

      {/* Seletor dos 3 dias nas cores exatas da tabela (Verde / Azul / Vermelho) */}
      <div className="grid grid-cols-3 gap-2.5">
        {DIAS_ACAMPAMENTO.map((dia) => {
          const ativo = dia.data === diaSelecionado;
          const cor = COR_CABECALHO_DIA[dia.corBadge];
          return (
            <button
              key={dia.data}
              onClick={() => setDiaSelecionado(dia.data)}
              className={`rounded-2xl border-2 px-3 py-2.5 text-left transition active:scale-[0.98] ${
                ativo
                  ? cor.tabAtiva
                  : 'border-[#E2DAC7] bg-white text-[#0A3D2E] hover:border-[#C8BDA3]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-black">
                <Calendar className={`h-3.5 w-3.5 ${ativo ? 'text-[#FACC15]' : 'text-[#0E5A36]'}`} />
                {dia.rotuloCurto}
              </div>
              <p className={`mt-0.5 truncate text-[11px] font-semibold ${ativo ? 'text-white/90' : 'text-[#5C6B64]'}`}>
                {dia.tema}
              </p>
            </button>
          );
        })}
      </div>

      {/* Card Coluna do Dia fiel à imagem Programação Geral */}
      <div className={`overflow-hidden rounded-3xl border-2 ${temaDia.border} bg-[#FAF6EA] shadow-xl`}>
        <div className={`bg-gradient-to-r ${temaDia.bg} px-5 py-4 text-center`}>
          <p className="text-sm font-bold text-white/95">{infoDia.tituloDia}</p>
          <div className="ribbon-yellow mx-auto mt-2 inline-block rounded-xl px-5 py-1.5">
            <span className="block text-sm font-black tracking-wide sm:text-base">
              {infoDia.tema}
            </span>
          </div>
        </div>

        {/* Lista de Horários */}
        <div className="space-y-2.5 p-3.5 sm:p-4">
          {eventosDoDia.map((ev) => {
            const status = ev.statusEm(agora, panorama.proximoEvento?.id);
            const estilo = estiloStatus(status);

            return (
              <div
                key={ev.id}
                className={`rounded-2xl p-3.5 transition ${estilo.linha}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-[#0A3D2E] px-3 py-1 text-sm font-black text-[#FACC15] shadow-sm">
                      {ev.horarioExibicao}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${estilo.badge}`}>
                      {estilo.rotulo}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#4B5B53]">
                    <User className="h-3.5 w-3.5 text-[#0E5A36]" />
                    <span>{ev.responsaveis}</span>
                  </div>
                </div>

                <h3 className="mt-2 text-base font-extrabold text-[#0A2E22] leading-snug">
                  {ev.titulo}
                </h3>

                {(ev.manualId || ev.momentoMusical) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ev.manualId && (
                      <button
                        onClick={() => onAbrirManual(ev.manualId!)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#FACC15] px-3.5 py-2 text-xs font-black text-[#0A3D2E] shadow-sm transition hover:bg-[#fde047] active:scale-[0.98]"
                      >
                        <BookOpen className="h-4 w-4" />
                        Abrir Guia / Manual da Prova
                      </button>
                    )}
                    {ev.momentoMusical && (
                      <button
                        onClick={() => onAbrirMusicasMomento(ev.momentoMusical!)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0369A1] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0284C7] active:scale-[0.98]"
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
      </div>

      {/* Modal Offline dos Cartazes Oficiais */}
      {verCartazes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A3D2E]/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border-2 border-[#D8CFBC] bg-[#FAF6EA] p-4 shadow-2xl animate-fade-slide-up">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-black text-[#0A3D2E]">
                Cartazes Oficiais (Salvos Offline no App)
              </h3>
              <button
                onClick={() => setVerCartazes(false)}
                className="rounded-xl p-2 text-[#5C6B64] hover:bg-[#EDE5D3] hover:text-[#0A3D2E]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-xs font-extrabold text-[#0E5A36]">
                  1. O Chamado — Dorina Azevedo
                </p>
                <img
                  src="/images/cartaz-chamado.jpg"
                  alt="Cartaz do Acampamento A Alegria de Ser Desbravador"
                  className="w-full rounded-2xl border-2 border-[#D8CFBC] shadow-md"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-extrabold text-[#0369A1]">2. Programação Geral</p>
                <img
                  src="/images/itinerario-oficial.jpg"
                  alt="Programação Geral 20 a 22 de Novembro"
                  className="w-full rounded-2xl border-2 border-[#D8CFBC] shadow-md"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <p className="text-xs font-extrabold text-[#0A3D2E]">
                  3. Ronda Noturna & Sanitarismo
                </p>
                <img
                  src="/images/ronda-sanitarismo.jpg"
                  alt="Escala de Ronda Noturna e Sanitarismo"
                  className="w-full rounded-2xl border-2 border-[#D8CFBC] shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
