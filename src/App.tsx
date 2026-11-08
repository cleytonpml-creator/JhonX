import React, { useState, useEffect } from 'react';
import { KidsHeader } from './components/kids/KidsHeader';
import { KidsPhonicsArena } from './components/kids/KidsPhonicsArena';
import { KidsSentencesArena } from './components/kids/KidsSentencesArena';
import { KidsStoriesArena } from './components/kids/KidsStoriesArena';
import { KidsStickerBook } from './components/kids/KidsStickerBook';
import { KidsStationTicket } from './components/kids/KidsStationTicket';
import { KidsParentModal } from './components/kids/KidsParentModal';
import { CodeExplorer } from './components/studio/CodeExplorer';
import { WidgetInspector } from './components/studio/WidgetInspector';
import { FlutterTerminal } from './components/studio/FlutterTerminal';
import { downloadFlutterProjectZip } from './utils/flutterCode';
import { sounds } from './utils/audio';
import { safeGetItem, safeSetItem } from './utils/database';
import { Code2, Terminal as TerminalIcon, Layers, X, Sparkles, FolderGit2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'phonics' | 'sentences' | 'stories' | 'stickers' | 'station' | 'parents'>('phonics');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [starsCount, setStarsCount] = useState<number>(() => {
    const stored = safeGetItem('jhonx_stars_count');
    return stored ? Number(stored) || 120 : 120;
  });
  const [explorerName, setExplorerName] = useState<string>(() => {
    return safeGetItem('jhonx_explorer_name') || 'Alex';
  });
  const [selectedRoute, setSelectedRoute] = useState<number>(2); // Camden Word Explorer
  const [isParentModalOpen, setIsParentModalOpen] = useState<boolean>(false);
  const [isDevDrawerOpen, setIsDevDrawerOpen] = useState<boolean>(false);
  const [devTab, setDevTab] = useState<'code' | 'terminal' | 'inspector'>('code');

  // Toggle Global Sound (Vozes fonéticas e efeitos da interface)
  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    sounds.setEnabled(nextVal);
  };

  // Ganhar estrelas ao completar palavras, frases ou histórias
  const handleAddStars = (amount: number) => {
    setStarsCount((prev) => {
      const next = prev + amount;
      safeSetItem('jhonx_stars_count', String(next));
      return next;
    });
  };

  // Gastar estrelas para desbloquear figurinhas
  const handleSpendStars = (amount: number): boolean => {
    if (starsCount >= amount) {
      setStarsCount((prev) => {
        const next = prev - amount;
        safeSetItem('jhonx_stars_count', String(next));
        return next;
      });
      return true;
    }
    return false;
  };

  const handleSelectTab = (tab: 'phonics' | 'sentences' | 'stories' | 'stickers' | 'station' | 'parents') => {
    if (tab === 'parents') {
      setIsParentModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleExportZip = async () => {
    sounds.playSuccess();
    await downloadFlutterProjectZip('jhonx_app');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Fredoka'] antialiased selection:bg-rose-500 selection:text-white overflow-x-hidden">
      {/* BARRA SUPERIOR DIVERTIDA COM CONTROLE DE SOM E PONTUAÇÃO */}
      <KidsHeader
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        starsCount={starsCount}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onExportZip={handleExportZip}
      />

      {/* ÁREA PRINCIPAL DA AVENTURA INFANTIL (TELA CHEIA, SEM MOLDURA DE CELULAR) */}
      <main className="flex-1 flex flex-col relative w-full">
        {/* MODALIDADE 1: FONÉTICA (PALAVRAS CURTAS) */}
        {activeTab === 'phonics' && (
          <KidsPhonicsArena
            explorerName={explorerName}
            onWordComplete={(word) => {
              // Word cleared
            }}
            starsCount={starsCount}
            onAddStars={handleAddStars}
            onSelectMode={(mode) => setActiveTab(mode)}
          />
        )}

        {/* MODALIDADE 2: PEQUENAS FRASES */}
        {activeTab === 'sentences' && (
          <KidsSentencesArena
            starsCount={starsCount}
            onAddStars={handleAddStars}
            onSelectMode={(mode) => setActiveTab(mode)}
          />
        )}

        {/* MODALIDADE 3: PEQUENOS TEXTOS / HISTORINHAS */}
        {activeTab === 'stories' && (
          <KidsStoriesArena
            starsCount={starsCount}
            onAddStars={handleAddStars}
            onSelectMode={(mode) => setActiveTab(mode)}
          />
        )}

        {/* ÁLBUM DE FIGURINHAS */}
        {activeTab === 'stickers' && (
          <KidsStickerBook
            starsCount={starsCount}
            onSpendStars={handleSpendStars}
            onBackToGame={() => setActiveTab('phonics')}
          />
        )}

        {/* ESTAÇÃO DE METRÔ & PASSAPORTE */}
        {activeTab === 'station' && (
          <KidsStationTicket
            explorerName={explorerName}
            selectedRoute={selectedRoute}
            onUpdateExplorer={(name, route) => {
              setExplorerName(name);
              setSelectedRoute(route);
              safeSetItem('jhonx_explorer_name', name);
            }}
            onBackToGame={() => setActiveTab('phonics')}
          />
        )}
      </main>

      {/* MODAL PROTEGIDO PARA OS PAIS (Com Trava Matemática, Áudios Gravados e Termômetro) */}
      <KidsParentModal
        isOpen={isParentModalOpen}
        onClose={() => setIsParentModalOpen(false)}
        explorerName={explorerName}
      />

      {/* BOTÃO FLUTUANTE DISCRETO PARA DESENVOLVEDORES (Permite ver o código Dart e Terminal se desejado) */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => {
            sounds.playTap();
            setIsDevDrawerOpen(!isDevDrawerOpen);
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 shadow-xl backdrop-blur-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Open Flutter Technical Panel (Dart Code, Terminal, Inspector)"
        >
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Flutter DevTools (.dart)</span>
        </button>
      </div>

      {/* GAVETA / DRAWER TÉCNICA DE DESENVOLVEDOR (Flutter Code / Terminal / Inspector) */}
      {isDevDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-full max-w-xl z-50 bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold text-sm">Flutter DevTools</span>
              <span className="text-xs text-slate-500 font-mono">jhonx_app</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportZip}
                className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-mono flex items-center gap-1 border border-pink-500/30 transition-colors"
                title="Download .zip"
              >
                <FolderGit2 className="w-3 h-3" />
                <span>Export .zip</span>
              </button>
              <button
                onClick={() => setIsDevDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1 p-2 bg-slate-900/50 border-b border-slate-800 text-xs font-mono">
            <button
              onClick={() => setDevTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                devTab === 'code' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Dart Files</span>
            </button>
            <button
              onClick={() => setDevTab('terminal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                devTab === 'terminal' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Terminal CLI</span>
            </button>
            <button
              onClick={() => setDevTab('inspector')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                devTab === 'inspector' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Widget Tree</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden p-3">
            {devTab === 'code' && <CodeExplorer />}
            {devTab === 'terminal' && (
              <FlutterTerminal
                onHotReload={() => sounds.playHotReload()}
                onHotRestart={() => sounds.playHotReload()}
              />
            )}
            {devTab === 'inspector' && (
              <WidgetInspector
                highlightWidgetId={null}
                onSetHighlightWidget={() => {}}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
