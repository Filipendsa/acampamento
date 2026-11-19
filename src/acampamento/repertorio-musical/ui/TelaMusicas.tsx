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
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <h1 className="flex items-center gap-2 text-lg font-extrabold text-white">
          <Music className="h-5 w-5 text-sky-400" />
          Músicas do Acampamento (Editável na Hora)
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Organize as músicas por momento do itinerário (sem letras) e marque as que já foram
          tocadas. Funciona 100% offline.
        </p>
      </div>

      {/* Adicionar Música na Hora */}
      <form
        onSubmit={handleAdicionar}
        className="space-y-2.5 rounded-2xl border border-slate-800 bg-slate-900/90 p-4"
      >
        <h2 className="text-sm font-bold text-white">Adicionar Música</h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Nome da música..."
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500"
          />
          <input
            type="text"
            value={interprete}
            onChange={(e) => setInterprete(e.target.value)}
            placeholder="Cantor / Tom / Link (opcional)"
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500"
          />
          <select
            value={momento}
            onChange={(e) => setMomento(e.target.value as MomentoMusical)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white"
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
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder-slate-500"
          />
        </div>
        {erro && <p className="text-xs text-rose-400">{erro}</p>}
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-sky-400"
        >
          <Plus className="h-4 w-4" />
          Adicionar à Programação
        </button>
      </form>

      {/* Filtro por Momento */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFiltroMomento('TODOS')}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
            filtroMomento === 'TODOS'
              ? 'bg-sky-500 text-slate-950'
              : 'border border-slate-800 bg-slate-900 text-slate-300'
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
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                filtroMomento === mom
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'border border-slate-800 bg-slate-900 text-slate-300'
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
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
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
                    ? 'border-emerald-500/30 bg-emerald-950/20 opacity-80'
                    : 'border-slate-800 bg-slate-900/90'
                }`}
              >
                {emEdicao ? (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <input
                      type="text"
                      value={editTitulo}
                      onChange={(e) => setEditTitulo(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm text-white"
                    />
                    <input
                      type="text"
                      value={editInterprete}
                      onChange={(e) => setEditInterprete(e.target.value)}
                      placeholder="Cantor / Tom"
                      className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm text-white"
                    />
                    <select
                      value={editMomento}
                      onChange={(e) => setEditMomento(e.target.value as MomentoMusical)}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
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
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-sm text-white"
                      />
                      <button
                        onClick={() => salvarEdicao(m.id)}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-emerald-950"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300"
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
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${
                          m.tocada
                            ? 'border-emerald-400 bg-emerald-400 text-emerald-950'
                            : 'border-slate-600 bg-slate-950 text-transparent hover:border-slate-400'
                        }`}
                        aria-label="Marcar como tocada"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            m.tocada ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {m.titulo}
                        </p>
                        <p className="text-xs text-slate-400">
                          <span className="text-sky-300 font-semibold">{m.momento}</span>
                          {m.interpreteOuOrigem ? ` • ${m.interpreteOuOrigem}` : ''}
                          {m.observacao ? ` • ${m.observacao}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => iniciarEdicao(m.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                        aria-label="Editar música"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removerMusica(m.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
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
