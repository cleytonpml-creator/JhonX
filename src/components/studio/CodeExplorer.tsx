import React, { useState } from 'react';
import { Copy, Check, FileCode, Folder, Terminal } from 'lucide-react';
import { getFlutterFiles, FlutterSourceFile } from '../../utils/flutterCode';
import { sounds } from '../../utils/audio';

export const CodeExplorer: React.FC = () => {
  const files = getFlutterFiles('jhonx_app');
  const [selectedPath, setSelectedPath] = useState<string>(files[1].path); // default lib/main.dart
  const [copied, setCopied] = useState<boolean>(false);

  const activeFile: FlutterSourceFile =
    files.find((f) => f.path === selectedPath) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    sounds.playTap();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = activeFile.content.split('\n');

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Sidebar: File Tree */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/60 p-3 shrink-0 flex flex-col">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-2 text-xs font-bold text-slate-300">
          <Folder className="w-4 h-4 text-cyan-400" />
          <span>jhonx_app</span>
          <span className="text-[10px] text-slate-400 ml-auto font-mono">v1.0.0</span>
        </div>

        <div className="space-y-1 overflow-y-auto flex-1">
          {files.map((file) => {
            const isSelected = file.path === selectedPath;
            return (
              <button
                key={file.path}
                onClick={() => {
                  sounds.playTap();
                  setSelectedPath(file.path);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors text-left ${
                  isSelected
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{file.path}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ready for local compilation</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Export via .zip or run with <code className="text-cyan-300">flutter run</code>.
          </p>
        </div>
      </div>

      {/* Main Code View Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* File Header Bar */}
        <div className="h-10 px-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <span className="text-cyan-400">{activeFile.path}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400 text-[11px]">{activeFile.description}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy File</span>
              </>
            )}
          </button>
        </div>

        {/* Syntax-highlighted code editor */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300">
          <div className="table w-full">
            {lines.map((line, idx) => (
              <div key={idx} className="table-row hover:bg-slate-900/60 transition-colors">
                <span className="table-cell pr-4 py-0.5 text-right text-slate-600 select-none text-[11px] tabular-nums w-10">
                  {idx + 1}
                </span>
                <span className="table-cell py-0.5 pl-2 text-slate-200 whitespace-pre">
                  {highlightDartSyntax(line, activeFile.language)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Syntax high-lighter for Dart & YAML
function highlightDartSyntax(line: string, lang: 'dart' | 'yaml' | 'markdown') {
  if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
    return <span className="text-slate-500 italic">{line}</span>;
  }

  if (lang === 'yaml') {
    if (line.includes(':')) {
      const [key, ...rest] = line.split(':');
      return (
        <>
          <span className="text-sky-300 font-semibold">{key}:</span>
          <span className="text-amber-300">{rest.join(':')}</span>
        </>
      );
    }
    return <span>{line}</span>;
  }

  // Dart syntax coloring highlights
  const tokens = line.split(/(\b(?:import|export|class|extends|void|main|const|final|return|override|super|static|get|set|true|false|new|if|else|this|required)\b|"[^"]*"|'[^']*')/g);

  return (
    <>
      {tokens.map((token, i) => {
        if (
          /^(import|export|class|extends|void|main|const|final|return|override|super|static|get|set|new|if|else|this|required)$/.test(
            token
          )
        ) {
          return (
            <span key={i} className="text-purple-400 font-semibold">
              {token}
            </span>
          );
        }
        if (/^(true|false)$/.test(token)) {
          return (
            <span key={i} className="text-amber-400 font-semibold">
              {token}
            </span>
          );
        }
        if (token.startsWith('"') || token.startsWith("'")) {
          return (
            <span key={i} className="text-emerald-300">
              {token}
            </span>
          );
        }
        if (/^[A-Z][A-Za-z0-9_]*$/.test(token)) {
          return (
            <span key={i} className="text-cyan-300">
              {token}
            </span>
          );
        }
        return <span key={i}>{token}</span>;
      })}
    </>
  );
}
