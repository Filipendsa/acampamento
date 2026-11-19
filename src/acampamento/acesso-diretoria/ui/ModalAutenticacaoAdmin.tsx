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
    <div className="mx-auto max-w-md rounded-3xl border-2 border-[#0A3D2E]/20 bg-white p-6 shadow-xl animate-fade-slide-up">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A3D2E] text-[#FACC15] shadow-md">
          <Lock className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-[#0A3D2E]">Área Restrita — Pontuação</h2>
          <p className="text-xs font-semibold text-[#5C6B64]">
            Exclusiva para Você e Diretoria Administrativa
          </p>
        </div>
      </div>

      <p className="mb-4 rounded-2xl border border-[#E2DAC7] bg-[#FAF6EA] p-3.5 text-sm text-[#2C3E36]">
        Os demais módulos (itinerário, manuais, músicas e ocorrências) continuam liberados para toda
        a diretoria. Digite a senha administrativa para visualizar ou lançar pontos e punições.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-[#0A3D2E]">
            Senha Administrativa
          </label>
          <div className="relative">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite a senha..."
              autoComplete="current-password"
              className="w-full rounded-xl border-2 border-[#D8CFBC] bg-[#FAF6EA] px-4 py-3 pr-12 text-base font-semibold text-[#0A2E22] placeholder-[#8B8574] focus:border-[#0A3D2E] focus:bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#5C6B64] hover:bg-[#EDE5D3] hover:text-[#0A3D2E]"
              aria-label="Mostrar ou ocultar senha"
            >
              {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {erro && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-700">
            {erro}
          </div>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A3D2E] px-4 py-3.5 text-base font-extrabold text-[#FACC15] shadow-lg shadow-[#0A3D2E]/20 transition hover:bg-[#0F533E] active:scale-[0.98]"
        >
          <ShieldCheck className="h-5 w-5" />
          Desbloquear Pontuação
        </button>
      </form>
    </div>
  );
};
