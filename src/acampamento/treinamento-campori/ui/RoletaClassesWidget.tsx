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
    <div className="rounded-2xl border-2 border-[#FACC15] bg-[#FEFCE8] p-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="flex items-center gap-2 text-sm font-black text-[#0A3D2E]">
            <Dices className="h-4 w-4 text-[#EA580C]" />
            Roleta Digital das Classes (Estação 2)
          </h4>
          <p className="text-xs font-medium text-[#4B5B53]">
            Sorteie a classe da equipe direto pelo celular/notebook na hora da prova.
          </p>
        </div>
        <button
          onClick={girarRoleta}
          disabled={girando}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0A3D2E] px-4 py-2.5 text-sm font-extrabold text-[#FACC15] shadow-md transition hover:bg-[#0F533E] active:scale-[0.98] disabled:opacity-60"
        >
          <Sparkles className={`h-4 w-4 ${girando ? 'animate-spin' : ''}`} />
          {girando ? 'Sorteando...' : 'Girar Roleta'}
        </button>
      </div>

      {sorteada && (
        <div
          className="mt-3 rounded-2xl border-2 bg-white p-4 shadow-sm transition-all animate-fade-slide-up"
          style={{
            borderColor: sorteada.corHex,
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-black text-[#0A3D2E]">
              {sorteada.classe} ({sorteada.idade} anos)
            </span>
            <span
              className="rounded-full px-3 py-0.5 text-[11px] font-extrabold text-white shadow-sm"
              style={{ backgroundColor: sorteada.corHex }}
            >
              {sorteada.classe}
            </span>
          </div>
          <p className="mt-1 text-xs font-extrabold text-[#EA580C]">{sorteada.temaPrincipal}</p>
          <ul className="mt-2 space-y-1 text-xs font-medium text-[#2C3E36]">
            {sorteada.detalhes.map((d, i) => (
              <li key={i}>• {d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
