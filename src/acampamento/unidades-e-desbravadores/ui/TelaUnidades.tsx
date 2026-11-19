import React, { useState } from 'react';
import { GitMerge, Link2Off, Plus, Shield, UserPlus, Users, Sparkles } from 'lucide-react';
import { useAcampamento } from '../../../application/AcampamentoStoreContext';
import { labelGeneroUnidade } from '../domain/GeneroUnidade';
import { PapelParticipante } from '../domain/PapelParticipante';

export const TelaUnidades: React.FC = () => {
  const {
    unidades,
    aliancas,
    equipesOperacionais,
    unirUnidades,
    aplicarUnioesPlanejadas,
    desfazerAlianca,
    adicionarMembro,
  } = useAcampamento();

  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [nomeAlianca, setNomeAlianca] = useState('');
  const [erroFusao, setErroFusao] = useState<string | null>(null);

  const [mostrarFormMembro, setMostrarFormMembro] = useState(false);
  const [unidadeMembroId, setUnidadeMembroId] = useState(unidades[0]?.id ?? '');
  const [nomeMembro, setNomeMembro] = useState('');
  const [papelMembro, setPapelMembro] = useState<PapelParticipante>('DESBRAVADOR');
  const [erroMembro, setErroMembro] = useState<string | null>(null);

  const aliancasAtivas = aliancas.filter((a) => a.ativa);

  const primeiraSelecionada = unidades.find((u) => u.id === selecionadas[0]);
  const generoTravado = primeiraSelecionada?.genero ?? null;

  const toggleSelecionada = (id: string) => {
    setErroFusao(null);
    setSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleUnir = (e: React.FormEvent) => {
    e.preventDefault();
    setErroFusao(null);
    try {
      unirUnidades(selecionadas, nomeAlianca);
      setSelecionadas([]);
      setNomeAlianca('');
    } catch (err) {
      setErroFusao(err instanceof Error ? err.message : 'Erro ao unir unidades.');
    }
  };

  const handleAdicionarMembro = (e: React.FormEvent) => {
    e.preventDefault();
    setErroMembro(null);
    try {
      adicionarMembro(unidadeMembroId, nomeMembro, papelMembro);
      setNomeMembro('');
      setMostrarFormMembro(false);
    } catch (err) {
      setErroMembro(err instanceof Error ? err.message : 'Erro ao adicionar participante.');
    }
  };

  const totalCriancas = unidades.reduce((acc, u) => acc + u.desbravadores.length, 0);
  const totalDiretoria = unidades.reduce((acc, u) => acc + u.diretoria.length, 0);

  return (
    <div className="space-y-4">
      {/* Resumo & Ações */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-extrabold text-white">
              <Users className="h-5 w-5 text-emerald-400" />
              Unidades & Desbravadores
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              {unidades.length} unidades base • {totalCriancas} crianças/desbravadores •{' '}
              {totalDiretoria} diretoria nas unidades • {equipesOperacionais.length} equipes ativas
            </p>
          </div>

          <button
            onClick={() => setMostrarFormMembro((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700"
          >
            <UserPlus className="h-4 w-4 text-emerald-400" />
            Adicionar Participante
          </button>
        </div>

        {mostrarFormMembro && (
          <form
            onSubmit={handleAdicionarMembro}
            className="mt-3 grid gap-2.5 rounded-xl border border-slate-700 bg-slate-950 p-3 sm:grid-cols-4"
          >
            <select
              value={unidadeMembroId}
              onChange={(e) => setUnidadeMembroId(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
            >
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nomeExibicao} ({labelGeneroUnidade(u.genero)})
                </option>
              ))}
            </select>
            <input
              type="text"
              value={nomeMembro}
              onChange={(e) => setNomeMembro(e.target.value)}
              placeholder="Nome completo..."
              className="sm:col-span-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
            />
            <div className="flex gap-2">
              <select
                value={papelMembro}
                onChange={(e) => setPapelMembro(e.target.value as PapelParticipante)}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-white"
              >
                <option value="DESBRAVADOR">Desbravador</option>
                <option value="DIRETORIA">Diretoria</option>
              </select>
              <button
                type="submit"
                className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-emerald-950 hover:bg-emerald-400"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {erroMembro && <p className="sm:col-span-4 text-xs text-rose-400">{erroMembro}</p>}
          </form>
        )}
      </div>

      {/* Painel de União de Unidades (Mesmo Gênero) */}
      <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-amber-300">
              <GitMerge className="h-4 w-4" />
              União de Unidades (Fusão por Gênero)
            </h2>
            <p className="text-xs text-slate-400">
              Regra: só é permitido unir Feminina com Feminina e Masculina com Masculina.
            </p>
          </div>
          <button
            onClick={aplicarUnioesPlanejadas}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400/15 border border-amber-400/40 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400/25"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Aplicar Uniões Planejadas (1+2, 3+4, Masc.)
          </button>
        </div>

        {/* Uniões Ativas */}
        {aliancasAtivas.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Uniões Ativas Agora
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {aliancasAtivas.map((al) => (
                <div
                  key={al.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3"
                >
                  <div>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        al.genero === 'FEMININO'
                          ? 'bg-pink-500/20 text-pink-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {labelGeneroUnidade(al.genero)}
                    </span>
                    <p className="mt-1 text-sm font-extrabold text-white">{al.nome}</p>
                  </div>
                  <button
                    onClick={() => desfazerAlianca(al.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-bold text-rose-300 hover:bg-rose-500/20"
                  >
                    <Link2Off className="h-3.5 w-3.5" />
                    Separar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Construtor Manual de União */}
        <form onSubmit={handleUnir} className="space-y-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-xs font-semibold text-slate-300">
            Ou selecione unidades disponíveis para unir manualmente:
          </p>
          <div className="flex flex-wrap gap-2">
            {unidades.map((u) => {
              const jaUnida = aliancasAtivas.some((a) => a.contemUnidade(u.id));
              const marcada = selecionadas.includes(u.id);
              const generoIncompativel = generoTravado !== null && u.genero !== generoTravado;
              const desabilitada = jaUnida || (!marcada && generoIncompativel);

              return (
                <button
                  type="button"
                  key={u.id}
                  disabled={desabilitada}
                  onClick={() => toggleSelecionada(u.id)}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                    marcada
                      ? 'border-amber-400 bg-amber-400 text-slate-950'
                      : desabilitada
                      ? 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed'
                      : 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  {u.nomeExibicao} ({u.genero === 'FEMININO' ? 'F' : 'M'})
                  {jaUnida ? ' • Já unida' : ''}
                </button>
              );
            })}
          </div>

          {selecionadas.length >= 2 && (
            <div className="flex flex-wrap gap-2 pt-1">
              <input
                type="text"
                value={nomeAlianca}
                onChange={(e) => setNomeAlianca(e.target.value)}
                placeholder="Nome da união (opcional, ex: Equipe Águias)"
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
              />
              <button
                type="submit"
                className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-emerald-950 hover:bg-emerald-400"
              >
                Confirmar União ({selecionadas.length})
              </button>
            </div>
          )}

          {erroFusao && <p className="text-xs text-rose-400">{erroFusao}</p>}
        </form>
      </div>

      {/* Lista de Todas as 6 Unidades Separadas */}
      <div className="grid gap-3 md:grid-cols-2">
        {unidades.map((u) => {
          const aliancaAtual = aliancasAtivas.find((a) => a.contemUnidade(u.id));
          return (
            <div
              key={u.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">{u.nomeExibicao}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        u.genero === 'FEMININO'
                          ? 'bg-pink-500/20 text-pink-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}
                    >
                      {labelGeneroUnidade(u.genero)}
                    </span>
                  </div>
                  {aliancaAtual && (
                    <p className="mt-0.5 text-[11px] font-semibold text-emerald-400">
                      Unida em: {aliancaAtual.nome}
                    </p>
                  )}
                </div>
                <span className="rounded-xl bg-slate-950 px-2.5 py-1 text-xs font-bold text-slate-300 border border-slate-800">
                  {u.membros.length} membros
                </span>
              </div>

              <div className="space-y-1.5">
                {u.membros.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-slate-100">{m.nome}</span>
                    {m.isDiretoria ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                        <Shield className="h-3 w-3" />
                        Diretoria
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        Desbravador
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
