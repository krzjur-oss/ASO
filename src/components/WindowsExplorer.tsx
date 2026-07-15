/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Folder, 
  FileText, 
  Image, 
  Cpu, 
  FileCode,
  ArrowUp, 
  Search, 
  Trash2, 
  Edit3, 
  ChevronRight,
  HardDrive,
  Monitor,
  File,
  Download,
  FolderPlus,
  FilePlus,
  Play,
  ArrowUpDown,
  Scissors,
  Clipboard
} from 'lucide-react';
import { VFSNode } from '../types';
import { 
  getChildren, 
  getWindowsPathString, 
  validateNodeName, 
  generateId, 
  getCurrentDateString,
  nodeExists,
  getPathNodes
} from '../utils/fileSystem';
import DirectoryTreeVisualizer from './DirectoryTreeVisualizer';
import WindowsCMD from './WindowsCMD';
import WindowsNotepad from './WindowsNotepad';

interface WindowsExplorerProps {
  vfs: Record<string, VFSNode>;
  setVfs: React.Dispatch<React.SetStateAction<Record<string, VFSNode>>>;
  currentPathId: string;
  setCurrentPathId: (id: string) => void;
  onAddXP: (points: number) => void;
  onActionTriggered: (action?: string) => void;
  isChallengeActive?: boolean;
  challengeTimeLeft?: number;
  activeMissionId?: string | null;
}

