/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VFSNode } from '../types';
import { 
  getChildren, 
  validateNodeName, 
  generateId, 
  getCurrentDateString,
  nodeExists 
} from '../utils/fileSystem';
import { Save, FilePlus, X, HelpCircle } from 'lucide-react';

interface WindowsNotepadProps {
  vfs: Record<string, VFSNode>;
  setVfs: React.Dispatch<React.SetStateAction<Record<string, VFSNode>>>;
  currentPathId: string;
  activeFileId: string | null;
  setActiveFileId: (id: string | null) => void;
  onAddXP: (points: number) => void;
  onActionTriggered: () => void;
  onClose: () => void;
}

export default function WindowsNotepad({
  vfs,
  setVfs,
  currentPathId,
  activeFileId,
  setActiveFileId,
  onAddXP,
  onActionTriggered,
  onClose
}: WindowsNotepadProps) {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('Bez_nazwy.txt');
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
      setFileName('Bez_nazwy.txt');
      setIsNew(true);
      setErrorMsg('');
    }
  }, [activeFileId, vfs]);

  const handleSave = () => {
    setErrorMsg('');
    setSaveSuccess(false);

    const val = validateNodeName(fileName, 'windows');
    if (!val.isValid) {
      setErrorMsg(val.error || 'Nieprawidłowa nazwa pliku.');
      return;
    }

    if (!fileName.toLowerCase().endsWith('.txt')) {
      setErrorMsg('Notatnik obsługuje tylko pliki tekstowe z rozszerzeniem .txt!');
      return;
    }

    if (isNew) {
      if (nodeExists(vfs, currentPathId, fileName)) {
        setErrorMsg('Plik o takiej nazwie już istnieje w tym folderze!');
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
      // Update existing
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

    // Hide success message after 3s
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
    setFileName('Bez_nazwy.txt');
    setIsNew(true);
    setErrorMsg('');
    setSaveSuccess(false);
  };

  // Cursor statistics
  const linesCount = content.split('\n').length;
  const charsCount = content.length;

  return (
    <div className="bg-white text-gray-800 border border-gray-300 rounded-3xl h-[550px] shadow-2xl flex flex-col overflow-hidden font-sans select-none">
      {/* Window Header */}
      <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between border-b border-blue-700">
        <div className="flex items-center gap-2">
          <span className="text-sm">📝</span>
          <span className="font-bold text-xs sm:text-sm">{fileName} - Notatnik Windows</span>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-emerald-300 text-[10px] sm:text-xs font-semibold animate-pulse mr-2">
              ✓ Zapisano pomyślnie!
            </span>
          )}
          <button 
            onClick={onClose}
            className="text-white hover:bg-red-500 hover:text-white rounded-lg p-1 transition-colors w-6 h-6 flex items-center justify-center font-bold text-xs"
            title="Zamknij"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-1.5 flex gap-4 text-xs font-medium text-gray-600 select-none">
        <button 
          onClick={handleNewFile}
          className="hover:bg-gray-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
        >
          <FilePlus className="w-3.5 h-3.5 text-blue-500" />
          <span>Nowy plik</span>
        </button>
        <button 
          onClick={handleSave}
          className="hover:bg-gray-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors font-bold text-gray-800"
        >
          <Save className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zapisz</span>
        </button>
      </div>

      {/* Input row for File Name */}
      <div className="bg-gray-50 border-b border-gray-100 p-2 px-4 flex flex-col sm:flex-row items-center gap-2 select-text">
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nazwa pliku:</label>
        <div className="flex-1 w-full flex gap-2">
          <input 
            type="text"
            value={fileName}
            onChange={(e) => { setFileName(e.target.value); setErrorMsg(''); }}
            disabled={!isNew}
            placeholder="np. referat.txt"
            className="flex-1 px-3 py-1 text-xs border border-gray-200 rounded-lg bg-white disabled:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          />
          {isNew && (
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-lg text-xs shadow-xs transition-all flex-shrink-0"
            >
              Stwórz plik
            </button>
          )}
        </div>
      </div>

      {/* Error Bar */}
      {errorMsg && (
        <div className="bg-red-50 text-red-600 px-4 py-1.5 text-xs font-semibold border-b border-red-100 flex items-center gap-1.5">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      {/* Main Textarea Area */}
      <div className="flex-1 bg-white p-4 select-text">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Wpisz tutaj treść swojej szkolnej notatki... Aby zapisać zmiany, kliknij 'Zapisz' u góry."
          className="w-full h-full border-none outline-none focus:ring-0 p-0 text-sm font-sans resize-none text-gray-800 leading-relaxed placeholder-gray-300"
          spellCheck={false}
          autoFocus
          id="notepad-textarea"
        />
      </div>

      {/* Status Bar */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-1.5 flex items-center justify-between text-[11px] text-gray-400 font-sans">
        <div className="flex gap-4">
          <span>Linie: <strong className="text-gray-600">{linesCount}</strong></span>
          <span>Znaki: <strong className="text-gray-600">{charsCount}</strong></span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Wszystkie notatki szkolne zapisujemy jako .txt</span>
        </div>
      </div>
    </div>
  );
}
