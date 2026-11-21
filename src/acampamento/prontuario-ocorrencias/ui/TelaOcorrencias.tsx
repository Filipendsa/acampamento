import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  Lock,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useAcampamento } from '../../../application/AcampamentoStoreContext';
import { ModalAutenticacaoAdmin } from '../../acesso-diretoria/ui/ModalAutenticacaoAdmin';
import {
  GravidadeOcorrencia,
  StatusOcorrencia,
  TIPOS_OCORRENCIA,
  TipoOcorrencia,
} from '../domain/TipoOcorrencia';

interface TelaOcorrenciasProps {
  onConverterEmPunicao?: (unidadeId: string, motivo: string, ocorrenciaId: string) => void;
}

export const TelaOcorrencias: React.FC<TelaOcorrenciasProps> = ({ onConverterEmPunicao }) => {
  const {
    unidades,
    ocorrenciasVisiveis,
    registrarOcorrencia,
    atualizarStatusOcorrencia,
    removerOcorrencia,
    sessao,
  } = useAcampamento();

  const todosParticipantes = useMemo(
    () => [
      {
        id: 'ocorrencia-geral',
        nome: 'GERAL — Ocorrência Geral (Sem pessoa específica)',
        papel: 'GERAL' as const,
        unidadeId: 'geral',
        unidadeNome: 'GERAL',
      },
      ...unidades.flatMap((u) =>
        u.membros.map((m) => ({
          id: m.id,
          nome: m.nome,
          papel: m.papel,
          unidadeId: u.id,
          unidadeNome: u.nomeExibicao,
        }))
      ),
    ],
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
  const [modalAdminAberto, setModalAdminAberto] = useState(false);

  const participantesFiltrados = useMemo(() => {
    const q = buscaParticipante.trim().toLowerCase();
    if (!q) return todosParticipantes;
    return todosParticipantes.filter(
      (p) => p.nome.toLowerCase().includes(q) || p.unidadeNome.toLowerCase().includes(q)
    );
  }, [todosParticipantes, buscaParticipante]);

  const ocorrenciasFiltradas = useMemo(() => {
    const q = filtroTexto.trim().toLowerCase();
    return ocorrenciasVisiveis.filter((o) => {
      if (filtroTipo !== 'TODOS' && o.tipo !== filtroTipo) return false;
      if (!q) return true;
      return (
        o.participanteNome.toLowerCase().includes(q) ||
        o.unidadeNome.toLowerCase().includes(q) ||
        o.descricao.toLowerCase().includes(q)
      );
    });
  }, [ocorrenciasVisiveis, filtroTexto, filtroTipo]);

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
    <div className="space-y-4 animate-fade-slide-up">
      <div className="card-camp rounded-3xl p-4">
        <h1 className="flex items-center gap-2 text-lg font-black text-[#0A3D2E]">
          <ClipboardList className="h-5 w-5 text-[#C81E1E]" />
          Ocorrências Individuais (Por Criança / Participante)
        </h1>
        <p className="mt-1 text-xs font-medium text-[#4B5B53]">
          Registre se alguma criança xingou, está doente, precisou de medicação ou teve algum
          incidente durante o acampamento.
        </p>
      </div>

      {/* Formulário Rápido */}
      <form onSubmit={handleRegistrar} className="card-camp space-y-3 rounded-3xl p-4">
        <h2 className="text-sm font-black text-[#0A3D2E]">Nova Ocorrência</h2>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#5C6B64]">
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
              className="w-full rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2 text-xs font-medium text-[#0A2E22] placeholder-[#8B8574]"
            />
            <select
              value={participanteId}
              onChange={(e) => setParticipanteId(e.target.value)}
              className="w-full rounded-xl border border-[#D8CFBC] bg-white px-3 py-2.5 text-sm font-bold text-[#0A3D2E]"
            >
              {participantesFiltrados.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id === 'ocorrencia-geral'
                    ? p.nome
                    : `${p.nome} — ${p.unidadeNome} ${p.papel === 'DIRETORIA' ? '(Diretoria)' : ''}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#5C6B64]">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoOcorrencia)}
                className="w-full rounded-xl border border-[#D8CFBC] bg-white px-3 py-2.5 text-xs font-bold text-[#0A3D2E]"
              >
                {TIPOS_OCORRENCIA.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.rotulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#5C6B64]">
                Gravidade
              </label>
              <select
                value={gravidade}
                onChange={(e) => setGravidade(e.target.value as GravidadeOcorrencia)}
                className="w-full rounded-xl border border-[#D8CFBC] bg-white px-3 py-2.5 text-xs font-bold text-[#0A3D2E]"
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
            className="w-full rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2 text-sm text-[#0A2E22] placeholder-[#8B8574] focus:bg-white focus:outline-none"
          />
          <textarea
            value={providencia}
            onChange={(e) => setProvidencia(e.target.value)}
            placeholder="Providência tomada (opcional: conversamos, tomou remédio, avisou os pais)"
            rows={2}
            className="w-full rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-3 py-2 text-sm text-[#0A2E22] placeholder-[#8B8574] focus:bg-white focus:outline-none"
          />
        </div>

        {erro && <p className="text-xs font-semibold text-rose-600">{erro}</p>}

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-[#C81E1E] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#B91C1C] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Registrar Ocorrência no Nome
        </button>
      </form>

      {/* Filtros + Lista */}
      <div className="card-camp space-y-3 rounded-3xl p-4">
        {/* Banner de Privacidade / Visibilidade (Autor + ADM) */}
        {sessao.isAdministrativa ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-900">
            <span className="flex items-center gap-2 font-bold">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
              Visão Administrativa Ativa: você está vendo todas as ocorrências registradas por toda
              a diretoria.
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#FACC15] bg-[#FEFCE8] px-3.5 py-2.5 text-xs text-[#0A3D2E]">
            <span className="flex items-center gap-2 font-semibold">
              <Lock className="h-4 w-4 shrink-0 text-[#EA580C]" />
              <span>
                Visibilidade Privada: exibindo apenas ocorrências postadas por{' '}
                <strong>{sessao.nomeOperador}</strong>. Todos os ADMs visualizam todas.
              </span>
            </span>
            <button
              type="button"
              onClick={() => setModalAdminAberto(true)}
              className="rounded-xl bg-[#0A3D2E] px-3 py-1.5 text-[11px] font-black text-[#FACC15] shadow-xs hover:bg-[#0F533E]"
            >
              Sou ADM (Desbloquear Todas)
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-black text-[#0A3D2E]">
            Histórico de Ocorrências ({ocorrenciasFiltradas.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5C6B64]" />
              <input
                type="text"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Buscar criança..."
                className="rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] py-1.5 pl-8 pr-3 text-xs font-medium text-[#0A2E22]"
              />
            </div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoOcorrencia | 'TODOS')}
              className="rounded-xl border border-[#D8CFBC] bg-[#FAF6EA] px-2.5 py-1.5 text-xs font-bold text-[#0A3D2E]"
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
          <p className="py-6 text-center text-xs font-medium text-[#5C6B64]">
            {sessao.isAdministrativa
              ? 'Nenhuma ocorrência registrada até o momento.'
              : `Nenhuma ocorrência postada por "${sessao.nomeOperador}" até o momento.`}
          </p>
        ) : (
          <div className="space-y-2.5">
            {ocorrenciasFiltradas.map((oc) => (
              <div
                key={oc.id}
                className="space-y-2 rounded-2xl border border-[#E2DAC7] bg-[#FAF6EA] p-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {oc.tipo === 'SAUDE' ? (
                        <HeartPulse className="h-4 w-4 text-[#C81E1E]" />
                      ) : oc.tipo === 'COMPORTAMENTO' ? (
                        <ShieldAlert className="h-4 w-4 text-[#EA580C]" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-[#0369A1]" />
                      )}
                      <span className="text-sm font-black text-[#0A3D2E]">
                        {oc.participanteNome}
                      </span>
                      <span className="rounded-full bg-[#0A3D2E] px-2.5 py-0.5 text-[10px] font-bold text-[#FACC15]">
                        {oc.unidadeNome}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] font-medium text-[#5C6B64]">
                      {TIPOS_OCORRENCIA.find((t) => t.valor === oc.tipo)?.rotulo} • Gravidade:{' '}
                      <strong
                        className={
                          oc.gravidade === 'URGENTE'
                            ? 'text-[#C81E1E]'
                            : oc.gravidade === 'MODERADA'
                            ? 'text-[#EA580C]'
                            : 'text-[#0E5A36]'
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

                  <div className="flex items-center gap-1.5">
                    <select
                      value={oc.status}
                      onChange={(e) =>
                        atualizarStatusOcorrencia(oc.id, e.target.value as StatusOcorrencia)
                      }
                      className={`rounded-xl border px-2.5 py-1 text-[11px] font-extrabold ${
                        oc.status === 'RESOLVIDA'
                          ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                          : oc.status === 'ACOMPANHANDO'
                          ? 'border-amber-300 bg-amber-100 text-amber-900'
                          : 'border-rose-300 bg-rose-100 text-rose-800'
                      }`}
                    >
                      <option value="ABERTA">Aberta</option>
                      <option value="ACOMPANHANDO">Acompanhando</option>
                      <option value="RESOLVIDA">Resolvida</option>
                    </select>

                    {sessao.isAdministrativa && (
                      <button
                        type="button"
                        onClick={() => removerOcorrencia(oc.id)}
                        className="rounded-xl border border-rose-200 bg-white p-1.5 text-rose-600 transition hover:bg-rose-50 hover:text-rose-800"
                        title="Excluir ocorrência (Somente ADM)"
                        aria-label="Excluir ocorrência"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm font-medium text-[#0A2E22]">{oc.descricao}</p>
                {oc.providencia && (
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#0E5A36]">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    Providência: {oc.providencia}
                  </p>
                )}

                {sessao.isAdministrativa &&
                  oc.tipo === 'COMPORTAMENTO' &&
                  oc.unidadeId !== 'geral' &&
                  onConverterEmPunicao && (
                    <button
                      onClick={() =>
                        onConverterEmPunicao(
                          oc.unidadeId,
                          `Ocorrência (${oc.participanteNome}): ${oc.descricao}`,
                          oc.id
                        )
                      }
                      className="rounded-xl bg-[#FACC15] px-3 py-1.5 text-[11px] font-black text-[#0A3D2E] shadow-xs hover:bg-[#fde047]"
                    >
                      Aplicar Punição na Unidade (Admin)
                    </button>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modalAdminAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A3D2E]/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md">
            <button
              type="button"
              onClick={() => setModalAdminAberto(false)}
              className="absolute right-3 top-3 z-10 rounded-xl p-1.5 text-[#5C6B64] hover:bg-[#EDE5D3] hover:text-[#0A3D2E]"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
            <ModalAutenticacaoAdmin onSucesso={() => setModalAdminAberto(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
