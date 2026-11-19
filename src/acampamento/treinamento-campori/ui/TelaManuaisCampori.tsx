import React, { useEffect, useState } from 'react';
import { Anchor, BookOpen, CheckCircle2, Compass, ShieldAlert, Users } from 'lucide-react';
import { useAcampamento } from '../../../application/AcampamentoStoreContext';
import { NOS_CLASSICOS_MANUAL, REQUISITOS_CLASSES_CAMPORI } from '../domain/RequisitoClasse';
import { CronometroPistaFio } from './CronometroPistaFio';
import { RoletaClassesWidget } from './RoletaClassesWidget';

interface TelaManuaisCamporiProps {
  manualIdInicial?: string | null;
}

export const TelaManuaisCampori: React.FC<TelaManuaisCamporiProps> = ({ manualIdInicial }) => {
  const { manuais } = useAcampamento();
  const [manualAtivoId, setManualAtivoId] = useState<string>(
    manualIdInicial || manuais[0]?.id || ''
  );

  useEffect(() => {
    if (manualIdInicial) {
      setManualAtivoId(manualIdInicial);
    }
  }, [manualIdInicial]);

  const manual = manuais.find((m) => m.id === manualAtivoId) ?? manuais[0];

  if (!manual) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <h1 className="flex items-center gap-2 text-lg font-extrabold text-white">
          <BookOpen className="h-5 w-5 text-amber-400" />
          Manuais & Guias das Provas (VI Campori 2027)
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Adaptações oficiais para a Chácara Morete • Base: Manual de Eventos &quot;Sempre Desbravador&quot;
        </p>

        {/* Seletor dos 4 Manuais */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {manuais.map((m) => {
            const ativo = m.id === manual.id;
            const diaCurto =
              m.dia === '2026-11-20' ? 'Sex 20/11' : m.dia === '2026-11-21' ? 'Sáb 21/11' : 'Dom 22/11';
            return (
              <button
                key={m.id}
                onClick={() => setManualAtivoId(m.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  ativo
                    ? 'border-amber-400 bg-amber-400/15 text-white shadow-md'
                    : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-[11px] font-bold text-amber-300">
                  {diaCurto} • {m.horario}
                </span>
                <p className="mt-0.5 text-xs font-bold leading-snug">{m.titulo}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalhes do Manual Selecionado */}
      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5">
        <div>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
            {manual.horario} • {manual.pegada}
          </span>
          <h2 className="mt-2 text-xl font-extrabold text-white">{manual.titulo}</h2>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs">
              <p className="flex items-center gap-1.5 font-bold text-slate-300">
                <Users className="h-3.5 w-3.5 text-amber-400" />
                Coordenação
              </p>
              <p className="mt-0.5 text-slate-200">{manual.coordenacao}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs">
              <p className="flex items-center gap-1.5 font-bold text-slate-300">
                <Compass className="h-3.5 w-3.5 text-sky-400" />
                Espaço & Inspiração no Manual
              </p>
              <p className="mt-0.5 text-slate-200">
                {manual.usoEspaco} — <em>{manual.inspiracaoCampori}</em>
              </p>
            </div>
          </div>

          {manual.notaSeguranca && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <span>{manual.notaSeguranca}</span>
            </div>
          )}
        </div>

        {/* Estações / Passo a passo */}
        <div className="space-y-3">
          {manual.estacoes.map((est, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
            >
              <h3 className="text-sm font-extrabold text-emerald-300">{est.titulo}</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-200">
                {est.passos.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Ferramentas Interativas do Manual */}
        {manual.possuiRoletaClasses && <RoletaClassesWidget />}
        {manual.possuiCronometroBateria && <CronometroPistaFio />}

        {manual.possuiTabelaClasses && (
          <div className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <h3 className="text-sm font-extrabold text-amber-300">
              Cola Rápida para a Diretoria — Requisitos das 6 Classes (Manual Campori)
            </h3>
            <div className="grid gap-2.5 md:grid-cols-2">
              {REQUISITOS_CLASSES_CAMPORI.map((req) => (
                <div
                  key={req.classe}
                  className="rounded-xl border border-slate-800 bg-slate-900/90 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-white">
                      {req.classe} ({req.idade} anos)
                    </span>
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: req.corHex }}
                    />
                  </div>
                  <p className="mt-0.5 text-xs font-bold text-amber-300">{req.temaPrincipal}</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-300">
                    {req.detalhes.map((d, idx) => (
                      <li key={idx}>• {d}</li>
                    ))}
                  </ul>
                  <p className="mt-2 rounded-lg bg-slate-950 px-2.5 py-1.5 text-[11px] text-emerald-300">
                    Dica: {req.dicaConferencia}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {manual.possuiNosAsCegas && (
          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-sky-300">
              <Anchor className="h-4 w-4" />
              Nós Clássicos para Executar às Cegas (Estação 2)
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {NOS_CLASSICOS_MANUAL.map((no) => (
                <div
                  key={no.nome}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs"
                >
                  <p className="font-bold text-white">{no.nome}</p>
                  <p className="mt-1 text-slate-400">{no.uso}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
