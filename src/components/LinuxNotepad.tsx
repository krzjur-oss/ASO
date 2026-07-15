/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VFSNode } from '../types';
import { 
  validateNodeName, 
  generateId, 
  getCurrentDateString,
  nodeExists 
} from '../utils/fileSystem';
import { Save, FilePlus, X, Info } from 'lucide-react';

interface LinuxNotepadProps {
  vfs: Record<string, VFSNode>;
  setVfs: React.Dispatch<React.SetStateAction<Record<string, VFSNode>>>;
  currentPathId: string;
  activeFileId: string | null;
  setActiveFileId: (id: string | null) => void;
  onAddXP: (points: number) => void;
  onActionTriggered: () => void;
  onClose: () => void;
}

export default function LinuxNotepad({
  vfs,
  setVfs,
  currentPathId,
  activeFileId,
  setActiveFileId,
  onAddXP,
  onActionTriggered,
  onClose
}: LinuxNotepadProps) {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('untitled.txt');
  const [isNew, setIsNew] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (activeFileId && vfs[activeFileId]) {
      const file = vfs[activeFileId];
      setContent(file.content || '');
      setFileName(file.name);
      setIsNew(false);
      setErrorMsg('');
    } else {
      setContent('');
      setFileName('untitled.txt');
      setIsNew(true);
      setErrorMsg('');
    }
  }, [activeFileId, vfs]);

  const handleSave = () => {
    setErrorMsg('');
    setSaveSuccess(false);

    const val = validateNodeName(fileName, 'linux');
    if (!val.isValid) {
      setErrorMsg(val.error || 'Nieprawidłowa nazwa pliku.');
      return;
    }

    if (isNew) {
      if (nodeExists(vfs, currentPathId, fileName)) {
        setErrorMsg('Plik o takiej nazwie już istnieje w tym katalogu!');
        return;
      }

      const newId = generateId();
      const newFile: VFSNode = {
        id: newId,
        name: fileName,
        type: 'file',
        parentId: currentPathId,
        content: content,
        createdAt: getCurrentDateString(),
        size: `${Math.max(1, content.length)} B`
      };

      setVfs(prev => ({
        ...prev,
        [newId]: newFile
      }));

      setActiveFileId(newId);
      setIsNew(false);
      onAddXP(15);
      setSaveSuccess(true);
    } else if (activeFileId) {
      setVfs(prev => ({
        ...prev,
        [activeFileId]: {
          ...prev[activeFileId],
          name: fileName,
          content: content,
          size: `${Math.max(1, content.length)} B`
        }
      }));
      onAddXP(5);
      setSaveSuccess(true);
    }

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);

    // Trigger verification
    setTimeout(() => {
      onActionTriggered();
    }, 100);
  };

  const handleNewFile = () => {
    setActiveFileId(null);
    setContent('');
    setFileName('untitled.txt');
    setIsNew(true);
    setErrorMsg('');
    setSaveSuccess(false);
  };

  const linesCount = content.split('\n').length;
  const charsCount = content.length;

  return (
    <div className="bg-[#1e1e24] text-[#eceff4] border border-[#2d2d34] rounded-3xl h-[550px] shadow-2xl flex flex-col overflow-hidden font-sans select-none">
      {/* Window Header */}
      <div className="bg-[#2d2d30] text-gray-200 px-4 py-3 flex items-center justify-between border-b border-[#141416]">
        <div className="flex items-center gap-2">
          <span className="text-sm">📝</span>
          <span className="font-bold text-xs sm:text-sm font-mono">{fileName} [Zodyfikowano] - gedit</span>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-orange-400 text-xs font-semibold animate-pulse mr-2">
              ✓ Zapisano pomyślnie!
            </span>
          )}
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-red-500/80 rounded-lg p-1 transition-colors w-6 h-6 flex items-center justify-center font-bold text-xs"
            title="Zamknij"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Menu / Options Bar */}
      <div className="bg-[#222226] border-b border-[#131315] px-4 py-1.5 flex gap-4 text-xs font-medium text-gray-400 select-none">
        <button 
          onClick={handleNewFile}
          className="hover:bg-[#2d2d34] hover:text-white px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
        >
          <FilePlus className="w-3.5 h-3.5 text-orange-400" />
          <span>Nowy plik</span>
        </button>
        <button 
          onClick={handleSave}
          className="hover:bg-[#2d2d34] hover:text-white px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors font-bold text-white"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zapisz</span>
        </button>
      </div>

      {/* Input File Name */}
      <div className="bg-[#19191d] border-b border-[#111113] p-2.5 px-4 flex flex-col sm:flex-row items-center gap-2 select-text">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">Nazwa pliku:</label>
        <div className="flex-1 w-full flex gap-2">
          <input 
            type="text"
            value={fileName}
            onChange={(e) => { setFileName(e.target.value); setErrorMsg(''); }}
            disabled={!isNew}
            placeholder="np. welcome.txt"
            className="flex-1 px-3 py-1 text-xs border border-[#2d2d34] bg-[#1e1e24] text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
          />
          {isNew && (
            <button
              onClick={handleSave}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3 py-1 rounded-lg text-xs shadow-xs transition-all flex-shrink-0"
            >
              Zapisz jako
            </button>
          )}
        </div>
      </div>

      {/* Error Bar */}
      {errorMsg && (
        <div className="bg-red-950/40 text-red-300 px-4 py-1.5 text-xs font-semibold border-b border-red-900/30 flex items-center gap-1.5">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      {/* Main Textarea Area */}
      <div className="flex-1 bg-[#121214] p-4 select-text">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Wpisz tutaj treść pliku systemowego... Kliknij 'Zapisz', aby sfinalizować zmiany w Linuxie."
          className="w-full h-full border-none outline-none focus:ring-0 p-0 text-sm font-mono resize-none text-gray-300 bg-[#121214] leading-relaxed placeholder-gray-600 caret-orange-500"
          spellCheck={false}
          autoFocus
          id="linux-notepad-textarea"
        />
      </div>

      {/* Status Bar */}
      <div className="bg-[#212124] border-t border-[#131315] px-4 py-1.5 flex items-center justify-between text-[11px] text-gray-500 font-mono">
        <div className="flex gap-4">
          <span>Linie: <strong className="text-gray-300">{linesCount}</strong></span>
          <span>Znaki: <strong className="text-gray-300">{charsCount}</strong></span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-500">
          <Info className="w-3.5 h-3.5" />
          <span>UTF-8 • Plain Text Editor</span>
        </div>
      </div>
    </div>
  );
}
