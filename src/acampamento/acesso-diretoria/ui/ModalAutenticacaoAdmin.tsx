import React, { useState } from 'react';
import { Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAcampamento } from '../../../application/AcampamentoStoreContext';

interface ModalAutenticacaoAdminProps {
  onSucesso?: () => void;
}

export const ModalAutenticacaoAdmin: React.FC<ModalAutenticacaoAdminProps> = ({ onSucesso }) => {
  const { autenticarAdmin } = useAcampamento();
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    try {
      autenticarAdmin(senha);
      setSenha('');
      onSucesso?.();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Senha incorreta.');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-amber-500/30 bg-slate-900/90 p-6 shadow-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Área Restrita — Pontuação</h2>
          <p className="text-xs text-slate-400">
            Exclusiva para Você e Diretoria Administrativa
          </p>
        </div>
      </div>

      <p className="mb-4 rounded-xl bg-slate-950/70 p-3 text-sm text-slate-300 border border-slate-800">
        Os demais módulos (itinerário, manuais, músicas e ocorrências) continuam liberados para toda
        a diretoria. Digite a senha administrativa para visualizar ou lançar pontos e punições.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Senha Administrativa
          </label>
          <div className="relative">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite a senha..."
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-base text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Mostrar ou ocultar senha"
            >
              {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {erro && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300">
            {erro}
          </div>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-[0.99] hover:bg-amber-300"
        >
          <ShieldCheck className="h-5 w-5" />
          Desbloquear Pontuação
        </button>
      </form>
    </div>
  );
};
