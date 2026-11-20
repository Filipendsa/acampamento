import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Cloud,
  CloudOff,
  Download,
  Lock,
  Moon,
  Music,
  RefreshCw,
  Settings,
  Trophy,
  Unlock,
  Users,
} from 'lucide-react';
import { AcampamentoStoreProvider, useAcampamento } from './application/AcampamentoStoreContext';
import { ModalConfiguracoesSync } from './acampamento/acesso-diretoria/ui/ModalConfiguracoesSync';
import { TelaPontuacaoAdmin } from './acampamento/pontuacao-e-disciplina/ui/TelaPontuacaoAdmin';
import { CentralAvisosBanner } from './acampamento/programacao-e-avisos/ui/CentralAvisosBanner';
import { TelaProgramacao } from './acampamento/programacao-e-avisos/ui/TelaProgramacao';
import { TelaOcorrencias } from './acampamento/prontuario-ocorrencias/ui/TelaOcorrencias';
import { TelaMusicas } from './acampamento/repertorio-musical/ui/TelaMusicas';
import { TelaRondaSanitarismo } from './acampamento/ronda-e-sanitarismo/ui/TelaRondaSanitarismo';
import { TelaManuaisCampori } from './acampamento/treinamento-campori/ui/TelaManuaisCampori';
import { TelaUnidades } from './acampamento/unidades-e-desbravadores/ui/TelaUnidades';

