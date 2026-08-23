/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Folder, 
  FileText, 
  ArrowUp, 
  Search, 
  Trash2, 
  HardDrive,
  Home, 
  Download, 
  FileCode, 
  FilePlus, 
  FolderPlus,
  Scissors,
  Copy,
  Clipboard,
  Edit3,
  Info,
  RotateCw,
  Play,
  X,
  Check,
  Terminal,
  ShieldCheck
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
  
  // Clipboard
  const [clipboardNodeId, setClipboardNodeId] = useState<string | null>(null);
  const [clipboardAction, setClipboardAction] = useState<'cut' | 'copy' | null>(null);

  // Context Menu
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string | null } | null>(null);

  // Modals
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isNewFileOpen, setIsNewFileOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [propertiesNodeId, setPropertiesNodeId] = useState<string | null>(null);
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
    setErrorMsg('');
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
    setErrorMsg('');
    onAddXP(15);
    onActionTriggered();
  };

  const handleOpenRename = (nodeId?: string) => {
    const targetId = nodeId || selectedNodeId;
    if (!targetId) return;
    const node = vfs[targetId];
    if (!node) return;
    
    if (node.id === 'root' || node.id === 'home' || node.id === 'uczen' || node.id === 'desktop' || node.id === 'documents' || node.id === 'downloads') {
      alert('System Linux chroni ten katalog systemowy przed zmianą nazwy!');
      return;
    }

    setSelectedNodeId(targetId);
    setNewItemName(node.name);
    setErrorMsg('');
    setIsRenameOpen(true);
  };

  const handleRename = () => {
    if (!selectedNodeId) return;
    const val = validateNodeName(newItemName, 'linux');
    if (!val.isValid) {
      setErrorMsg(val.error || 'Błąd nazwy.');
      return;
    }

    const targetNode = vfs[selectedNodeId];
    if (targetNode && nodeExists(vfs, targetNode.parentId || 'root', newItemName) && targetNode.name !== newItemName) {
      setErrorMsg('Element o tej nazwie już istnieje w tym katalogu!');
      return;
    }

    setVfs(prev => ({
      ...prev,
      [selectedNodeId]: {
        ...prev[selectedNodeId],
        name: newItemName
      }
    }));

    setIsRenameOpen(false);
    setNewItemName('');
    setErrorMsg('');
    onAddXP(10);
    onActionTriggered();
  };

  const handleCut = (nodeId?: string) => {
    const targetId = nodeId || selectedNodeId;
    if (!targetId) return;
    setClipboardNodeId(targetId);
    setClipboardAction('cut');
    onAddXP(5);
  };

  const handleCopy = (nodeId?: string) => {
    const targetId = nodeId || selectedNodeId;
    if (!targetId) return;
    setClipboardNodeId(targetId);
    setClipboardAction('copy');
    onAddXP(5);
  };

  const handlePaste = () => {
    if (!clipboardNodeId || !clipboardAction) return;
    const sourceNode = vfs[clipboardNodeId];
    if (!sourceNode) return;

    if (clipboardAction === 'cut') {
      if (sourceNode.type === 'directory') {
        let tempParentId: string | null = currentPathId;
        while (tempParentId) {
          if (tempParentId === sourceNode.id) {
            alert('Błąd: Nie można przenieść katalogu do samego siebie ani do jego podkatalogów!');
            return;
          }
          const parentNode = vfs[tempParentId];
          tempParentId = parentNode ? parentNode.parentId : null;
        }
      }

      setVfs(prev => ({
        ...prev,
        [clipboardNodeId]: {
          ...prev[clipboardNodeId],
          parentId: currentPathId
        }
      }));

      setClipboardNodeId(null);
      setClipboardAction(null);
    } else if (clipboardAction === 'copy') {
      setVfs(prev => {
        const nextVfs = { ...prev };
        const cloneTree = (origId: string, newParentId: string, isRootCopy: boolean) => {
          const orig = prev[origId];
          if (!orig) return;
          const newId = generateId();
          let targetName = orig.name;
          if (isRootCopy) {
            if (nodeExists(nextVfs, newParentId, targetName)) {
              const dotIdx = targetName.lastIndexOf('.');
              if (dotIdx !== -1 && orig.type === 'file') {
                const base = targetName.substring(0, dotIdx);
                const ext = targetName.substring(dotIdx);
                targetName = `${base}_kopia${ext}`;
              } else {
                targetName = `${targetName}_kopia`;
              }
            }
          }
          nextVfs[newId] = {
            ...orig,
            id: newId,
            name: targetName,
            parentId: newParentId,
            createdAt: getCurrentDateString()
          };
          if (orig.type === 'directory') {
            const children = (Object.values(prev) as VFSNode[]).filter(n => n.parentId === origId);
            children.forEach(ch => cloneTree(ch.id, newId, false));
          }
        };
        cloneTree(clipboardNodeId, currentPathId, true);
        return nextVfs;
      });
    }

    onAddXP(15);
    onActionTriggered();
  };

  const handleDeleteNode = (nodeId?: string) => {
    const targetId = nodeId || selectedNodeId;
    if (!targetId) return;
    const node = vfs[targetId];
    if (!node) return;

    if (node.id === 'root' || node.id === 'home' || node.id === 'uczen' || node.id === 'desktop' || node.id === 'documents' || node.id === 'downloads') {
      alert('System Linux chroni ten katalog systemowy przed usunięciem!');
      return;
    }

    const deleteRecursive = (id: string, currentVfs: Record<string, VFSNode>) => {
      delete currentVfs[id];
      Object.keys(currentVfs).forEach(key => {
        if (currentVfs[key]?.parentId === id) {
          deleteRecursive(key, currentVfs);
        }
      });
    };

    setVfs(prev => {
      const next = { ...prev };
      deleteRecursive(targetId, next);
      return next;
    });

    setSelectedNodeId(null);
    onAddXP(15);
    onActionTriggered();
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
    <div className="bg-[#2c1a24] text-[#eceff4] border border-[#4a2e3f] rounded-3xl h-[560px] shadow-2xl flex flex-col overflow-hidden font-sans select-none relative">
      {/* Ubuntu Window Header */}
      <div className="bg-[#3d2633] px-4 py-2.5 flex items-center justify-between border-b border-[#21141c] flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-orange-500 fill-orange-400 animate-pulse" />
          <span className="font-bold text-xs sm:text-sm">Pliki (Nautilus) — GNOME Files</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button 
            onClick={() => {
              setIsNewFolderOpen(true);
              setNewItemName('');
              setErrorMsg('');
            }}
            className="bg-[#2c1a24] hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 font-bold transition-all"
            title="Nowy katalog"
            id="linux-btn-new-folder"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Nowy folder</span>
          </button>
          <button 
            onClick={() => {
              setIsNewFileOpen(true);
              setNewItemName('');
              setErrorMsg('');
            }}
            className="bg-[#2c1a24] hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 font-bold transition-all"
            title="Nowy plik"
            id="linux-btn-new-file"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Nowy plik</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-0.5 hidden sm:block"></div>

          <button 
            disabled={!selectedNodeId}
            onClick={() => handleCopy()}
            className="bg-[#2c1a24] hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 font-semibold transition-all disabled:opacity-30"
            title="Kopiuj zaznaczony element (Ctrl+C)"
            id="linux-btn-copy"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Kopiuj</span>
            {clipboardNodeId && clipboardAction === 'copy' && clipboardNodeId === selectedNodeId && (
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping"></span>
            )}
          </button>

          <button 
            disabled={!selectedNodeId}
            onClick={() => handleCut()}
            className="bg-[#2c1a24] hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 font-semibold transition-all disabled:opacity-30"
            title="Wytnij zaznaczony element (Ctrl+X)"
            id="linux-btn-cut"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Wytnij</span>
            {clipboardNodeId && clipboardAction === 'cut' && clipboardNodeId === selectedNodeId && (
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></span>
            )}
          </button>

          <button 
            disabled={!clipboardNodeId || !clipboardAction}
            onClick={handlePaste}
            className="bg-[#2c1a24] hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 font-semibold transition-all disabled:opacity-30"
            title="Wklej ze schowka (Ctrl+V)"
            id="linux-btn-paste"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Wklej</span>
          </button>

          <button 
            disabled={!selectedNodeId}
            onClick={() => handleOpenRename()}
            className="bg-[#2c1a24] hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 font-semibold transition-all disabled:opacity-30"
            title="Zmień nazwę (F2)"
            id="linux-btn-rename"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Zmień nazwę</span>
          </button>

          {selectedNodeId && (
            <button 
              onClick={() => handleDeleteNode()}
              className="bg-red-900/40 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-300 px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 transition-all"
              title="Usuń (Del)"
              id="linux-btn-delete"
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
            className="p-1.5 bg-[#3d2633] rounded-lg hover:bg-orange-500/20 text-orange-400 disabled:opacity-40 transition-colors cursor-pointer"
            title="Folder wyżej"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono bg-[#130b10] px-3 py-1.5 rounded-xl border border-white/5 overflow-x-auto max-w-[200px] sm:max-w-md truncate text-gray-300">
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
            className="w-full bg-[#3d2633] text-xs px-3 py-1.5 pl-8 rounded-xl border border-white/5 focus:outline-none focus:ring-1 focus:ring-orange-500 text-white placeholder-gray-500"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Main Panel Side-By-Side layout */}
      <div className="flex-1 flex min-h-0">
        {/* Side panel */}
        <div className="w-44 bg-[#1e1118] p-3 border-r border-[#21141c] space-y-1 text-xs hidden sm:block">
          <span className="px-2 text-[9px] uppercase font-bold text-gray-500 tracking-wider">Miejsca</span>
          <button 
            onClick={() => setCurrentPathId('uczen')}
            className={`w-full text-left px-2 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${currentPathId === 'uczen' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/20' : 'hover:bg-white/5 text-gray-300'}`}
          >
            <Home className="w-3.5 h-3.5 text-orange-400" />
            <span>Folder domowy</span>
          </button>
          <button 
            onClick={() => setCurrentPathId('desktop')}
            className={`w-full text-left px-2 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${currentPathId === 'desktop' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/20' : 'hover:bg-white/5 text-gray-300'}`}
          >
            <HardDrive className="w-3.5 h-3.5 text-orange-400" />
            <span>Pulpit</span>
          </button>
          <button 
            onClick={() => setCurrentPathId('documents')}
            className={`w-full text-left px-2 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${currentPathId === 'documents' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/20' : 'hover:bg-white/5 text-gray-300'}`}
          >
            <Folder className="w-3.5 h-3.5 text-orange-400" />
            <span>Dokumenty</span>
          </button>
          <button 
            onClick={() => setCurrentPathId('downloads')}
            className={`w-full text-left px-2 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${currentPathId === 'downloads' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/20' : 'hover:bg-white/5 text-gray-300'}`}
          >
            <Download className="w-3.5 h-3.5 text-orange-400" />
            <span>Pobrane</span>
          </button>
          <button 
            onClick={() => setCurrentPathId('root')}
            className={`w-full text-left px-2 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${currentPathId === 'root' ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/20' : 'hover:bg-white/5 text-gray-300'}`}
          >
            <HardDrive className="w-3.5 h-3.5 text-orange-400" />
            <span>System plików (/)</span>
          </button>
        </div>

        {/* Desktop Grid Area */}
        <div 
          className="flex-1 bg-[#160d12] p-4 overflow-y-auto relative" 
          onClick={() => setSelectedNodeId(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
              nodeId: null
            });
          }}
          id="linux-folder-background"
        >
          {currentChildren.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
              <Folder className="w-16 h-16 stroke-1 text-gray-600 mb-2" />
              <p className="font-semibold text-xs">Pusty katalog w systemie Linux</p>
              <p className="text-[10px] text-gray-600 mt-1">Kliknij prawym przyciskiem myszy (PPM), aby utworzyć plik lub folder.</p>
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
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                      setContextMenu({
                        x: e.clientX,
                        y: e.clientY,
                        nodeId: node.id
                      });
                    }}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-500/15 shadow-lg ring-1 ring-orange-500/40' 
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
        <span>Podwójne kliknięcie otwiera • PPM menu kontekstowe</span>
      </div>

      {/* Linux Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-[45] bg-transparent" 
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div 
            className="fixed z-50 bg-[#2c1a24]/95 backdrop-blur-md border border-[#4a2e3f] rounded-2xl shadow-2xl py-1.5 min-w-[210px] text-xs text-gray-200 animate-fadeIn ring-1 ring-black/40 select-none"
            style={{ 
              top: Math.max(10, Math.min(contextMenu.y, (typeof window !== 'undefined' ? window.innerHeight : 600) - 290)), 
              left: Math.max(10, Math.min(contextMenu.x, (typeof window !== 'undefined' ? window.innerWidth : 800) - 240)) 
            }}
            id="linux-context-menu"
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.nodeId ? (
              /* Item Context Menu */
              <>
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-gray-400 border-b border-white/5 flex items-center justify-between">
                  <span className="truncate max-w-[140px] text-orange-400">{vfs[contextMenu.nodeId]?.name}</span>
                  <span className="text-[9px] text-orange-400 font-mono font-bold bg-orange-500/20 px-1 py-0.5 rounded">Linux PPM</span>
                </div>

                <button 
                  onClick={() => {
                    const node = vfs[contextMenu.nodeId!];
                    if (node) handleFolderClick(node);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-orange-500/20 hover:text-orange-400 flex items-center gap-2.5 cursor-pointer font-bold transition-colors"
                  id="linux-cm-open"
                >
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span>Otwórz</span>
                </button>

                <div className="h-px bg-white/5 my-1"></div>

                <button 
                  onClick={() => {
                    handleCopy(contextMenu.nodeId!);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500/20 hover:text-orange-400 flex items-center justify-between cursor-pointer font-medium transition-colors"
                  id="linux-cm-copy"
                >
                  <div className="flex items-center gap-2.5">
                    <Copy className="w-4 h-4 text-blue-400" />
                    <span>Kopiuj</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">Ctrl+C</span>
                </button>

                <button 
                  onClick={() => {
                    handleCut(contextMenu.nodeId!);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500/20 hover:text-orange-400 flex items-center justify-between cursor-pointer font-medium transition-colors"
                  id="linux-cm-cut"
                >
                  <div className="flex items-center gap-2.5">
                    <Scissors className="w-4 h-4 text-amber-400" />
                    <span>Wytnij</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">Ctrl+X</span>
                </button>

                <button 
                  onClick={() => {
                    const targetId = contextMenu.nodeId!;
                    setContextMenu(null);
                    handleOpenRename(targetId);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500/20 hover:text-orange-400 flex items-center justify-between cursor-pointer font-medium transition-colors"
                  id="linux-cm-rename"
                >
                  <div className="flex items-center gap-2.5">
                    <Edit3 className="w-4 h-4 text-indigo-400" />
                    <span>Zmień nazwę...</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">F2</span>
                </button>

                <div className="h-px bg-white/5 my-1"></div>

                <button 
                  onClick={() => {
                    handleDeleteNode(contextMenu.nodeId!);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-red-500/20 hover:text-red-300 flex items-center justify-between cursor-pointer font-medium transition-colors"
                  id="linux-cm-delete"
                >
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span>Usuń trwale</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">Del</span>
                </button>

                <div className="h-px bg-white/5 my-1"></div>

                <button 
                  onClick={() => {
                    setPropertiesNodeId(contextMenu.nodeId!);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500/20 hover:text-orange-400 flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                  id="linux-cm-properties"
                >
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>Właściwości</span>
                </button>
              </>
            ) : (
              /* Background Context Menu */
              <>
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-gray-400 border-b border-white/5 flex items-center justify-between">
                  <span className="truncate max-w-[140px] text-orange-400">{vfs[currentPathId]?.name || 'Linux'}</span>
                  <span className="text-[9px] text-orange-400 font-mono font-bold bg-orange-500/20 px-1 py-0.5 rounded">Tło katalogu</span>
                </div>

                <button 
                  onClick={() => {
                    setIsNewFolderOpen(true);
                    setNewItemName('');
                    setErrorMsg('');
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500/20 hover:text-orange-400 flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                  id="linux-bg-new-folder"
                >
                  <FolderPlus className="w-4 h-4 text-orange-400" />
                  <span>Nowy folder...</span>
                </button>

                <button 
                  onClick={() => {
                    setIsNewFileOpen(true);
                    setNewItemName('');
                    setErrorMsg('');
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500/20 hover:text-orange-400 flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                  id="linux-bg-new-file"
                >
                  <FilePlus className="w-4 h-4 text-orange-400" />
                  <span>Nowy dokument...</span>
                </button>

                <div className="h-px bg-white/5 my-1"></div>

                <button 
                  disabled={!clipboardNodeId || !clipboardAction}
                  onClick={() => {
                    handlePaste();
                    setContextMenu(null);
                  }}
                  className={`w-full text-left px-3 py-1.5 flex items-center justify-between cursor-pointer font-medium transition-colors ${
                    clipboardNodeId && clipboardAction
                      ? 'hover:bg-emerald-500/20 hover:text-emerald-300 text-gray-200'
                      : 'opacity-40 text-gray-500 cursor-not-allowed'
                  }`}
                  id="linux-bg-paste"
                >
                  <div className="flex items-center gap-2.5">
                    <Clipboard className="w-4 h-4 text-emerald-400" />
                    <span>
                      Wklej {clipboardNodeId && vfs[clipboardNodeId] ? `(„${vfs[clipboardNodeId].name}”)` : ''}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">Ctrl+V</span>
                </button>

                <button 
                  onClick={() => {
                    setContextMenu(null);
                    onAddXP(5);
                    onActionTriggered();
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500/20 hover:text-orange-400 flex items-center justify-between cursor-pointer font-medium transition-colors"
                  id="linux-bg-refresh"
                >
                  <div className="flex items-center gap-2.5">
                    <RotateCw className="w-4 h-4 text-gray-400" />
                    <span>Odśwież</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">F5</span>
                </button>

                <div className="h-px bg-white/5 my-1"></div>

                <button 
                  onClick={() => {
                    setPropertiesNodeId(currentPathId);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-orange-500/20 hover:text-orange-400 flex items-center gap-2.5 cursor-pointer font-medium transition-colors"
                  id="linux-bg-properties"
                >
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>Właściwości katalogu</span>
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* MODAL 1: Create Folder */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#2c1a24] text-white rounded-3xl p-6 max-w-sm w-full border border-orange-500/30 animate-scaleUp shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-orange-400" />
              Nowy folder (Linux Ubuntu)
            </h3>
            <p className="text-xs text-gray-400 mb-4">Wpisz nazwę dla nowego podkatalogu:</p>
            
            <input 
              type="text"
              value={newItemName}
              onChange={(e) => { setNewItemName(e.target.value); setErrorMsg(''); }}
              placeholder="np. Projekty"
              className="w-full px-3 py-2 border border-[#4a2e3f] bg-[#1e1118] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm mb-2 font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
              id="linux-input-folder-name"
            />
            
            {errorMsg && (
              <p className="text-red-400 text-xs font-semibold mb-3 flex items-center gap-1">
                <span>⚠️</span> {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-2 text-xs mt-4">
              <button 
                onClick={() => setIsNewFolderOpen(false)}
                className="px-4 py-2 border border-[#4a2e3f] text-gray-400 rounded-xl hover:bg-white/5 cursor-pointer"
              >
                Anuluj
              </button>
              <button 
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                id="linux-btn-confirm-create-folder"
              >
                Utwórz folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create File */}
      {isNewFileOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#2c1a24] text-white rounded-3xl p-6 max-w-sm w-full border border-orange-500/30 animate-scaleUp shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-orange-400" />
              Nowy plik (Linux)
            </h3>
            <p className="text-xs text-gray-400 mb-4">Wpisz nazwę z rozszerzeniem (np. <span className="font-mono text-orange-400">skrypt.py</span> lub <span className="font-mono text-orange-400">notatka.txt</span>):</p>
            
            <input 
              type="text"
              value={newItemName}
              onChange={(e) => { setNewItemName(e.target.value); setErrorMsg(''); }}
              placeholder="np. skrypt.py"
              className="w-full px-3 py-2 border border-[#4a2e3f] bg-[#1e1118] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm mb-2 font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
              autoFocus
              id="linux-input-file-name"
            />
            
            {errorMsg && (
              <p className="text-red-400 text-xs font-semibold mb-3 flex items-center gap-1">
                <span>⚠️</span> {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-2 text-xs mt-4">
              <button 
                onClick={() => setIsNewFileOpen(false)}
                className="px-4 py-2 border border-[#4a2e3f] text-gray-400 rounded-xl hover:bg-white/5 cursor-pointer"
              >
                Anuluj
              </button>
              <button 
                onClick={handleCreateFile}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                id="linux-btn-confirm-create-file"
              >
                Utwórz plik
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Rename */}
      {isRenameOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#2c1a24] text-white rounded-3xl p-6 max-w-sm w-full border border-orange-500/30 animate-scaleUp shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-400" />
              Zmień nazwę (Linux)
            </h3>
            <p className="text-xs text-gray-400 mb-4">Podaj nową nazwę dla zaznaczonego elementu:</p>
            
            <input 
              type="text"
              value={newItemName}
              onChange={(e) => { setNewItemName(e.target.value); setErrorMsg(''); }}
              className="w-full px-3 py-2 border border-[#4a2e3f] bg-[#1e1118] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm mb-2 font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              autoFocus
              id="linux-input-rename"
            />
            
            {errorMsg && (
              <p className="text-red-400 text-xs font-semibold mb-3 flex items-center gap-1">
                <span>⚠️</span> {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-2 text-xs mt-4">
              <button 
                onClick={() => setIsRenameOpen(false)}
                className="px-4 py-2 border border-[#4a2e3f] text-gray-400 rounded-xl hover:bg-white/5 cursor-pointer"
              >
                Anuluj
              </button>
              <button 
                onClick={handleRename}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                id="linux-btn-confirm-rename"
              >
                Zmień nazwę
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Linux Properties */}
      {propertiesNodeId && vfs[propertiesNodeId] && (() => {
        const node = vfs[propertiesNodeId];
        const isDir = node.type === 'directory';
        const permissionsStr = isDir ? 'drwxr-xr-x (755)' : '-rw-r--r-- (644)';
        const pathStr = getLinuxPathString(vfs, node.id);

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
            <div className="bg-[#2c1a24] text-white rounded-3xl max-w-md w-full border border-orange-500/30 shadow-2xl flex flex-col overflow-hidden animate-scaleUp">
              {/* Header */}
              <div className="bg-[#3d2633] px-5 py-3.5 flex items-center justify-between border-b border-[#21141c]">
                <div className="flex items-center gap-2.5">
                  <Info className="w-5 h-5 text-orange-400" />
                  <h3 className="font-bold text-sm truncate max-w-[260px]">
                    Właściwości: {node.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setPropertiesNodeId(null)}
                  className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 text-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="p-2.5 bg-[#1e1118] rounded-2xl border border-white/5 flex-shrink-0">
                    {getFileIcon(node)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-white truncate">{node.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                      {isDir ? 'Katalog systemowy (inode/directory)' : 'Plik tekstowy (text/plain)'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="grid grid-cols-[100px_1fr] items-center">
                    <span className="text-gray-400">Lokalizacja:</span>
                    <span className="font-mono text-[11px] text-orange-300 bg-[#1e1118] px-2 py-1 rounded-lg border border-white/5 break-all">
                      {pathStr}
                    </span>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] items-center">
                    <span className="text-gray-400">Rozmiar:</span>
                    <span className="font-medium text-gray-200">{node.size || (isDir ? '4,0 KB' : '100 B')}</span>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] items-center">
                    <span className="text-gray-400">Data utworzenia:</span>
                    <span className="font-mono text-gray-300">{node.createdAt || '2026-07-15 10:00'}</span>
                  </div>

                  <div className="h-px bg-white/10 my-2"></div>

                  <div className="grid grid-cols-[100px_1fr] items-center">
                    <span className="text-gray-400">Właściciel (User):</span>
                    <span className="font-mono text-emerald-400 font-bold">uczen (UID: 1000)</span>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] items-center">
                    <span className="text-gray-400">Grupa (Group):</span>
                    <span className="font-mono text-gray-300">uczen (GID: 1000)</span>
                  </div>

                  <div className="grid grid-cols-[100px_1fr] items-center">
                    <span className="text-gray-400">Prawa dostępu:</span>
                    <span className="font-mono text-amber-400 font-bold bg-[#1e1118] px-2 py-0.5 rounded border border-white/5 inline-block w-fit">
                      {permissionsStr}
                    </span>
                  </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 p-2.5 rounded-xl text-[11px] text-orange-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 text-orange-400" />
                  <span>Uprawnienia Linux: Odczyt i zapis dla właściciela (<code className="font-mono">rw-</code>).</span>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#1e1118] px-5 py-3 flex justify-end border-t border-[#21141c]">
                <button 
                  onClick={() => setPropertiesNodeId(null)}
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