export default function WindowsExplorer({ 
  vfs, 
  setVfs, 
  currentPathId, 
  setCurrentPathId, 
  onAddXP,
  onActionTriggered,
  isChallengeActive,
  challengeTimeLeft,
  activeMissionId
}: WindowsExplorerProps) {
  
  // OS Simulator States
  const [activeApp, setActiveApp] = useState<'explorer' | 'cmd' | 'notepad' | null>('explorer');
  const [openApps, setOpenApps] = useState<string[]>(['explorer']);
  const [activeNotepadFileId, setActiveNotepadFileId] = useState<string | null>(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  // Search state for Explorer
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection states for Explorer
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Clipboard states for Move operations
  const [clipboardNodeId, setClipboardNodeId] = useState<string | null>(null);
  const [clipboardAction, setClipboardAction] = useState<'cut' | null>(null);
  
  // Modal states for Explorer
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isNewFileOpen, setIsNewFileOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Active Preview State for files that are not txt
  const [previewNode, setPreviewNode] = useState<VFSNode | null>(null);

  // Sorting states for Explorer
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // Hints System for Windows
  const [showHint, setShowHint] = useState(false);
  const [hintTarget, setHintTarget] = useState<{ id: string; message: string } | null>(null);
  const [hintPosition, setHintPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Toggle hint
  const toggleHint = () => {
    setShowHint(prev => !prev);
  };

  // Close hint on mission change
  useEffect(() => {
    setShowHint(false);
  }, [activeMissionId]);

  useEffect(() => {
    if (!showHint) {
      setHintPosition(null);
      setHintTarget(null);
      return;
    }

    if (!activeMissionId) {
      setHintTarget({
        id: 'btn-windows-hint',
        message: 'Najpierw wybierz misję z listy!'
      });
      return;
    }

    let targetId: string | null = null;
    let message = '';

    switch (activeMissionId) {
      case 'm1_win_folder':
        if (currentPathId !== 'root') {
          targetId = 'sidebar-link-root';
          message = 'Najpierw przejdź do Dysku C:';
        } else {
          targetId = 'btn-create-folder';
          message = 'Kliknij przycisk „Nowy Folder”';
        }
        break;

      case 'm2_win_file':
        if (currentPathId === 'dokumenty') {
          targetId = 'explorer-item-szkola_folder';
          if (!document.getElementById(targetId)) {
            // Find by name in case of manual recreation or list items
            const found = Object.values(vfs).find(node => node.name.toLowerCase() === 'szkoła' && node.parentId === 'dokumenty');
            if (found) targetId = `explorer-item-${found.id}`;
          }
          message = 'Kliknij dwukrotnie folder „Szkoła”';
        } else if (currentPathId === 'szkola_folder' || currentPathId.startsWith('szkola')) {
          targetId = 'btn-create-file';
          message = 'Kliknij przycisk „Nowy Plik”';
        } else {
          targetId = 'sidebar-link-dokumenty';
          message = 'Wejdź do folderu „Dokumenty”';
        }
        break;

      case 'm3_win_delete':
        const currentFolderIsSzkola = currentPathId === 'szkola_folder' || currentPathId.startsWith('szkola');
        if (currentFolderIsSzkola) {
          if (selectedNodeId !== 'smieci_tmp') {
            targetId = 'explorer-item-smieci_tmp';
            if (!document.getElementById(targetId)) {
              const found = Object.values(vfs).find(node => node.name.toLowerCase() === 'smieci.tmp' && node.parentId === currentPathId);
              if (found) targetId = `explorer-item-${found.id}`;
            }
            message = 'Zaznacz plik „smieci.tmp”';
          } else {
            targetId = 'btn-delete-file';
            message = 'Kliknij przycisk „Usuń”';
          }
        } else if (currentPathId === 'dokumenty') {
          targetId = 'explorer-item-szkola_folder';
          message = 'Kliknij dwukrotnie folder „Szkoła”';
        } else {
          targetId = 'sidebar-link-dokumenty';
          message = 'Przejdź do folderu „Dokumenty”';
        }
        break;

      case 'm7_win_rename':
        if (currentPathId !== 'pobrane') {
          targetId = 'sidebar-link-pobrane';
          message = 'Przejdź do folderu „Pobrane”';
        } else {
          if (selectedNodeId !== 'obrazek_png') {
            targetId = 'explorer-item-obrazek_png';
            if (!document.getElementById(targetId)) {
              const found = Object.values(vfs).find(node => node.name === 'śmieszny_piesek.png' && node.parentId === 'pobrane');
              if (found) targetId = `explorer-item-${found.id}`;
            }
            message = 'Zaznacz plik „śmieszny_piesek.png”';
          } else {
            targetId = 'btn-rename-file';
            message = 'Kliknij przycisk „Zmień nazwę”';
          }
        }
        break;

      case 'm10_win_subfolder_creation':
        if (currentPathId === 'root') {
          targetId = 'explorer-item-pulpit';
          if (!document.getElementById(targetId)) {
            targetId = 'sidebar-link-pulpit';
          }
          message = 'Wejdź na „Pulpit”';
        } else if (currentPathId === 'pulpit') {
          targetId = 'explorer-item-gry_folder';
          message = 'Kliknij dwukrotnie folder „Moje Gry”';
        } else if (currentPathId === 'gry_folder') {
          targetId = 'btn-create-file';
          message = 'Kliknij przycisk „Nowy Plik”';
        } else {
          targetId = 'sidebar-link-pulpit';
          message = 'Przejdź na „Pulpit”';
        }
        break;

      case 'm13_win_sort':
        if (currentPathId !== 'pobrane') {
          targetId = 'sidebar-link-pobrane';
          message = 'Przejdź do folderu „Pobrane”';
        } else {
          targetId = 'btn-sort-files';
          message = 'Kliknij przycisk „Sortuj”';
        }
        break;

      case 'm14_win_challenge_move': {
        const hasInDownloads = ['obrazek_png', 'kotek_jpg', 'rybka_gif'].some(
          id => vfs[id] && vfs[id].parentId === 'pobrane'
        );
        if (hasInDownloads) {
          if (currentPathId !== 'pobrane') {
            targetId = 'sidebar-link-pobrane';
            message = 'Przejdź do folderu „Pobrane”';
          } else {
            const cuttable = ['obrazek_png', 'kotek_jpg', 'rybka_gif'].find(
              id => vfs[id] && vfs[id].parentId === 'pobrane'
            );
            if (cuttable) {
              if (selectedNodeId !== cuttable) {
                targetId = `explorer-item-${cuttable}`;
                message = `Zaznacz plik „${vfs[cuttable]?.name}”`;
              } else {
                targetId = 'btn-cut-file';
                message = 'Kliknij przycisk „Wytnij”';
              }
            }
          }
        } else {
          if (clipboardNodeId) {
            if (currentPathId !== 'zdjęcia') {
              if (currentPathId === 'root') {
                targetId = 'explorer-item-zdjęcia';
                message = 'Kliknij dwukrotnie folder „Zdjęcia”';
              } else {
                targetId = 'sidebar-link-root';
                message = 'Przejdź do Dysku C:';
              }
            } else {
              targetId = 'btn-paste-file';
              message = 'Kliknij przycisk „Wklej”';
            }
          } else {
            targetId = 'sidebar-link-pobrane';
            message = 'Przejdź do „Pobrane” po kolejny plik';
          }
        }
        break;
      }

      default:
        targetId = 'btn-windows-hint';
        message = 'To zadanie wykonaj w terminalu Linux';
        break;
    }

    setHintTarget(targetId ? { id: targetId, message } : null);
  }, [showHint, activeMissionId, currentPathId, selectedNodeId, vfs, clipboardNodeId]);

  useEffect(() => {
    if (!showHint || !hintTarget) {
      setHintPosition(null);
      return;
    }

    const updatePosition = () => {
      const parentEl = document.getElementById('windows-desktop-root');
      const targetEl = document.getElementById(hintTarget.id);

      if (parentEl && targetEl) {
        const parentRect = parentEl.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();

        setHintPosition({
          top: targetRect.top - parentRect.top,
          left: targetRect.left - parentRect.left,
          width: targetRect.width,
          height: targetRect.height,
        });
      } else {
        setHintPosition(null);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    const intervalId = setInterval(updatePosition, 300);

    return () => {
      window.removeEventListener('resize', updatePosition);
      clearInterval(intervalId);
    };
  }, [showHint, hintTarget]);

  // Helper for rendering appropriate icons
  const getFileIcon = (node: VFSNode) => {
    if (node.type === 'directory') {
      return <Folder className="w-12 h-12 text-yellow-500 fill-yellow-400" />;
    }
    const name = node.name.toLowerCase();
    if (name.endsWith('.txt')) {
      return <FileText className="w-12 h-12 text-blue-500" />;
    }
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
      return <Image className="w-12 h-12 text-teal-500" />;
    }
    if (name.endsWith('.exe')) {
      return <Cpu className="w-12 h-12 text-indigo-500" />;
    }
    if (name.endsWith('.py') || name.endsWith('.html') || name.endsWith('.css')) {
      return <FileCode className="w-12 h-12 text-amber-500" />;
    }
    return <File className="w-12 h-12 text-gray-400" />;
  };

  const getSmallFileIcon = (node: VFSNode) => {
    if (node.type === 'directory') {
      return <Folder className="w-4 h-4 text-yellow-500 fill-yellow-400" />;
    }
    const name = node.name.toLowerCase();
    if (name.endsWith('.txt')) {
      return <FileText className="w-4 h-4 text-blue-500" />;
    }
    if (name.endsWith('.png') || name.endsWith('.jpg')) {
      return <Image className="w-4 h-4 text-teal-500" />;
    }
    if (name.endsWith('.exe')) {
      return <Cpu className="w-4 h-4 text-indigo-500" />;
    }
    return <File className="w-4 h-4 text-gray-400" />;
  };

  // Nav actions
  const handleFolderClick = (node: VFSNode) => {
    if (node.type === 'directory') {
      setCurrentPathId(node.id);
      setSelectedNodeId(null);
      setSearchQuery('');
    } else {
      const name = node.name.toLowerCase();
      if (name.endsWith('.txt')) {
        // Intercept txt files to open in Windows Notepad!
        setActiveNotepadFileId(node.id);
        if (!openApps.includes('notepad')) {
          setOpenApps(prev => [...prev, 'notepad']);
        }
        setActiveApp('notepad');
        onAddXP(5);
      } else {
        // Other files use regular preview modal
        setPreviewNode(node);
        onAddXP(5);
      }
    }
  };

  const handleGoUp = () => {
    const current = vfs[currentPathId];
    if (current && current.parentId) {
      setCurrentPathId(current.parentId);
      setSelectedNodeId(null);
    }
  };

  // Create Folder
  const handleCreateFolder = () => {
    const val = validateNodeName(newItemName, 'windows');
    if (!val.isValid) {
      setErrorMsg(val.error || 'Błąd nazwy.');
      return;
    }
    if (nodeExists(vfs, currentPathId, newItemName)) {
      setErrorMsg('Folder o takiej nazwie już istnieje!');
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
    setTimeout(() => {
      onActionTriggered();
    }, 50);
  };

  // Create File
  const handleCreateFile = () => {
    const val = validateNodeName(newItemName, 'windows');
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
      content: newItemName.toLowerCase().endsWith('.txt') ? 'Klasyczny plik tekstowy szkolny. Zmodyfikuj mnie.' : 'Zawartość pliku.',
      createdAt: getCurrentDateString(),
      size: '1 KB'
    };

    setVfs(prev => ({
      ...prev,
      [newId]: newFile
    }));

    setIsNewFileOpen(false);
    setNewItemName('');
    setErrorMsg('');
    onAddXP(15);
    setTimeout(() => {
      onActionTriggered();
    }, 50);
  };

  // Delete Node
  const handleDeleteNode = (nodeId: string) => {
    setVfs(prev => {
      const copy = { ...prev };
      
      const removeNodeAndChildren = (id: string) => {
        delete copy[id];
        Object.keys(copy).forEach(childId => {
          if (copy[childId]?.parentId === id) {
            removeNodeAndChildren(childId);
          }
        });
      };
      
      removeNodeAndChildren(nodeId);
      return copy;
    });
    
    setSelectedNodeId(null);
    onAddXP(10);
    setTimeout(() => {
      onActionTriggered();
    }, 50);
  };

  // Clipboard: Cut node (Wytnij)
  const handleCut = () => {
    if (!selectedNodeId) return;
    setClipboardNodeId(selectedNodeId);
    setClipboardAction('cut');
  };

  // Clipboard: Paste node (Wklej)
  const handlePaste = () => {
    if (!clipboardNodeId || clipboardAction !== 'cut') return;
    
    const nodeToMove = vfs[clipboardNodeId];
    if (!nodeToMove) return;

    // Prevent pasting a directory inside itself or its children
    if (nodeToMove.type === 'directory') {
      let tempParentId: string | null = currentPathId;
      while (tempParentId) {
        if (tempParentId === nodeToMove.id) {
          alert('Błąd: Nie można wkleić folderu do samego siebie ani do jego podfolderów!');
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
    onAddXP(15);
    
    setTimeout(() => {
      onActionTriggered();
    }, 50);
  };

  // Rename Node
  const handleRename = () => {
    if (!selectedNodeId) return;
    const val = validateNodeName(newItemName, 'windows');
    if (!val.isValid) {
      setErrorMsg(val.error || 'Błąd nazwy.');
      return;
    }
    
    const targetNode = vfs[selectedNodeId];
    if (targetNode && nodeExists(vfs, targetNode.parentId || 'root', newItemName) && targetNode.name.toLowerCase() !== newItemName.toLowerCase()) {
      setErrorMsg('Nazwa już istnieje w tym folderze!');
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
    setTimeout(() => {
      onActionTriggered();
    }, 50);
  };

  // Fetch active directory items or search results
  const rawChildren = searchQuery.trim() !== ''
    ? Object.values(vfs).filter(node => 
        node.parentId !== null && 
        node.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getChildren(vfs, currentPathId);

  // Helper to parse file size string for correct numerical sorting
  const parseSizeForSorting = (sizeStr?: string): number => {
    if (!sizeStr) return 0;
    if (sizeStr === 'Folder' || sizeStr === 'Katalog') return -1;
    const cleanStr = sizeStr.trim().toLowerCase();
    const match = cleanStr.match(/^([\d.]+)\s*([a-z]*)/);
    if (!match) return 0;
    const value = parseFloat(match[1]);
    const unit = match[2];
    if (unit.startsWith('k')) return value * 1024;
    if (unit.startsWith('m')) return value * 1024 * 1024;
    if (unit.startsWith('g')) return value * 1024 * 1024 * 1024;
    return value;
  };

  const currentChildren = [...rawChildren].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    
    let comp = 0;
    if (sortBy === 'name') {
      comp = a.name.localeCompare(b.name, 'pl');
    } else if (sortBy === 'size') {
      comp = parseSizeForSorting(a.size) - parseSizeForSorting(b.size);
    } else if (sortBy === 'date') {
      comp = (a.createdAt || '').localeCompare(b.createdAt || '');
    }
    
    return sortOrder === 'asc' ? comp : -comp;
  });

  const pathNodes = getPathNodes(vfs, currentPathId);

  return (
    <div 
      className="bg-gradient-to-tr from-[#9ec4df] via-[#dfd6ed] to-[#ececf3] rounded-3xl border border-white shadow-xl overflow-hidden flex flex-col h-[650px] text-[#2E3440] relative" 
      id="windows-desktop-root"
    >
      {/* DESKTOP WORKSPACE AREA */}
      <div 
        className="flex-grow relative overflow-hidden"
        onClick={() => {
          setSelectedNodeId(null);
          setStartMenuOpen(false);
        }}
      >
        {/* Floating Desktop Shortcut Icons */}
        <div className="absolute top-6 left-6 flex flex-col gap-5 z-0" onClick={(e) => e.stopPropagation()}>
          {/* Shortcut 1: Computer */}
          <button 
            onDoubleClick={() => {
              if (!openApps.includes('explorer')) setOpenApps(prev => [...prev, 'explorer']);
              setActiveApp('explorer');
            }}
            onClick={() => setSelectedNodeId('shortcut-explorer')}
            className={`flex flex-col items-center p-2 rounded-2xl border w-20 cursor-pointer text-center select-none transition-all ${
              selectedNodeId === 'shortcut-explorer' 
                ? 'bg-white/35 border-white/50 shadow-md scale-102 ring-1 ring-white/10' 
                : 'border-transparent hover:bg-white/15'
            }`}
          >
            <Folder className="w-10 h-10 text-yellow-500 fill-yellow-400 drop-shadow-md" />
            <span className="text-[10px] font-bold text-gray-800 tracking-tight mt-1 line-clamp-2 leading-tight drop-shadow-xs">Ten Komputer</span>
          </button>

          {/* Shortcut 2: CMD */}
          <button 
            onDoubleClick={() => {
              if (!openApps.includes('cmd')) setOpenApps(prev => [...prev, 'cmd']);
              setActiveApp('cmd');
            }}
            onClick={() => setSelectedNodeId('shortcut-cmd')}
            className={`flex flex-col items-center p-2 rounded-2xl border w-20 cursor-pointer text-center select-none transition-all ${
              selectedNodeId === 'shortcut-cmd' 
                ? 'bg-white/35 border-white/50 shadow-md scale-102 ring-1 ring-white/10' 
                : 'border-transparent hover:bg-white/15'
            }`}
          >
            <div className="w-10 h-10 bg-black rounded-xl border border-gray-600 flex items-center justify-center text-white text-sm font-mono font-bold shadow-md drop-shadow-md">
              &gt;_
            </div>
            <span className="text-[10px] font-bold text-gray-800 tracking-tight mt-1 line-clamp-2 leading-tight drop-shadow-xs">Konsola CMD</span>
          </button>

          {/* Shortcut 3: Notepad */}
          <button 
            onDoubleClick={() => {
              setActiveNotepadFileId(null);
              if (!openApps.includes('notepad')) setOpenApps(prev => [...prev, 'notepad']);
              setActiveApp('notepad');
            }}
            onClick={() => setSelectedNodeId('shortcut-notepad')}
            className={`flex flex-col items-center p-2 rounded-2xl border w-20 cursor-pointer text-center select-none transition-all ${
              selectedNodeId === 'shortcut-notepad' 
                ? 'bg-white/35 border-white/50 shadow-md scale-102 ring-1 ring-white/10' 
                : 'border-transparent hover:bg-white/15'
            }`}
          >
            <FileText className="w-10 h-10 text-blue-600 drop-shadow-md fill-blue-50/50" />
            <span className="text-[10px] font-bold text-gray-800 tracking-tight mt-1 line-clamp-2 leading-tight drop-shadow-xs">Notatnik</span>
          </button>
        </div>

        {/* 1. APP WINDOW: FILE EXPLORER */}
        {activeApp === 'explorer' && openApps.includes('explorer') && (
          <div 
            className="absolute inset-x-2 top-2 bottom-2 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-10 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Explorer Inner Header */}
            <div className="bg-[#ECEFF4] border-b border-[#D8DEE9] p-3 rounded-t-2xl flex flex-wrap items-center justify-between gap-3 select-none">
              {/* Navigation & Address Bar */}
              <div className="flex items-center gap-2 flex-grow min-w-0">
                <button 
                  onClick={handleGoUp}
                  disabled={currentPathId === 'root'}
                  className="p-1.5 hover:bg-white/60 rounded-xl text-[#2E3440] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  title="W górę (Cofnij)"
                  id="explorer-back-btn"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                
                {/* Breadcrumbs Address Bar */}
                <div className="flex items-center gap-1 bg-white border border-[#D8DEE9] px-3 py-1.5 rounded-xl flex-grow min-w-0 text-xs text-[#2E3440] font-sans overflow-x-auto whitespace-nowrap shadow-2xs">
                  <Monitor className="w-3.5 h-3.5 text-[#5E81AC] flex-shrink-0" />
                  <span className="text-gray-400">Ten komputer</span>
                  <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  {pathNodes.map((pNode, index) => (
                    <React.Fragment key={pNode.id}>
                      {index > 0 && <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                      <button 
                        onClick={() => handleFolderClick(pNode)}
                        className="hover:text-[#5E81AC] hover:underline font-bold focus:outline-none"
                      >
                        {pNode.name === 'root' ? 'Dysk lokalny (C:)' : pNode.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-[#4C566A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Szukaj..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-[#D8DEE9] rounded-xl text-xs bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E81AC] text-[#2E3440] shadow-2xs"
                  id="explorer-search-input"
                />
              </div>

              {/* Close window icon */}
              <button 
                onClick={() => {
                  setOpenApps(prev => prev.filter(a => a !== 'explorer'));
                  setActiveApp(openApps.filter(a => a !== 'explorer')[0] as any || null);
                }}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 p-1 rounded-lg w-7 h-7 flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* 2. Secondary Action Icons Bar (Windows 11 modern top bar) */}
            <div className="bg-[#F8FAFC] border-b border-[#D8DEE9] px-4 py-2 flex items-center justify-between text-xs text-[#2E3440] select-none">
              <div className="flex items-center gap-2 flex-wrap">
                <button 
                  onClick={() => { setIsNewFolderOpen(true); setErrorMsg(''); setNewItemName(''); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white border border-transparent hover:border-[#D8DEE9] hover:text-[#5E81AC] rounded-lg transition-all shadow-2xs cursor-pointer"
                  id="btn-create-folder"
                >
                  <FolderPlus className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold">Nowy Folder</span>
                </button>
                
                <button 
                  onClick={() => { setIsNewFileOpen(true); setErrorMsg(''); setNewItemName(''); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white border border-transparent hover:border-[#D8DEE9] hover:text-[#5E81AC] rounded-lg transition-all shadow-2xs cursor-pointer"
                  id="btn-create-file"
                >
                  <FilePlus className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold">Nowy Plik</span>
                </button>

                {/* Sort Option Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white border border-transparent hover:border-[#D8DEE9] hover:text-[#5E81AC] rounded-lg transition-all shadow-2xs cursor-pointer"
                    id="btn-sort-files"
                  >
                    <ArrowUpDown className="w-4 h-4 text-indigo-500" />
                    <span className="font-semibold">Sortuj ({sortBy === 'name' ? 'Nazwa' : sortBy === 'size' ? 'Rozmiar' : 'Data'})</span>
                  </button>
                  
                  {isSortMenuOpen && (
                    <div className="absolute left-0 mt-1.5 w-48 bg-white border border-[#D8DEE9] rounded-xl shadow-lg py-1.5 z-20 animate-fadeIn text-[#2E3440]">
                      <button 
                        onClick={() => {
                          setSortBy('name');
                          setSortOrder('asc');
                          setIsSortMenuOpen(false);
                          onActionTriggered('sort-name-asc');
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#ECEFF4] transition-colors flex items-center justify-between ${sortBy === 'name' && sortOrder === 'asc' ? 'font-bold text-[#5E81AC]' : ''}`}
                      >
                        <span>Nazwa (Rosnąco)</span>
                        {sortBy === 'name' && sortOrder === 'asc' && <span>✓</span>}
                      </button>
                      <button 
                        onClick={() => {
                          setSortBy('name');
                          setSortOrder('desc');
                          setIsSortMenuOpen(false);
                          onActionTriggered('sort-name-desc');
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#ECEFF4] transition-colors flex items-center justify-between ${sortBy === 'name' && sortOrder === 'desc' ? 'font-bold text-[#5E81AC]' : ''}`}
                      >
                        <span>Nazwa (Malejąco)</span>
                        {sortBy === 'name' && sortOrder === 'desc' && <span>✓</span>}
                      </button>
                      <div className="h-px bg-[#ECEFF4] my-1"></div>
                      <button 
                        onClick={() => {
                          setSortBy('size');
                          setSortOrder('asc');
                          setIsSortMenuOpen(false);
                          onActionTriggered('sort-size-asc');
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#ECEFF4] transition-colors flex items-center justify-between ${sortBy === 'size' && sortOrder === 'asc' ? 'font-bold text-[#5E81AC]' : ''}`}
                      >
                        <span>Rozmiar (Rosnąco)</span>
                        {sortBy === 'size' && sortOrder === 'asc' && <span>✓</span>}
                      </button>
                      <button 
                        onClick={() => {
                          setSortBy('size');
                          setSortOrder('desc');
                          setIsSortMenuOpen(false);
                          onActionTriggered('sort-size-desc');
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#ECEFF4] transition-colors flex items-center justify-between ${sortBy === 'size' && sortOrder === 'desc' ? 'font-bold text-[#5E81AC]' : ''}`}
                      >
                        <span>Rozmiar (Malejąco)</span>
                        {sortBy === 'size' && sortOrder === 'desc' && <span>✓</span>}
                      </button>
                      <div className="h-px bg-[#ECEFF4] my-1"></div>
                      <button 
                        onClick={() => {
                          setSortBy('date');
                          setSortOrder('asc');
                          setIsSortMenuOpen(false);
                          onActionTriggered('sort-date-asc');
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#ECEFF4] transition-colors flex items-center justify-between ${sortBy === 'date' && sortOrder === 'asc' ? 'font-bold text-[#5E81AC]' : ''}`}
                      >
                        <span>Data (Najstarsze)</span>
                        {sortBy === 'date' && sortOrder === 'asc' && <span>✓</span>}
                      </button>
                      <button 
                        onClick={() => {
                          setSortBy('date');
                          setSortOrder('desc');
                          setIsSortMenuOpen(false);
                          onActionTriggered('sort-date-desc');
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#ECEFF4] transition-colors flex items-center justify-between ${sortBy === 'date' && sortOrder === 'desc' ? 'font-bold text-[#5E81AC]' : ''}`}
                      >
                        <span>Data (Najnowsze)</span>
                        {sortBy === 'date' && sortOrder === 'desc' && <span>✓</span>}
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-4 w-px bg-[#D8DEE9] mx-1"></div>

                <button 
                  disabled={!selectedNodeId}
                  onClick={() => {
                    if (!selectedNodeId) return;
                     setIsRenameOpen(true);
                     setNewItemName(vfs[selectedNodeId]?.name || '');
                     setErrorMsg('');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white border border-transparent hover:border-[#D8DEE9] hover:text-[#5E81AC] rounded-lg transition-all shadow-2xs disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent disabled:hover:text-[#4C566A] cursor-pointer"
                  title="Zmień nazwę zaznaczonego elementu"
                  id="btn-rename-file"
                >
                  <Edit3 className="w-4 h-4 text-[#4C566A]" />
                  <span className="hidden sm:inline font-semibold">Zmień nazwę</span>
                </button>

                <button 
                  disabled={!selectedNodeId}
                  onClick={handleCut}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 hover:text-emerald-700 rounded-lg transition-all shadow-2xs disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent disabled:hover:text-[#4C566A] cursor-pointer"
                  title="Wytnij (przygotuj plik do przeniesienia)"
                  id="btn-cut-file"
                >
                  <Scissors className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold">Wytnij</span>
                  {clipboardNodeId && clipboardNodeId === selectedNodeId && (
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                  )}
                </button>

                <button 
                  disabled={!clipboardNodeId}
                  onClick={handlePaste}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 hover:text-emerald-700 rounded-lg transition-all shadow-2xs disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent disabled:hover:text-[#4C566A] cursor-pointer"
                  title="Wklej plik w obecnym folderze"
                  id="btn-paste-file"
                >
                  <Clipboard className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Wklej</span>
                  {clipboardNodeId && (
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                  )}
                </button>

                <button 
                  disabled={!selectedNodeId}
                  onClick={() => selectedNodeId && handleDeleteNode(selectedNodeId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50/50 border border-transparent hover:border-red-200 hover:text-red-600 rounded-lg transition-all shadow-2xs disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent disabled:hover:text-[#4C566A] cursor-pointer"
                  title="Usuń zaznaczony element"
                  id="btn-delete-file"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span className="hidden sm:inline font-semibold">Usuń</span>
                </button>
              </div>
            </div>

            {/* 3. Main Workspace splits */}
            <div className="flex-1 flex min-h-0">
              {/* Sidebar directory tree navigation (Windows Explorer style) */}
              <div className="w-56 border-r border-[#ECEFF4] p-3 overflow-y-auto space-y-4 bg-[#F8FAFC]/50 select-none hidden md:block">
                <div>
                  <span className="px-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Szybki dostęp</span>
                  <div className="mt-1 space-y-0.5">
                    <button 
                      onClick={() => handleFolderClick({ id: 'pulpit', name: 'Pulpit', type: 'directory', parentId: 'root', createdAt: '' })}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-colors border border-transparent ${currentPathId === 'pulpit' ? 'bg-white text-[#5E81AC] font-bold border-[#D8DEE9] shadow-2xs' : 'hover:bg-[#ECEFF4]/60'}`}
                      id="sidebar-link-pulpit"
                    >
                      <Monitor className="w-3.5 h-3.5 text-[#5E81AC]" />
                      <span>Pulpit</span>
                    </button>
                    <button 
                      onClick={() => handleFolderClick({ id: 'dokumenty', name: 'Dokumenty', type: 'directory', parentId: 'root', createdAt: '' })}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-colors border border-transparent ${currentPathId === 'dokumenty' ? 'bg-white text-[#5E81AC] font-bold border-[#D8DEE9] shadow-2xs' : 'hover:bg-[#ECEFF4]/60'}`}
                      id="sidebar-link-dokumenty"
                    >
                      <Folder className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                      <span>Dokumenty</span>
                    </button>
                    <button 
                      onClick={() => handleFolderClick({ id: 'pobrane', name: 'Pobrane', type: 'directory', parentId: 'root', createdAt: '' })}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-colors border border-transparent ${currentPathId === 'pobrane' ? 'bg-white text-[#5E81AC] font-bold border-[#D8DEE9] shadow-2xs' : 'hover:bg-[#ECEFF4]/60'}`}
                      id="sidebar-link-pobrane"
                    >
                      <Download className="w-3.5 h-3.5 text-green-500" />
                      <span>Pobrane</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="px-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ten komputer</span>
                  <div className="mt-1 space-y-0.5">
                    <button 
                      onClick={() => handleFolderClick({ id: 'root', name: 'C:', type: 'directory', parentId: null, createdAt: '' })}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-colors border border-transparent ${currentPathId === 'root' ? 'bg-white text-[#5E81AC] font-bold border-[#D8DEE9] shadow-2xs' : 'hover:bg-[#ECEFF4]/60'}`}
                      id="sidebar-link-root"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-sky-600" />
                      <span>Dysk lokalny (C:)</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ECEFF4]">
                  <DirectoryTreeVisualizer 
                    vfs={vfs}
                    currentPathId={currentPathId}
                    setCurrentPathId={setCurrentPathId}
                    system="windows"
                    minimal={true}
                  />
                </div>
              </div>

              {/* Main Folder Grid Area */}
              <div className="flex-1 bg-white p-4 overflow-y-auto select-none" onClick={() => setSelectedNodeId(null)}>
                {currentChildren.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8">
                    <Folder className="w-16 h-16 stroke-1 text-gray-300 mb-2" />
                    <p className="font-medium text-sm">Ten folder jest pusty.</p>
                    <p className="text-xs text-gray-300 mt-1">Użyj paska u góry, aby dodać nowe foldery lub pliki!</p>
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
                          className={`p-3 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-blue-400 bg-blue-50/50 shadow-sm ring-1 ring-blue-400/50' 
                              : 'border-transparent hover:bg-gray-50 hover:border-gray-100'
                          }`}
                          id={`explorer-item-${node.id}`}
                        >
                          <div className="mb-2 relative">
                            {getFileIcon(node)}
                          </div>
                          <span className="text-xs text-gray-700 font-medium break-all line-clamp-2 max-w-[100px]" title={node.name}>
                            {node.name}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5 font-mono">
                            {node.type === 'directory' ? 'Katalog' : node.size}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 4. Footer Status Bar */}
            <div className="bg-[#ECEFF4] border-t border-[#D8DEE9] px-4 py-2 rounded-b-2xl flex items-center justify-between text-[11px] text-gray-500 font-sans select-none">
              <div className="flex items-center gap-3">
                <span>Elementy: {currentChildren.length}</span>
                {selectedNodeId && vfs[selectedNodeId] && (
                  <span className="text-blue-600 font-medium">
                    Zaznaczono: {vfs[selectedNodeId]?.name} ({vfs[selectedNodeId]?.type === 'directory' ? 'Katalog' : 'Plik'})
                  </span>
                )}
              </div>
              <div className="text-right">
                Kliknij dwukrotnie, aby otworzyć
              </div>
            </div>
          </div>
        )}

        {/* 2. APP WINDOW: WINDOWS CMD */}
        {activeApp === 'cmd' && openApps.includes('cmd') && (
          <div 
            className="absolute inset-x-2 top-2 bottom-2 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col z-10 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <WindowsCMD 
              vfs={vfs}
              setVfs={setVfs}
              currentPathId={currentPathId}
              setCurrentPathId={setCurrentPathId}
              onAddXP={onAddXP}
              onActionTriggered={onActionTriggered}
            />
          </div>
        )}

        {/* 3. APP WINDOW: WINDOWS NOTEPAD */}
        {activeApp === 'notepad' && openApps.includes('notepad') && (
          <div 
            className="absolute inset-x-2 top-2 bottom-2 rounded-2xl overflow-hidden shadow-2xl border border-gray-300 flex flex-col z-10 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <WindowsNotepad 
              vfs={vfs}
              setVfs={setVfs}
              currentPathId={currentPathId}
              activeFileId={activeNotepadFileId}
              setActiveFileId={setActiveNotepadFileId}
              onAddXP={onAddXP}
              onActionTriggered={onActionTriggered}
              onClose={() => {
                setOpenApps(prev => prev.filter(a => a !== 'notepad'));
                setActiveApp(openApps.filter(a => a !== 'notepad')[0] as any || null);
              }}
            />
          </div>
        )}
      </div>

      {/* WINDOWS 11 STYLE BOTTOM TASKBAR */}
      <div 
        className="bg-white/80 backdrop-blur-md border-t border-white/40 h-14 flex items-center justify-between px-4 z-20 select-none relative no-print shadow-lg"
        onClick={(e) => e.stopPropagation()}
        id="windows-taskbar"
      >
        {/* Left branding widget */}
        <div className="text-[10px] text-gray-600 font-bold font-sans hidden sm:block">
          <span>Akademia Windows 11</span>
        </div>

        {/* Center centered icons */}
        <div className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
          
          {/* Start Menu Button */}
          <button
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className={`p-2 rounded-xl transition-all hover:bg-white/60 ${startMenuOpen ? 'bg-white shadow-xs scale-105' : ''}`}
            title="Start Menu"
            id="taskbar-btn-start"
          >
            <div className="w-5 h-5 bg-[#5e81ac] rounded-lg flex items-center justify-center text-white font-black text-[10px] shadow-sm">
              🪟
            </div>
          </button>

          {/* File Explorer Shortcut */}
          <button
            onClick={() => {
              if (activeApp === 'explorer') {
                setActiveApp(null); // minimize
              } else {
                if (!openApps.includes('explorer')) setOpenApps(prev => [...prev, 'explorer']);
                setActiveApp('explorer');
              }
              setStartMenuOpen(false);
            }}
            className={`p-2 rounded-xl transition-all relative flex flex-col items-center justify-center hover:bg-white/60 ${
              activeApp === 'explorer' ? 'bg-white shadow-xs' : ''
            }`}
            title="Eksplorator plików"
            id="taskbar-btn-explorer"
          >
            <Folder className="w-5 h-5 text-yellow-500 fill-yellow-400" />
            {openApps.includes('explorer') && (
              <span className="w-1 h-1 bg-blue-500 rounded-full absolute bottom-1"></span>
            )}
          </button>

          {/* CMD Shortcut */}
          <button
            onClick={() => {
              if (activeApp === 'cmd') {
                setActiveApp(null); // minimize
              } else {
                if (!openApps.includes('cmd')) setOpenApps(prev => [...prev, 'cmd']);
                setActiveApp('cmd');
              }
              setStartMenuOpen(false);
            }}
            className={`p-2 rounded-xl transition-all relative flex flex-col items-center justify-center hover:bg-white/60 ${
              activeApp === 'cmd' ? 'bg-white shadow-xs' : ''
            }`}
            title="Wiersz poleceń (CMD)"
            id="taskbar-btn-cmd"
          >
            <div className="w-5 h-5 bg-black rounded-lg flex items-center justify-center text-white text-[9px] font-mono font-bold border border-gray-600">
              &gt;_
            </div>
            {openApps.includes('cmd') && (
              <span className="w-1 h-1 bg-blue-500 rounded-full absolute bottom-1"></span>
            )}
          </button>

          {/* Notepad Shortcut */}
          <button
            onClick={() => {
              if (activeApp === 'notepad') {
                setActiveApp(null); // minimize
              } else {
                if (!openApps.includes('notepad')) setOpenApps(prev => [...prev, 'notepad']);
                setActiveApp('notepad');
              }
              setStartMenuOpen(false);
            }}
            className={`p-2 rounded-xl transition-all relative flex flex-col items-center justify-center hover:bg-white/60 ${
              activeApp === 'notepad' ? 'bg-white shadow-xs' : ''
            }`}
            title="Notatnik"
            id="taskbar-btn-notepad"
          >
            <FileText className="w-5 h-5 text-blue-500" />
            {openApps.includes('notepad') && (
              <span className="w-1 h-1 bg-blue-500 rounded-full absolute bottom-1"></span>
            )}
          </button>

        </div>

        {/* Right side widgets: volume, wifi, clock */}
        <div className="text-right flex items-center gap-3 text-gray-600 font-sans text-[10px] font-bold select-none">
          {isChallengeActive && challengeTimeLeft !== undefined && (
            <div className="bg-red-50 text-red-600 px-2 py-1 rounded-md flex items-center gap-1 border border-red-200 animate-pulse font-mono text-[10px]" id="windows-taskbar-challenge-timer">
              <span>⏱️ Zostało:</span>
              <span className="font-extrabold text-xs">{challengeTimeLeft}s</span>
            </div>
          )}
          <div className="hidden xs:flex items-center gap-2">
            <span>📶</span>
            <span>🔊</span>
          </div>
          <div className="flex flex-col items-end leading-none">
            <span>{new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-[8px] text-gray-400 mt-0.5">{new Date().toLocaleDateString('pl-PL')}</span>
          </div>
        </div>

        {/* POPUP: WINDOWS 11 START MENU */}
        {startMenuOpen && (
          <div 
            className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-2xl w-80 p-5 shadow-2xl border border-white/60 animate-scaleUp text-gray-800 select-none z-30"
            id="start-menu-popup"
          >
            <div className="bg-gray-100/85 px-3 py-1.5 rounded-xl text-xs text-gray-400 mb-4 flex items-center gap-2 border border-gray-200/25">
              <span>🔍</span>
              <span>Wyszukaj pliki i programy...</span>
            </div>

            <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Polecane programy</h4>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button 
                onClick={() => {
                  if (!openApps.includes('explorer')) setOpenApps(prev => [...prev, 'explorer']);
                  setActiveApp('explorer');
                  setStartMenuOpen(false);
                }}
                className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Folder className="w-7 h-7 text-yellow-500 fill-yellow-400" />
                <span className="text-[9px] font-bold text-gray-700 mt-1 truncate max-w-full">Eksplorator</span>
              </button>
              
              <button 
                onClick={() => {
                  if (!openApps.includes('cmd')) setOpenApps(prev => [...prev, 'cmd']);
                  setActiveApp('cmd');
                  setStartMenuOpen(false);
                }}
                className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-[9px] font-mono font-bold border border-gray-600">
                  &gt;_
                </div>
                <span className="text-[9px] font-bold text-gray-700 mt-1 truncate max-w-full">Konsola CMD</span>
              </button>

              <button 
                onClick={() => {
                  setActiveNotepadFileId(null);
                  if (!openApps.includes('notepad')) setOpenApps(prev => [...prev, 'notepad']);
                  setActiveApp('notepad');
                  setStartMenuOpen(false);
                }}
                className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <FileText className="w-7 h-7 text-blue-500" />
                <span className="text-[9px] font-bold text-gray-700 mt-1 truncate max-w-full">Notatnik</span>
              </button>
            </div>

            <div className="bg-[#5E81AC]/10 border border-[#5E81AC]/20 p-3 rounded-xl mb-4 text-xs">
              <p className="font-bold text-[#5E81AC] text-[11px] mb-1">💡 Podpowiedź Plikusia:</p>
              <p className="text-[10px] text-[#4C566A] leading-normal italic">
                "Notatnik to aplikacja do edycji plików tekstowych z rozszerzeniem .txt. Możesz pisać tam swoje notatki ze szkoły!"
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5 font-bold text-gray-700">
                <span className="bg-[#5e81ac] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">U</span>
                <span>Uczen_SP</span>
              </div>
              <button 
                onClick={() => {
                  if (confirm('Czy zresetować widok symulatora pulpitu?')) {
                    setOpenApps(['explorer']);
                    setActiveApp('explorer');
                    setStartMenuOpen(false);
                  }
                }}
                className="hover:bg-red-50 hover:text-red-600 px-2.5 py-1 rounded-lg transition-all border border-transparent hover:border-red-100 font-bold"
              >
                Uruchom ponownie 🔄
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Create Folder */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-scaleUp">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-amber-500" />
              Stwórz Nowy Folder
            </h3>
            <p className="text-xs text-gray-500 mb-4">Wpisz nazwę dla nowego katalogu w systemie Windows 11:</p>
            
            <input 
              type="text"
              value={newItemName}
              onChange={(e) => { setNewItemName(e.target.value); setErrorMsg(''); }}
              placeholder="np. Prace_Domowe"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
              id="input-new-folder-name"
            />
            
            {errorMsg && (
              <p className="text-red-500 text-xs font-semibold mb-3 flex items-center gap-1" id="error-create-folder">
                <span>⚠️</span> {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-2 text-sm mt-4">
              <button 
                onClick={() => setIsNewFolderOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button 
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md font-semibold"
                id="btn-confirm-create-folder"
              >
                Stwórz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create File */}
      {isNewFileOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-scaleUp">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-blue-500" />
              Stwórz Nowy Plik
            </h3>
            <p className="text-xs text-gray-500 mb-4">Wpisz nazwę wraz z rozszerzeniem (np. <span className="font-mono text-red-600">.txt</span> dla Notatnika):</p>
            
            <input 
              type="text"
              value={newItemName}
              onChange={(e) => { setNewItemName(e.target.value); setErrorMsg(''); }}
              placeholder="np. referat.txt"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
              autoFocus
              id="input-new-file-name"
            />
            
            {errorMsg && (
              <p className="text-red-500 text-xs font-semibold mb-3 flex items-center gap-1" id="error-create-file">
                <span>⚠️</span> {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-2 text-sm mt-4">
              <button 
                onClick={() => setIsNewFileOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button 
                onClick={handleCreateFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md font-semibold"
                id="btn-confirm-create-file"
              >
                Stwórz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Rename */}
      {isRenameOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-scaleUp">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-500" />
              Zmień Nazwę
            </h3>
            <p className="text-xs text-gray-500 mb-4">Podaj nową nazwę dla zaznaczonego elementu:</p>
            
            <input 
              type="text"
              value={newItemName}
              onChange={(e) => { setNewItemName(e.target.value); setErrorMsg(''); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              autoFocus
              id="input-rename-name"
            />
            
            {errorMsg && (
              <p className="text-red-500 text-xs font-semibold mb-3 flex items-center gap-1" id="error-rename">
                <span>⚠️</span> {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-2 text-sm mt-4">
              <button 
                onClick={() => setIsRenameOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button 
                onClick={handleRename}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md font-semibold"
                id="btn-confirm-rename"
              >
                Zmień nazwę
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILE PREVIEW DIALOG MODAL (Images, exe programs, etc.) */}
      {previewNode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-scaleUp">
            <div className="bg-gray-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSmallFileIcon(previewNode)}
                <span className="font-semibold text-sm font-sans tracking-tight">{previewNode.name}</span>
              </div>
              <button 
                onClick={() => setPreviewNode(null)}
                className="text-gray-400 hover:text-white font-bold text-sm bg-white/10 w-6 h-6 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 flex-1 min-h-[250px] max-h-[400px] overflow-y-auto bg-gray-50 text-sm text-gray-700">
              {previewNode.name.toLowerCase().endsWith('.png') || previewNode.name.toLowerCase().endsWith('.jpg') || previewNode.name.toLowerCase().endsWith('.jpeg') ? (
                <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                  <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-2xl mb-4 text-indigo-500 shadow-inner">
                    <Image className="w-16 h-16 animate-pulse" />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">Podgląd obrazu:</p>
                  <p className="text-xs text-gray-500 mt-1 italic font-mono bg-white px-2.5 py-1 rounded-md border border-gray-200">{previewNode.content}</p>
                </div>
              ) : previewNode.name.toLowerCase().endsWith('.exe') ? (
                <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                  <div className="bg-red-50 border border-red-100 p-6 rounded-full text-red-500 mb-4 animate-bounce">
                    <Play className="w-8 h-8 fill-red-500" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-base">Uruchamianie programu .exe</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">W systemie Windows pliki z rozszerzeniem .exe to programy. Twoja symulacja właśnie uruchomiła instalator:</p>
                  <div className="mt-4 bg-gray-900 text-emerald-400 font-mono text-xs p-3 rounded-lg text-left w-full shadow-md">
                    <p>[SYSTEM]: Odpalanie Minecraft_Installer.exe...</p>
                    <p>[STATUS]: Kopiowanie bibliotek Java...</p>
                    <p>[STATUS]: Pobieranie najnowszych bloków...</p>
                    <p>[SUKCES]: Gotowe do gry!</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                  <File className="w-16 h-16 text-gray-300 mb-2" />
                  <p className="font-semibold text-gray-800 text-sm">Nieznany format pliku</p>
                  <p className="text-xs text-gray-400 mt-1">Komputer nie wie, jakiego programu użyć do otwarcia tego pliku, ponieważ nie rozpoznał rozszerzenia.</p>
                  {previewNode.content && (
                    <div className="mt-4 bg-gray-100 p-3 rounded-lg w-full text-left font-mono text-xs text-gray-500 overflow-x-auto">
                      {previewNode.content}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-gray-100 border-t border-gray-200 p-4 flex justify-between items-center text-xs text-gray-500">
              <div>
                <span>Utworzono: {previewNode.createdAt}</span>
                <span className="mx-2">|</span>
                <span>Rozmiar: {previewNode.size}</span>
              </div>
              <button 
                onClick={() => setPreviewNode(null)}
                className="px-4 py-1.5 bg-gray-800 hover:bg-gray-950 text-white font-medium rounded-lg text-xs"
              >
                Zamknij podgląd
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
