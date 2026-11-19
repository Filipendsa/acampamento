import React, { useEffect, useRef, useState } from 'react';
import { Flag, Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { useAcampamento } from '../../../application/AcampamentoStoreContext';

function formatarMs(ms: number): string {
  const totalSeg = Math.floor(ms / 1000);
  const min = Math.floor(totalSeg / 60);
  const seg = totalSeg % 60;
  const cent = Math.floor((ms % 1000) / 10);
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}.${String(cent).padStart(2, '0')}`;
}

export const CronometroPistaFio: React.FC = () => {
  const { equipesOperacionais, temposPistaFio, registrarTempoPistaFio } = useAcampamento();

  const [equipeId, setEquipeId] = useState<string>(() => equipesOperacionais[0]?.id ?? '');
  const [rodando, setRodando] = useState(false);
  const [acumuladoMs, setAcumuladoMs] = useState(0);
  const [tempoExibidoMs, setTempoExibidoMs] = useState(0);
  const inicioRef = useRef<number | null>(null);

  useEffect(() => {
    if (!equipeId && equipesOperacionais.length > 0) {
      setEquipeId(equipesOperacionais[0].id);
    }
  }, [equipeId, equipesOperacionais]);

  useEffect(() => {
    if (!rodando) return;
    inicioRef.current = performance.now();
    const id = setInterval(() => {
      if (inicioRef.current !== null) {
        setTempoExibidoMs(acumuladoMs + (performance.now() - inicioRef.current));
      }
    }, 50);
    return () => clearInterval(id);
  }, [rodando, acumuladoMs]);

  const pausar = () => {
    if (!rodando) return;
    if (inicioRef.current !== null) {
      const novo = acumuladoMs + (performance.now() - inicioRef.current);
      setAcumuladoMs(novo);
      setTempoExibidoMs(novo);
    }
    setRodando(false);
  };

  const zerar = () => {
    setRodando(false);
    setAcumuladoMs(0);
    setTempoExibidoMs(0);
    inicioRef.current = null;
  };

  const salvarBateria = () => {
    let finalMs = tempoExibidoMs;
    if (rodando && inicioRef.current !== null) {
      finalMs = acumuladoMs + (performance.now() - inicioRef.current);
      setAcumuladoMs(finalMs);
      setTempoExibidoMs(finalMs);
      setRodando(false);
    }
    if (finalMs <= 0) return;
    const eq = equipesOperacionais.find((e) => e.id === equipeId);
    registrarTempoPistaFio(equipeId, eq ? eq.nome : 'Equipe', Math.round(finalMs));
    zerar();
  };

  const ordenados = [...temposPistaFio].sort((a, b) => a.duracaoMs - b.duracaoMs);

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-slate-950/80 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-bold text-rose-300">
          <Timer className="h-4 w-4" />
          Cronômetro da Pista de Fio (Por Bateria)
        </h4>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={equipeId}
          onChange={(e) => setEquipeId(e.target.value)}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white"
        >
          {equipesOperacionais.map((eq) => (
            <option key={eq.id} value={eq.id}>
              {eq.nome} ({eq.tipo === 'ALIANCA' ? 'União' : 'Unidade'})
            </option>
          ))}
        </select>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-center font-mono text-2xl font-extrabold text-amber-300">
          {formatarMs(tempoExibidoMs)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {!rodando ? (
          <button
            onClick={() => setRodando(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-emerald-950 hover:bg-emerald-400"
          >
            <Play className="h-4 w-4" />
            Iniciar
          </button>
        ) : (
          <button
            onClick={pausar}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-300"
          >
            <Pause className="h-4 w-4" />
            Pausar
          </button>
        )}

        <button
          onClick={zerar}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
          Zerar
        </button>

        <button
          onClick={salvarBateria}
          disabled={tempoExibidoMs <= 0}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 py-2.5 text-sm font-bold text-white hover:bg-rose-400 disabled:opacity-40"
        >
          <Flag className="h-4 w-4" />
          Registrar
        </button>
      </div>

      {ordenados.length > 0 && (
        <div className="space-y-1.5 border-t border-slate-800 pt-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tempos Registrados (Menor Tempo Primeiro)
          </p>
          {ordenados.map((reg, idx) => (
            <div
              key={reg.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs"
            >
              <span className="font-semibold text-white">
                {idx + 1}º • {reg.nomeEquipe}
              </span>
              <span className="font-mono text-sm font-extrabold text-amber-300">
                {formatarMs(reg.duracaoMs)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
