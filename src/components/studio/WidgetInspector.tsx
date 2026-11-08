import React, { useState } from 'react';
import { Layers, ChevronRight, ChevronDown, Eye, Info } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface WidgetInspectorProps {
  highlightWidgetId: string | null;
  onSetHighlightWidget: (id: string | null) => void;
}

interface TreeNode {
  id: string;
  name: string;
  type: string;
  properties?: Record<string, string>;
  children?: TreeNode[];
}

export const WidgetInspector: React.FC<WidgetInspectorProps> = ({
  highlightWidgetId,
  onSetHighlightWidget,
}) => {
  const [selectedWidget, setSelectedWidget] = useState<string>('ParentAudioPlayerScreen');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    materialApp: true,
    navigator: true,
    parents: true,
    player: true,
  });

  const toggleExpand = (key: string) => {
    sounds.playTap();
    setExpandedNodes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const widgetTree: TreeNode = {
    id: 'root',
    name: 'JhonxApp',
    type: 'StatelessWidget',
    properties: {
      title: 'Jhonx London',
      database: 'JhonxDatabaseHelper.instance',
    },
    children: [
      {
        id: 'materialApp',
        name: 'MaterialApp',
        type: 'Core App Container',
        properties: {
          debugShowCheckedModeBanner: 'false',
          title: 'Jhonx London',
        },
        children: [
          {
            id: 'navigator',
            name: 'Scaffold (4-Tab BottomNavigationBar)',
            type: 'App Root Navigator',
            properties: {
              tabs: 'Station | Phonics | Stickers | Parents',
              backgroundColor: 'Color(0xff121212)',
              globalSoundToggle: 'Top-Right Corner (Volume2 / VolumeX)',
            },
            children: [
              {
                id: 'onboarding',
                name: 'JhonxOnboardingScreen',
                type: 'StatefulWidget',
                properties: {
                  route: 'Underground Station',
                },
              },
              {
                id: 'challenge',
                name: 'PhonicsChallengeScreen',
                type: 'StatefulWidget',
                properties: {
                  currentWord: '"CAT"',
                  stage: 'Level 2: Camden 🛹',
                },
              },
              {
                id: 'stickerBook',
                name: 'StickerBookScreen',
                type: 'StatefulWidget',
                properties: {
                  unlockedCount: '2 / 6 Unlocked',
                },
              },
              {
                id: 'parents',
                name: 'ParentDashboardScreen',
                type: 'Parent Portal Container',
                properties: {
                  subTabs: 'Kids Voices 🎧 | Termômetro | SQLite',
                },
                children: [
                  {
                    id: 'player',
                    name: 'ParentAudioPlayerScreen',
                    type: 'StatefulWidget (Kids Voices 🎧)',
                    properties: {
                      title: 'Text("KIDS VOICES 🎧")',
                      audioList: 'ListView.builder (4 recordings)',
                      playPauseButton: '52x52 circular animated button',
                      badge: 'Container("PERFECT", #00ff66)',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const findNode = (node: TreeNode, id: string): TreeNode | null => {
    if (node.id === id || node.name === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const activeNode = findNode(widgetTree, selectedWidget) || widgetTree;

  const renderTree = (node: TreeNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id] ?? false;
    const isSelected = selectedWidget === node.name;
    const isHighlighted = highlightWidgetId === node.name;

    return (
      <div key={node.id} className="select-none">
        <div
          onMouseEnter={() => onSetHighlightWidget(node.name)}
          onMouseLeave={() => onSetHighlightWidget(null)}
          onClick={() => {
            sounds.playTap();
            setSelectedWidget(node.name);
          }}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          className={`py-1.5 pr-3 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors ${
            isSelected
              ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
              : isHighlighted
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
                className="p-0.5 text-slate-500 hover:text-slate-200 shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <span className="w-3.5 h-3.5 inline-block shrink-0" />
            )}
            <span className="font-mono text-cyan-400 font-medium truncate">
              {node.name}
            </span>
          </div>

          <span className="text-[10px] text-slate-500 font-mono ml-2 shrink-0">
            {node.type}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-slate-800/80 ml-3.5">
            {node.children!.map((child) => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Widget Tree View */}
      <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col min-w-0">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Flutter DevTools · Widget Tree
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Hover to inspect on phone
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-0.5 pr-2">
          {renderTree(widgetTree)}
        </div>
      </div>

      {/* Widget Properties Inspector */}
      <div className="w-full md:w-80 bg-slate-900/40 p-4 flex flex-col shrink-0">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-3 text-xs font-bold text-white">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Kids Voices 🎧 Attributes</span>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Selected:</span>
              <span className="font-mono text-cyan-300 font-semibold">{activeNode.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Class Type:</span>
              <span className="font-mono text-slate-300">{activeNode.type}</span>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Declared Flutter Attributes
            </h4>
            <div className="space-y-1.5">
              {activeNode.properties ? (
                Object.entries(activeNode.properties).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-400 font-mono">{key}</span>
                    <span className="text-emerald-400 font-mono font-medium truncate max-w-[140px]">
                      {val}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No custom parameters</p>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-[11px] text-emerald-200">
            <p className="font-medium mb-1 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              Offline Playback Integration
            </p>
            <p className="text-emerald-300/80 leading-relaxed">
              Tapping the 52px play button triggers British English pronunciation and displays the green audio waveform visualization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
