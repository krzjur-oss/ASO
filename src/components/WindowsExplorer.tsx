/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  Image, 
  Cpu, 
  FileCode,
  ArrowUp, 
  Search, 
  Trash,
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
  Clipboard,
  Network,
  RotateCcw,
  Info
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
import { Tooltip } from './Tooltip';

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

  // Dynamic ticking clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // File Tree Panel visibility state
  const [showFileTree, setShowFileTree] = useState(true);

  // Context Menu and Properties modal States
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, nodeId: string } | null>(null);
  const [propertiesNodeId, setPropertiesNodeId] = useState<string | null>(null);

  // Drag and Drop States
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);

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

      case 'm16_win_search':
        if (!searchQuery.toLowerCase().includes('projekt')) {
          targetId = 'explorer-search-input';
          message = 'Wpisz „projekt” w wyszukiwarce u góry po prawej stronie.';
        } else {
          const foundNode = Object.values(vfs).find(node => node.name === 'projekt_semestralny.docx');
          if (foundNode && selectedNodeId !== foundNode.id) {
            targetId = `explorer-item-${foundNode.id}`;
            message = 'Kliknij lewym przyciskiem na plik „projekt_semestralny.docx”, aby go zaznaczyć.';
          }
        }
        break;

      default:
        targetId = 'btn-windows-hint';
        message = 'To zadanie wykonaj w terminalu Linux';
        break;
    }

    setHintTarget(targetId ? { id: targetId, message } : null);
  }, [showHint, activeMissionId, currentPathId, selectedNodeId, vfs, clipboardNodeId, searchQuery]);

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

  // Helper to calculate total elements and size within a directory
  const getFolderContentsInfo = (dirId: string) => {
    let fileCount = 0;
    let folderCount = 0;
    let totalBytes = 0;

    const traverse = (id: string) => {
      Object.values(vfs).forEach(node => {
        if (node.parentId === id) {
          if (node.type === 'directory') {
            folderCount++;
            traverse(node.id);
          } else {
            fileCount++;
            if (node.size) {
              const match = node.size.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
              if (match) {
                const val = parseFloat(match[1]);
                const unit = match[2].toUpperCase();
                let multiplier = 1;
                if (unit === 'KB') multiplier = 1024;
                else if (unit === 'MB') multiplier = 1024 * 1024;
                else if (unit === 'GB') multiplier = 1024 * 1024 * 1024;
                totalBytes += val * multiplier;
              }
            }
          }
        }
      });
    };

    traverse(dirId);
    return { fileCount, folderCount, totalBytes };
  };

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
    if (node.parentId === 'kosz') {
      return;
    }
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
    if (currentPathId === 'kosz') {
      setCurrentPathId('root');
      setSelectedNodeId(null);
      return;
    }
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
    if (currentPathId === 'kosz') {
      // Permanent deletion
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
      onAddXP(5);
    } else {
      // Move to Recycle Bin (Kosz)
      setVfs(prev => {
        const copy = { ...prev };
        if (copy[nodeId]) {
          copy[nodeId] = {
            ...copy[nodeId],
            originalParentId: copy[nodeId].parentId,
            parentId: 'kosz'
          };
        }
        return copy;
      });
      setSelectedNodeId(null);
      onAddXP(10);
    }
    
    setTimeout(() => {
      onActionTriggered();
    }, 50);
  };

  // Move Node (used for drag and drop)
  const handleMoveNode = (nodeId: string, targetParentId: string) => {
    if (!nodeId || !targetParentId) return;
    if (nodeId === targetParentId) return;

    const nodeToMove = vfs[nodeId];
    if (!nodeToMove) return;

    if (nodeToMove.parentId === targetParentId) return;

    // If moving to Kosz, delete it
    if (targetParentId === 'kosz') {
      handleDeleteNode(nodeId);
      return;
    }

    // Prevent moving a directory inside itself or its children
    if (nodeToMove.type === 'directory') {
      let tempParentId: string | null = targetParentId;
      while (tempParentId) {
        if (tempParentId === nodeToMove.id) {
          alert('Błąd: Nie można przenieść folderu do samego siebie ani do jego podfolderów!');
          return;
        }
        const parentNode = vfs[tempParentId];
        tempParentId = parentNode ? parentNode.parentId : null;
      }
    }

    setVfs(prev => ({
      ...prev,
      [nodeId]: {
        ...prev[nodeId],
        parentId: targetParentId
      }
    }));

    setSelectedNodeId(null);
    onAddXP(15);
    
    setTimeout(() => {
      onActionTriggered();
    }, 50);
  };

  // Restore Node from Recycle Bin (Kosz)
  const handleRestoreNode = (nodeId: string) => {
    setVfs(prev => {
      const copy = { ...prev };
      const node = copy[nodeId];
      if (node) {
        const targetParentId = node.originalParentId && copy[node.originalParentId]
          ? node.originalParentId
          : 'root';
        copy[nodeId] = {
          ...node,
          parentId: targetParentId,
          originalParentId: undefined
        };
      }
      return copy;
    });
    setSelectedNodeId(null);
    onAddXP(15);
    setTimeout(() => {
      onActionTriggered();
    }, 50);
  };

  // Empty Recycle Bin (Kosz)
  const handleEmptyTrash = () => {
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
      
      Object.keys(copy).forEach(id => {
        if (copy[id]?.parentId === 'kosz') {
          removeNodeAndChildren(id);
        }
      });
      
      return copy;
    });
    setSelectedNodeId(null);
    onAddXP(20);
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

  // Helper to check if a node or any ancestor is in the Recycle Bin (Kosz)
  const isNodeInTrash = (nodeId: string): boolean => {
    let current = vfs[nodeId];
    while (current) {
      if (current.parentId === 'kosz') return true;
      if (current.parentId) {
        current = vfs[current.parentId];
      } else {
        break;
      }
    }
    return false;
  };

  // Fetch active directory items or search results
  const rawChildren = searchQuery.trim() !== ''
    ? Object.values(vfs).filter(node => {
        const matchesSearch = node.parentId !== null && node.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        
        const inTrash = isNodeInTrash(node.id);
        if (currentPathId === 'kosz') {
          return inTrash;
        } else {
          return !inTrash;
        }
      })
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

  const deletedFilesCount = Object.values(vfs).filter(node => node.parentId === 'kosz').length;
  const isTrashEmpty = deletedFilesCount === 0;

  const pathNodes = currentPathId === 'kosz' 
    ? [{ id: 'kosz', name: 'Kosz', type: 'directory' as const, parentId: null, createdAt: '' }]
    : getPathNodes(vfs, currentPathId);

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
                <Tooltip content="W górę (Cofnij do folderu wyżej)">
                  <button 
                    onClick={handleGoUp}
                    disabled={currentPathId === 'root'}
                    className="p-1.5 hover:bg-white/60 rounded-xl text-[#2E3440] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title="W górę (Cofnij)"
                    id="explorer-back-btn"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </Tooltip>
                
                {/* Breadcrumbs Address Bar */}
                <div className="flex items-center gap-1 bg-white border border-[#D8DEE9] px-3 py-1.5 rounded-xl flex-grow min-w-0 text-xs text-[#2E3440] font-sans overflow-x-auto whitespace-nowrap shadow-2xs" id="explorer-address-bar">
                  <HardDrive className="w-3.5 h-3.5 text-[#5E81AC] flex-shrink-0" />
                  {currentPathId === 'kosz' ? (
                    <>
                      <span className="text-gray-400 font-bold px-1 font-mono">\</span>
                      <span className="text-gray-800 font-bold">Kosz</span>
                    </>
                  ) : (
                    <>
                      {pathNodes.map((pNode, index) => {
                        const displayName = pNode.name === 'root' ? 'C:' : pNode.name;
                        return (
                          <React.Fragment key={pNode.id}>
                            {index > 0 && <span className="text-gray-400 font-bold font-mono px-0.5">\</span>}
                            <button 
                              onClick={() => handleFolderClick(pNode)}
                              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverNodeId(`breadcrumb-${pNode.id}`); }}
                              onDragLeave={() => setDragOverNodeId(null)}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDragOverNodeId(null);
                                const droppedId = e.dataTransfer.getData('text/plain');
                                if (droppedId) {
                                  handleMoveNode(droppedId, pNode.id);
                                }
                              }}
                              className={`hover:text-[#5E81AC] hover:underline font-bold focus:outline-none transition-all px-1 py-0.5 rounded ${
                                dragOverNodeId === `breadcrumb-${pNode.id}` 
                                  ? 'bg-blue-100 text-[#5E81AC] scale-105 border border-dashed border-blue-400 font-extrabold animate-pulse' 
                                  : ''
                              }`}
                              title={`Przejdź do: ${displayName}`}
                            >
                              {displayName}
                            </button>
                          </React.Fragment>
                        );
                      })}
                      {pathNodes.length === 1 && <span className="text-gray-400 font-bold font-mono px-0.5">\</span>}
                    </>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-[#4C566A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Szukaj..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    onActionTriggered(`search:${val.toLowerCase()}`);
                  }}
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
                <Tooltip content="Stwórz nowy folder (nowe puste pudełko)">
                  <button 
                    onClick={() => { setIsNewFolderOpen(true); setErrorMsg(''); setNewItemName(''); }}
                    disabled={currentPathId === 'kosz'}
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white border border-transparent hover:border-[#D8DEE9] hover:text-[#5E81AC] rounded-lg transition-all shadow-2xs cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent disabled:hover:text-[#4C566A]"
                    id="btn-create-folder"
                  >
                    <FolderPlus className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold">Nowy Folder</span>
                  </button>
                </Tooltip>
                
                <Tooltip content="Stwórz nowy plik tekstowy (nowy dokument)">
                  <button 
                    onClick={() => { setIsNewFileOpen(true); setErrorMsg(''); setNewItemName(''); }}
                    disabled={currentPathId === 'kosz'}
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white border border-transparent hover:border-[#D8DEE9] hover:text-[#5E81AC] rounded-lg transition-all shadow-2xs cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent disabled:hover:text-[#4C566A]"
                    id="btn-create-file"
                  >
                    <FilePlus className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold">Nowy Plik</span>
                  </button>
                </Tooltip>

                {/* Sort Option Dropdown */}
                <div className="relative">
                  <Tooltip content="Sortuj (Zmień kolejność wyświetlania plików)">
                    <button 
                      onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                      className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white border border-transparent hover:border-[#D8DEE9] hover:text-[#5E81AC] rounded-lg transition-all shadow-2xs cursor-pointer"
                      id="btn-sort-files"
                    >
                      <ArrowUpDown className="w-4 h-4 text-indigo-500" />
                      <span className="font-semibold">Sortuj ({sortBy === 'name' ? 'Nazwa' : sortBy === 'size' ? 'Rozmiar' : 'Data'})</span>
                    </button>
                  </Tooltip>
                  
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

                <Tooltip content="Drzewo plików (Pokaż lub ukryj boczny panel folderów)">
                  <button 
                    onClick={() => setShowFileTree(!showFileTree)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg transition-all shadow-2xs cursor-pointer ${
                      showFileTree 
                        ? 'bg-[#5E81AC]/10 border-[#5E81AC]/30 text-[#5E81AC] font-bold' 
                        : 'hover:bg-white border-transparent hover:border-[#D8DEE9] hover:text-[#5E81AC]'
                    }`}
                    title="Pokaż / ukryj boczny panel z drzewem plików"
                    id="btn-toggle-tree"
                  >
                    <Network className="w-4 h-4 text-[#5E81AC]" />
                    <span className="font-semibold">Drzewo plików</span>
                  </button>
                </Tooltip>

                <div className="h-4 w-px bg-[#D8DEE9] mx-1"></div>

                <Tooltip content="Zmień nazwę zaznaczonego pliku lub folderu">
                  <button 
                    disabled={!selectedNodeId || currentPathId === 'kosz'}
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
                </Tooltip>

                <Tooltip content="Wytnij zaznaczony plik (przygotuj do przeniesienia)">
                  <button 
                    disabled={!selectedNodeId || currentPathId === 'kosz'}
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
                </Tooltip>

                <Tooltip content="Wklej wcześniej wycięty plik do obecnego folderu">
                  <button 
                    disabled={!clipboardNodeId || currentPathId === 'kosz'}
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
                </Tooltip>

                <Tooltip content={currentPathId === 'kosz' ? "Usuń trwale (Bezpowrotnie wyrzuć)" : "Usuń plik (Przenieś do Kosza)"}>
                  <button 
                    disabled={!selectedNodeId}
                    onClick={() => selectedNodeId && handleDeleteNode(selectedNodeId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50/50 border border-transparent hover:border-red-200 hover:text-red-600 rounded-lg transition-all shadow-2xs disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent disabled:hover:text-[#4C566A] cursor-pointer"
                    title={currentPathId === 'kosz' ? "Trwale usuń zaznaczony element" : "Usuń zaznaczony element (przenieś do Kosza)"}
                    id="btn-delete-file"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span className="hidden sm:inline font-semibold">
                      {currentPathId === 'kosz' ? "Usuń trwale" : "Usuń"}
                    </span>
                  </button>
                </Tooltip>

                {currentPathId === 'kosz' && (
                  <>
                    <div className="h-4 w-px bg-[#D8DEE9] mx-1"></div>
                    
                    <Tooltip content="Przywróć dane (Wyjmij plik z Kosza do starego folderu)">
                      <button 
                        disabled={!selectedNodeId}
                        onClick={() => selectedNodeId && handleRestoreNode(selectedNodeId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-blue-50/50 border border-transparent hover:border-blue-200 hover:text-blue-600 rounded-lg transition-all shadow-2xs disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent disabled:hover:text-[#4C566A] cursor-pointer"
                        title="Przywróć zaznaczony element do oryginalnej lokalizacji"
                        id="btn-restore-file"
                      >
                        <RotateCcw className="w-4 h-4 text-blue-500" />
                        <span className="hidden sm:inline font-semibold">Przywróć dane</span>
                      </button>
                    </Tooltip>

                    <Tooltip content="Opróżnij Kosz (Wyrzuć wszystkie pliki z Kosza na zawsze)">
                      <button 
                        disabled={currentChildren.length === 0}
                        onClick={handleEmptyTrash}
                        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-amber-50/50 border border-transparent hover:border-amber-200 hover:text-amber-700 rounded-lg transition-all shadow-2xs disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent disabled:hover:text-[#4C566A] cursor-pointer"
                        title="Opróżnij cały Kosz"
                        id="btn-empty-trash"
                      >
                        <Trash2 className="w-4 h-4 text-amber-600" />
                        <span className="hidden sm:inline font-semibold">Opróżnij Kosz</span>
                      </button>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>

            {/* 3. Main Workspace splits */}
            <div className="flex-1 flex min-h-0">
              {/* Sidebar directory tree navigation (Windows Explorer style) */}
              <div className={`w-60 border-r border-[#ECEFF4] p-3 overflow-y-auto space-y-4 bg-[#F8FAFC]/50 select-none flex-shrink-0 transition-all duration-300 ${showFileTree ? 'block' : 'hidden'}`}>
                <div>
                  <span className="px-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Szybki dostęp</span>
                  <div className="mt-1 space-y-0.5">
                    <button 
                      onClick={() => handleFolderClick({ id: 'pulpit', name: 'Pulpit', type: 'directory', parentId: 'root', createdAt: '' })}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverNodeId('pulpit'); }}
                      onDragLeave={() => setDragOverNodeId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverNodeId(null);
                        const droppedId = e.dataTransfer.getData('text/plain');
                        if (droppedId) {
                          handleMoveNode(droppedId, 'pulpit');
                        }
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-all border border-transparent ${
                        currentPathId === 'pulpit' 
                          ? 'bg-white text-[#5E81AC] font-bold border-[#D8DEE9] shadow-2xs' 
                          : 'hover:bg-[#ECEFF4]/60'
                      } ${
                        dragOverNodeId === 'pulpit'
                          ? 'bg-blue-100/50 border-dashed border-blue-400 scale-102 font-bold shadow-xs animate-pulse text-[#5E81AC]'
                          : ''
                      }`}
                      id="sidebar-link-pulpit"
                    >
                      <Monitor className="w-3.5 h-3.5 text-[#5E81AC]" />
                      <span>Pulpit</span>
                    </button>
                    <button 
                      onClick={() => handleFolderClick({ id: 'dokumenty', name: 'Dokumenty', type: 'directory', parentId: 'root', createdAt: '' })}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverNodeId('dokumenty'); }}
                      onDragLeave={() => setDragOverNodeId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverNodeId(null);
                        const droppedId = e.dataTransfer.getData('text/plain');
                        if (droppedId) {
                          handleMoveNode(droppedId, 'dokumenty');
                        }
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-all border border-transparent ${
                        currentPathId === 'dokumenty' 
                          ? 'bg-white text-[#5E81AC] font-bold border-[#D8DEE9] shadow-2xs' 
                          : 'hover:bg-[#ECEFF4]/60'
                      } ${
                        dragOverNodeId === 'dokumenty'
                          ? 'bg-blue-100/50 border-dashed border-blue-400 scale-102 font-bold shadow-xs animate-pulse text-[#5E81AC]'
                          : ''
                      }`}
                      id="sidebar-link-dokumenty"
                    >
                      <Folder className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400" />
                      <span>Dokumenty</span>
                    </button>
                    <button 
                      onClick={() => handleFolderClick({ id: 'pobrane', name: 'Pobrane', type: 'directory', parentId: 'root', createdAt: '' })}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverNodeId('pobrane'); }}
                      onDragLeave={() => setDragOverNodeId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverNodeId(null);
                        const droppedId = e.dataTransfer.getData('text/plain');
                        if (droppedId) {
                          handleMoveNode(droppedId, 'pobrane');
                        }
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-all border border-transparent ${
                        currentPathId === 'pobrane' 
                          ? 'bg-white text-[#5E81AC] font-bold border-[#D8DEE9] shadow-2xs' 
                          : 'hover:bg-[#ECEFF4]/60'
                      } ${
                        dragOverNodeId === 'pobrane'
                          ? 'bg-blue-100/50 border-dashed border-blue-400 scale-102 font-bold shadow-xs animate-pulse text-[#5E81AC]'
                          : ''
                      }`}
                      id="sidebar-link-pobrane"
                    >
                      <Download className="w-3.5 h-3.5 text-green-500" />
                      <span>Pobrane</span>
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentPathId('kosz');
                        setSelectedNodeId(null);
                        setSearchQuery('');
                      }}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverNodeId('kosz'); }}
                      onDragLeave={() => setDragOverNodeId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverNodeId(null);
                        const droppedId = e.dataTransfer.getData('text/plain');
                        if (droppedId) {
                          handleMoveNode(droppedId, 'kosz');
                        }
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-all border border-transparent ${
                        currentPathId === 'kosz' 
                          ? 'bg-white text-[#5E81AC] font-bold border-[#D8DEE9] shadow-2xs' 
                          : 'hover:bg-[#ECEFF4]/60'
                      } ${
                        dragOverNodeId === 'kosz'
                          ? 'bg-red-50 border-dashed border-red-400 scale-102 font-bold shadow-xs animate-pulse text-red-600'
                          : ''
                      }`}
                      id="sidebar-link-kosz"
                    >
                      {isTrashEmpty ? (
                        <Trash className="w-3.5 h-3.5 text-[#4C566A]" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-red-500 fill-red-100 animate-pulse" />
                      )}
                      <span>Kosz</span>
                      {!isTrashEmpty && (
                        <span className="ml-auto bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {deletedFilesCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="px-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ten komputer</span>
                  <div className="mt-1 space-y-0.5">
                    <button 
                      onClick={() => handleFolderClick({ id: 'root', name: 'C:', type: 'directory', parentId: null, createdAt: '' })}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverNodeId('root'); }}
                      onDragLeave={() => setDragOverNodeId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverNodeId(null);
                        const droppedId = e.dataTransfer.getData('text/plain');
                        if (droppedId) {
                          handleMoveNode(droppedId, 'root');
                        }
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center gap-2 transition-all border border-transparent ${
                        currentPathId === 'root' 
                          ? 'bg-white text-[#5E81AC] font-bold border-[#D8DEE9] shadow-2xs' 
                          : 'hover:bg-[#ECEFF4]/60'
                      } ${
                        dragOverNodeId === 'root'
                          ? 'bg-blue-100/50 border-dashed border-blue-400 scale-102 font-bold shadow-xs animate-pulse text-[#5E81AC]'
                          : ''
                      }`}
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
                    onDropNode={handleMoveNode}
                  />
                </div>
              </div>

              {/* Main Folder Grid Area */}
              <div className="flex-1 bg-white p-4 overflow-y-auto select-none" onClick={() => setSelectedNodeId(null)}>
                {currentPathId === 'kosz' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center gap-2.5 text-xs text-amber-800 font-medium animate-fadeIn shadow-2xs">
                    <Trash2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Pliki w Koszu są zablokowane. Zaznacz plik lub folder i kliknij <b>„Przywróć dane”</b> u góry, aby go otworzyć, edytować lub przenieść.</span>
                  </div>
                )}

                {currentChildren.length === 0 ? (
                  currentPathId === 'kosz' ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8">
                      <Trash2 className="w-16 h-16 stroke-1 text-gray-300 mb-2" />
                      <p className="font-medium text-sm">Kosz jest pusty.</p>
                      <p className="text-xs text-gray-400 mt-1">Usunięte pliki i foldery trafią tutaj, skąd będziesz mógł je przywrócić.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8">
                      <Folder className="w-16 h-16 stroke-1 text-gray-300 mb-2" />
                      <p className="font-medium text-sm">Ten folder jest pusty.</p>
                      <p className="text-xs text-gray-300 mt-1">Użyj paska u góry, aby dodać nowe foldery lub pliki!</p>
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {currentChildren.map(node => {
                      const isSelected = selectedNodeId === node.id;
                      const isFolder = node.type === 'directory';
                      
                      return (
                        <div
                          key={node.id}
                          draggable={currentPathId !== 'kosz'}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', node.id);
                            setDraggedNodeId(node.id);
                          }}
                          onDragEnd={() => {
                            setDraggedNodeId(null);
                            setDragOverNodeId(null);
                          }}
                          onDragOver={isFolder && draggedNodeId && draggedNodeId !== node.id ? (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          } : undefined}
                          onDragEnter={isFolder && draggedNodeId && draggedNodeId !== node.id ? (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragOverNodeId(node.id);
                          } : undefined}
                          onDragLeave={isFolder && draggedNodeId && draggedNodeId !== node.id ? (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (dragOverNodeId === node.id) {
                              setDragOverNodeId(null);
                            }
                          } : undefined}
                          onDrop={isFolder && draggedNodeId && draggedNodeId !== node.id ? (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragOverNodeId(null);
                            const droppedId = e.dataTransfer.getData('text/plain');
                            if (droppedId) {
                              handleMoveNode(droppedId, node.id);
                            }
                          } : undefined}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNodeId(node.id);
                            onActionTriggered(`select:${node.id}`);
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
                          className={`p-3 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                            dragOverNodeId === node.id && isFolder
                              ? 'border-dashed border-blue-500 bg-blue-100/50 scale-105 shadow-md font-bold'
                              : isSelected 
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
                  <span className="text-blue-600 font-medium hidden md:inline">
                    Zaznaczono: {vfs[selectedNodeId]?.name} ({vfs[selectedNodeId]?.type === 'directory' ? 'Katalog' : 'Plik'})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleHint}
                  id="btn-windows-hint"
                  className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] transition-all cursor-pointer font-bold ${
                    showHint 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-600' 
                      : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-600'
                  }`}
                >
                  <span>💡 Podpowiedź</span>
                </button>
                <div className="text-right hidden sm:block">
                  Kliknij dwukrotnie, aby otworzyć
                </div>
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
        {/* Left branding widget & Open Windows list */}
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-[#5e81ac] font-bold font-sans hidden sm:block">
            <span>Akademia Windows 11</span>
          </div>
          {openApps.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 border-l border-gray-300 pl-3">
              <span className="text-[9px] text-gray-400 uppercase tracking-wider font-extrabold mr-1">Otwarte okna:</span>
              {openApps.map(app => {
                const isActive = activeApp === app;
                const appName = app === 'explorer' ? 'Eksplorator plików' : app === 'cmd' ? 'Wiersz poleceń' : 'Notatnik';
                const appIcon = app === 'explorer' ? '📁' : app === 'cmd' ? '💻' : '📝';
                return (
                  <button
                    key={app}
                    onClick={() => {
                      if (isActive) {
                        setActiveApp(null); // minimize
                      } else {
                        if (!openApps.includes(app)) {
                          setOpenApps(prev => [...prev, app]);
                        }
                        setActiveApp(app as any);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-2xs' 
                        : 'bg-gray-100/50 text-gray-500 border-gray-200/50 hover:bg-gray-100'
                    }`}
                  >
                    <span>{appIcon}</span>
                    <span>{appName}</span>
                    {isActive && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>}
                  </button>
                );
              })}
            </div>
          )}
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
            <span>{currentTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <span className="text-[8px] text-gray-400 mt-0.5">{currentTime.toLocaleDateString('pl-PL')}</span>
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
      {showHint && hintPosition && hintTarget && (
        <>
          {/* Highlight ring around target element */}
          <div 
            className="absolute z-40 border-2 border-amber-500 rounded-lg pointer-events-none animate-pulse"
            style={{
              top: hintPosition.top - 2,
              left: hintPosition.left - 2,
              width: hintPosition.width + 4,
              height: hintPosition.height + 4,
              boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.2)',
            }}
          />
          {/* Pulsing floating arrow with description */}
          <div 
            className="absolute z-50 pointer-events-none transition-all duration-300"
            style={{
              top: hintPosition.top - 45,
              left: hintPosition.left + hintPosition.width / 2 - 20,
            }}
          >
            <div className="flex flex-col items-center animate-bounce">
              <div className="bg-amber-500 text-white font-extrabold text-[10px] px-2 py-1 rounded-md shadow-md whitespace-nowrap mb-1 border border-amber-600 animate-pulse">
                {hintTarget.message}
              </div>
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-amber-500 filter drop-shadow-sm"></div>
            </div>
          </div>
        </>
      )}

      {/* Context Menu Backdrop & Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-45 bg-transparent" 
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div 
            className="fixed z-50 bg-white border border-[#D8DEE9] rounded-lg shadow-lg py-1.5 min-w-[170px] text-xs text-gray-700 animate-fadeIn"
            style={{ 
              top: Math.min(contextMenu.y, window.innerHeight - 160), 
              left: Math.min(contextMenu.x, window.innerWidth - 180) 
            }}
            id="explorer-context-menu"
          >
            {currentPathId === 'kosz' ? (
              <button 
                onClick={() => {
                  handleRestoreNode(contextMenu.nodeId);
                  setContextMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#F3F4F6] hover:text-[#5E81AC] flex items-center gap-2 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                <span>Przywróć dane</span>
              </button>
            ) : (
              <>
                <button 
                  onClick={() => {
                    const node = vfs[contextMenu.nodeId];
                    if (node) handleFolderClick(node);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#F3F4F6] hover:text-[#5E81AC] flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Otwórz</span>
                </button>
                <button 
                  onClick={() => {
                    setClipboardNodeId(contextMenu.nodeId);
                    setClipboardAction('cut');
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#F3F4F6] hover:text-[#5E81AC] flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Scissors className="w-3.5 h-3.5 text-amber-500" />
                  <span>Wytnij</span>
                </button>
              </>
            )}
            <button 
              onClick={() => {
                handleDeleteNode(contextMenu.nodeId);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              <span>{currentPathId === 'kosz' ? 'Usuń trwale' : 'Usuń'}</span>
            </button>
            <div className="h-px bg-gray-100 my-1"></div>
            <button 
              onClick={() => {
                setPropertiesNodeId(contextMenu.nodeId);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-[#F3F4F6] hover:text-[#5E81AC] flex items-center gap-2 cursor-pointer font-medium"
              id="context-menu-properties"
            >
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>Właściwości</span>
            </button>
          </div>
        </>
      )}

      {/* Properties Modal */}
      {propertiesNodeId && vfs[propertiesNodeId] && (() => {
        const node = vfs[propertiesNodeId];
        
        let fileTypeStr = 'Plik';
        if (node.type === 'directory') {
          fileTypeStr = 'Folder plików (Katalog)';
        } else if (node.name.toLowerCase().endsWith('.txt')) {
          fileTypeStr = 'Dokument tekstowy (.txt)';
        } else if (node.name.toLowerCase().endsWith('.exe')) {
          fileTypeStr = 'Aplikacja (.exe)';
        } else if (node.name.toLowerCase().endsWith('.tmp')) {
          fileTypeStr = 'Plik tymczasowy (.tmp)';
        } else if (node.name.toLowerCase().endsWith('.sh')) {
          fileTypeStr = 'Skrypt powłoki (.sh)';
        } else if (node.name.toLowerCase().endsWith('.png') || node.name.toLowerCase().endsWith('.jpg') || node.name.toLowerCase().endsWith('.gif')) {
          fileTypeStr = 'Obraz cyfrowy';
        }

        let locationStr = '';
        try {
          locationStr = node.parentId && vfs[node.parentId] ? getWindowsPathString(vfs, node.parentId) : 'C:\\';
        } catch (e) {
          locationStr = 'C:\\';
        }

        let sizeDetails = node.size || '0 B';
        let folderDetailsStr = '';
        if (node.type === 'directory') {
          const info = getFolderContentsInfo(node.id);
          const friendlyBytes = info.totalBytes >= 1024 * 1024 ? `${(info.totalBytes / (1024 * 1024)).toFixed(1)} MB` : info.totalBytes >= 1024 ? `${(info.totalBytes / 1024).toFixed(1)} KB` : `${info.totalBytes} B`;
          sizeDetails = friendlyBytes;
          folderDetailsStr = `Zawiera: ${info.fileCount} plików, ${info.folderCount} folderów`;
        }

        return (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn" onClick={() => setPropertiesNodeId(null)}>
            <div 
              className="bg-[#F8FAFC] border border-[#D8DEE9] rounded-xl shadow-2xl w-full max-w-[360px] text-gray-800 font-sans overflow-hidden animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
              id="properties-modal"
            >
              {/* Title bar */}
              <div className="bg-white border-b border-[#E5E9F0] px-4 py-3 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#5E81AC]" />
                  <span className="font-bold text-sm text-[#2E3440]">{node.name} - Właściwości</span>
                </div>
                <button 
                  onClick={() => setPropertiesNodeId(null)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                  id="properties-close-btn"
                >
                  ✕
                </button>
              </div>

              {/* Tab Header */}
              <div className="px-4 pt-3 flex border-b border-[#E5E9F0] bg-white gap-2 select-none">
                <button className="px-3 py-1.5 text-xs font-semibold text-[#5E81AC] border-b-2 border-[#5E81AC] bg-[#F8FAFC] rounded-t-lg">
                  Ogólne
                </button>
              </div>

              {/* Contents area */}
              <div className="p-5 space-y-4">
                {/* Header with icon and name */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-150">
                  <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-3xs flex-shrink-0">
                    {getFileIcon(node)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input 
                      type="text" 
                      value={node.name}
                      disabled
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-sm font-semibold text-gray-700 shadow-3xs"
                    />
                    <p className="text-[9px] text-gray-400 mt-1 font-mono">ID: {node.id}</p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-3 text-xs text-gray-600">
                  <div className="grid grid-cols-[90px_1fr] items-baseline">
                    <span className="text-gray-400 font-medium">Typ pliku:</span>
                    <span className="text-gray-900 font-semibold">{fileTypeStr}</span>
                  </div>

                  <div className="grid grid-cols-[90px_1fr] items-baseline">
                    <span className="text-gray-400 font-medium">Lokalizacja:</span>
                    <span className="text-gray-900 font-mono break-all bg-white px-1.5 py-0.5 rounded border border-gray-150 text-[10px]">{locationStr}</span>
                  </div>

                  <div className="h-px bg-gray-200 my-2"></div>

                  <div className="grid grid-cols-[90px_1fr] items-baseline">
                    <span className="text-gray-400 font-medium">Rozmiar:</span>
                    <span className="text-gray-900 font-semibold">{sizeDetails}</span>
                  </div>

                  {folderDetailsStr && (
                    <div className="grid grid-cols-[90px_1fr] items-baseline">
                      <span className="text-gray-400 font-medium">Zawartość:</span>
                      <span className="text-gray-900 font-semibold">{folderDetailsStr}</span>
                    </div>
                  )}

                  <div className="h-px bg-gray-200 my-2"></div>

                  <div className="grid grid-cols-[90px_1fr] items-baseline">
                    <span className="text-gray-400 font-medium">Utworzono:</span>
                    <span className="text-gray-900 font-medium">{node.createdAt || 'Brak danych'}</span>
                  </div>

                  <div className="grid grid-cols-[90px_1fr] items-baseline">
                    <span className="text-gray-400 font-medium">Atrybuty:</span>
                    <div className="flex items-center gap-3 mt-1 select-none">
                      <label className="flex items-center gap-1.5 text-gray-500 font-normal">
                        <input type="checkbox" checked disabled className="rounded border-gray-300 text-[#5E81AC] focus:ring-[#5E81AC] pointer-events-none" />
                        <span>Tylko do odczytu</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-gray-500 font-normal">
                        <input type="checkbox" checked={node.parentId === 'kosz'} disabled className="rounded border-gray-300 text-[#5E81AC] focus:ring-[#5E81AC] pointer-events-none" />
                        <span>Kosz</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="bg-white border-t border-[#E5E9F0] px-4 py-3 flex justify-end">
                <button 
                  onClick={() => setPropertiesNodeId(null)}
                  className="px-5 py-1.5 bg-[#5E81AC] hover:bg-[#4C566A] text-white text-xs font-bold rounded-lg transition-all shadow-3xs cursor-pointer"
                  id="properties-ok-btn"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
