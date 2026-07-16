/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  HelpCircle, 
  Folder, 
  FileText, 
  Eye, 
  RotateCcw,
  Sparkles,
  Award,
  BookOpen
} from 'lucide-react';
import { VFSNode, TerminalLine } from '../types';
import { 
  getChildren, 
  getLinuxPathString, 
  validateNodeName, 
  generateId, 
  getCurrentDateString,
  nodeExists,
  getPathNodes
} from '../utils/fileSystem';
import DirectoryTreeVisualizer from './DirectoryTreeVisualizer';
import LinuxFileBrowser from './LinuxFileBrowser';
import LinuxNotepad from './LinuxNotepad';

interface LinuxTerminalProps {
  vfs: Record<string, VFSNode>;
  setVfs: React.Dispatch<React.SetStateAction<Record<string, VFSNode>>>;
  currentPathId: string;
  setCurrentPathId: (id: string) => void;
  onAddXP: (points: number) => void;
  onActionTriggered: (command?: string) => void;
  isChallengeActive?: boolean;
  challengeTimeLeft?: number;
  activeMissionId?: string | null;
}

export default function LinuxTerminal({
  vfs,
  setVfs,
  currentPathId,
  setCurrentPathId,
  onAddXP,
  onActionTriggered,
  isChallengeActive,
  challengeTimeLeft,
  activeMissionId
}: LinuxTerminalProps) {
  
  // OS Simulator States for Linux
  const [activeApp, setActiveApp] = useState<'terminal' | 'browser' | 'gedit' | null>('terminal');
  const [openApps, setOpenApps] = useState<string[]>(['terminal']);
  const [activeGeditFileId, setActiveGeditFileId] = useState<string | null>(null);
  const [showApplicationsMenu, setShowApplicationsMenu] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Dynamic ticking clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [inputVal, setInputVal] = useState('');
  const [terminalLog, setTerminalLog] = useState<TerminalLine[]>([
    { text: 'Witaj w terminalu Linux Ubuntu (Wersja edukacyjna)!', type: 'success', timestamp: getCurrentDateString() },
    { text: 'Wpisz "help", aby zobaczyć listę dostępnych komend i rozpocząć naukę.', type: 'output', timestamp: getCurrentDateString() },
  ]);
  
  // Command History
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Right Panel Tab state ('content' shows flat directory, 'tree' shows recursive tree)
  const [rightPanelTab, setRightPanelTab] = useState<'content' | 'tree'>('tree');

  // References
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLog]);

  // Hints System for Linux
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
        id: 'btn-linux-hint',
        message: 'Najpierw wybierz misję z listy!'
      });
      return;
    }

    let targetId = 'terminal-command-input';
    let message = '';

    switch (activeMissionId) {
      case 'm4_linux_basics':
        message = 'Wpisz polecenie „pwd” i kliknij Enter';
        break;
      case 'm5_linux_mkdir':
        message = 'Wpisz polecenie „mkdir Projekty”';
        break;
      case 'm6_linux_ninja': {
        const projektyFolder = Object.values(vfs).find(node => node.name === 'Projekty' && node.type === 'directory');
        if (currentPathId === 'uczen') {
          if (projektyFolder) {
            message = 'Wpisz polecenie „cd Projekty”';
          } else {
            message = 'Wpisz polecenie „mkdir Projekty”';
          }
        } else if (projektyFolder && currentPathId === projektyFolder.id) {
          const graFile = Object.values(vfs).find(node => node.name === 'gra.py' && node.parentId === projektyFolder.id);
          if (!graFile) {
            message = 'Wpisz polecenie „touch gra.py”';
          } else {
            message = 'Wpisz polecenie „cd ..”';
          }
        } else {
          message = 'Przejdź do katalogu domowego wpisując „cd ~”';
        }
        break;
      }
      case 'm8_linux_cat':
        message = 'Wpisz polecenie „cat welcome.txt”';
        break;
      case 'm9_linux_rm':
        message = 'Wpisz polecenie „rm welcome.txt”';
        break;
      case 'm11_linux_chmod_basic':
        message = 'Wpisz polecenie „chmod 600 welcome.txt”';
        break;
      case 'm12_linux_chmod_exec':
        message = 'Wpisz polecenie „chmod +x gra.py” (lub 755)';
        break;
      case 'm15_linux_grep':
        if (currentPathId !== 'documents') {
          message = 'Przejdź do folderu Documents wpisując „cd Documents”';
        } else {
          message = 'Wpisz polecenie „grep haslo raport.txt”';
        }
        break;
      default:
        targetId = 'btn-linux-hint';
        message = 'To zadanie wykonaj w systemie Windows';
        break;
    }

    setHintTarget({ id: targetId, message });
  }, [showHint, activeMissionId, currentPathId, vfs]);

  useEffect(() => {
    if (!showHint || !hintTarget) {
      setHintPosition(null);
      return;
    }

    const updatePosition = () => {
      const parentEl = document.getElementById('linux-desktop-root');
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

  // Handle focusing input
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // Run a command
  const executeCommand = (fullCmd: string) => {
    const trimmed = fullCmd.trim();
    if (trimmed === '') return;

    // Add command to history
    const updatedHistory = [...cmdHistory, trimmed];
    setCmdHistory(updatedHistory);
    setHistoryIndex(-1);

    // Print command input
    const promptPath = getLinuxPathString(vfs, currentPathId).replace('/home/uczen', '~');
    const inputLine: TerminalLine = {
      text: `uczen@ubuntu:${promptPath}$ ${trimmed}`,
      type: 'input',
      timestamp: getCurrentDateString()
    };
    
    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputs: TerminalLine[] = [];

    switch (command) {
      case 'help':
        outputs = [
          { text: 'Dostępne komendy terminala:', type: 'success', timestamp: getCurrentDateString() },
          { text: '  pwd             - Pokazuje pełną ścieżkę obecnego folderu (Gdzie jestem?)', type: 'output', timestamp: getCurrentDateString() },
          { text: '  ls              - Pokazuje listę plików i folderów (użyj "ls -l" dla szczegółów)', type: 'output', timestamp: getCurrentDateString() },
          { text: '  cd [folder]     - Wejdź do podanego folderu (np. cd Documents)', type: 'output', timestamp: getCurrentDateString() },
          { text: '  cd ..           - Wyjdź o jeden poziom wyżej (do folderu-rodzica)', type: 'output', timestamp: getCurrentDateString() },
          { text: '  cd ~ / cd       - Wróć do folderu domowego (/home/uczen)', type: 'output', timestamp: getCurrentDateString() },
          { text: '  mkdir [nazwa]   - Tworzy nowy folder (np. mkdir Projekty)', type: 'output', timestamp: getCurrentDateString() },
          { text: '  touch [nazwa]   - Tworzy nowy pusty plik (np. touch notatka.txt)', type: 'output', timestamp: getCurrentDateString() },
          { text: '  rm [nazwa]      - Usuwa plik tekstowy (np. rm notatka.txt)', type: 'output', timestamp: getCurrentDateString() },
          { text: '  cat [nazwa]     - Wyświetla zawartość pliku na ekranie (np. cat welcome.txt)', type: 'output', timestamp: getCurrentDateString() },
          { text: '  grep [wzór] [f] - Wyszukuje tekst wewnątrz pliku (np. grep haslo raport.txt)', type: 'output', timestamp: getCurrentDateString() },
          { text: '  chmod [uprawnia] [plik] - Zmienia uprawnienia (np. chmod 600 tajne.txt lub chmod +x gra.py)', type: 'output', timestamp: getCurrentDateString() },
          { text: '  clear           - Czyści ekran konsoli', type: 'output', timestamp: getCurrentDateString() },
        ];
        onAddXP(5);
        break;

      case 'pwd': {
        const fullPath = getLinuxPathString(vfs, currentPathId);
        outputs = [{ text: fullPath, type: 'output', timestamp: getCurrentDateString() }];
        onAddXP(5);
        break;
      }

      case 'ls': {
        const isLongListing = args.includes('-l');
        const children = getChildren(vfs, currentPathId);
        
        if (children.length === 0) {
          outputs = [{ text: '(folder jest pusty)', type: 'output', timestamp: getCurrentDateString() }];
        } else if (isLongListing) {
          const formatPermissions = (node: VFSNode): string => {
            const prefix = node.type === 'directory' ? 'd' : '-';
            const perm = node.permissions;
            if (!perm) {
              return prefix + (node.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--');
            }
            if (perm === '600') return prefix + 'rw-------';
            if (perm === '700') return prefix + 'rwx------';
            if (perm === '755' || perm === '+x') return prefix + 'rwxr-xr-x';
            return prefix + perm;
          };

          const lines = children.map(child => {
            const perms = formatPermissions(child);
            const size = child.type === 'directory' ? '4096' : (child.size || '100 B');
            const date = child.createdAt || '2026-07-15 10:00';
            
            const isExec = child.permissions === '755' || child.permissions === '+x';
            let nameStr = child.name;
            if (child.type === 'directory') {
              nameStr = `\x1b[34m${child.name}\x1b[0m/`;
            } else if (isExec) {
              nameStr = `\x1b[32m${child.name}\x1b[0m*`;
            }

            return `${perms}  1 uczen uczen  ${size.padEnd(6)} ${date}  ${nameStr}`;
          });

          outputs = lines.map(line => ({ text: line, type: 'output', timestamp: getCurrentDateString() }));
        } else {
          const formattedText = children.map(child => {
            const isExec = child.permissions === '755' || child.permissions === '+x';
            if (child.type === 'directory') {
              return `📁 \x1b[34m${child.name}\x1b[0m/`;
            } else if (isExec) {
              return `📄 \x1b[32m${child.name}\x1b[0m*`;
            }
            return `📄 ${child.name}`;
          }).join('    ');
          
          outputs = [{ text: formattedText, type: 'output', timestamp: getCurrentDateString() }];
        }
        onAddXP(5);
        break;
      }

      case 'cd': {
        const target = args[0];
        if (!target || target === '~') {
          // Go to home directory (/home/uczen)
          if (vfs['uczen']) {
            setCurrentPathId('uczen');
            outputs = [{ text: 'Powrót do katalogu domowego (~)', type: 'output', timestamp: getCurrentDateString() }];
          } else {
            setCurrentPathId('root');
          }
        } else if (target === '..') {
          const current = vfs[currentPathId];
          if (current && current.parentId) {
            setCurrentPathId(current.parentId);
          } else {
            outputs = [{ text: 'Błąd: Jesteś już w katalogu głównym (/)!', type: 'error', timestamp: getCurrentDateString() }];
          }
        } else {
          // Find matching folder
          const children = getChildren(vfs, currentPathId);
          const found = children.find(child => child.name === target && child.type === 'directory');
          
          if (found) {
            setCurrentPathId(found.id);
          } else {
            const isFile = children.find(child => child.name === target && child.type === 'file');
            if (isFile) {
              outputs = [{ text: `cd: błąd: "${target}" nie jest katalogiem! To jest plik.`, type: 'error', timestamp: getCurrentDateString() }];
            } else {
              outputs = [{ text: `cd: błąd: brak takiego katalogu: "${target}"`, type: 'error', timestamp: getCurrentDateString() }];
            }
          }
        }
        onAddXP(10);
        break;
      }

      case 'mkdir': {
        const folderName = args.join(' ');
        if (!folderName) {
          outputs = [{ text: 'mkdir: brakujący argument (podaj nazwę folderu, np. mkdir Folder)', type: 'error', timestamp: getCurrentDateString() }];
          break;
        }

        const val = validateNodeName(folderName, 'linux');
        if (!val.isValid) {
          outputs = [{ text: `mkdir: błąd: ${val.error}`, type: 'error', timestamp: getCurrentDateString() }];
          break;
        }

        if (nodeExists(vfs, currentPathId, folderName)) {
          outputs = [{ text: `mkdir: nie można utworzyć katalogu "${folderName}": Plik/Folder już istnieje!`, type: 'error', timestamp: getCurrentDateString() }];
          break;
        }

        const newId = generateId();
        const newFolder: VFSNode = {
          id: newId,
          name: folderName,
          type: 'directory',
          parentId: currentPathId,
          createdAt: getCurrentDateString(),
          size: 'Katalog'
        };

        setVfs(prev => ({
          ...prev,
          [newId]: newFolder
        }));

        outputs = [{ text: `Katalog "${folderName}" został pomyślnie utworzony.`, type: 'success', timestamp: getCurrentDateString() }];
        onAddXP(15);
        break;
      }

      case 'touch': {
        const fileName = args.join(' ');
        if (!fileName) {
          outputs = [{ text: 'touch: brakujący argument (podaj nazwę pliku, np. touch plik.txt)', type: 'error', timestamp: getCurrentDateString() }];
          break;
        }

        const val = validateNodeName(fileName, 'linux');
        if (!val.isValid) {
          outputs = [{ text: `touch: błąd: ${val.error}`, type: 'error', timestamp: getCurrentDateString() }];
          break;
        }

        if (nodeExists(vfs, currentPathId, fileName)) {
          outputs = [{ text: `touch: Plik/Folder o nazwie "${fileName}" już istnieje!`, type: 'error', timestamp: getCurrentDateString() }];
          break;
        }

        const newId = generateId();
        const newFile: VFSNode = {
          id: newId,
          name: fileName,
          type: 'file',
          parentId: currentPathId,
          content: 'Tekst pliku utworzonego przez touch. Możesz go edytować.',
          createdAt: getCurrentDateString(),
          size: '100 B'
        };

        setVfs(prev => ({
          ...prev,
          [newId]: newFile
        }));

        outputs = [{ text: `Plik "${fileName}" został utworzony.`, type: 'success', timestamp: getCurrentDateString() }];
        onAddXP(15);
        break;
      }

      case 'rm': {
        const fileName = args.join(' ');
        if (!fileName) {
          outputs = [{ text: 'rm: brakujący argument (podaj nazwę pliku do usunięcia)', type: 'error', timestamp: getCurrentDateString() }];
          break;
        }

        const children = getChildren(vfs, currentPathId);
        const target = children.find(child => child.name === fileName);

        if (!target) {
          outputs = [{ text: `rm: błąd: nie można usunąć "${fileName}": Brak takiego pliku!`, type: 'error', timestamp: getCurrentDateString() }];
        } else if (target.type === 'directory') {
          outputs = [{ text: `rm: błąd: "${fileName}" jest katalogiem! Aby usunąć katalog w Linux, potrzebujesz specjalnej flagi rm -rf (użyj wizualnego podglądu z prawej strony, by usunąć katalog).`, type: 'error', timestamp: getCurrentDateString() }];
        } else {
          setVfs(prev => {
            const next = { ...prev };
            delete next[target.id];
            return next;
          });
          outputs = [{ text: `Plik "${target.name}" został trwale usunięty z systemu.`, type: 'success', timestamp: getCurrentDateString() }];
          onAddXP(15);
        }
        break;
      }

      case 'mv': {
        const srcName = args[0];
        const destName = args[1];
        if (!srcName || !destName) {
          outputs = [{ text: 'mv: brakujące argumenty (użycie: mv [źródło] [cel], np. mv kotek.jpg Zdjęcia/)', type: 'error', timestamp: getCurrentDateString() }];
          break;
        }

        const children = getChildren(vfs, currentPathId);
        const target = children.find(child => child.name === srcName);

        if (!target) {
          outputs = [{ text: `mv: błąd: plik lub katalog "${srcName}" nie istnieje!`, type: 'error', timestamp: getCurrentDateString() }];
          break;
        }

        const cleanDest = destName.endsWith('/') ? destName.slice(0, -1) : destName;
        
        let destFolder = children.find(child => child.name === cleanDest && child.type === 'directory');
        
        if (cleanDest === '..') {
          const currentFolder = vfs[currentPathId];
          if (currentFolder && currentFolder.parentId) {
            setVfs(prev => ({
              ...prev,
              [target.id]: {
                ...prev[target.id],
                parentId: currentFolder.parentId
              }
            }));
            outputs = [{ text: `Przeniesiono "${srcName}" do katalogu nadrzędnego.`, type: 'success', timestamp: getCurrentDateString() }];
            onAddXP(15);
            break;
          } else {
            outputs = [{ text: `mv: błąd: brak katalogu nadrzędnego!`, type: 'error', timestamp: getCurrentDateString() }];
            break;
          }
        }

        if (destFolder) {
          setVfs(prev => ({
            ...prev,
            [target.id]: {
              ...prev[target.id],
              parentId: destFolder.id
            }
          }));
          outputs = [{ text: `Przeniesiono "${srcName}" do "${destFolder.name}/".`, type: 'success', timestamp: getCurrentDateString() }];
          onAddXP(15);
        } else {
          setVfs(prev => ({
            ...prev,
            [target.id]: {
              ...prev[target.id],
              name: destName
            }
          }));
          outputs = [{ text: `Zmieniono nazwę "${srcName}" na "${destName}".`, type: 'success', timestamp: getCurrentDateString() }];
          onAddXP(10);
        }
        break;
      }

      case 'cat': {
        const fileName = args.join(' ');
        if (!fileName) {
          outputs = [{ text: 'cat: brakujący argument (podaj nazwę pliku, np. cat welcome.txt)', type: 'error', timestamp: getCurrentDateString() }];
          break;
        }

        const children = getChildren(vfs, currentPathId);
        const target = children.find(child => child.name === fileName && child.type === 'file');

        if (target) {
          outputs = [{ text: target.content || '(plik jest pusty)', type: 'output', timestamp: getCurrentDateString() }];
          onAddXP(10);
        } else {
          outputs = [{ text: `cat: błąd: plik "${fileName}" nie istnieje!`, type: 'error', timestamp: getCurrentDateString() }];
        }
        break;
      }

      case 'chmod': {
        const permArg = args[0];
        const fileArg = args[1];
        if (!permArg || !fileArg) {
          outputs = [{ text: 'chmod: brakujące argumenty (użycie: chmod [uprawnienia] [nazwa_pliku], np. chmod 600 tajne.txt lub chmod +x gra.py)', type: 'error', timestamp: getCurrentDateString() }];
          break;
        }

        const children = getChildren(vfs, currentPathId);
        const target = children.find(child => child.name === fileArg);

        if (!target) {
          outputs = [{ text: `chmod: błąd: brak dostępu do "${fileArg}": Nie ma takiego pliku ani katalogu!`, type: 'error', timestamp: getCurrentDateString() }];
        } else {
          const newPerm = permArg;
          
          setVfs(prev => ({
            ...prev,
            [target.id]: {
              ...prev[target.id],
              permissions: newPerm
            }
          }));

          outputs = [{ text: `Zmieniono uprawnienia pliku "${target.name}" na: ${newPerm}`, type: 'success', timestamp: getCurrentDateString() }];
          onAddXP(15);
        }
        break;
      }

      case 'grep': {
        const pattern = args[0];
        const fileArg = args[1];
        if (!pattern || !fileArg) {
          outputs = [{ text: 'grep: brakujące argumenty (użycie: grep [wzorzec] [nazwa_pliku], np. grep haslo raport.txt)', type: 'error', timestamp: getCurrentDateString() }];
          break;
        }

        const children = getChildren(vfs, currentPathId);
        const target = children.find(child => child.name === fileArg && child.type === 'file');

        if (target) {
          const lines = (target.content || '').split('\n');
          const matchingLines = lines.filter(line => line.toLowerCase().includes(pattern.toLowerCase()));
          if (matchingLines.length > 0) {
            outputs = matchingLines.map(line => {
              // Highlight matches
              const partsOfLine = line.split(new RegExp(`(${pattern})`, 'gi'));
              const coloredText = partsOfLine.map(part => {
                if (part.toLowerCase() === pattern.toLowerCase()) {
                  return `\x1b[31m${part}\x1b[0m`;
                }
                return part;
              }).join('');

              return {
                text: coloredText,
                type: 'output' as const,
                timestamp: getCurrentDateString()
              };
            });
            onAddXP(15);
          } else {
            outputs = [{ text: `(brak dopasowań dla wzorca "${pattern}")`, type: 'output', timestamp: getCurrentDateString() }];
          }
        } else {
          outputs = [{ text: `grep: błąd: plik "${fileArg}" nie istnieje!`, type: 'error', timestamp: getCurrentDateString() }];
        }
        break;
      }

      case 'clear':
        setTerminalLog([]);
        return;

      default:
        outputs = [
          { text: `bash: błąd: nieznane polecenie: "${command}"`, type: 'error', timestamp: getCurrentDateString() },
          { text: 'Wpisz "help", aby zobaczyć listę poprawnych poleceń systemu Linux.', type: 'output', timestamp: getCurrentDateString() }
        ];
    }

    setTerminalLog(prev => [
      ...prev,
      inputLine,
      ...outputs
    ]);

    // Fast state sync triggers action verify
    setTimeout(() => {
      onActionTriggered(trimmed);
    }, 100);
  };

  // Handle keys for terminal inputs (Enter, Arrows)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < cmdHistory.length) {
          setHistoryIndex(nextIdx);
          setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = historyIndex - 1;
      if (nextIdx >= 0) {
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx]);
      } else {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  // Build terminal path representation
  const terminalPath = getLinuxPathString(vfs, currentPathId).replace('/home/uczen', '~');

  // Compute active children in the current directory for the side-by-side display
  const activeChildren = getChildren(vfs, currentPathId);

  return (
    <div 
      className="bg-gradient-to-tr from-[#2c001e] via-[#4f1035] to-[#77216f] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[650px] text-[#2E3440] relative" 
      id="linux-desktop-root"
    >
      {/* DESKTOP WORKSPACE AREA */}
      <div 
        className="flex-grow relative overflow-hidden"
        onClick={() => {
          setSelectedNodeId(null);
          setShowApplicationsMenu(false);
        }}
      >
        {/* Floating Ubuntu Desktop Shortcuts */}
        <div className="absolute top-6 left-6 flex flex-col gap-5 z-0" onClick={(e) => e.stopPropagation()}>
          {/* Shortcut 1: Terminal */}
          <button 
            onDoubleClick={() => {
              if (!openApps.includes('terminal')) setOpenApps(prev => [...prev, 'terminal']);
              setActiveApp('terminal');
            }}
            onClick={() => setSelectedNodeId('shortcut-terminal')}
            className={`flex flex-col items-center p-2 rounded-2xl border w-20 cursor-pointer text-center select-none transition-all ${
              selectedNodeId === 'shortcut-terminal' 
                ? 'bg-white/15 border-orange-500/30 shadow-md scale-102 ring-1 ring-orange-500/20' 
                : 'border-transparent hover:bg-white/5'
            }`}
          >
            <div className="w-10 h-10 bg-[#2E3440] rounded-xl flex items-center justify-center text-orange-400 text-xs font-mono border border-stone-700 shadow-md drop-shadow-md">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-stone-200 tracking-tight mt-1 line-clamp-2 leading-tight drop-shadow-sm">Terminal</span>
          </button>

          {/* Shortcut 2: Files Browser */}
          <button 
            onDoubleClick={() => {
              if (!openApps.includes('browser')) setOpenApps(prev => [...prev, 'browser']);
              setActiveApp('browser');
            }}
            onClick={() => setSelectedNodeId('shortcut-browser')}
            className={`flex flex-col items-center p-2 rounded-2xl border w-20 cursor-pointer text-center select-none transition-all ${
              selectedNodeId === 'shortcut-browser' 
                ? 'bg-white/15 border-orange-500/30 shadow-md scale-102 ring-1 ring-orange-500/20' 
                : 'border-transparent hover:bg-white/5'
            }`}
          >
            <Folder className="w-10 h-10 text-orange-500 fill-orange-400 drop-shadow-md" />
            <span className="text-[10px] font-bold text-stone-200 tracking-tight mt-1 line-clamp-2 leading-tight drop-shadow-sm">Pliki</span>
          </button>

          {/* Shortcut 3: Gedit text editor */}
          <button 
            onDoubleClick={() => {
              setActiveGeditFileId(null);
              if (!openApps.includes('gedit')) setOpenApps(prev => [...prev, 'gedit']);
              setActiveApp('gedit');
            }}
            onClick={() => setSelectedNodeId('shortcut-gedit')}
            className={`flex flex-col items-center p-2 rounded-2xl border w-20 cursor-pointer text-center select-none transition-all ${
              selectedNodeId === 'shortcut-gedit' 
                ? 'bg-white/15 border-orange-500/30 shadow-md scale-102 ring-1 ring-orange-500/20' 
                : 'border-transparent hover:bg-white/5'
            }`}
          >
            <FileText className="w-10 h-10 text-orange-400 drop-shadow-md" />
            <span className="text-[10px] font-bold text-stone-200 tracking-tight mt-1 line-clamp-2 leading-tight drop-shadow-sm">Edytor gedit</span>
          </button>
        </div>

        {/* 1. APP: TERMINAL & VISUAL MAP SPLIT LAYOUT */}
        {activeApp === 'terminal' && openApps.includes('terminal') && (
          <div 
            className="absolute inset-x-2 top-2 bottom-2 bg-transparent grid md:grid-cols-12 gap-4 p-2 z-10 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT Column - Terminal Console (8 cols) */}
            <div className="md:col-span-8 flex flex-col bg-[#2D3440] border border-stone-700/50 rounded-2xl overflow-hidden shadow-2xl relative">
              {/* Terminal Header */}
              <div className="bg-[#1E222A] px-4 py-2.5 flex items-center justify-between select-none border-b border-[#2E3440]/30">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                  <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block"></span>
                  <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                </div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-orange-400" />
                  <span className="text-stone-300 font-mono text-[11px] font-bold">uczen@ubuntu: {terminalPath}</span>
                </div>
                <button 
                  onClick={() => {
                    setOpenApps(prev => prev.filter(a => a !== 'terminal'));
                    setActiveApp(openApps.filter(a => a !== 'terminal')[0] as any || null);
                  }}
                  className="text-gray-500 hover:text-gray-300 w-5 h-5 flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Console Body */}
              <div 
                onClick={handleTerminalClick}
                className="flex-1 p-4 font-mono text-xs md:text-sm overflow-y-auto space-y-1.5 cursor-text bg-[#1A1E24]"
                id="terminal-console-body"
              >
                {terminalLog.map((line, idx) => {
                  let colorClass = 'text-white';
                  if (line.type === 'input') colorClass = 'text-green-400 font-semibold';
                  if (line.type === 'error') colorClass = 'text-red-400 font-medium';
                  if (line.type === 'success') colorClass = 'text-amber-400 font-medium';
                  if (line.type === 'output' && line.text.includes('\x1b[34m')) {
                    const parts = line.text.split('    ');
                    return (
                      <div key={idx} className="flex flex-wrap gap-4 leading-relaxed">
                        {parts.map((p, pIdx) => {
                          const isDir = p.includes('\x1b[34m');
                          const cleanName = p.replace(/\x1b\[34m/g, '').replace(/\x1b\[0m/g, '');
                          return (
                            <span 
                              key={pIdx} 
                              className={isDir ? 'text-sky-400 font-bold hover:underline' : 'text-stone-200'}
                            >
                              {cleanName}
                            </span>
                          );
                        })}
                      </div>
                    );
                  }

                  if (line.text.includes('\x1b[31m')) {
                    const parts = line.text.split(/(\x1b\[31m.*?\x1b\[0m)/g);
                    return (
                      <div key={idx} className={`leading-relaxed whitespace-pre-wrap ${colorClass}`}>
                        {parts.map((part, pIdx) => {
                          if (part.startsWith('\x1b[31m') && part.endsWith('\x1b[0m')) {
                            const cleanText = part.substring(7, part.length - 4);
                            return <span key={pIdx} className="text-red-400 font-bold bg-red-500/10 px-1 rounded">{cleanText}</span>;
                          }
                          return part;
                        })}
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className={`leading-relaxed whitespace-pre-wrap ${colorClass}`}>
                      {line.text}
                    </div>
                  );
                })}
                
                {/* Prompt Row */}
                <div className="flex items-center gap-1 text-green-400 font-semibold pt-1">
                  <span className="whitespace-nowrap">uczen@ubuntu:{terminalPath}$</span>
                  <input 
                    ref={inputRef}
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 text-white font-mono text-xs md:text-sm resize-none caret-orange-500 font-semibold"
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    id="terminal-command-input"
                  />
                </div>
                <div ref={terminalEndRef} />
              </div>

              {/* Console Footer */}
              <div className="bg-[#1E222A] px-4 py-2 border-t border-[#2E3440]/30 text-[10px] text-[#81A1C1] font-mono flex justify-between items-center select-none">
                <span>Wskazówka: ↑ i ↓ dają historię komend</span>
                <button
                  onClick={toggleHint}
                  id="btn-linux-hint"
                  className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] transition-all cursor-pointer font-bold ${
                    showHint 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                      : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400'
                  }`}
                >
                  <span>💡 Podpowiedź</span>
                </button>
              </div>
            </div>

            {/* RIGHT Column - Disk Map Preview (4 cols) */}
            <div className="md:col-span-4 flex flex-col bg-white border border-gray-100 rounded-2xl p-4 shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 pb-2.5 border-b border-[#ECEFF4] mb-3 select-none">
                <div className="bg-orange-100 text-orange-700 p-1.5 rounded-xl">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-[#2E3440] text-xs">Podgląd Dysku Live</h4>
                  <p className="text-[9px] text-gray-400">Zmiany z terminala widać tu natychmiast!</p>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex bg-[#ECEFF4] p-1 rounded-xl mb-3 select-none border border-[#D8DEE9]">
                <button
                  onClick={() => setRightPanelTab('content')}
                  className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition-all ${
                    rightPanelTab === 'content'
                      ? 'bg-white text-[#5E81AC] shadow-3xs border border-white font-black'
                      : 'text-[#4C566A] hover:text-[#2E3440]'
                  }`}
                >
                  Bieżący folder
                </button>
                <button
                  onClick={() => setRightPanelTab('tree')}
                  className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition-all ${
                    rightPanelTab === 'tree'
                      ? 'bg-white text-[#5E81AC] shadow-3xs border border-white font-black'
                      : 'text-[#4C566A] hover:text-[#2E3440]'
                  }`}
                >
                  Drzewo 🌳
                </button>
              </div>

              {rightPanelTab === 'content' ? (
                <div className="flex-grow flex flex-col min-h-0">
                  <div className="mb-2 bg-[#F8FAFC] border border-[#D8DEE9] p-2 rounded-xl text-[10px] text-[#2E3440] font-bold font-mono flex items-center gap-1 overflow-x-auto whitespace-nowrap shadow-2xs select-none">
                    <span className="text-[#4C566A]">Ścieżka:</span>
                    <span className="text-[#5E81AC]">{getLinuxPathString(vfs, currentPathId)}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 select-none">
                    {activeChildren.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-300">
                        <Folder className="w-8 h-8 stroke-1 mb-1 text-gray-300" />
                        <p className="font-semibold text-[10px] text-gray-400">Katalog jest pusty.</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {activeChildren.map(node => (
                          <div 
                            key={node.id} 
                            onClick={() => {
                              if (node.type === 'directory') {
                                setCurrentPathId(node.id);
                              } else {
                                const name = node.name.toLowerCase();
                                if (name.endsWith('.txt')) {
                                  // Open in gedit text editor!
                                  setActiveGeditFileId(node.id);
                                  if (!openApps.includes('gedit')) {
                                    setOpenApps(prev => [...prev, 'gedit']);
                                  }
                                  setActiveApp('gedit');
                                  onAddXP(5);
                                } else {
                                  alert(`Podgląd pliku "${node.name}":\n\n${node.content || '(brak zawartości)'}`);
                                }
                              }
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer hover:scale-101 ${
                              node.type === 'directory' 
                                ? 'bg-[#F8FAFC] border-[#D8DEE9] hover:bg-[#ECEFF4]' 
                                : 'bg-white border-[#ECEFF4] hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {node.type === 'directory' ? (
                                <Folder className="w-3.5 h-3.5 text-blue-500 fill-blue-100 flex-shrink-0" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              )}
                              <span className="text-[11px] font-bold text-[#2E3440] truncate font-mono">{node.name}</span>
                            </div>
                            <span className="text-[8px] text-[#4C566A] font-bold font-mono bg-white px-1.5 py-0.5 rounded border border-[#D8DEE9]">
                              {node.type === 'directory' ? 'DIR' : node.size}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-grow min-h-0 flex flex-col select-none">
                  <DirectoryTreeVisualizer 
                    vfs={vfs}
                    currentPathId={currentPathId}
                    setCurrentPathId={setCurrentPathId}
                    system="linux"
                    minimal={true}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. APP: LINUX FILE BROWSER (Nautilus) */}
        {activeApp === 'browser' && openApps.includes('browser') && (
          <div 
            className="absolute inset-x-2 top-2 bottom-2 rounded-2xl overflow-hidden shadow-2xl z-10 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <LinuxFileBrowser 
              vfs={vfs}
              setVfs={setVfs}
              currentPathId={currentPathId}
              setCurrentPathId={setCurrentPathId}
              onAddXP={onAddXP}
              onActionTriggered={() => onActionTriggered('Nautilus Browser')}
              onOpenFile={(id) => {
                setActiveGeditFileId(id);
                if (!openApps.includes('gedit')) {
                  setOpenApps(prev => [...prev, 'gedit']);
                }
                setActiveApp('gedit');
              }}
            />
          </div>
        )}

        {/* 3. APP: LINUX NOTEPAD (gedit) */}
        {activeApp === 'gedit' && openApps.includes('gedit') && (
          <div 
            className="absolute inset-x-2 top-2 bottom-2 rounded-2xl overflow-hidden shadow-2xl z-10 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <LinuxNotepad 
              vfs={vfs}
              setVfs={setVfs}
              currentPathId={currentPathId}
              activeFileId={activeGeditFileId}
              setActiveFileId={setActiveGeditFileId}
              onAddXP={onAddXP}
              onActionTriggered={() => onActionTriggered('gedit Editor')}
              onClose={() => {
                setOpenApps(prev => prev.filter(a => a !== 'gedit'));
                setActiveApp(openApps.filter(a => a !== 'gedit')[0] as any || null);
              }}
            />
          </div>
        )}

      </div>

      {/* UBUNTU STYLE BOTTOM DOCK / TASKBAR */}
      <div 
        className="bg-[#21141c]/90 backdrop-blur-md border-t border-white/5 h-14 flex items-center justify-between px-4 z-20 select-none relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
        id="linux-taskbar"
      >
        {/* Left branding text & Open Windows list */}
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-orange-400 font-mono font-bold hidden sm:block">
            <span>ubuntu@akademia-linux</span>
          </div>
          {openApps.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 border-l border-white/15 pl-3">
              <span className="text-[9px] text-[#c2b5bc]/60 uppercase tracking-wider font-mono mr-1">Open windows:</span>
              {openApps.map(app => {
                const isActive = activeApp === app;
                const appName = app === 'terminal' ? 'Terminal' : app === 'browser' ? 'Nautilus Pliki' : 'gedit Notatnik';
                const appIcon = app === 'terminal' ? '📟' : app === 'browser' ? '📁' : '📝';
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
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                      isActive 
                        ? 'bg-orange-600/20 text-orange-400 border-orange-500/40 shadow-2xs' 
                        : 'bg-[#2c1a24]/50 text-[#c2b5bc]/70 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <span>{appIcon}</span>
                    <span>{appName}</span>
                    {isActive && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Center centered Dock shortcut icons */}
        <div className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
          
          {/* Applications Menu */}
          <button
            onClick={() => setShowApplicationsMenu(!showApplicationsMenu)}
            className={`p-2 rounded-xl transition-all hover:bg-white/10 ${showApplicationsMenu ? 'bg-orange-500/20 border border-orange-500/30' : ''}`}
            title="Aplikacje Ubuntu"
            id="linux-taskbar-btn-start"
          >
            <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-white font-extrabold text-[9px] shadow-sm animate-bounce">
              🍥
            </div>
          </button>

          {/* Terminal App */}
          <button
            onClick={() => {
              if (activeApp === 'terminal') {
                setActiveApp(null);
              } else {
                if (!openApps.includes('terminal')) setOpenApps(prev => [...prev, 'terminal']);
                setActiveApp('terminal');
              }
              setShowApplicationsMenu(false);
            }}
            className={`p-2 rounded-xl transition-all relative flex flex-col items-center justify-center hover:bg-white/10 ${
              activeApp === 'terminal' ? 'bg-orange-500/15 border border-orange-500/20 shadow-xs' : ''
            }`}
            title="Terminal Ubuntu"
            id="linux-taskbar-btn-terminal"
          >
            <Terminal className="w-5 h-5 text-orange-400" />
            {openApps.includes('terminal') && (
              <span className="w-1 h-1 bg-orange-500 rounded-full absolute bottom-1"></span>
            )}
          </button>

          {/* Nautilus File Browser App */}
          <button
            onClick={() => {
              if (activeApp === 'browser') {
                setActiveApp(null);
              } else {
                if (!openApps.includes('browser')) setOpenApps(prev => [...prev, 'browser']);
                setActiveApp('browser');
              }
              setShowApplicationsMenu(false);
            }}
            className={`p-2 rounded-xl transition-all relative flex flex-col items-center justify-center hover:bg-white/10 ${
              activeApp === 'browser' ? 'bg-orange-500/15 border border-orange-500/20 shadow-xs' : ''
            }`}
            title="Przeglądarka plików (Nautilus)"
            id="linux-taskbar-btn-browser"
          >
            <Folder className="w-5 h-5 text-orange-500 fill-orange-400" />
            {openApps.includes('browser') && (
              <span className="w-1 h-1 bg-orange-500 rounded-full absolute bottom-1"></span>
            )}
          </button>

          {/* gedit Text Editor App */}
          <button
            onClick={() => {
              if (activeApp === 'gedit') {
                setActiveApp(null);
              } else {
                if (!openApps.includes('gedit')) setOpenApps(prev => [...prev, 'gedit']);
                setActiveApp('gedit');
              }
              setShowApplicationsMenu(false);
            }}
            className={`p-2 rounded-xl transition-all relative flex flex-col items-center justify-center hover:bg-white/10 ${
              activeApp === 'gedit' ? 'bg-orange-500/15 border border-orange-500/20 shadow-xs' : ''
            }`}
            title="Edytor tekstu gedit"
            id="linux-taskbar-btn-gedit"
          >
            <FileText className="w-5 h-5 text-orange-400" />
            {openApps.includes('gedit') && (
              <span className="w-1 h-1 bg-orange-500 rounded-full absolute bottom-1"></span>
            )}
          </button>

        </div>

        {/* Right side widgets: volume, wifi, clock */}
        <div className="text-right flex items-center gap-3 text-[#c2b5bc] font-mono text-[10px] font-bold select-none">
          {isChallengeActive && challengeTimeLeft !== undefined && (
            <div className="bg-[#5c1e33] text-orange-400 px-2 py-1 rounded-md flex items-center gap-1 border border-orange-500/20 animate-pulse text-[10px]" id="linux-taskbar-challenge-timer">
              <span>⏱️ Zostało:</span>
              <span className="font-extrabold text-xs">{challengeTimeLeft}s</span>
            </div>
          )}
          <div className="hidden xs:flex items-center gap-2">
            <span>📶</span>
            <span>🔊</span>
          </div>
          <div className="flex flex-col items-end leading-none">
            <span className="text-[#81a1c1]">{currentTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            <span className="text-[8px] text-[#4a2e3f] mt-0.5">{currentTime.toLocaleDateString('pl-PL')}</span>
          </div>
        </div>

        {/* POPUP: UBUNTU APPLICATIONS DOCK MENU */}
        {showApplicationsMenu && (
          <div 
            className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#2c1a24]/95 backdrop-blur-md rounded-2xl w-80 p-5 shadow-2xl border border-orange-500/20 text-[#eceff4] select-none z-30 font-sans"
            id="linux-applications-popup"
          >
            <div className="bg-[#1e1118]/80 px-3 py-1.5 rounded-xl text-xs text-gray-500 mb-4 flex items-center gap-2 border border-white/5">
              <span>🔍</span>
              <span>Wyszukaj komendy i programy...</span>
            </div>

            <h4 className="text-[10px] uppercase font-bold text-orange-500 tracking-wider mb-2 font-mono">Dostępne aplikacje</h4>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button 
                onClick={() => {
                  if (!openApps.includes('terminal')) setOpenApps(prev => [...prev, 'terminal']);
                  setActiveApp('terminal');
                  setShowApplicationsMenu(false);
                }}
                className="flex flex-col items-center p-2 hover:bg-white/5 rounded-xl transition-all"
              >
                <Terminal className="w-7 h-7 text-orange-400" />
                <span className="text-[9px] font-bold text-gray-300 mt-1 truncate max-w-full">Terminal</span>
              </button>
              
              <button 
                onClick={() => {
                  if (!openApps.includes('browser')) setOpenApps(prev => [...prev, 'browser']);
                  setActiveApp('browser');
                  setShowApplicationsMenu(false);
                }}
                className="flex flex-col items-center p-2 hover:bg-white/5 rounded-xl transition-all"
              >
                <Folder className="w-7 h-7 text-orange-500 fill-orange-400" />
                <span className="text-[9px] font-bold text-gray-300 mt-1 truncate max-w-full">Pliki Linux</span>
              </button>

              <button 
                onClick={() => {
                  setActiveGeditFileId(null);
                  if (!openApps.includes('gedit')) setOpenApps(prev => [...prev, 'gedit']);
                  setActiveApp('gedit');
                  setShowApplicationsMenu(false);
                }}
                className="flex flex-col items-center p-2 hover:bg-white/5 rounded-xl transition-all"
              >
                <FileText className="w-7 h-7 text-orange-400" />
                <span className="text-[9px] font-bold text-gray-300 mt-1 truncate max-w-full font-mono">gedit</span>
              </button>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl mb-4 text-xs">
              <p className="font-bold text-orange-400 text-[11px] mb-1">💡 Lekcja Ubuntu:</p>
              <p className="text-[10px] text-gray-400 leading-normal italic font-mono">
                "Używaj komendy cat, aby czytać pliki, lub otwórz gedit, aby edytować pliki bezpośrednio!"
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5 font-bold font-mono">
                <span className="bg-orange-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">U</span>
                <span>uczen@ubuntu</span>
              </div>
              <button 
                onClick={() => {
                  if (confirm('Czy chcesz zresetować widok Ubuntu?')) {
                    setOpenApps(['terminal']);
                    setActiveApp('terminal');
                    setShowApplicationsMenu(false);
                  }
                }}
                className="hover:bg-orange-500/20 hover:text-orange-400 px-2.5 py-1 rounded-lg transition-all text-xs font-mono"
              >
                Resetuj 🔄
              </button>
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
}
