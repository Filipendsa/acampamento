import React, { useEffect, useState } from 'react';
import { Award, Lock, MinusCircle, PlusCircle, ShieldCheck, Trash2, Trophy } from 'lucide-react';
import { useAcampamento } from '../../../application/AcampamentoStoreContext';
import { ModalAutenticacaoAdmin } from '../../acesso-diretoria/ui/ModalAutenticacaoAdmin';
import { CATEGORIAS_LANCAMENTO, CategoriaLancamento } from '../domain/CategoriaLancamento';

interface TelaPontuacaoAdminProps {
  prePreencherPunicao?: {
    unidadeId: string;
    motivo: string;
    ocorrenciaId: string;
  } | null;
  onLimparPrePreenchimento?: () => void;
}

export const TelaPontuacaoAdmin: React.FC<TelaPontuacaoAdminProps> = ({
  prePreencherPunicao,
  onLimparPrePreenchimento,
}) => {
  const {
    sessao,
    bloquearAdmin,
    equipesOperacionais,
    rankingEquipes,
    placar,
    registrarLancamentoPontuacao,
    removerLancamentoPontuacao,
  } = useAcampamento();

  const [equipeAlvoId, setEquipeAlvoId] = useState(equipesOperacionais[0]?.id ?? '');
  const [categoria, setCategoria] = useState<CategoriaLancamento>('PROVA');
  const [pontosInput, setPontosInput] = useState('');
  const [motivo, setMotivo] = useState('');
  const [atividadeRelacionada, setAtividadeRelacionada] = useState('');
  const [ocorrenciaOrigemId, setOcorrenciaOrigemId] = useState<string | undefined>(undefined);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!equipeAlvoId && equipesOperacionais.length > 0) {
      setEquipeAlvoId(equipesOperacionais[0].id);
    }
  }, [equipeAlvoId, equipesOperacionais]);

  useEffect(() => {
    if (!prePreencherPunicao) return;
    const eq = equipesOperacionais.find(
      (e) =>
        e.id === prePreencherPunicao.unidadeId ||
        e.unidadeIds.includes(prePreencherPunicao.unidadeId)
    );
    if (eq) setEquipeAlvoId(eq.id);
    setCategoria('PUNICAO');
    setMotivo(prePreencherPunicao.motivo);
    setOcorrenciaOrigemId(prePreencherPunicao.ocorrenciaId);
  }, [prePreencherPunicao, equipesOperacionais]);

  if (!sessao.isAdministrativa) {
    return (
      <div className="py-6">
        <ModalAutenticacaoAdmin />
      </div>
    );
  }

  const handleLancar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    try {
      const numero = categoria === 'OBSERVACAO' ? 0 : Number(pontosInput.replace(',', '.'));
      registrarLancamentoPontuacao({
        equipeAlvoId,
        categoria,
        pontos: numero,
        motivo,
        atividadeRelacionada: atividadeRelacionada.trim() || undefined,
        ocorrenciaOrigemId,
      });
      setPontosInput('');
      setMotivo('');
      setAtividadeRelacionada('');
      setOcorrenciaOrigemId(undefined);
      onLimparPrePreenchimento?.();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao lançar pontuação.');
    }
  };

  const lancamentos = placar.lancamentosAtivos;

  return (
    <div className="space-y-4 animate-fade-slide-up">
      {/* Cabeçalho Administrativo */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-[#FACC15] bg-gradient-to-r from-[#0A3D2E] to-[#0F533E] p-4 text-white shadow-lg">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-black text-[#FACC15]">
            <Trophy className="h-5 w-5" />
            Pontuação, Punições & Ranking (Admin)
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-emerald-100">
            <ShieldCheck className="h-3.5 w-3.5 text-[#FACC15]" />
            Acesso administrativo liberado • Pontuação livre • Oscar DBV 2026
          </p>
        </div>
        <button
          onClick={bloquearAdmin}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-extrabold text-[#FACC15] hover:bg-white/25"
        >
          <Lock className="h-3.5 w-3.5" />
          Bloquear Placar
        </button>
      </div>

      {/* Placar / Ranking Geral */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rankingEquipes.map((item, idx) => (
          <div
            key={item.equipe.id}
            className={`card-camp card-camp-hover rounded-3xl p-4 ${
              idx === 0 ? 'border-2 border-[#FACC15] bg-gradient-to-br from-[#FEFCE8] to-white' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    idx === 0 ? 'bg-[#FACC15] text-[#0A3D2E]' : 'bg-[#EFE8D8] text-[#0A3D2E]'
                  }`}
                >
                  {idx + 1}º Lugar • {item.equipe.tipo === 'ALIANCA' ? 'União' : 'Unidade'}
                </span>
                <h3 className="mt-1 text-base font-black text-[#0A3D2E]">{item.equipe.nome}</h3>
              </div>
              <span className="rounded-2xl bg-[#0A3D2E] px-3.5 py-1.5 font-mono text-xl font-black text-[#FACC15] shadow-sm">
                {item.saldoTotal}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="rounded-lg bg-[#ECFDF5] px-2 py-0.5 text-[#0E5A36]">
                +{item.totalPositivo} pts ganhos
              </span>
              {item.totalPunicoes < 0 && (
                <span className="rounded-lg bg-rose-100 px-2 py-0.5 text-[#C81E1E]">
                  {item.totalPunicoes} pts punição
                </span>
              )}
              {item.quantidadeObservacoes > 0 && (
                <span className="rounded-lg bg-[#EFE8D8] px-2 py-0.5 text-[#4B5B53]">
                  {item.quantidadeObservacoes} obs.
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Formulário de Lançamento Livre */}
      <form onSubmit={handleLancar} className="card-camp space-y-3 rounded-3xl p-4">
        <h2 className="flex items-center gap-2 text-sm font-black text-[#0A3D2E]">
          <Award className="h-4 w-4 text-[#EA580C]" />
          Novo Lançamento (Pontuação Livre / Punição / Observação)
        </h2>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#5C6B64]">
              Unidade ou União
            </label>
            <select
              value={equipeAlvoId}
              onChange={(e) => setEquipeAlvoId(e.target.value)}
              className="w-full rounded-xl border border-[#D8CFBC] bg-white px-3 py-2.5 text-sm font-bold text-[#0A3D2E]"
            >
              {equipesOperacionais.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#5C6B64]">
              Categoria
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaLancamento)}
              className="w-full rounded-xl border border-[#D8CFBC] bg-white px-3 py-2.5 text-sm font-bold text-[#0A3D2E]"
            >
              {CATEGORIAS_LANCAMENTO.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-[#5C6B64]">
              {categoria === 'PUNICAO'
                ? 'Pontos a Descontar (Livre)'
                : categoria === 'OBSERVACAO'
                ? 'Pontuação (0 pts)'
                : 'Pontos (Valor Livre)'}
            </label>
            <input
              type="number"
              disabled={categoria === 'OBSERVACAO'}
              value={categoria === 'OBSERVACAO' ? '0' : pontosInput}
              onChange={(e) => setPontosInput(e.target.value)}
              placeholder={categoria === 'PUNICAO' ? 'Ex: 20' : 'Ex: 100'}
              className="w-full rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2.5 font-mono text-sm font-black text-[#0A3D2E] focus:bg-white disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo obrigatório (ex: Venceu Pista de Fio, ou Atraso na formação)"
            className="rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2.5 text-sm text-[#0A2E22] placeholder-[#8B8574] focus:bg-white focus:outline-none"
          />
          <input
            type="text"
            value={atividadeRelacionada}
            onChange={(e) => setAtividadeRelacionada(e.target.value)}
            placeholder="Atividade relacionada (opcional, ex: Sáb 14h30)"
            className="rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2.5 text-sm text-[#0A2E22] placeholder-[#8B8574] focus:bg-white focus:outline-none"
          />
        </div>

        {erro && <p className="text-xs font-semibold text-rose-600">{erro}</p>}

        <button
          type="submit"
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold shadow-sm transition active:scale-[0.98] ${
            categoria === 'PUNICAO'
              ? 'bg-[#C81E1E] text-white hover:bg-[#B91C1C]'
              : 'bg-[#0A3D2E] text-[#FACC15] hover:bg-[#0F533E]'
          }`}
        >
          {categoria === 'PUNICAO' ? (
            <MinusCircle className="h-4 w-4" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          {categoria === 'PUNICAO'
            ? 'Aplicar Punição'
            : categoria === 'OBSERVACAO'
            ? 'Salvar Observação da Unidade'
            : 'Lançar Pontuação'}
        </button>
      </form>

      {/* Histórico Auditável */}
      <div className="card-camp space-y-2.5 rounded-3xl p-4">
        <h2 className="text-sm font-black text-[#0A3D2E]">
          Extrato de Lançamentos ({lancamentos.length})
        </h2>

        {lancamentos.length === 0 ? (
          <p className="py-6 text-center text-xs font-medium text-[#5C6B64]">
            Nenhum lançamento de pontos ou punição registrado ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {lancamentos.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#E2DAC7] bg-[#FAF6EA] px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-[#0A3D2E]">{l.nomeEquipe}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        l.categoria === 'PUNICAO'
                          ? 'bg-rose-100 text-[#C81E1E]'
                          : l.categoria === 'OBSERVACAO'
                          ? 'bg-[#E5DEC9] text-[#4B5B53]'
                          : 'bg-[#ECFDF5] text-[#0E5A36]'
                      }`}
                    >
                      {l.categoria}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-[#0A2E22]">{l.motivo}</p>
                  <p className="mt-0.5 text-[11px] text-[#5C6B64]">
                    Por {l.autor}
                    {l.atividadeRelacionada ? ` • ${l.atividadeRelacionada}` : ''} •{' '}
                    {new Date(l.criadoEm).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`font-mono text-base font-black ${
                      l.pontos > 0
                        ? 'text-[#0E5A36]'
                        : l.pontos < 0
                        ? 'text-[#C81E1E]'
                        : 'text-[#5C6B64]'
                    }`}
                  >
                    {l.pontos > 0 ? `+${l.pontos}` : l.pontos}
                  </span>
                  <button
                    onClick={() => removerLancamentoPontuacao(l.id)}
                    className="rounded-lg p-1.5 text-[#5C6B64] hover:bg-rose-50 hover:text-[#C81E1E]"
                    aria-label="Remover lançamento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
