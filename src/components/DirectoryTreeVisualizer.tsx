/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Image, 
  Cpu, 
  FileCode, 
  File,
  ChevronDown, 
  ChevronRight,
  Eye,
  EyeOff,
  Network
} from 'lucide-react';
import { VFSNode } from '../types';
import { getChildren } from '../utils/fileSystem';

interface DirectoryTreeVisualizerProps {
  vfs: Record<string, VFSNode>;
  currentPathId: string;
  setCurrentPathId: (id: string) => void;
  system: 'windows' | 'linux';
  selectedFileId?: string | null;
  onSelectFile?: (id: string) => void;
  minimal?: boolean;
}

export default function DirectoryTreeVisualizer({
  vfs,
  currentPathId,
  setCurrentPathId,
  system,
  selectedFileId = null,
  onSelectFile,
  minimal = false
}: DirectoryTreeVisualizerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ root: true });
  const [showFiles, setShowFiles] = useState<boolean>(true);

  // Automatically expand all ancestor folders of currentPathId so the user can always see where they are
  useEffect(() => {
    if (!currentPathId || !vfs[currentPathId]) return;
    
    const parentIds: string[] = [];
    let current: VFSNode | null = vfs[currentPathId];
    
    while (current && current.parentId) {
      parentIds.push(current.parentId);
      current = vfs[current.parentId] || null;
    }
    
    if (parentIds.length > 0) {
      setExpanded(prev => {
        // Only update if there are actually unexpanded parents to avoid unnecessary re-renders
        const needsUpdate = parentIds.some(id => !prev[id]);
        if (!needsUpdate) return prev;
        
        const next = { ...prev };
        parentIds.forEach(id => {
          next[id] = true;
        });
        return next;
      });
    }
  }, [currentPathId]); // Only trigger when currentPathId changes to avoid circular state updates

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleNodeClick = (node: VFSNode) => {
    if (node.type === 'directory') {
      setCurrentPathId(node.id);
    } else if (node.type === 'file' && onSelectFile) {
      onSelectFile(node.id);
    }
  };

  // Render appropriate mini icon for the tree
  const getTreeIcon = (node: VFSNode, isFolderOpen: boolean) => {
    if (node.type === 'directory') {
      return isFolderOpen ? (
        <FolderOpen className="w-4 h-4 text-amber-500 fill-amber-400/20 flex-shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-amber-500 fill-amber-400/10 flex-shrink-0" />
      );
    }

    const name = node.name.toLowerCase();
    if (name.endsWith('.txt')) {
      return <FileText className="w-4 h-4 text-sky-500 flex-shrink-0" />;
    }
    if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
      return <Image className="w-4 h-4 text-teal-500 flex-shrink-0" />;
    }
    if (name.endsWith('.exe')) {
      return <Cpu className="w-4 h-4 text-indigo-500 flex-shrink-0" />;
    }
    if (name.endsWith('.py') || name.endsWith('.html') || name.endsWith('.css')) {
      return <FileCode className="w-4 h-4 text-amber-600 flex-shrink-0" />;
    }
    return <File className="w-4 h-4 text-[#4C566A] flex-shrink-0" />;
  };

  // Helper to trace path coordinates (for drawing visual guide lines)
  const renderNode = (nodeId: string, depth: number): React.ReactNode => {
    const node = vfs[nodeId];
    if (!node) return null;

    const isDirectory = node.type === 'directory';
    const isExpanded = !!expanded[nodeId];
    const isCurrent = currentPathId === nodeId;
    const isSelectedFile = node.type === 'file' && selectedFileId === nodeId;

    // Get child nodes
    const children = getChildren(vfs, nodeId);
    // Sort directories first, then files
    const sortedChildren = [...children].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    // If file rendering is disabled, filter out files
    const displayChildren = showFiles ? sortedChildren : sortedChildren.filter(c => c.type === 'directory');
    const hasChildren = displayChildren.length > 0;

    return (
      <div key={nodeId} className="select-none" id={`tree-node-wrapper-${nodeId}`}>
        {/* Node label bar */}
        <div 
          onClick={() => handleNodeClick(node)}
          className={`group flex items-center py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-150 ${
            isCurrent 
              ? 'bg-[#5E81AC]/15 text-[#5E81AC] font-bold border border-[#5E81AC]/20' 
              : isSelectedFile
                ? 'bg-sky-50 text-sky-700 font-bold border border-sky-100'
                : 'text-[#4C566A] hover:bg-[#ECEFF4]/60 border border-transparent'
          }`}
          style={{ paddingLeft: `${Math.max(8, depth * 16)}px` }}
          id={`tree-node-${nodeId}`}
        >
          {/* Chevron for directories */}
          {isDirectory ? (
            <button 
              onClick={(e) => toggleExpand(nodeId, e)}
              className="p-0.5 hover:bg-[#ECEFF4] rounded-md mr-1 text-[#4C566A] transition-colors focus:outline-none"
              id={`tree-node-chevron-${nodeId}`}
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-4.5 mr-1 block flex-shrink-0"></span> // spacer to align with folders
          )}

          {/* Node Icon */}
          <div className="mr-2">
            {getTreeIcon(node, isExpanded)}
          </div>

          {/* Node Name */}
          <span className="text-xs font-mono truncate flex-1 leading-none flex items-center">
            <span>{node.name === 'root' ? (system === 'windows' ? 'C:' : '/') : node.name}</span>
            {system === 'linux' && node.id !== 'root' && node.id !== 'home' && (
              <span className="ml-1.5 text-[9px] font-mono text-[#5E81AC] font-medium bg-[#5E81AC]/10 px-1 py-0.5 rounded-md">
                {(() => {
                  const perm = node.permissions;
                  if (!perm) return node.type === 'directory' ? 'rwxr-xr-x' : 'rw-r--r--';
                  if (perm === '600') return 'rw-------';
                  if (perm === '700') return 'rwx------';
                  if (perm === '755' || perm === '+x') return 'rwxr-xr-x';
                  return perm;
                })()}
              </span>
            )}
          </span>

          {/* Active Folder Indicator Label */}
          {isCurrent && (
            <span className="ml-2 text-[9px] font-sans font-bold bg-[#5E81AC] text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-90 flex-shrink-0">
              tutaj
            </span>
          )}
        </div>

        {/* Render child nodes recursively */}
        {isDirectory && isExpanded && hasChildren && (
          <div className="relative" id={`tree-children-container-${nodeId}`}>
            {/* Elegant vertical alignment line for directory tree indentation */}
            <div 
              className="absolute left-0 top-0 bottom-1 w-px bg-dashed bg-[#D8DEE9]" 
              style={{ left: `${Math.max(8, depth * 16) + 16}px` }}
            />
            <div className="mt-0.5">
              {displayChildren.map(child => renderNode(child.id, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (minimal) {
    return (
      <div className="flex flex-col text-[#2E3440] w-full" id="directory-tree-visualizer-container-minimal">
        {/* Toggle Files compact button */}
        <div className="flex items-center justify-between pb-1.5 border-b border-[#ECEFF4] mb-2 select-none">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Struktura Dysku</span>
          <button
            onClick={() => setShowFiles(!showFiles)}
            className="text-[10px] font-bold text-[#5E81AC] hover:text-[#4C566A] transition-colors"
            id="tree-toggle-files-btn-minimal"
          >
            {showFiles ? 'Ukryj pliki' : 'Pokaż pliki'}
          </button>
        </div>
        
        {/* Scrollable Tree area */}
        <div className="overflow-y-auto max-h-[300px] pr-1 space-y-0.5 scrollbar-thin scrollbar-thumb-[#4C566A]/20 scrollbar-track-transparent" id="tree-nodes-list-minimal">
          {renderNode('root', 0)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#D8DEE9]/50 shadow-sm p-4 flex flex-col h-full text-[#2E3440]" id="directory-tree-visualizer-container">
      {/* Title block */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ECEFF4] mb-3 select-none">
        <div className="flex items-center gap-2">
          <div className="bg-[#88C0D0]/10 text-[#5E81AC] p-1.5 rounded-xl">
            <Network className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-xs md:text-sm text-[#2E3440] leading-tight">Wizualizacja Drzewa</h4>
            <p className="text-[9px] text-[#4C566A]">Pełna hierarchia dysku w czasie rzeczywistym</p>
          </div>
        </div>

        {/* Toggle Files button */}
        <button
          onClick={() => setShowFiles(!showFiles)}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all shadow-2xs ${
            showFiles 
              ? 'bg-[#ECEFF4] border-[#D8DEE9] text-[#2E3440] hover:bg-[#E5E9F0]' 
              : 'bg-white border-[#D8DEE9] text-[#4C566A] hover:bg-[#ECEFF4]/40'
          }`}
          title={showFiles ? "Ukryj pliki w drzewie" : "Pokaż pliki w drzewie"}
          id="tree-toggle-files-btn"
        >
          {showFiles ? <EyeOff className="w-3.5 h-3.5 text-[#5E81AC]" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
          <span className="hidden md:inline font-semibold text-[10px]">
            {showFiles ? 'Tylko Foldery' : 'Wszystko'}
          </span>
        </button>
      </div>

      {/* Scrollable Tree area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-[#4C566A]/20 scrollbar-track-transparent max-h-[460px]" id="tree-nodes-list">
        {renderNode('root', 0)}
      </div>

      {/* Interactive Helper Footer */}
      <div className="mt-3 pt-3 border-t border-[#ECEFF4] text-[9px] text-[#4C566A] select-none text-center">
        💡 Klikaj foldery w drzewie, aby natychmiast do nich wejść!
      </div>
    </div>
  );
}
