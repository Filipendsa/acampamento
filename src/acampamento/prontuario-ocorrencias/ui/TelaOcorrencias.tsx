import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardList, HeartPulse, Plus, Search, ShieldAlert } from 'lucide-react';
import { useAcampamento } from '../../../application/AcampamentoStoreContext';
import { GravidadeOcorrencia, StatusOcorrencia, TIPOS_OCORRENCIA, TipoOcorrencia } from '../domain/TipoOcorrencia';

interface TelaOcorrenciasProps {
  onConverterEmPunicao?: (unidadeId: string, motivo: string, ocorrenciaId: string) => void;
}

export const TelaOcorrencias: React.FC<TelaOcorrenciasProps> = ({ onConverterEmPunicao }) => {
  const { unidades, ocorrencias, registrarOcorrencia, atualizarStatusOcorrencia, sessao } =
    useAcampamento();

  const todosParticipantes = useMemo(
    () =>
      unidades.flatMap((u) =>
        u.membros.map((m) => ({
          id: m.id,
          nome: m.nome,
          papel: m.papel,
          unidadeId: u.id,
          unidadeNome: u.nomeExibicao,
        }))
      ),
    [unidades]
  );

  const [buscaParticipante, setBuscaParticipante] = useState('');
  const [participanteId, setParticipanteId] = useState(todosParticipantes[0]?.id ?? '');
  const [tipo, setTipo] = useState<TipoOcorrencia>('COMPORTAMENTO');
  const [gravidade, setGravidade] = useState<GravidadeOcorrencia>('MODERADA');
  const [descricao, setDescricao] = useState('');
  const [providencia, setProvidencia] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<TipoOcorrencia | 'TODOS'>('TODOS');

  const participantesFiltrados = useMemo(() => {
    const q = buscaParticipante.trim().toLowerCase();
    if (!q) return todosParticipantes;
    return todosParticipantes.filter(
      (p) => p.nome.toLowerCase().includes(q) || p.unidadeNome.toLowerCase().includes(q)
    );
  }, [todosParticipantes, buscaParticipante]);

  const ocorrenciasFiltradas = useMemo(() => {
    const q = filtroTexto.trim().toLowerCase();
    return ocorrencias.filter((o) => {
      if (filtroTipo !== 'TODOS' && o.tipo !== filtroTipo) return false;
      if (!q) return true;
      return (
        o.participanteNome.toLowerCase().includes(q) ||
        o.unidadeNome.toLowerCase().includes(q) ||
        o.descricao.toLowerCase().includes(q)
      );
    });
  }, [ocorrencias, filtroTexto, filtroTipo]);

  const handleRegistrar = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    try {
      registrarOcorrencia({
        participanteId,
        tipo,
        gravidade,
        descricao,
        providencia,
      });
      setDescricao('');
      setProvidencia('');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao registrar ocorrência.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <h1 className="flex items-center gap-2 text-lg font-extrabold text-white">
          <ClipboardList className="h-5 w-5 text-rose-400" />
          Ocorrências Individuais (Por Criança / Participante)
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Registre se alguma criança xingou, está doente, precisou de medicação ou teve algum
          incidente durante o acampamento.
        </p>
      </div>

      {/* Formulário Rápido */}
      <form
        onSubmit={handleRegistrar}
        className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4"
      >
        <h2 className="text-sm font-bold text-white">Nova Ocorrência</h2>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Buscar Criança / Participante
            </label>
            <input
              type="text"
              value={buscaParticipante}
              onChange={(e) => {
                setBuscaParticipante(e.target.value);
                const primeiro = todosParticipantes.find((p) =>
                  p.nome.toLowerCase().includes(e.target.value.trim().toLowerCase())
                );
                if (primeiro) setParticipanteId(primeiro.id);
              }}
              placeholder="Filtrar por nome ou unidade..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500"
            />
            <select
              value={participanteId}
              onChange={(e) => setParticipanteId(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-white"
            >
              {participantesFiltrados.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} — {p.unidadeNome} {p.papel === 'DIRETORIA' ? '(Diretoria)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoOcorrencia)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white"
              >
                {TIPOS_OCORRENCIA.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.rotulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Atenção / Gravidade
              </label>
              <select
                value={gravidade}
                onChange={(e) => setGravidade(e.target.value as GravidadeOcorrencia)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white"
              >
                <option value="LEVE">Leve</option>
                <option value="MODERADA">Moderada</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-2.5 md:grid-cols-2">
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="O que aconteceu? (ex: Xingou colega durante a prova, ou está com febre / dor de barriga)"
            rows={2}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500"
          />
          <textarea
            value={providencia}
            onChange={(e) => setProvidencia(e.target.value)}
            placeholder="Providência tomada (opcional: conversamos, tomou remédio, avisou os pais)"
            rows={2}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500"
          />
        </div>

        {erro && <p className="text-xs text-rose-400">{erro}</p>}

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-400"
        >
          <Plus className="h-4 w-4" />
          Registrar Ocorrência no Nome
        </button>
      </form>

      {/* Filtros + Lista */}
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-white">
            Histórico de Ocorrências ({ocorrenciasFiltradas.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Buscar criança..."
                className="rounded-xl border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-white"
              />
            </div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoOcorrencia | 'TODOS')}
              className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white"
            >
              <option value="TODOS">Todos os Tipos</option>
              {TIPOS_OCORRENCIA.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.rotulo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {ocorrenciasFiltradas.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">
            Nenhuma ocorrência registrada até o momento.
          </p>
        ) : (
          <div className="space-y-2.5">
            {ocorrenciasFiltradas.map((oc) => (
              <div
                key={oc.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-2"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {oc.tipo === 'SAUDE' ? (
                        <HeartPulse className="h-4 w-4 text-rose-400" />
                      ) : oc.tipo === 'COMPORTAMENTO' ? (
                        <ShieldAlert className="h-4 w-4 text-amber-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-sky-400" />
                      )}
                      <span className="text-sm font-extrabold text-white">
                        {oc.participanteNome}
                      </span>
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                        {oc.unidadeNome}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {TIPOS_OCORRENCIA.find((t) => t.valor === oc.tipo)?.rotulo} • Gravidade:{' '}
                      <strong
                        className={
                          oc.gravidade === 'URGENTE'
                            ? 'text-rose-400'
                            : oc.gravidade === 'MODERADA'
                            ? 'text-amber-300'
                            : 'text-slate-300'
                        }
                      >
                        {oc.gravidade}
                      </strong>{' '}
                      • Por {oc.registradoPor} em{' '}
                      {new Date(oc.criadoEm).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <select
                    value={oc.status}
                    onChange={(e) =>
                      atualizarStatusOcorrencia(oc.id, e.target.value as StatusOcorrencia)
                    }
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                      oc.status === 'RESOLVIDA'
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                        : oc.status === 'ACOMPANHANDO'
                        ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                        : 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    <option value="ABERTA">Aberta</option>
                    <option value="ACOMPANHANDO">Acompanhando</option>
                    <option value="RESOLVIDA">Resolvida</option>
                  </select>
                </div>

                <p className="text-sm text-slate-200">{oc.descricao}</p>
                {oc.providencia && (
                  <p className="flex items-center gap-1.5 text-xs text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    Providência: {oc.providencia}
                  </p>
                )}

                {sessao.isAdministrativa &&
                  oc.tipo === 'COMPORTAMENTO' &&
                  onConverterEmPunicao && (
                    <button
                      onClick={() =>
                        onConverterEmPunicao(
                          oc.unidadeId,
                          `Ocorrência (${oc.participanteNome}): ${oc.descricao}`,
                          oc.id
                        )
                      }
                      className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20"
                    >
                      Aplicar Punição na Unidade (Admin)
                    </button>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
