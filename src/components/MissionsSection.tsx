/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SpeechButton from './SpeechButton';
import { 
  Award, 
  CheckCircle2, 
  Circle, 
  Compass, 
  Lock, 
  RefreshCw, 
  Play, 
  Info,
  Sparkles,
  ChevronRight,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import { Mission, Badge } from '../types';
import { MISSIONS, BADGES } from '../utils/missions';

interface MissionsSectionProps {
  completedMissionIds: string[];
  activeMissionId: string | null;
  setActiveMissionId: (id: string | null) => void;
  onLoadMissionState: (mission: Mission, startAsChallenge?: boolean) => void;
  vfs: Record<string, any>;
  currentPathId: string;
  commandHistory: string[];
  totalPoints: number;
  isChallengeActive?: boolean;
  challengeTimeLeft?: number;
  isChallengeMode?: boolean;
  challengeFailed?: boolean;
}

export default function MissionsSection({
  completedMissionIds,
  activeMissionId,
  setActiveMissionId,
  onLoadMissionState,
  vfs,
  currentPathId,
  commandHistory,
  totalPoints,
  isChallengeActive,
  challengeTimeLeft,
  isChallengeMode,
  challengeFailed
}: MissionsSectionProps) {

  // Check if active mission is completed
  const activeMission = MISSIONS.find(m => m.id === activeMissionId);
  
  let isCurrentCompleted = false;
  let progressText = '';
  let hint = '';

  if (activeMission) {
    const checkResult = activeMission.checkCompleted(vfs, currentPathId, commandHistory);
    isCurrentCompleted = checkResult.completed;
    progressText = checkResult.progressText;
    hint = checkResult.hint || '';
  }

  // Helper for difficulty color
  const getDiffBadge = (diff: string) => {
    switch (diff) {
      case 'Łatwy':
        return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">Łatwy</span>;
      case 'Średni':
        return <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100">Średni</span>;
      case 'Trudny':
        return <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-100">Trudny</span>;
      default:
        return null;
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8" id="missions-section-container">
      
      {/* LEFT COLUMN: Quests & Badges List (5 Columns) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Missions Header */}
        <div className="bg-[#ECEFF4] border border-[#D8DEE9] rounded-3xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#5E81AC]" />
            <h3 className="font-bold text-[#2E3440] text-sm md:text-base">Wybierz Zadanie Praktyczne</h3>
          </div>
          <span className="text-xs font-mono font-bold bg-white text-[#5E81AC] px-2.5 py-1 rounded-lg border border-[#D8DEE9]">
            XP: {totalPoints}
          </span>
        </div>

        {/* Missions List */}
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {MISSIONS.map((mission, index) => {
            const isCompleted = completedMissionIds.includes(mission.id);
            const isActive = activeMissionId === mission.id;
            
            return (
              <div
                key={mission.id}
                onClick={() => {
                  setActiveMissionId(mission.id);
                  onLoadMissionState(mission);
                }}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all select-none flex items-center justify-between gap-3 ${
                  isActive 
                    ? 'border-[#5E81AC] bg-[#ECEFF4]/60 shadow-xs font-bold' 
                    : 'border-[#ECEFF4] bg-white hover:border-[#D8DEE9] hover:shadow-xs'
                }`}
                id={`mission-card-${mission.id}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Step status check icon */}
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  )}
                  
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs md:text-sm text-[#2E3440] truncate leading-tight">
                      {mission.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] uppercase font-bold text-gray-400 font-mono">
                        {mission.category === 'windows' ? 'Windows 11' : 'Linux Terminal'}
                      </span>
                      <span className="text-gray-300 text-[10px]">•</span>
                      {getDiffBadge(mission.difficulty)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-[11px] font-mono font-bold text-amber-600">+{mission.points} XP</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Badges Bento-Grid */}
        <div className="bg-white border border-white rounded-3xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-500" />
            <h4 className="font-bold text-[#2E3440] text-sm">Twoja Kolekcja Odznak</h4>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {BADGES.map(badge => {
              // Badge unlocking rules
              let isUnlocked = false;
              if (badge.id === 'badge_quiz' && completedMissionIds.includes('quiz_passed')) isUnlocked = true;
              if (badge.id === 'badge_folder_win' && completedMissionIds.includes('m1_win_folder')) isUnlocked = true;
              if (badge.id === 'badge_clean_win' && completedMissionIds.includes('m3_win_delete')) isUnlocked = true;
              if (badge.id === 'badge_rename_win' && completedMissionIds.includes('m7_win_rename')) isUnlocked = true;
              if (badge.id === 'badge_structure_win' && completedMissionIds.includes('m10_win_subfolder_creation')) isUnlocked = true;
              if (badge.id === 'badge_linux_basic' && completedMissionIds.includes('m4_linux_basics')) isUnlocked = true;
              if (badge.id === 'badge_linux_ninja' && completedMissionIds.includes('m6_linux_ninja')) isUnlocked = true;
              if (badge.id === 'badge_linux_guru' && completedMissionIds.includes('m8_linux_cat') && completedMissionIds.includes('m9_linux_rm')) isUnlocked = true;
              if (badge.id === 'badge_chmod_linux' && completedMissionIds.includes('m11_linux_chmod_basic') && completedMissionIds.includes('m12_linux_chmod_exec')) isUnlocked = true;
              if (badge.id === 'badge_sorting_win' && completedMissionIds.includes('m13_win_sort')) isUnlocked = true;
              
              // Master badge is unlocked if all missions are completed
              const hasAllMissions = MISSIONS.every(m => completedMissionIds.includes(m.id));
              if (badge.id === 'badge_master' && hasAllMissions) isUnlocked = true;

              return (
                <div 
                  key={badge.id}
                  className={`p-2.5 rounded-2xl border text-center relative group select-none transition-all duration-300 ${
                    isUnlocked 
                      ? 'bg-yellow-50/20 border-yellow-300 shadow-xs scale-100' 
                      : 'bg-[#F8FAFC]/50 border-[#ECEFF4] opacity-30 grayscale scale-95'
                  }`}
                  id={`badge-card-${badge.id}`}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <p className="text-[10px] font-bold text-[#2E3440] leading-tight truncate">{badge.title}</p>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-[#2E3440] text-white text-[10px] rounded-xl p-2.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 shadow-xl leading-normal border border-[#4C566A]/20">
                    <p className="font-bold text-amber-300">{badge.title}</p>
                    <p className="mt-0.5 text-gray-200">{badge.description}</p>
                    <p className="mt-1 border-t border-[#4C566A]/50 pt-1 text-[9px] text-[#81A1C1] font-mono">Wymaga: {badge.requirement}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Active Quest Sandbox Details (7 Columns) */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-white shadow-xl p-6 flex flex-col justify-between min-h-[450px] text-[#2E3440]">
        
        {activeMission ? (
          <div className="space-y-6 flex-1 flex flex-col justify-between" id="active-mission-panel">
            <div>
              {/* Mission Badge & Header */}
              <div className="flex items-start justify-between gap-4 border-b border-[#ECEFF4] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="uppercase text-[9px] font-bold text-[#5E81AC] tracking-wider bg-[#ECEFF4] px-2 py-0.5 rounded-md">
                      {activeMission.category === 'windows' ? 'Eksplorator Windows 11' : 'Konsola Ubuntu'}
                    </span>
                    {getDiffBadge(activeMission.difficulty)}
                  </div>
                  <h3 className="text-xl font-extrabold text-[#2E3440] font-sans tracking-tight mt-1.5">
                    {activeMission.title}
                  </h3>
                </div>
                
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-400 block text-[10px] uppercase">Nagroda</span>
                  <span className="text-lg font-bold text-amber-600 font-mono">+{activeMission.points} XP</span>
                </div>
              </div>

              {/* Description */}
              <div className="flex items-start gap-2.5 mt-4">
                <p className="text-gray-600 text-sm leading-relaxed flex-1">
                  {activeMission.description}
                </p>
                <SpeechButton 
                  text={`${activeMission.title}. ${activeMission.description}. Instrukcja krok po kraku: ${activeMission.instructions.join('. ')}`} 
                  size="sm" 
                  className="flex-shrink-0" 
                />
              </div>

              {/* Challenge Mode Interactive Panel */}
              <div className="mt-4">
                {isChallengeActive ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between select-none animate-pulse">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⏱️</span>
                      <div>
                        <h4 className="text-rose-800 font-extrabold text-sm uppercase tracking-wide">Trwa Wyzwanie na Czas!</h4>
                        <p className="text-[11px] text-rose-600 font-semibold">Ukończ misję zanim licznik dojdzie do zera!</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-rose-500 font-bold block uppercase">Zostało:</span>
                      <span className="text-2xl font-black text-rose-700 font-mono tracking-tighter">{challengeTimeLeft}s</span>
                    </div>
                  </div>
                ) : challengeFailed ? (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col gap-3 select-none">
                    <div className="flex items-center gap-3 text-red-800">
                      <span className="text-2xl animate-bounce">😢</span>
                      <div>
                        <h4 className="font-extrabold text-sm uppercase">Czas minął! Nie poddawaj się!</h4>
                        <p className="text-xs font-semibold">Zadanie zresetowało się do stanu początkowego. Spróbuj jeszcze raz!</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onLoadMissionState(activeMission, true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer text-center"
                    >
                      ⏱️ Spróbuj ponownie wyzwania na czas
                    </button>
                  </div>
                ) : !isCurrentCompleted ? (
                  <div className="bg-slate-50 border border-[#D8DEE9]/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <h4 className="font-extrabold text-xs text-[#2E3440] uppercase">Chcesz większego wyzwania?</h4>
                        <p className="text-[11px] text-gray-500 font-semibold">Wykonaj to zadanie na czas (60 sekund) i zgarnij dodatkowe <strong className="text-amber-600">+50 XP bonusu</strong>!</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onLoadMissionState(activeMission, true)}
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wider cursor-pointer text-center flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <span>⏱️ Graj na czas</span>
                    </button>
                  </div>
                ) : isChallengeMode ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2 select-none">
                    <span className="text-xl">🏆</span>
                    <div>
                      <h4 className="text-emerald-800 font-bold text-xs uppercase">Wyzwanie na Czas Zaliczane!</h4>
                      <p className="text-[11px] text-emerald-600 font-semibold">Świetna szybkość! Otrzymałeś premię +50 XP za refleks.</p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Instructions list */}
              <div className="mt-5 space-y-3 bg-[#F8FAFC] p-4 rounded-2xl border border-[#D8DEE9]/50 shadow-2xs">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Instrukcja krok po kroku:</h4>
                <ul className="space-y-2.5 text-xs text-gray-700">
                  {activeMission.instructions.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="bg-[#E5E9F0] text-[#5E81AC] w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Verification Status Area */}
            <div className="mt-6 pt-5 border-t border-[#ECEFF4]">
              
              {/* Verification Card */}
              <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors shadow-2xs ${
                isCurrentCompleted 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-[#FDF6E2] border-amber-200 text-amber-950'
              }`}>
                {isCurrentCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5 animate-bounce" />
                ) : (
                  <RefreshCw className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 animate-spin" />
                )}
                
                <div className="flex-1 text-xs md:text-sm">
                  <p className="font-bold flex items-center gap-1.5">
                    {isCurrentCompleted ? 'Wyzwanie Rozwiązane!' : 'Trwa sprawdzanie kodu w czasie rzeczywistym...'}
                    {isCurrentCompleted && <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300" />}
                  </p>
                  <p className="mt-1 font-semibold">{progressText}</p>
                  
                  {hint && !isCurrentCompleted && (
                    <p className="mt-2 text-amber-700 bg-white/70 px-2 py-1.5 rounded-lg border border-amber-100/50 text-[11px] leading-normal font-mono">
                      💡 <strong>Podpowiedź:</strong> {hint}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Reset State Button */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => onLoadMissionState(activeMission)}
                  className="flex items-center gap-1.5 text-xs text-[#4C566A] hover:text-[#2E3440] font-bold bg-[#ECEFF4] hover:bg-[#E5E9F0] px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                  title="Rozpocznij od nowa i przywróć fabryczne pliki tej misji"
                  id="reset-active-mission-btn"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restartuj zadanie</span>
                </button>
                
                {isCurrentCompleted && (
                  <div className="text-emerald-700 font-bold text-xs bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/50 flex items-center gap-1 select-none animate-pulse">
                    <span>Punkty i odznaka zaliczone!</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 max-w-sm mx-auto select-none" id="no-active-mission-panel">
            <BookOpen className="w-16 h-16 stroke-1 text-indigo-400 mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-gray-800">Rozpocznij Przygodę</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Wybierz jedno z zadań praktycznych z bocznego paska po lewej stronie, aby załadować interaktywną symulację systemu operacyjnego.
            </p>
            <p className="text-[11px] text-[#4C566A] bg-[#F8FAFC] p-3 rounded-2xl border border-[#D8DEE9]/50 mt-4 leading-normal shadow-2xs">
              <strong>Zalecana kolejność:</strong> Zacznij od Teorii i Quizu, potem wykonaj Misje Windows (1-3), a na końcu zmierz się z konsolą Linux (4-6)!
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
