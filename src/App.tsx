import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Calendar,
  ClipboardList,
  Cloud,
  CloudOff,
  Download,
  Lock,
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
import { TelaManuaisCampori } from './acampamento/treinamento-campori/ui/TelaManuaisCampori';
import { TelaUnidades } from './acampamento/unidades-e-desbravadores/ui/TelaUnidades';

type AbaId = 'programacao' | 'manuais' | 'unidades' | 'ocorrencias' | 'musicas' | 'pontuacao';

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
    { id: 'manuais', rotulo: 'Manuais', icone: <BookOpen className="h-5 w-5" /> },
    { id: 'unidades', rotulo: 'Unidades', icone: <Users className="h-5 w-5" /> },
    { id: 'ocorrencias', rotulo: 'Ocorrências', icone: <ClipboardList className="h-5 w-5" /> },
    { id: 'musicas', rotulo: 'Músicas', icone: <Music className="h-5 w-5" /> },
    {
      id: 'pontuacao',
      rotulo: 'Pontuação',
      icone: sessao.isAdministrativa ? (
        <Unlock className="h-5 w-5 text-amber-400" />
      ) : (
        <Lock className="h-5 w-5 text-amber-400" />
      ),
    },
  ];

  if (carregando) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-200 p-6">
        <img src="/icons/icon.svg" alt="Dorina Azevedo" className="h-16 w-16 mb-3 animate-pulse" />
        <p className="text-sm font-bold">Carregando base offline do Acampamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 lg:pb-6">
      {/* Header Superior */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/icons/icon.svg"
              alt="Clube Dorina Azevedo"
              className="h-9 w-9 shrink-0 rounded-xl"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-white">
                Dorina Azevedo • Campori Prep
              </p>
              <p className="truncate text-[11px] text-emerald-400 font-medium">
                A Alegria de Ser Desbravador • {sessao.nomeOperador}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {installPrompt && (
              <button
                onClick={handleInstalarPwa}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-extrabold text-emerald-950 hover:bg-emerald-400"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Baixar App</span>
              </button>
            )}

            <button
              onClick={() => (syncStatus.endpointConfigured ? void sincronizarAgora() : setConfigAberto(true))}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-bold ${
                syncStatus.online
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
              }`}
              title="Status Offline / Sincronização Pull & Push"
            >
              {syncStatus.syncing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : syncStatus.online ? (
                <Cloud className="h-3.5 w-3.5" />
              ) : (
                <CloudOff className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {syncStatus.online ? 'Online' : 'Offline'}
              </span>
              {syncStatus.pendingCount > 0 && (
                <span className="rounded-full bg-amber-400 px-1.5 text-[10px] font-black text-slate-950">
                  {syncStatus.pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setConfigAberto(true)}
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
              aria-label="Configurações e Sincronização"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Layout Principal: Sidebar no Notebook (lg+) + Conteúdo */}
      <div className="mx-auto flex max-w-7xl gap-6 px-3 pt-4 sm:px-4">
        <aside className="hidden lg:block w-60 shrink-0">
          <nav className="sticky top-20 space-y-1.5 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
            {navItems.map((item) => {
              const ativa = aba === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAba(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
                    ativa
                      ? 'bg-emerald-500 text-emerald-950 shadow-md'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icone}
                  <span>{item.rotulo}</span>
                </button>
              );
            })}

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-[11px] text-slate-400">
              <p className="flex items-center gap-1.5 font-bold text-amber-300">
                <Trophy className="h-3.5 w-3.5" />
                Modo Diretoria
              </p>
              <p className="mt-1">
                {sessao.isAdministrativa
                  ? 'Diretoria Administrativa autenticada.'
                  : 'Pontuação restrita à Diretoria Administrativa.'}
              </p>
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          {/* Central de Avisos no topo para nunca se perderem no horário */}
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

      {/* Bottom Bar Mobile (< lg) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-6">
          {navItems.map((item) => {
            const ativa = aba === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAba(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-bold transition ${
                  ativa ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.icone}
                <span className="truncate max-w-full px-0.5">{item.rotulo}</span>
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