type AbaId =
  | 'programacao'
  | 'ronda-sanitarismo'
  | 'manuais'
  | 'unidades'
  | 'ocorrencias'
  | 'musicas'
  | 'pontuacao';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const AcampamentoShell: React.FC = () => {
  const { carregando, sessao, syncStatus, sincronizarAgora } = useAcampamento();

  const [aba, setAba] = useState<AbaId>('programacao');
  const [manualIdSelecionado, setManualIdSelecionado] = useState<string | null>(null);
  const [momentoMusicalFiltro, setMomentoMusicalFiltro] = useState<string | null>(null);
  const [prePunicao, setPrePunicao] = useState<{
    unidadeId: string;
    motivo: string;
    ocorrenciaId: string;
  } | null>(null);
  const [configAberto, setConfigAberto] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstalarPwa = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const res = await installPrompt.userChoice;
    if (res.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const abrirManual = (manualId: string) => {
    setManualIdSelecionado(manualId);
    setAba('manuais');
  };

  const abrirMusicasDoMomento = (momento: string) => {
    setMomentoMusicalFiltro(momento);
    setAba('musicas');
  };

  const converterOcorrenciaEmPunicao = (
    unidadeId: string,
    motivo: string,
    ocorrenciaId: string
  ) => {
    setPrePunicao({ unidadeId, motivo, ocorrenciaId });
    setAba('pontuacao');
  };

  const navItems: Array<{
    id: AbaId;
    rotulo: string;
    icone: React.ReactNode;
  }> = [
    { id: 'programacao', rotulo: 'Itinerário', icone: <Calendar className="h-5 w-5" /> },
    { id: 'ronda-sanitarismo', rotulo: 'Ronda', icone: <Moon className="h-5 w-5" /> },
    { id: 'manuais', rotulo: 'Manuais', icone: <BookOpen className="h-5 w-5" /> },
    { id: 'unidades', rotulo: 'Unidades', icone: <Users className="h-5 w-5" /> },
    { id: 'ocorrencias', rotulo: 'Ocorrências', icone: <ClipboardList className="h-5 w-5" /> },
    { id: 'musicas', rotulo: 'Músicas', icone: <Music className="h-5 w-5" /> },
    {
      id: 'pontuacao',
      rotulo: 'Pontuação',
      icone: sessao.isAdministrativa ? (
        <Unlock className="h-5 w-5 text-[#EA580C]" />
      ) : (
        <Lock className="h-5 w-5 text-[#EA580C]" />
      ),
    },
  ];

  if (carregando) {
    return (
      <div className="bg-camp-daylight flex min-h-screen flex-col items-center justify-center p-6 text-[#0A3D2E]">
        <img src="/icons/icon.svg" alt="Dorina Azevedo" className="mb-3 h-16 w-16 animate-bounce" />
        <p className="text-sm font-extrabold">Carregando base offline do Acampamento...</p>
      </div>
    );
  }

  return (
    <div className="bg-camp-daylight min-h-screen pb-24 text-[#0A2E22] lg:pb-8">
      {/* Header Verde Floresta Dorina com Faixa Dourada do Cartaz */}
      <header className="sticky top-0 z-30 border-b-4 border-[#FACC15] bg-gradient-to-r from-[#0A3D2E] via-[#0F533E] to-[#0A3D2E] text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/icons/icon.svg"
              alt="Clube Dorina Azevedo"
              className="h-10 w-10 shrink-0 rounded-xl border-2 border-[#FACC15] bg-white/10 shadow-sm"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-black tracking-wide text-white sm:text-base">
                  DORINA AZEVEDO
                </p>
                <span className="hidden sm:inline-block rounded-md bg-[#FACC15] px-2 py-0.5 text-[10px] font-black uppercase text-[#0A3D2E]">
                  Acampamento 2026
                </span>
              </div>
              <p className="truncate text-[11px] font-semibold text-[#FDE047]">
                A Alegria de Ser Desbravador • {sessao.nomeOperador}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {installPrompt && (
              <button
                onClick={handleInstalarPwa}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#FACC15] px-3 py-1.5 text-xs font-black text-[#0A3D2E] shadow-md transition hover:bg-[#fde047]"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Baixar App</span>
              </button>
            )}

            <button
              onClick={() =>
                syncStatus.endpointConfigured ? void sincronizarAgora() : setConfigAberto(true)
              }
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold transition ${
                syncStatus.online
                  ? 'border-emerald-300/40 bg-white/10 text-emerald-100 hover:bg-white/20'
                  : 'border-amber-300/60 bg-amber-400/20 text-amber-100'
              }`}
              title="Status Offline / Sincronização Pull & Push"
            >
              {syncStatus.syncing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#FACC15]" />
              ) : syncStatus.online ? (
                <Cloud className="h-3.5 w-3.5 text-[#FACC15]" />
              ) : (
                <CloudOff className="h-3.5 w-3.5 text-amber-300" />
              )}
              <span className="hidden sm:inline">
                {syncStatus.online ? 'Online' : 'Offline'}
              </span>
              {syncStatus.pendingCount > 0 && (
                <span className="rounded-full bg-[#FACC15] px-1.5 text-[10px] font-black text-[#0A3D2E]">
                  {syncStatus.pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setConfigAberto(true)}
              className="rounded-xl border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Configurações e Sincronização"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Layout Principal: Sidebar no Notebook (lg+) + Conteúdo */}
      <div className="mx-auto flex max-w-7xl gap-6 px-3 pt-4 sm:px-4">
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="card-camp sticky top-20 space-y-1.5 rounded-3xl p-3">
            {navItems.map((item) => {
              const ativa = aba === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAba(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-extrabold transition active:scale-[0.98] ${
                    ativa
                      ? 'bg-[#0A3D2E] text-[#FACC15] shadow-md shadow-[#0A3D2E]/20'
                      : 'text-[#2C3E36] hover:bg-[#FAF6EA] hover:text-[#0A3D2E]'
                  }`}
                >
                  {item.icone}
                  <span>{item.rotulo}</span>
                </button>
              );
            })}

            <div className="mt-4 rounded-2xl border border-[#E2DAC7] bg-[#FAF6EA] p-3 text-[11px] text-[#4B5B53]">
              <p className="flex items-center gap-1.5 font-extrabold text-[#0A3D2E]">
                <Trophy className="h-3.5 w-3.5 text-[#EA580C]" />
                Modo Diretoria
              </p>
              <p className="mt-1 font-medium">
                {sessao.isAdministrativa
                  ? 'Diretoria Administrativa autenticada.'
                  : 'Pontuação restrita à Diretoria Administrativa.'}
              </p>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          <CentralAvisosBanner
            onAbrirManual={abrirManual}
            onAbrirMusicasMomento={abrirMusicasDoMomento}
          />

          {aba === 'programacao' && (
            <TelaProgramacao
              onAbrirManual={abrirManual}
              onAbrirMusicasMomento={abrirMusicasDoMomento}
            />
          )}
          {aba === 'ronda-sanitarismo' && <TelaRondaSanitarismo />}
          {aba === 'manuais' && (
            <TelaManuaisCampori manualIdInicial={manualIdSelecionado} />
          )}
          {aba === 'unidades' && <TelaUnidades />}
          {aba === 'ocorrencias' && (
            <TelaOcorrencias onConverterEmPunicao={converterOcorrenciaEmPunicao} />
          )}
          {aba === 'musicas' && (
            <TelaMusicas momentoFiltroInicial={momentoMusicalFiltro} />
          )}
          {aba === 'pontuacao' && (
            <TelaPontuacaoAdmin
              prePreencherPunicao={prePunicao}
              onLimparPrePreenchimento={() => setPrePunicao(null)}
            />
          )}
        </main>
      </div>

      {/* Bottom Bar Mobile (< lg) em Tema Claro */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[#E2DAC7] bg-white/95 shadow-[0_-4px_20px_rgba(10,61,46,0.08)] backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-7">
          {navItems.map((item) => {
            const ativa = aba === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAba(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-extrabold transition ${
                  ativa
                    ? 'text-[#0A3D2E] bg-[#FEF9C3]/70 border-t-2 border-[#0A3D2E]'
                    : 'text-[#5C6B64] hover:text-[#0A3D2E]'
                }`}
              >
                {item.icone}
                <span className="max-w-full truncate px-0.5">{item.rotulo}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <ModalConfiguracoesSync
        aberto={configAberto}
        onFechar={() => setConfigAberto(false)}
        podeInstalarPwa={Boolean(installPrompt)}
        onInstalarPwa={handleInstalarPwa}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AcampamentoStoreProvider>
      <AcampamentoShell />
    </AcampamentoStoreProvider>
  );
};

export default App;
