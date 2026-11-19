import React, { useEffect, useState } from 'react';
import { Check, Edit3, Music, Plus, Trash2, X } from 'lucide-react';
import { useAcampamento } from '../../../application/AcampamentoStoreContext';
import { MOMENTOS_MUSICAIS, MomentoMusical } from '../domain/MusicaAcampamento';

interface TelaMusicasProps {
  momentoFiltroInicial?: string | null;
}

export const TelaMusicas: React.FC<TelaMusicasProps> = ({ momentoFiltroInicial }) => {
  const { repertorio, adicionarMusica, editarMusica, alternarMusicaTocada, removerMusica } =
    useAcampamento();

  const [filtroMomento, setFiltroMomento] = useState<string>(momentoFiltroInicial || 'TODOS');
  const [titulo, setTitulo] = useState('');
  const [interprete, setInterprete] = useState('');
  const [momento, setMomento] = useState<MomentoMusical>('Momento na Fogueira');
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editInterprete, setEditInterprete] = useState('');
  const [editMomento, setEditMomento] = useState<MomentoMusical>('Geral / Livre');
  const [editObs, setEditObs] = useState('');

  useEffect(() => {
    if (momentoFiltroInicial) {
      setFiltroMomento(momentoFiltroInicial);
      if (MOMENTOS_MUSICAIS.includes(momentoFiltroInicial as MomentoMusical)) {
        setMomento(momentoFiltroInicial as MomentoMusical);
      }
    }
  }, [momentoFiltroInicial]);

  const musicas = repertorio.musicasAtivas.filter(
    (m) => filtroMomento === 'TODOS' || m.momento === filtroMomento
  );

  const handleAdicionar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    try {
      adicionarMusica({
        titulo,
        interpreteOuOrigem: interprete,
        momento,
        observacao,
      });
      setTitulo('');
      setInterprete('');
      setObservacao('');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao adicionar música.');
    }
  };

  const iniciarEdicao = (id: string) => {
    const m = repertorio.obterPorId(id);
    if (!m) return;
    setEditandoId(id);
    setEditTitulo(m.titulo);
    setEditInterprete(m.interpreteOuOrigem ?? '');
    setEditMomento(m.momento);
    setEditObs(m.observacao ?? '');
  };

  const salvarEdicao = (id: string) => {
    try {
      editarMusica(id, {
        titulo: editTitulo,
        interpreteOuOrigem: editInterprete,
        momento: editMomento,
        observacao: editObs,
      });
      setEditandoId(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao editar música.');
    }
  };

  return (
    <div className="space-y-4 animate-fade-slide-up">
      <div className="card-camp rounded-3xl p-4">
        <h1 className="flex items-center gap-2 text-lg font-black text-[#0A3D2E]">
          <Music className="h-5 w-5 text-[#0369A1]" />
          Músicas do Acampamento (Editável na Hora)
        </h1>
        <p className="mt-1 text-xs font-medium text-[#4B5B53]">
          Organize as músicas por momento do itinerário (sem letras) e marque as que já foram
          tocadas. Funciona 100% offline.
        </p>
      </div>

      {/* Adicionar Música */}
      <form onSubmit={handleAdicionar} className="card-camp space-y-2.5 rounded-3xl p-4">
        <h2 className="text-sm font-black text-[#0A3D2E]">Adicionar Música</h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Nome da música..."
            className="rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2.5 text-sm font-medium text-[#0A2E22] placeholder-[#8B8574] focus:bg-white focus:outline-none"
          />
          <input
            type="text"
            value={interprete}
            onChange={(e) => setInterprete(e.target.value)}
            placeholder="Cantor / Tom / Link (opcional)"
            className="rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2.5 text-sm font-medium text-[#0A2E22] placeholder-[#8B8574] focus:bg-white focus:outline-none"
          />
          <select
            value={momento}
            onChange={(e) => setMomento(e.target.value as MomentoMusical)}
            className="rounded-xl border border-[#D8CFBC] bg-white px-3 py-2.5 text-xs font-bold text-[#0A3D2E]"
          >
            {MOMENTOS_MUSICAIS.map((mom) => (
              <option key={mom} value={mom}>
                {mom}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Obs. (ex: violão, playback)"
            className="rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2.5 text-sm font-medium text-[#0A2E22] placeholder-[#8B8574] focus:bg-white focus:outline-none"
          />
        </div>
        {erro && <p className="text-xs font-semibold text-rose-600">{erro}</p>}
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0369A1] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#0284C7] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Adicionar à Programação
        </button>
      </form>

      {/* Filtro por Momento */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFiltroMomento('TODOS')}
          className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
            filtroMomento === 'TODOS'
              ? 'bg-[#0369A1] text-white shadow-sm'
              : 'border border-[#D8CFBC] bg-white text-[#0A3D2E] hover:bg-[#FAF6EA]'
          }`}
        >
          Todos ({repertorio.musicasAtivas.length})
        </button>
        {MOMENTOS_MUSICAIS.map((mom) => {
          const qtd = repertorio.porMomento(mom).length;
          return (
            <button
              key={mom}
              onClick={() => setFiltroMomento(mom)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filtroMomento === mom
                  ? 'bg-[#0369A1] text-white shadow-sm'
                  : 'border border-[#D8CFBC] bg-white text-[#0A3D2E] hover:bg-[#FAF6EA]'
              }`}
            >
              {mom} {qtd > 0 ? `(${qtd})` : ''}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {musicas.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-[#D8CFBC] bg-white/70 p-8 text-center text-xs font-semibold text-[#5C6B64]">
            Nenhuma música cadastrada para este filtro ainda. Adicione acima na hora do acampamento!
          </div>
        ) : (
          musicas.map((m) => {
            const emEdicao = editandoId === m.id;
            return (
              <div
                key={m.id}
                className={`rounded-2xl border p-3.5 transition ${
                  m.tocada
                    ? 'border-emerald-300 bg-[#ECFDF5] opacity-80'
                    : 'card-camp card-camp-hover'
                }`}
              >
                {emEdicao ? (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                      type="text"
                      value={editTitulo}
                      onChange={(e) => setEditTitulo(e.target.value)}
                      className="rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-2.5 py-1.5 text-sm font-medium text-[#0A2E22]"
                    />
                    <input
                      type="text"
                      value={editInterprete}
                      onChange={(e) => setEditInterprete(e.target.value)}
                      placeholder="Cantor / Tom"
                      className="rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-2.5 py-1.5 text-sm text-[#0A2E22]"
                    />
                    <select
                      value={editMomento}
                      onChange={(e) => setEditMomento(e.target.value as MomentoMusical)}
                      className="rounded-xl border border-[#D8CFBC] bg-white px-2.5 py-1.5 text-xs font-bold text-[#0A3D2E]"
                    >
                      {MOMENTOS_MUSICAIS.map((mom) => (
                        <option key={mom} value={mom}>
                          {mom}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editObs}
                        onChange={(e) => setEditObs(e.target.value)}
                        placeholder="Obs."
                        className="flex-1 rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-2.5 py-1.5 text-sm text-[#0A2E22]"
                      />
                      <button
                        onClick={() => salvarEdicao(m.id)}
                        className="rounded-xl bg-[#0E5A36] px-3 py-1.5 text-xs font-bold text-white"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="rounded-xl border border-[#D8CFBC] bg-white px-2.5 py-1.5 text-xs text-[#5C6B64]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => alternarMusicaTocada(m.id)}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition ${
                          m.tocada
                            ? 'border-[#0E5A36] bg-[#0E5A36] text-white'
                            : 'border-[#C8BDA3] bg-[#FAF6EA] text-transparent hover:border-[#0E5A36]'
                        }`}
                        aria-label="Marcar como tocada"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <div>
                        <p
                          className={`text-sm font-extrabold ${
                            m.tocada ? 'line-through text-[#5C6B64]' : 'text-[#0A3D2E]'
                          }`}
                        >
                          {m.titulo}
                        </p>
                        <p className="text-xs text-[#4B5B53]">
                          <span className="font-bold text-[#0369A1]">{m.momento}</span>
                          {m.interpreteOuOrigem ? ` • ${m.interpreteOuOrigem}` : ''}
                          {m.observacao ? ` • ${m.observacao}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => iniciarEdicao(m.id)}
                        className="rounded-lg p-2 text-[#5C6B64] hover:bg-[#FAF6EA] hover:text-[#0A3D2E]"
                        aria-label="Editar música"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removerMusica(m.id)}
                        className="rounded-lg p-2 text-[#5C6B64] hover:bg-rose-50 hover:text-[#C81E1E]"
                        aria-label="Remover música"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
