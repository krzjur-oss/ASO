/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Folder, 
  FileText, 
  ArrowLeft, 
  ArrowUp, 
  Search, 
  Plus, 
  Trash2, 
  HardDrive,
  Home,
  Download,
  Terminal,
  FileCode,
  FilePlus,
  FolderPlus
} from 'lucide-react';
import { VFSNode } from '../types';
import { 
  getChildren, 
  getLinuxPathString, 
  validateNodeName, 
  generateId, 
  getCurrentDateString,
  nodeExists 
} from '../utils/fileSystem';

interface LinuxFileBrowserProps {
  vfs: Record<string, VFSNode>;
  setVfs: React.Dispatch<React.SetStateAction<Record<string, VFSNode>>>;
  currentPathId: string;
  setCurrentPathId: (id: string) => void;
  onAddXP: (points: number) => void;
  onActionTriggered: () => void;
  onOpenFile: (id: string) => void;
}

export default function LinuxFileBrowser({
  vfs,
  setVfs,
  currentPathId,
  setCurrentPathId,
  onAddXP,
  onActionTriggered,
  onOpenFile
}: LinuxFileBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Modals
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isNewFileOpen, setIsNewFileOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentChildren = getChildren(vfs, currentPathId).filter(node => 
    node.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFolderClick = (node: VFSNode) => {
    if (node.type === 'directory') {
      setCurrentPathId(node.id);
      setSelectedNodeId(null);
      setSearchQuery('');
    } else {
      onOpenFile(node.id);
    }
  };

  const handleGoUp = () => {
    const current = vfs[currentPathId];
    if (current && current.parentId) {
      setCurrentPathId(current.parentId);
      setSelectedNodeId(null);
    }
  };

  const handleCreateFolder = () => {
    const val = validateNodeName(newItemName, 'linux');
    if (!val.isValid) {
      setErrorMsg(val.error || 'Błąd nazwy.');
      return;
    }
    if (nodeExists(vfs, currentPathId, newItemName)) {
      setErrorMsg('Katalog o takiej nazwie już istnieje!');
      return;
    }

    const newId = generateId();
    const newFolder: VFSNode = {
      id: newId,
      name: newItemName,
      type: 'directory',
      parentId: currentPathId,
      createdAt: getCurrentDateString(),
      size: 'Katalog'
    };

    setVfs(prev => ({
      ...prev,
      [newId]: newFolder
    }));

    setIsNewFolderOpen(false);
    setNewItemName('');
    onAddXP(15);
    onActionTriggered();
  };

  const handleCreateFile = () => {
    const val = validateNodeName(newItemName, 'linux');
    if (!val.isValid) {
      setErrorMsg(val.error || 'Błąd nazwy.');
      return;
    }
    if (nodeExists(vfs, currentPathId, newItemName)) {
      setErrorMsg('Plik o takiej nazwie już istnieje!');
      return;
    }

    const newId = generateId();
    const newFile: VFSNode = {
      id: newId,
      name: newItemName,
      type: 'file',
      parentId: currentPathId,
      content: newItemName.toLowerCase().endsWith('.py') ? 'print("Hello, Linux!")\n' : 'Nowy plik tekstowy.',
      createdAt: getCurrentDateString(),
      size: '100 B'
    };

    setVfs(prev => ({
      ...prev,
      [newId]: newFile
    }));

    setIsNewFileOpen(false);
    setNewItemName('');
    onAddXP(15);
    onActionTriggered();
  };

  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    const node = vfs[selectedNodeId];
    if (!node) return;

    if (node.id === 'root' || node.id === 'home' || node.id === 'uczen' || node.id === 'desktop' || node.id === 'documents' || node.id === 'downloads') {
      alert('System Linux chroni ten katalog systemowy przed usunięciem!');
      return;
    }

    if (window.confirm(`Czy na pewno chcesz trwale usunąć "${node.name}" za pomocą graficznego interfejsu Linux?`)) {
      // Recursive delete helper
      const deleteRecursive = (id: string, currentVfs: Record<string, VFSNode>) => {
        delete currentVfs[id];
        Object.keys(currentVfs).forEach(key => {
          if (currentVfs[key].parentId === id) {
            deleteRecursive(key, currentVfs);
          }
        });
      };

      setVfs(prev => {
        const next = { ...prev };
        deleteRecursive(selectedNodeId, next);
        return next;
      });

      setSelectedNodeId(null);
      onAddXP(15);
      onActionTriggered();
    }
  };

  const getFileIcon = (node: VFSNode) => {
    if (node.type === 'directory') {
      return <Folder className="w-12 h-12 text-orange-500 fill-orange-400" />;
    }
    const name = node.name.toLowerCase();
    if (name.endsWith('.txt')) {
      return <FileText className="w-12 h-12 text-[#81A1C1]" />;
    }
    if (name.endsWith('.py')) {
      return <FileCode className="w-12 h-12 text-emerald-500" />;
    }
    return <FileText className="w-12 h-12 text-gray-400" />;
  };

  return (
    <div className="bg-[#2c1a24] text-[#eceff4] border border-[#4a2e3f] rounded-3xl h-[550px] shadow-2xl flex flex-col overflow-hidden font-sans select-none">
      {/* Ubuntu Window Header */}
      <div className="bg-[#3d2633] px-4 py-3 flex items-center justify-between border-b border-[#21141c]">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-orange-500 fill-orange-400 animate-pulse" />
          <span className="font-bold text-xs sm:text-sm">Pliki (Nautilus) - Linux Files</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setIsNewFolderOpen(true);
              setNewItemName('');
              setErrorMsg('');
            }}
            className="bg-[#2c1a24] hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 font-bold transition-all"
            title="Nowy katalog"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nowy folder</span>
          </button>
          <button 
            onClick={() => {
              setIsNewFileOpen(true);
              setNewItemName('');
              setErrorMsg('');
            }}
            className="bg-[#2c1a24] hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-xl text-xs flex items-center gap-1.5 font-bold transition-all"
            title="Nowy plik"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nowy plik</span>
          </button>
          {selectedNodeId && (
            <button 
              onClick={handleDeleteNode}
              className="bg-red-900/40 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-300 px-3 py-1 rounded-xl text-xs flex items-center gap-1 transition-all"
              title="Usuń"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Usuń</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar / Search bar */}
      <div className="bg-[#21141c] p-3 px-4 flex items-center justify-between gap-4 border-b border-[#130b10] flex-wrap sm:flex-nowrap">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleGoUp}
            disabled={!vfs[currentPathId]?.parentId}
            className="p-1.5 bg-[#3d2633] rounded-lg hover:bg-orange-500/20 text-orange-400 disabled:opacity-40 transition-colors"
            title="Folder wyżej"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono bg-[#130b10] px-3 py-1.5 rounded-xl border border-white/5 overflow-x-auto max-w-[200px] sm:max-w-md truncate">
            {getLinuxPathString(vfs, currentPathId)}
          </span>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-48">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj..."
            className="w-full bg-[#3d2633] text-xs px-3 py-1.5 pl-8 rounded-xl border border-white/5 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Main Panel Side-By-Side layout */}
      <div className="flex-1 flex min-h-0">
        {/* Side panel */}
        <div className="w-40 bg-[#1e1118] p-3 border-r border-[#21141c] space-y-1 text-xs hidden sm:block">
          <span className="px-2 text-[9px] uppercase font-bold text-gray-500 tracking-wider">Miejsca</span>
          <button 
            onClick={() => setCurrentPathId('uczen')}
            className={`w-full text-left px-2 py-2 rounded-xl flex items-center gap-2 transition-colors ${currentPathId === 'uczen' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/20' : 'hover:bg-white/5'}`}
          >
            <Home className="w-3.5 h-3.5 text-orange-400" />
            <span>Folder domowy</span>
          </button>
          <button 
            onClick={() => setCurrentPathId('desktop')}
            className={`w-full text-left px-2 py-2 rounded-xl flex items-center gap-2 transition-colors ${currentPathId === 'desktop' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/20' : 'hover:bg-white/5'}`}
          >
            <HardDrive className="w-3.5 h-3.5 text-orange-400" />
            <span>Pulpit</span>
          </button>
          <button 
            onClick={() => setCurrentPathId('documents')}
            className={`w-full text-left px-2 py-2 rounded-xl flex items-center gap-2 transition-colors ${currentPathId === 'documents' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/20' : 'hover:bg-white/5'}`}
          >
            <Folder className="w-3.5 h-3.5 text-orange-400" />
            <span>Dokumenty</span>
          </button>
          <button 
            onClick={() => setCurrentPathId('downloads')}
            className={`w-full text-left px-2 py-2 rounded-xl flex items-center gap-2 transition-colors ${currentPathId === 'downloads' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/20' : 'hover:bg-white/5'}`}
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Pobrane</span>
          </button>
        </div>

        {/* Desktop Grid Area */}
        <div className="flex-1 bg-[#160d12] p-4 overflow-y-auto" onClick={() => setSelectedNodeId(null)}>
          {currentChildren.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
              <Folder className="w-16 h-16 stroke-1 text-gray-600 mb-2" />
              <p className="font-semibold text-xs">Pusty katalog w systemie Linux</p>
              <p className="text-[10px] text-gray-600 mt-1">Użyj górnych przycisków lub Terminala, by dodać pliki.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentChildren.map(node => {
                const isSelected = selectedNodeId === node.id;
                
                return (
                  <div
                    key={node.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    onDoubleClick={() => handleFolderClick(node)}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-500/10 shadow-lg ring-1 ring-orange-500/30' 
                        : 'border-transparent hover:bg-white/5'
                    }`}
                    id={`linux-explorer-item-${node.id}`}
                  >
                    <div className="mb-2">
                      {getFileIcon(node)}
                    </div>
                    <span className="text-xs font-medium break-all line-clamp-2 text-gray-200" title={node.name}>
                      {node.name}
                    </span>
                    <span className="text-[9px] text-gray-500 mt-0.5 font-mono">
                      {node.type === 'directory' ? 'Katalog' : node.size}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Nautilus Footer */}
      <div className="bg-[#130b10] border-t border-[#21141c] px-4 py-2 flex items-center justify-between text-[10px] text-gray-500 font-mono">
        <span>Pozycji: {currentChildren.length}</span>
        {selectedNodeId && vfs[selectedNodeId] && (
          <span className="text-orange-400 font-bold">
            Wybrano: {vfs[selectedNodeId].name}
          </span>
        )}
        <span>Podwójne kliknięcie otwiera</span>
      </div>

      {/* MODAL 1: Create Folder */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#2c1a24] text-white rounded-3xl p-6 max-w-sm w-full border border-orange-500/30 animate-scaleUp">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-orange-400" />
              Nowy folder (Linux)
            </h3>
            <p className="text-xs text-gray-400 mb-4">Wpisz nazwę dla nowego podkatalogu w systemie Linux Ubuntu:</p>
            
            <input 
              type="text"
              value={newItemName}
              onChange={(e) => { setNewItemName(e.target.value); setErrorMsg(''); }}
              placeholder="np. Zadania"
              className="w-full px-3 py-2 border border-[#4a2e3f] bg-[#1e1118] text-white rounded-xl focus:outline-none focus:ring-1 focus:focus:ring-orange-500 text-sm mb-2 font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            
            {errorMsg && (
              <p className="text-red-400 text-xs font-semibold mb-3 flex items-center gap-1">
                <span>⚠️</span> {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-2 text-xs mt-4">
              <button 
                onClick={() => setIsNewFolderOpen(false)}
                className="px-4 py-2 border border-[#4a2e3f] text-gray-400 rounded-xl hover:bg-white/5"
              >
                Anuluj
              </button>
              <button 
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md"
              >
                Stwórz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create File */}
      {isNewFileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#2c1a24] text-white rounded-3xl p-6 max-w-sm w-full border border-orange-500/30 animate-scaleUp">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-orange-400" />
              Nowy plik (Linux)
            </h3>
            <p className="text-xs text-gray-400 mb-4">Wpisz nazwę nowego pliku z rozszerzeniem tekstowym lub kodu (np. <span className="font-mono text-orange-400">welcome.txt</span> lub <span className="font-mono text-orange-400">gra.py</span>):</p>
            
            <input 
              type="text"
              value={newItemName}
              onChange={(e) => { setNewItemName(e.target.value); setErrorMsg(''); }}
              placeholder="np. gra.py"
              className="w-full px-3 py-2 border border-[#4a2e3f] bg-[#1e1118] text-white rounded-xl focus:outline-none focus:ring-1 focus:focus:ring-orange-500 text-sm mb-2 font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
              autoFocus
            />
            
            {errorMsg && (
              <p className="text-red-400 text-xs font-semibold mb-3 flex items-center gap-1">
                <span>⚠️</span> {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-2 text-xs mt-4">
              <button 
                onClick={() => setIsNewFileOpen(false)}
                className="px-4 py-2 border border-[#4a2e3f] text-gray-400 rounded-xl hover:bg-white/5"
              >
                Anuluj
              </button>
              <button 
                onClick={handleCreateFile}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md"
              >
                Stwórz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
