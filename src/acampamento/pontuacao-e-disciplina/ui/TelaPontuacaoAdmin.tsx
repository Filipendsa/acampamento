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
    <div className="space-y-4">
      {/* Cabeçalho Administrativo */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-extrabold text-white">
            <Trophy className="h-5 w-5 text-amber-400" />
            Pontuação, Punições & Ranking (Admin)
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-amber-200/80">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Acesso administrativo liberado • Pontuação livre • Oscar DBV 2026
          </p>
        </div>
        <button
          onClick={bloquearAdmin}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-slate-800"
        >
          <Lock className="h-3.5 w-3.5 text-amber-400" />
          Bloquear Placar
        </button>
      </div>

      {/* Placar / Ranking Geral */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {rankingEquipes.map((item, idx) => (
          <div
            key={item.equipe.id}
            className={`rounded-2xl border p-4 ${
              idx === 0
                ? 'border-amber-400/60 bg-gradient-to-br from-amber-500/15 to-slate-900'
                : 'border-slate-800 bg-slate-900/90'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                  {idx + 1}º Lugar • {item.equipe.tipo === 'ALIANCA' ? 'União' : 'Unidade'}
                </span>
                <h3 className="text-base font-extrabold text-white">{item.equipe.nome}</h3>
              </div>
              <span className="rounded-xl bg-slate-950 px-3 py-1.5 font-mono text-xl font-black text-amber-300 border border-slate-800">
                {item.saldoTotal}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
                +{item.totalPositivo} pts ganhos
              </span>
              {item.totalPunicoes < 0 && (
                <span className="rounded-lg bg-rose-500/10 px-2 py-0.5 text-rose-300">
                  {item.totalPunicoes} pts punição
                </span>
              )}
              {item.quantidadeObservacoes > 0 && (
                <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-slate-300">
                  {item.quantidadeObservacoes} obs.
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Formulário de Lançamento Livre */}
      <form
        onSubmit={handleLancar}
        className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4"
      >
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <Award className="h-4 w-4 text-amber-400" />
          Novo Lançamento (Pontuação Livre / Punição / Observação)
        </h2>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Unidade ou União
            </label>
            <select
              value={equipeAlvoId}
              onChange={(e) => setEquipeAlvoId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white"
            >
              {equipesOperacionais.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Categoria
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as CategoriaLancamento)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white"
            >
              {CATEGORIAS_LANCAMENTO.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.rotulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-sm font-bold text-white disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo obrigatório (ex: Venceu Pista de Fio, ou Atraso na formação)"
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500"
          />
          <input
            type="text"
            value={atividadeRelacionada}
            onChange={(e) => setAtividadeRelacionada(e.target.value)}
            placeholder="Atividade relacionada (opcional, ex: Sáb 14h30)"
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500"
          />
        </div>

        {erro && <p className="text-xs text-rose-400">{erro}</p>}

        <button
          type="submit"
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
            categoria === 'PUNICAO'
              ? 'bg-rose-500 text-white hover:bg-rose-400'
              : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
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
      <div className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
        <h2 className="text-sm font-bold text-white">
          Extrato de Lançamentos ({lancamentos.length})
        </h2>

        {lancamentos.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">
            Nenhum lançamento de pontos ou punição registrado ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {lancamentos.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-white">{l.nomeEquipe}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        l.categoria === 'PUNICAO'
                          ? 'bg-rose-500/20 text-rose-300'
                          : l.categoria === 'OBSERVACAO'
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      {l.categoria}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-200">{l.motivo}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
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

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-mono text-base font-black ${
                      l.pontos > 0
                        ? 'text-emerald-400'
                        : l.pontos < 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {l.pontos > 0 ? `+${l.pontos}` : l.pontos}
                  </span>
                  <button
                    onClick={() => removerLancamentoPontuacao(l.id)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400"
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
