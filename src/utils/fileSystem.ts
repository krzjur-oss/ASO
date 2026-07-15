/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VFSNode } from '../types';

// Helper to generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Default initial Windows VFS
export function createDefaultWindowsVFS(): Record<string, VFSNode> {
  const nodes: Record<string, VFSNode> = {
    'root': { id: 'root', name: 'C:', type: 'directory', parentId: null, createdAt: '2026-07-15 10:00', size: 'Folder' },
    'pulpit': { id: 'pulpit', name: 'Pulpit', type: 'directory', parentId: 'root', createdAt: '2026-07-15 10:05', size: 'Folder' },
    'dokumenty': { id: 'dokumenty', name: 'Dokumenty', type: 'directory', parentId: 'root', createdAt: '2026-07-15 10:05', size: 'Folder' },
    'pobrane': { id: 'pobrane', name: 'Pobrane', type: 'directory', parentId: 'root', createdAt: '2026-07-15 10:05', size: 'Folder' },
    'zdjęcia': { id: 'zdjęcia', name: 'Zdjęcia', type: 'directory', parentId: 'root', createdAt: '2026-07-15 10:05', size: 'Folder' },
    
    // Desktop (Pulpit) items
    'gry_folder': { id: 'gry_folder', name: 'Moje Gry', type: 'directory', parentId: 'pulpit', createdAt: '2026-07-15 11:30', size: 'Folder' },
    'instrukcja_txt': { id: 'instrukcja_txt', name: 'Instrukcja.txt', type: 'file', parentId: 'pulpit', content: 'Witaj w symulatorze systemu Windows 11! Wykonaj zadania, aby zdobyć punkty i odznaki.', createdAt: '2026-07-15 10:10', size: '1 KB' },
    
    // Documents (Dokumenty) items
    'szkola_folder': { id: 'szkola_folder', name: 'Szkoła', type: 'directory', parentId: 'dokumenty', createdAt: '2026-07-15 10:15', size: 'Folder' },
    'przepis_txt': { id: 'przepis_txt', name: 'Przepis_na_naleśniki.txt', type: 'file', parentId: 'dokumenty', content: 'Składniki: mąka, jajka, mleko, szczypta soli. Wymieszaj i smaż na patelni!', createdAt: '2026-07-15 10:45', size: '2 KB' },
    
    // School (Szkoła) items
    'matma_docx': { id: 'matma_docx', name: 'Matematyka_Zadania.docx', type: 'file', parentId: 'szkola_folder', content: '[Dokument MS Word] Zadanie 1: Oblicz pole kwadratu o boku 5 cm.', createdAt: '2026-07-15 12:00', size: '14 KB' },
    'smieci_tmp': { id: 'smieci_tmp', name: 'smieci.tmp', type: 'file', parentId: 'szkola_folder', content: 'Tymczasowe dane do usunięcia w zadaniu.', createdAt: '2026-07-15 12:01', size: '0 KB' },
    
    // Downloads (Pobrane) items
    'minecraft_exe': { id: 'minecraft_exe', name: 'Minecraft_Installer.exe', type: 'file', parentId: 'pobrane', content: 'Instalator gry Minecraft. Kliknij, aby uruchomić.', createdAt: '2026-07-14 18:22', size: '4.2 MB' },
    'obrazek_png': { id: 'obrazek_png', name: 'śmieszny_piesek.png', type: 'file', parentId: 'pobrane', content: '[Obrazek] Uroczy piesek patrzący w kamerę.', createdAt: '2026-07-15 08:05', size: '180 KB' },

    // Pictures (Zdjęcia) items
    'wakacje_jpg': { id: 'wakacje_jpg', name: 'wakacje_2025.jpg', type: 'file', parentId: 'zdjęcia', content: '[Zdjęcie] Piękna plaża, słońce i szum fal.', createdAt: '2025-08-12 15:40', size: '1.2 MB' },
  };
  return nodes;
}

