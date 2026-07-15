/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VFSNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  parentId: string | null;
  content?: string; // For files: optional contents
  createdAt: string;
  size?: string; // Friendly file size e.g. "4 KB" or "Folder"
  permissions?: string; // Permissions for Linux (e.g. "rw-r--r--", "755", etc.)
}

export interface VFSState {
  nodes: Record<string, VFSNode>;
}

export interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success';
  timestamp: string;
}

export interface Mission {
  id: string;
  title: string;
  category: 'windows' | 'linux' | 'teoria';
  difficulty: 'Łatwy' | 'Średni' | 'Trudny';
  description: string;
  instructions: string[];
  points: number;
  initialState: {
    system: 'windows' | 'linux';
    currentPathId: string;
    nodes: Record<string, VFSNode>;
  };
  // validation function returns true/false if VFS / state matches mission requirements
  checkCompleted: (nodes: Record<string, VFSNode>, currentPathId: string, commandHistory?: string[]) => {
    completed: boolean;
    progressText: string;
    hint?: string;
  };
  successMessage: string;
}

export interface UserProgress {
  completedMissionIds: string[];
  totalPoints: number;
  unlockedBadges: string[];
  preferredOS: 'windows' | 'linux' | null;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
}
