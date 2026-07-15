/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { VFSNode } from '../types';
import { 
  getChildren, 
  getWindowsPathString, 
  validateNodeName, 
  generateId, 
  getCurrentDateString,
  nodeExists 
} from '../utils/fileSystem';

interface WindowsCMDProps {
  vfs: Record<string, VFSNode>;
  setVfs: React.Dispatch<React.SetStateAction<Record<string, VFSNode>>>;
  currentPathId: string;
  setCurrentPathId: (id: string) => void;
  onAddXP: (points: number) => void;
  onActionTriggered: (latestCommand?: string) => void;
}

interface CMDLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success';
}

export default function WindowsCMD({
  vfs,
  setVfs,
  currentPathId,
  setCurrentPathId,
  onAddXP,
  onActionTriggered
}: WindowsCMDProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CMDLine[]>([
    { text: 'Microsoft Windows [Wersja 10.0.22621]', type: 'output' },
    { text: '(c) Microsoft Corporation. Wszelkie prawa zastrzeżone.', type: 'output' },
    { text: '', type: 'output' },
    { text: 'Wpisz "help", aby wyświetlić listę dostępnych poleceń.', type: 'success' },
    { text: '', type: 'output' }
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    focusInput();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < cmdHistory.length) {
          setHistoryIndex(nextIdx);
          setInput(cmdHistory[cmdHistory.length - 1 - nextIdx]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = historyIndex - 1;
      if (nextIdx >= 0) {
        setHistoryIndex(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) {
      const pathStr = getWindowsPathString(vfs, currentPathId);
      setHistory(prev => [...prev, { text: `${pathStr}>`, type: 'input' }]);
      return;
    }

    // Add to history
    setCmdHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    const pathStr = getWindowsPathString(vfs, currentPathId);
    const parts = trimmed.split(' ');
    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputs: CMDLine[] = [];
    let updatedPathId = currentPathId;

    switch (commandName) {
      case 'help':
        outputs = [
          { text: 'Dostępne polecenia systemu Windows:', type: 'success' },
          { text: '  DIR             - Wyświetla listę plików i podkatalogów w bieżącym katalogu.', type: 'output' },
          { text: '  CD [katalog]    - Zmienia bieżący katalog (np. CD Dokumenty).', type: 'output' },
          { text: '  CD ..           - Przechodzi do katalogu nadrzędnego.', type: 'output' },
          { text: '  CD \\            - Przechodzi do katalogu głównego (C:\\).', type: 'output' },
          { text: '  MKDIR [nazwa]   - Tworzy nowy katalog (np. MKDIR Zadania).', type: 'output' },
          { text: '  TYPE [plik]     - Wyświetla zawartość pliku tekstowego (np. TYPE notatka.txt).', type: 'output' },
          { text: '  DEL [plik]      - Usuwa jeden lub więcej plików.', type: 'output' },
          { text: '  CLS             - Czyści ekran konsoli.', type: 'output' },
          { text: '  VER             - Wyświetla wersję systemu Windows.', type: 'output' },
          { text: '  ECHO [tekst] > [plik] - Zapisuje tekst do pliku (np. ECHO Hej > plik.txt).', type: 'output' }
        ];
        onAddXP(5);
        break;

      case 'ver':
        outputs = [
          { text: 'Microsoft Windows [Wersja 10.0.22621]', type: 'output' }
        ];
        onAddXP(2);
        break;

      case 'cls':
        setHistory([]);
        return;

      case 'dir': {
        const children = getChildren(vfs, currentPathId);
        outputs.push({ text: ` Katalog: ${getWindowsPathString(vfs, currentPathId)}`, type: 'output' });
        outputs.push({ text: '', type: 'output' });

        if (children.length === 0) {
          outputs.push({ text: '0 plików, 0 katalogów', type: 'output' });
        } else {
          children.forEach(child => {
            const dateStr = child.createdAt.split(' ')[0] || '2026-07-15';
            if (child.type === 'directory') {
              outputs.push({ text: `${dateStr}  <DIR>          ${child.name}`, type: 'output' });
            } else {
              outputs.push({ text: `${dateStr}         ${child.size.padEnd(8)} ${child.name}`, type: 'output' });
            }
          });
        }
        onAddXP(5);
        break;
      }

      case 'cd': {
        const dest = args.join(' ');
        if (!dest) {
          outputs = [{ text: getWindowsPathString(vfs, currentPathId), type: 'output' }];
        } else if (dest === '..') {
          const current = vfs[currentPathId];
          if (current && current.parentId) {
            updatedPathId = current.parentId;
            setCurrentPathId(current.parentId);
          } else {
            outputs = [{ text: 'Błąd: Jesteś już w katalogu głównym (C:\\)!', type: 'error' }];
          }
        } else if (dest === '\\' || dest === '/') {
          updatedPathId = 'root';
          setCurrentPathId('root');
        } else {
          const children = getChildren(vfs, currentPathId);
          const found = children.find(child => child.name.toLowerCase() === dest.toLowerCase() && child.type === 'directory');
          if (found) {
            updatedPathId = found.id;
            setCurrentPathId(found.id);
          } else {
            const isFile = children.find(child => child.name.toLowerCase() === dest.toLowerCase() && child.type === 'file');
            if (isFile) {
              outputs = [{ text: `System nie może odnaleźć określonej ścieżki (to jest plik, nie katalog).`, type: 'error' }];
            } else {
              outputs = [{ text: `System nie może odnaleźć określonej ścieżki: "${dest}"`, type: 'error' }];
            }
          }
        }
        onAddXP(5);
        break;
      }

      case 'mkdir': {
        const folderName = args.join(' ');
        if (!folderName) {
          outputs = [{ text: 'Błąd: Należy podać nazwę folderu (np. MKDIR Zadania)', type: 'error' }];
          break;
        }
        const val = validateNodeName(folderName, 'windows');
        if (!val.isValid) {
          outputs = [{ text: `Błąd: ${val.error}`, type: 'error' }];
          break;
        }
        if (nodeExists(vfs, currentPathId, folderName)) {
          outputs = [{ text: `Błąd: Plik lub podkatalog o nazwie "${folderName}" już istnieje.`, type: 'error' }];
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

        outputs = [{ text: `Utworzono katalog "${folderName}".`, type: 'success' }];
        onAddXP(15);
        break;
      }

      case 'del': {
        const fileName = args.join(' ');
        if (!fileName) {
          outputs = [{ text: 'Błąd: Podaj nazwę pliku do usunięcia (np. DEL smieci.tmp)', type: 'error' }];
          break;
        }

        const children = getChildren(vfs, currentPathId);
        const target = children.find(child => child.name.toLowerCase() === fileName.toLowerCase());

        if (!target) {
          outputs = [{ text: `Nie można odnaleźć pliku: "${fileName}"`, type: 'error' }];
        } else if (target.type === 'directory') {
          outputs = [{ text: `Użycie DEL na katalogu "${fileName}" jest niedozwolone. Aby usunąć katalog, użyj interfejsu graficznego.`, type: 'error' }];
        } else {
          setVfs(prev => {
            const next = { ...prev };
            delete next[target.id];
            return next;
          });
          outputs = [{ text: `Usunięto plik "${target.name}".`, type: 'success' }];
          onAddXP(15);
        }
        break;
      }

      case 'type': {
        const fileName = args.join(' ');
        if (!fileName) {
          outputs = [{ text: 'Błąd: Podaj nazwę pliku (np. TYPE notatka.txt)', type: 'error' }];
          break;
        }

        const children = getChildren(vfs, currentPathId);
        const target = children.find(child => child.name.toLowerCase() === fileName.toLowerCase() && child.type === 'file');

        if (target) {
          outputs = [{ text: target.content || '(plik jest pusty)', type: 'output' }];
          onAddXP(10);
        } else {
          outputs = [{ text: `System nie może odnaleźć określonego pliku: "${fileName}"`, type: 'error' }];
        }
        break;
      }

      case 'echo': {
        // Simple echo parser supporting echo content > filename.txt
        const fullArgStr = args.join(' ');
        const redirectIndex = fullArgStr.indexOf('>');
        if (redirectIndex === -1) {
          outputs = [{ text: args.join(' '), type: 'output' }];
          break;
        }

        const content = fullArgStr.substring(0, redirectIndex).trim();
        const destFile = fullArgStr.substring(redirectIndex + 1).trim();

        if (!destFile) {
          outputs = [{ text: 'Błąd składni: Brak pliku docelowego po znaku ">".', type: 'error' }];
          break;
        }

        const val = validateNodeName(destFile, 'windows');
        if (!val.isValid) {
          outputs = [{ text: `Błąd: ${val.error}`, type: 'error' }];
          break;
        }

        const children = getChildren(vfs, currentPathId);
        const existingFile = children.find(child => child.name.toLowerCase() === destFile.toLowerCase() && child.type === 'file');

        if (existingFile) {
          setVfs(prev => ({
            ...prev,
            [existingFile.id]: {
              ...prev[existingFile.id],
              content: content,
              size: `${Math.max(1, content.length)} B`
            }
          }));
          outputs = [{ text: `Zaktualizowano zawartość pliku "${existingFile.name}".`, type: 'success' }];
        } else {
          const newId = generateId();
          const newFile: VFSNode = {
            id: newId,
            name: destFile,
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
          outputs = [{ text: `Utworzono plik "${destFile}" z podaną zawartością.`, type: 'success' }];
        }
        onAddXP(15);
        break;
      }

      default:
        outputs = [
          { text: `Nazwa "${commandName}" nie jest rozpoznawana jako polecenie wewnętrzne lub zewnętrzne,`, type: 'error' },
          { text: 'program wykonywalny lub plik wsadowy.', type: 'error' },
          { text: 'Wpisz "help", aby uzyskać pomoc.', type: 'error' }
        ];
    }

    setHistory(prev => [
      ...prev,
      { text: `${pathStr}> ${cmdText}`, type: 'input' },
      ...outputs
    ]);

    // Fast state sync triggers action verify
    setTimeout(() => {
      onActionTriggered(trimmed);
    }, 100);
  };

  return (
    <div 
      className="bg-black text-gray-200 border border-gray-700 rounded-3xl h-[550px] shadow-2xl flex flex-col font-mono text-xs md:text-sm overflow-hidden select-text"
      onClick={focusInput}
    >
      {/* CMD Window Header */}
      <div className="bg-gray-800 text-gray-300 px-4 py-2 flex items-center justify-between border-b border-gray-700 select-none">
        <div className="flex items-center gap-2">
          <span className="text-blue-400">💻</span>
          <span className="font-bold font-sans">Wiersz polecenia (CMD)</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-60"></span>
          <span className="w-3 h-3 rounded-full bg-green-500 opacity-60"></span>
          <span className="w-3 h-3 rounded-full bg-red-500 opacity-60"></span>
        </div>
      </div>

      {/* Terminal Lines Area */}
      <div 
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-gray-800"
      >
        {history.map((line, idx) => {
          let colorClass = 'text-gray-200';
          if (line.type === 'error') colorClass = 'text-red-400';
          if (line.type === 'success') colorClass = 'text-emerald-400';
          if (line.type === 'input') colorClass = 'text-white font-bold';

          return (
            <div key={idx} className={`${colorClass} whitespace-pre-wrap leading-relaxed`}>
              {line.text}
            </div>
          );
        })}

        {/* Input Prompter Row */}
        <div className="flex items-center gap-1 text-white">
          <span className="font-bold select-none">{getWindowsPathString(vfs, currentPathId)}&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 text-white font-mono text-xs md:text-sm caret-white"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            id="windows-cmd-input"
          />
        </div>
      </div>

      {/* Footer bar */}
      <div className="bg-gray-900 px-4 py-1.5 border-t border-gray-800 text-[10px] text-gray-400 select-none flex justify-between">
        <span>Windows Command Line Simulator</span>
        <span>Wpisz cls, aby wyczyścić</span>
      </div>
    </div>
  );
}
