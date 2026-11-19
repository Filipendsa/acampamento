import React, { useState } from 'react';
import { Dices, Sparkles } from 'lucide-react';
import { REQUISITOS_CLASSES_CAMPORI, RequisitoClasse } from '../domain/RequisitoClasse';

export const RoletaClassesWidget: React.FC = () => {
  const [girando, setGirando] = useState(false);
  const [sorteada, setSorteada] = useState<RequisitoClasse | null>(null);

  const girarRoleta = () => {
    if (girando) return;
    setGirando(true);
    let passos = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * REQUISITOS_CLASSES_CAMPORI.length);
      setSorteada(REQUISITOS_CLASSES_CAMPORI[idx]);
      passos += 1;
      if (passos >= 14) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * REQUISITOS_CLASSES_CAMPORI.length);
        setSorteada(REQUISITOS_CLASSES_CAMPORI[finalIdx]);
        setGirando(false);
      }
    }, 85);
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-slate-950/80 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold text-amber-300">
            <Dices className="h-4 w-4" />
            Roleta Digital das Classes (Estação 2)
          </h4>
          <p className="text-xs text-slate-400">
            Sorteie a classe da equipe direto pelo celular/notebook na hora da prova.
          </p>
        </div>
        <button
          onClick={girarRoleta}
          disabled={girando}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-extrabold text-slate-950 shadow-md hover:bg-amber-300 disabled:opacity-60"
        >
          <Sparkles className={`h-4 w-4 ${girando ? 'animate-spin' : ''}`} />
          {girando ? 'Sorteando...' : 'Girar Roleta'}
        </button>
      </div>

      {sorteada && (
        <div
          className="mt-3 rounded-xl border p-3.5 transition-all"
          style={{
            borderColor: `${sorteada.corHex}88`,
            backgroundColor: `${sorteada.corHex}18`,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-extrabold text-white">
              {sorteada.classe} ({sorteada.idade} anos)
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
              style={{ backgroundColor: sorteada.corHex }}
            >
              {sorteada.classe}
            </span>
          </div>
          <p className="mt-1 text-xs font-bold text-amber-200">{sorteada.temaPrincipal}</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-200">
            {sorteada.detalhes.map((d, i) => (
              <li key={i}>• {d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
