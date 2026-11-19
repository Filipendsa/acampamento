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
    <div className="space-y-4 animate-fade-slide-up">
      <div className="card-camp rounded-3xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="ribbon-yellow inline-block rounded-lg px-2.5 py-0.5 text-[11px] font-black uppercase">
            VI Campori 2027
          </span>
          <h1 className="flex items-center gap-2 text-lg font-black text-[#0A3D2E]">
            <BookOpen className="h-5 w-5 text-[#0E5A36]" />
            Manuais & Guias das Provas
          </h1>
        </div>
        <p className="mt-1 text-xs font-medium text-[#4B5B53]">
          Adaptações oficiais para a Chácara Morete • Base: Manual de Eventos &quot;Sempre Desbravador&quot;
        </p>

        {/* Seletor dos 4 Manuais */}
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {manuais.map((m) => {
            const ativo = m.id === manual.id;
            const diaCurto =
              m.dia === '2026-11-20' ? 'Sex 20/11' : m.dia === '2026-11-21' ? 'Sáb 21/11' : 'Dom 22/11';
            return (
              <button
                key={m.id}
                onClick={() => setManualAtivoId(m.id)}
                className={`rounded-2xl border-2 p-3 text-left transition active:scale-[0.98] ${
                  ativo
                    ? 'border-[#0A3D2E] bg-[#0A3D2E] text-white shadow-lg shadow-[#0A3D2E]/20'
                    : 'border-[#E2DAC7] bg-[#FAF6EA] text-[#0A3D2E] hover:border-[#C8BDA3] hover:bg-white'
                }`}
              >
                <span
                  className={`text-[11px] font-extrabold ${
                    ativo ? 'text-[#FACC15]' : 'text-[#EA580C]'
                  }`}
                >
                  {diaCurto} • {m.horario}
                </span>
                <p className="mt-0.5 text-xs font-extrabold leading-snug">{m.titulo}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalhes do Manual Selecionado */}
      <div className="card-camp space-y-4 rounded-3xl p-4 sm:p-5">
        <div>
          <span className="inline-block rounded-full border border-[#0E5A36]/25 bg-[#ECFDF5] px-3 py-1 text-[11px] font-extrabold text-[#0E5A36]">
            {manual.horario} • {manual.pegada}
          </span>
          <h2 className="mt-2 text-xl font-black text-[#0A3D2E]">{manual.titulo}</h2>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E2DAC7] bg-[#FAF6EA] p-3 text-xs">
              <p className="flex items-center gap-1.5 font-extrabold text-[#0A3D2E]">
                <Users className="h-3.5 w-3.5 text-[#EA580C]" />
                Coordenação
              </p>
              <p className="mt-0.5 font-semibold text-[#2C3E36]">{manual.coordenacao}</p>
            </div>
            <div className="rounded-2xl border border-[#E2DAC7] bg-[#FAF6EA] p-3 text-xs">
              <p className="flex items-center gap-1.5 font-extrabold text-[#0A3D2E]">
                <Compass className="h-3.5 w-3.5 text-[#0369A1]" />
                Espaço & Inspiração no Manual
              </p>
              <p className="mt-0.5 font-medium text-[#2C3E36]">
                {manual.usoEspaco} — <em>{manual.inspiracaoCampori}</em>
              </p>
            </div>
          </div>

          {manual.notaSeguranca && (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-[#FACC15] bg-[#FEF9C3] p-3 text-xs font-semibold text-[#0A3D2E]">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#EA580C]" />
              <span>{manual.notaSeguranca}</span>
            </div>
          )}
        </div>

        {/* Estações / Passo a passo */}
        <div className="space-y-3">
          {manual.estacoes.map((est, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#E2DAC7] bg-[#FAF6EA] p-4"
            >
              <h3 className="text-sm font-black text-[#0E5A36]">{est.titulo}</h3>
              <ul className="mt-2 space-y-1.5 text-sm font-medium text-[#0A2E22]">
                {est.passos.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#157347]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Ferramentas Interativas */}
        {manual.possuiRoletaClasses && <RoletaClassesWidget />}
        {manual.possuiCronometroBateria && <CronometroPistaFio />}

        {manual.possuiTabelaClasses && (
          <div className="space-y-2.5 rounded-2xl border border-[#E2DAC7] bg-[#FAF6EA] p-4">
            <h3 className="text-sm font-black text-[#0A3D2E]">
              Cola Rápida para a Diretoria — Requisitos das 6 Classes (Manual Campori)
            </h3>
            <div className="grid gap-2.5 md:grid-cols-2">
              {REQUISITOS_CLASSES_CAMPORI.map((req) => (
                <div
                  key={req.classe}
                  className="card-camp card-camp-hover rounded-2xl p-3.5"
                  style={{ borderLeftWidth: '5px', borderLeftColor: req.corHex }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-[#0A3D2E]">
                      {req.classe} ({req.idade} anos)
                    </span>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-white"
                      style={{ backgroundColor: req.corHex }}
                    >
                      {req.classe}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-extrabold text-[#EA580C]">
                    {req.temaPrincipal}
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs font-medium text-[#2C3E36]">
                    {req.detalhes.map((d, idx) => (
                      <li key={idx}>• {d}</li>
                    ))}
                  </ul>
                  <p className="mt-2 rounded-xl bg-[#ECFDF5] px-2.5 py-1.5 text-[11px] font-bold text-[#0E5A36]">
                    Dica: {req.dicaConferencia}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {manual.possuiNosAsCegas && (
          <div className="space-y-2 rounded-2xl border border-[#0369A1]/25 bg-[#F0F9FF] p-4">
            <h3 className="flex items-center gap-2 text-sm font-black text-[#0369A1]">
              <Anchor className="h-4 w-4" />
              Nós Clássicos para Executar às Cegas (Estação 2)
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {NOS_CLASSICOS_MANUAL.map((no) => (
                <div
                  key={no.nome}
                  className="rounded-xl border border-[#BAE6FD] bg-white p-3 text-xs shadow-xs"
                >
                  <p className="font-extrabold text-[#0A3D2E]">{no.nome}</p>
                  <p className="mt-1 font-medium text-[#4B5B53]">{no.uso}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
