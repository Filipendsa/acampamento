import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Image as ImageIcon,
  Moon,
  Sparkles,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useAcampamento } from '../../../application/AcampamentoStoreContext';

type FiltroEscala = 'TUDO' | 'RONDA' | 'SANITARISMO' | 'MINHA_ESCALA';

const COR_DIA_RONDA: Record<'indigo' | 'emerald' | 'purple', { header: string; border: string; badge: string }> = {
  indigo: {
    header: 'from-[#1E3A8A] to-[#1E40AF]',
    border: 'border-[#1E3A8A]/30',
    badge: 'bg-[#DBEAFE] text-[#1E3A8A]',
  },
  emerald: {
    header: 'from-[#0E5A36] to-[#0A3D2E]',
    border: 'border-[#0E5A36]/30',
    badge: 'bg-[#ECFDF5] text-[#0E5A36]',
  },
  purple: {
    header: 'from-[#581C87] to-[#6B21A8]',
    border: 'border-[#581C87]/30',
    badge: 'bg-[#F3E8FF] text-[#581C87]',
  },
};

export const TelaRondaSanitarismo: React.FC = () => {
  const {
    controleRondaSanitarismo,
    alternarConclusaoRonda,
    alternarConclusaoSanitarismo,
    sessao,
  } = useAcampamento();

  const [filtro, setFiltro] = useState<FiltroEscala>('TUDO');
  const [verCartaz, setVerCartaz] = useState(false);

  const turnosRonda = controleRondaSanitarismo.turnosRonda;
  const escalasSanitarismo = controleRondaSanitarismo.escalasSanitarismo;

  const turnosFiltrados = useMemo(() => {
    if (filtro === 'SANITARISMO') return [];
    if (filtro === 'MINHA_ESCALA') {
      return turnosRonda.filter((t) => t.pertenceAoOperador(sessao.nomeOperador));
    }
    return [...turnosRonda];
  }, [turnosRonda, filtro, sessao.nomeOperador]);

  const escalasFiltradas = useMemo(() => {
    if (filtro === 'RONDA') return [];
    if (filtro === 'MINHA_ESCALA') {
      return escalasSanitarismo.filter((e) => e.pertenceAoOperador(sessao.nomeOperador));
    }
    return [...escalasSanitarismo];
  }, [escalasSanitarismo, filtro, sessao.nomeOperador]);

  const gruposRonda = useMemo(() => {
    const mapa = new Map<number, typeof turnosFiltrados>();
    for (const t of turnosFiltrados) {
      const lista = mapa.get(t.diaNumero) ?? [];
      lista.push(t);
      mapa.set(t.diaNumero, lista);
    }
    return Array.from(mapa.entries()).sort((a, b) => a[0] - b[0]);
  }, [turnosFiltrados]);

  const gruposSanitarismo = useMemo(() => {
    const mapa = new Map<string, typeof escalasFiltradas>();
    for (const esc of escalasFiltradas) {
      const lista = mapa.get(esc.rotuloDia) ?? [];
      lista.push(esc);
      mapa.set(esc.rotuloDia, lista);
    }
    return Array.from(mapa.entries());
  }, [escalasFiltradas]);

  const totalConcluidosRonda = turnosRonda.filter((t) => t.concluido).length;
  const totalConcluidosSanit = escalasSanitarismo.filter((e) => e.concluido).length;

  return (
    <div className="space-y-4 animate-fade-slide-up">
      {/* Cabeçalho */}
      <div className="card-camp flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="ribbon-yellow inline-block rounded-lg px-2.5 py-0.5 text-[11px] font-black uppercase">
              Acampori • Evangelhos em Ação
            </span>
            <h1 className="flex items-center gap-2 text-lg font-black text-[#0A3D2E]">
              <Moon className="h-5 w-5 text-[#1E3A8A]" />
              Ronda Noturna & Sanitarismo
            </h1>
          </div>
          <p className="mt-1 text-xs font-medium text-[#4B5B53]">
            Ronda: {totalConcluidosRonda}/{turnosRonda.length} turnos • Sanitarismo:{' '}
            {totalConcluidosSanit}/{escalasSanitarismo.length} limpezas concluídas
          </p>
        </div>

        <button
          onClick={() => setVerCartaz(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0A3D2E] px-4 py-2.5 text-xs font-extrabold text-[#FACC15] shadow-md transition hover:bg-[#0F533E] active:scale-[0.98]"
        >
          <ImageIcon className="h-4 w-4" />
          Ver Cartaz Oficial
        </button>
      </div>

      {/* Filtros Rápidos */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'TUDO', rotulo: 'Tudo (Ronda + Sanitarismo)' },
            { id: 'RONDA', rotulo: 'Ronda Noturna' },
            { id: 'SANITARISMO', rotulo: 'Sanitarismo (Banheiros/Lixo)' },
            { id: 'MINHA_ESCALA', rotulo: `Minha Escala (${sessao.nomeOperador})` },
          ] as Array<{ id: FiltroEscala; rotulo: string }>
        ).map((item) => {
          const ativo = filtro === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setFiltro(item.id)}
              className={`rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${
                ativo
                  ? 'border-[#0A3D2E] bg-[#0A3D2E] text-[#FACC15] shadow-sm'
                  : 'border-[#E2DAC7] bg-white text-[#0A3D2E] hover:bg-[#FAF6EA]'
              }`}
            >
              {item.rotulo}
            </button>
          );
        })}
      </div>

      {filtro === 'MINHA_ESCALA' &&
        gruposRonda.length === 0 &&
        gruposSanitarismo.length === 0 && (
          <div className="card-camp rounded-3xl p-5 text-center text-xs font-medium text-[#5C6B64]">
            Nenhum turno encontrado para <strong>{sessao.nomeOperador}</strong>. Atualize seu nome
            em Configurações (engrenagem no topo) para filtrar sua escala automaticamente.
          </div>
        )}

      {/* Seção 1: Ronda Noturna */}
      {gruposRonda.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Moon className="h-4 w-4 text-[#1E3A8A]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[#0A3D2E]">
              Ronda Noturna (23h às 07h)
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {gruposRonda.map(([diaNum, turnos]) => {
              const primeiro = turnos[0];
              const estilo = COR_DIA_RONDA[primeiro.corTema];
              return (
                <div
                  key={diaNum}
                  className={`overflow-hidden rounded-3xl border-2 ${estilo.border} bg-[#FAF6EA] shadow-md`}
                >
                  <div className={`bg-gradient-to-r ${estilo.header} px-4 py-3 text-white`}>
                    <p className="text-sm font-black tracking-wide">{primeiro.tituloDia}</p>
                    <p className="text-xs font-semibold text-white/85">{primeiro.subtituloTema}</p>
                  </div>

                  <div className="space-y-2 p-3">
                    {turnos.map((turno) => {
                      const meuTurno = turno.pertenceAoOperador(sessao.nomeOperador);
                      return (
                        <button
                          key={turno.id}
                          type="button"
                          onClick={() => alternarConclusaoRonda(turno.id)}
                          className={`flex w-full items-center justify-between gap-2 rounded-2xl border p-3 text-left transition ${
                            turno.concluido
                              ? 'border-emerald-300 bg-emerald-50/90'
                              : meuTurno
                              ? 'border-[#FACC15] bg-[#FEFCE8] shadow-xs'
                              : 'border-[#E2DAC7] bg-white hover:border-[#0A3D2E]/30'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-black ${estilo.badge}`}
                              >
                                <Clock className="h-3 w-3" />
                                {turno.horarioExibicao}
                              </span>
                              {meuTurno && (
                                <span className="rounded-full bg-[#FACC15] px-2 py-0.5 text-[10px] font-black text-[#0A3D2E]">
                                  Você
                                </span>
                              )}
                            </div>
                            <p
                              className={`mt-1 text-sm font-extrabold ${
                                turno.concluido
                                  ? 'text-emerald-900 line-through opacity-80'
                                  : 'text-[#0A2E22]'
                              }`}
                            >
                              {turno.duplaResponsaveis}
                            </p>
                            {turno.concluido && turno.concluidoPor && (
                              <p className="mt-0.5 text-[10px] font-semibold text-emerald-700">
                                Check-in por {turno.concluidoPor}
                              </p>
                            )}
                          </div>

                          {turno.concluido ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                          ) : (
                            <Circle className="h-5 w-5 shrink-0 text-[#C8BDA3]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Seção 2: Sanitarismo */}
      {gruposSanitarismo.length > 0 && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0E5A36]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-[#0A3D2E]">
                Sanitarismo — Recolher lixo e limpar os banheiros
              </h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {gruposSanitarismo.map(([rotuloDia, escalas]) => {
              const resp = escalas[0]?.responsaveisDiretoria ?? '';
              return (
                <div
                  key={rotuloDia}
                  className="card-camp space-y-2.5 rounded-3xl border border-[#D8CFBC] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2DAC7] pb-2">
                    <h3 className="text-sm font-black text-[#0A3D2E]">{rotuloDia}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FAF6EA] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0E5A36]">
                      <UserCheck className="h-3.5 w-3.5 text-[#EA580C]" />
                      Resp. {resp}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {escalas.map((esc) => {
                      const minhaEscala = esc.pertenceAoOperador(sessao.nomeOperador);
                      return (
                        <button
                          key={esc.id}
                          type="button"
                          onClick={() => alternarConclusaoSanitarismo(esc.id)}
                          className={`flex w-full items-center justify-between gap-3 rounded-2xl border p-3 text-left transition ${
                            esc.concluido
                              ? 'border-emerald-300 bg-emerald-50'
                              : minhaEscala
                              ? 'border-[#FACC15] bg-[#FEFCE8]'
                              : 'border-[#E2DAC7] bg-[#FAF6EA] hover:bg-white'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-lg bg-[#0A3D2E] px-2.5 py-0.5 text-xs font-black text-[#FACC15]">
                                {esc.horarioExibicao}
                              </span>
                              <span className="inline-flex items-center gap-1 text-sm font-extrabold text-[#0A2E22]">
                                <Users className="h-3.5 w-3.5 text-[#0E5A36]" />
                                {esc.unidadesEscaladas}
                              </span>
                              {minhaEscala && (
                                <span className="rounded-full bg-[#FACC15] px-2 py-0.5 text-[10px] font-black text-[#0A3D2E]">
                                  Sua Resp.
                                </span>
                              )}
                            </div>
                            {esc.concluido && esc.concluidoPor && (
                              <p className="mt-1 text-[10px] font-semibold text-emerald-700">
                                Limpeza concluída • Marcado por {esc.concluidoPor}
                              </p>
                            )}
                          </div>

                          {esc.concluido ? (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                          ) : (
                            <Circle className="h-5 w-5 shrink-0 text-[#C8BDA3]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Modal Cartaz Oficial Ronda & Sanitarismo */}
      {verCartaz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A3D2E]/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border-2 border-[#D8CFBC] bg-[#FAF6EA] p-4 shadow-2xl animate-fade-slide-up">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-black text-[#0A3D2E]">
                Escala Oficial — Ronda Noturna & Sanitarismo
              </h3>
              <button
                onClick={() => setVerCartaz(false)}
                className="rounded-xl p-2 text-[#5C6B64] hover:bg-[#EDE5D3] hover:text-[#0A3D2E]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <img
              src="/images/ronda-sanitarismo.jpg"
              alt="Escala Oficial de Ronda Noturna e Sanitarismo"
              className="w-full rounded-2xl border-2 border-[#D8CFBC] shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
};