// Default initial Linux VFS
export function createDefaultLinuxVFS(): Record<string, VFSNode> {
  const nodes: Record<string, VFSNode> = {
    'root': { id: 'root', name: '/', type: 'directory', parentId: null, createdAt: '2026-07-15 10:00', size: 'Folder' },
    'home': { id: 'home', name: 'home', type: 'directory', parentId: 'root', createdAt: '2026-07-15 10:01', size: 'Folder' },
    'uczen': { id: 'uczen', name: 'uczen', type: 'directory', parentId: 'home', createdAt: '2026-07-15 10:02', size: 'Folder' },
    
    // Items inside /home/uczen
    'desktop': { id: 'desktop', name: 'Desktop', type: 'directory', parentId: 'uczen', createdAt: '2026-07-15 10:05', size: 'Folder' },
    'documents': { id: 'documents', name: 'Documents', type: 'directory', parentId: 'uczen', createdAt: '2026-07-15 10:05', size: 'Folder' },
    'downloads': { id: 'downloads', name: 'Downloads', type: 'directory', parentId: 'uczen', createdAt: '2026-07-15 10:05', size: 'Folder' },
    
    // Inside Documents
    'notes_txt': { id: 'notes_txt', name: 'welcome.txt', type: 'file', parentId: 'documents', content: 'Witaj w terminalu Ubuntu! Nauka linii poleceń to super moc każdego młodego programisty.', createdAt: '2026-07-15 10:12', size: '150 B' },
    'projekt_py': { id: 'projekt_py', name: 'gra.py', type: 'file', parentId: 'documents', content: 'print("Gra wystartowała!")\nwhile True:\n  print("Rozgrywka...")\n', createdAt: '2026-07-15 10:50', size: '84 B' },
    
    // Inside Downloads
    'linux_iso': { id: 'linux_iso', name: 'ubuntu-desktop.iso', type: 'file', parentId: 'downloads', content: 'Obraz instalacyjny systemu Linux Ubuntu.', createdAt: '2026-07-14 20:10', size: '3.8 GB' },
  };
  return nodes;
}

// Compute path from node up to root
export function getPathNodes(nodes: Record<string, VFSNode>, nodeId: string): VFSNode[] {
  const path: VFSNode[] = [];
  let current: VFSNode | null = nodes[nodeId];
  
  while (current) {
    path.unshift(current); // prepending to get root-to-node order
    if (current.parentId) {
      current = nodes[current.parentId] || null;
    } else {
      current = null;
    }
  }
  return path;
}

// Get path string for Windows (e.g., C:\Dokumenty\Szkoła)
export function getWindowsPathString(nodes: Record<string, VFSNode>, nodeId: string): string {
  const pathNodes = getPathNodes(nodes, nodeId);
  if (pathNodes.length === 0) return 'C:\\';
  
  // First node is usually 'C:' (root)
  const parts = pathNodes.map((n, idx) => {
    if (idx === 0) return n.name; // 'C:'
    return n.name;
  });
  
  if (parts.length === 1) return parts[0] + '\\';
  return parts.join('\\');
}

// Get path string for Linux (e.g., /home/uczen/Documents)
export function getLinuxPathString(nodes: Record<string, VFSNode>, nodeId: string): string {
  const pathNodes = getPathNodes(nodes, nodeId);
  if (pathNodes.length <= 1) return '/';
  
  const parts = pathNodes.map((n, idx) => {
    if (idx === 0) return ''; // root / will be handled by join
    return n.name;
  });
  
  return parts.join('/') || '/';
}

// Check if a node name is valid
export function validateNodeName(name: string, system: 'windows' | 'linux'): { isValid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Nazwa nie może być pusta.' };
  }
  
  if (name.length > 255) {
    return { isValid: false, error: 'Nazwa jest za długa (maksymalnie 255 znaków).' };
  }
  
  if (system === 'windows') {
    // Windows illegal chars: \ / : * ? " < > |
    const illegalChars = /[\\/:*?"<>|]/;
    if (illegalChars.test(name)) {
      return { isValid: false, error: 'Nazwa w systemie Windows nie może zawierać znaków: \\ / : * ? " < > |' };
    }
  } else {
    // Linux illegal chars: / and null char
    if (name.includes('/')) {
      return { isValid: false, error: 'Nazwa w systemie Linux nie może zawierać ukośnika /' };
    }
  }
  
  return { isValid: true };
}

// Get child nodes of a parent directory
export function getChildren(nodes: Record<string, VFSNode>, parentId: string): VFSNode[] {
  return Object.values(nodes).filter(node => node.parentId === parentId);
}

// Check if a file or folder already exists inside parentId
export function nodeExists(nodes: Record<string, VFSNode>, parentId: string, name: string): boolean {
  const children = getChildren(nodes, parentId);
  return children.some(child => child.name.toLowerCase() === name.toLowerCase());
}

// Helper to create format date
export function getCurrentDateString(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}
