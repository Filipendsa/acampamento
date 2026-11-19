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
    <div className="space-y-4 animate-fade-slide-up">
      {/* Resumo & Ações */}
      <div className="card-camp rounded-3xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-black text-[#0A3D2E]">
              <Users className="h-5 w-5 text-[#0E5A36]" />
              Unidades & Desbravadores
            </h1>
            <p className="mt-0.5 text-xs font-semibold text-[#4B5B53]">
              {unidades.length} unidades base • {totalCriancas} crianças/desbravadores •{' '}
              {totalDiretoria} diretoria nas unidades • {equipesOperacionais.length} equipes ativas
            </p>
          </div>

          <button
            onClick={() => setMostrarFormMembro((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A3D2E] px-3.5 py-2 text-xs font-extrabold text-[#FACC15] shadow-sm hover:bg-[#0F533E]"
          >
            <UserPlus className="h-4 w-4" />
            Adicionar Participante
          </button>
        </div>

        {mostrarFormMembro && (
          <form
            onSubmit={handleAdicionarMembro}
            className="mt-3 grid gap-2.5 rounded-2xl border border-[#D8CFBC] bg-[#FAF6EA] p-3.5 sm:grid-cols-4"
          >
            <select
              value={unidadeMembroId}
              onChange={(e) => setUnidadeMembroId(e.target.value)}
              className="rounded-xl border border-[#D8CFBC] bg-white px-3 py-2 text-xs font-bold text-[#0A3D2E]"
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
              className="sm:col-span-2 rounded-xl border border-[#D8CFBC] bg-white px-3 py-2 text-xs font-medium text-[#0A2E22]"
            />
            <div className="flex gap-2">
              <select
                value={papelMembro}
                onChange={(e) => setPapelMembro(e.target.value as PapelParticipante)}
                className="flex-1 rounded-xl border border-[#D8CFBC] bg-white px-2 py-2 text-xs font-bold text-[#0A3D2E]"
              >
                <option value="DESBRAVADOR">Desbravador</option>
                <option value="DIRETORIA">Diretoria</option>
              </select>
              <button
                type="submit"
                className="rounded-xl bg-[#0E5A36] px-3 py-2 text-xs font-bold text-white hover:bg-[#157347]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {erroMembro && <p className="sm:col-span-4 text-xs font-semibold text-rose-600">{erroMembro}</p>}
          </form>
        )}
      </div>

      {/* Painel de União de Unidades */}
      <div className="card-camp space-y-3 rounded-3xl border-2 border-[#FACC15] bg-[#FEFCE8] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-black text-[#0A3D2E]">
              <GitMerge className="h-4 w-4 text-[#EA580C]" />
              União de Unidades (Fusão por Gênero)
            </h2>
            <p className="text-xs font-medium text-[#4B5B53]">
              Regra: só é permitido unir Feminina com Feminina e Masculina com Masculina.
            </p>
          </div>
          <button
            onClick={aplicarUnioesPlanejadas}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#FACC15] px-3.5 py-2 text-xs font-black text-[#0A3D2E] shadow-sm hover:bg-[#fde047] active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Aplicar Uniões Planejadas (1+2, 3+4, Masc.)
          </button>
        </div>

        {/* Uniões Ativas */}
        {aliancasAtivas.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#0E5A36]">
              Uniões Ativas Agora
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {aliancasAtivas.map((al) => (
                <div
                  key={al.id}
                  className="flex items-center justify-between gap-2 rounded-2xl border-2 border-[#0E5A36]/30 bg-white p-3 shadow-xs"
                >
                  <div>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        al.genero === 'FEMININO'
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {labelGeneroUnidade(al.genero)}
                    </span>
                    <p className="mt-1 text-sm font-black text-[#0A3D2E]">{al.nome}</p>
                  </div>
                  <button
                    onClick={() => desfazerAlianca(al.id)}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                  >
                    <Link2Off className="h-3.5 w-3.5" />
                    Separar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Construtor Manual */}
        <form
          onSubmit={handleUnir}
          className="space-y-2.5 rounded-2xl border border-[#E2DAC7] bg-white p-3.5"
        >
          <p className="text-xs font-bold text-[#0A3D2E]">
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
                  className={`rounded-xl border-2 px-3 py-2 text-xs font-extrabold transition ${
                    marcada
                      ? 'border-[#0A3D2E] bg-[#0A3D2E] text-[#FACC15] shadow-sm'
                      : desabilitada
                      ? 'border-[#E5DEC9] bg-[#FAF6EA] text-[#A8A08E] cursor-not-allowed'
                      : 'border-[#D8CFBC] bg-[#FAF6EA] text-[#0A3D2E] hover:border-[#0A3D2E]/50'
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
                className="flex-1 rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2 text-xs font-medium text-[#0A2E22]"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#0E5A36] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#157347]"
              >
                Confirmar União ({selecionadas.length})
              </button>
            </div>
          )}

          {erroFusao && <p className="text-xs font-semibold text-rose-600">{erroFusao}</p>}
        </form>
      </div>

      {/* Lista de Todas as 6 Unidades */}
      <div className="grid gap-3 md:grid-cols-2">
        {unidades.map((u) => {
          const aliancaAtual = aliancasAtivas.find((a) => a.contemUnidade(u.id));
          return (
            <div
              key={u.id}
              className="card-camp card-camp-hover space-y-3 rounded-3xl p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[#0A3D2E]">{u.nomeExibicao}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                        u.genero === 'FEMININO'
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {labelGeneroUnidade(u.genero)}
                    </span>
                  </div>
                  {aliancaAtual && (
                    <p className="mt-0.5 text-[11px] font-extrabold text-[#0E5A36]">
                      Unida em: {aliancaAtual.nome}
                    </p>
                  )}
                </div>
                <span className="rounded-xl border border-[#E2DAC7] bg-[#FAF6EA] px-2.5 py-1 text-xs font-extrabold text-[#0A3D2E]">
                  {u.membros.length} membros
                </span>
              </div>

              <div className="space-y-1.5">
                {u.membros.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-[#ECE4D2] bg-[#FAF6EA]/80 px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-[#0A2E22]">{m.nome}</span>
                    {m.isDiretoria ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FACC15]/40 px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A3D2E]">
                        <Shield className="h-3 w-3 text-[#0E5A36]" />
                        Diretoria
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[10px] font-bold text-[#0E5A36]">
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
