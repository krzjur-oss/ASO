/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Monitor, 
  Terminal as TerminalIcon, 
  Compass, 
  Award, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  RotateCcw,
  User,
  Heart,
  ChevronDown,
  X,
  Printer,
  ShieldAlert
} from 'lucide-react';

import { VFSNode, Mission } from './types';
import { createDefaultWindowsVFS, createDefaultLinuxVFS, getCurrentDateString } from './utils/fileSystem';
import { MISSIONS } from './utils/missions';
import { playClickSound, playSuccessSound, speakText, stopSpeaking } from './utils/audio';

// Component Imports
import TheorySection from './components/TheorySection';
import WindowsExplorer from './components/WindowsExplorer';
import LinuxTerminal from './components/LinuxTerminal';
import MissionsSection from './components/MissionsSection';
import SpeechButton from './components/SpeechButton';

export default function App() {
  
  // Tab Navigation: 'theory' | 'windows' | 'linux' | 'missions' | 'certificate'
  const [activeTab, setActiveTab] = useState<'theory' | 'windows' | 'linux' | 'missions' | 'certificate'>('theory');
  
  // Filesystem States (Separate Windows and Linux instances for clean sandbox behavior)
  const [windowsVfs, setWindowsVfs] = useState<Record<string, VFSNode>>(() => createDefaultWindowsVFS());
  const [windowsPathId, setWindowsPathId] = useState<string>('root');
  
  const [linuxVfs, setLinuxVfs] = useState<Record<string, VFSNode>>(() => createDefaultLinuxVFS());
  const [linuxPathId, setLinuxPathId] = useState<string>('uczen');

  // Helper functions with click sound feedback
  const changeWindowsPathId = (id: string | ((prev: string) => string)) => {
    setWindowsPathId(prev => {
      const next = typeof id === 'function' ? id(prev) : id;
      if (next !== prev) {
        playClickSound();
      }
      return next;
    });
  };

  const changeLinuxPathId = (id: string | ((prev: string) => string)) => {
    setLinuxPathId(prev => {
      const next = typeof id === 'function' ? id(prev) : id;
      if (next !== prev) {
        playClickSound();
      }
      return next;
    });
  };

  // Gamification & Progress States
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [quizDone, setQuizDone] = useState<boolean>(false);

  // Challenge Mode States
  const [isChallengeMode, setIsChallengeMode] = useState<boolean>(false);
  const [challengeTimeLeft, setChallengeTimeLeft] = useState<number>(60);
  const [challengeActive, setChallengeActive] = useState<boolean>(false);
  const [challengeFailed, setChallengeFailed] = useState<boolean>(false);

  // Student Name for Certificate
  const [studentName, setStudentName] = useState<string>('');

  // Floating Assistant "Plikuś" State
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [assistantTipIdx, setAssistantTipIdx] = useState(0);

  // Completed Celebration Modal State
  const [celebrationMission, setCelebrationMission] = useState<Mission | null>(null);

  // Educational helpful tips from Plikuś (in Polish)
  const assistantTips = [
    "Cześć! Jestem Plikuś, Twój pomocnik. Czy wiesz, że słowa 'folder' oraz 'katalog' to dokładnie to samo?",
    "W systemie Windows używamy lewego ukośnika (\\) do opisu ścieżek, a w systemie Linux prawego ukośnika (/). Zapamiętaj to!",
    "Rozszerzenie pliku tekstowego to najczęściej .txt. Pozwala systemowi wiedzieć, że należy go otworzyć w Notatniku.",
    "Komenda 'pwd' w terminalu oznacza 'print working directory', czyli 'wydrukuj obecny katalog roboczy'.",
    "Gdy stworzysz folder komendą 'mkdir' w Linuxie, od razu zobaczysz go na mapie dysku po prawej stronie! To niesamowite!",
    "Chcesz cofnąć się o poziom wyżej w terminalu? Wpisz 'cd ..' (dwie kropki oznaczają folder-rodzica).",
    "W Windows pliki .exe to programy, które można uruchomić. Kliknij dwukrotnie Minecraft_Installer.exe w Pobranych, aby zobaczyć!",
    "Rozwiąż Quiz w dziale Teoria, aby zgarnąć nawet 100 XP i odblokować pierwszą odznakę!"
  ];

  // Rotate assistant tips automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setAssistantTipIdx(prev => (prev + 1) % assistantTips.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Auto-speak tip when assistant is open or tip changes
  useEffect(() => {
    if (assistantOpen) {
      // Delay slightly to allow the transition to finish or UI to settle
      const timer = setTimeout(() => {
        speakText(assistantTips[assistantTipIdx]);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      stopSpeaking();
    }
  }, [assistantOpen, assistantTipIdx]);

  // Challenge Mode Countdown Timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (challengeActive && challengeTimeLeft > 0) {
      intervalId = setInterval(() => {
        setChallengeTimeLeft(prev => {
          if (prev <= 1) {
            setChallengeActive(false);
            setChallengeFailed(true);
            
            // Automatically restart the active mission
            const activeMission = MISSIONS.find(m => m.id === activeMissionId);
            if (activeMission) {
              // Reload initial files
              if (activeMission.initialState.system === 'windows') {
                setWindowsVfs(JSON.parse(JSON.stringify(activeMission.initialState.nodes)));
                setWindowsPathId(activeMission.initialState.currentPathId);
              } else {
                setLinuxVfs(JSON.parse(JSON.stringify(activeMission.initialState.nodes)));
                setLinuxPathId(activeMission.initialState.currentPathId);
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [challengeActive, challengeTimeLeft, activeMissionId]);

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedMissions = localStorage.getItem('edu_completed_missions');
    const savedXP = localStorage.getItem('edu_total_xp');
    const savedQuiz = localStorage.getItem('edu_quiz_done');
    const savedName = localStorage.getItem('edu_student_name');

    if (savedMissions) {
      try {
        setCompletedMissionIds(JSON.parse(savedMissions));
      } catch (e) {
        console.error(e);
      }
    }
    if (savedXP) {
      setTotalPoints(parseInt(savedXP, 10) || 0);
    }
    if (savedQuiz === 'true') {
      setQuizDone(true);
    }
    if (savedName) {
      setStudentName(savedName);
    }
  }, []);

  // Save progress helper
  const saveProgress = (missions: string[], points: number, quizCompleted: boolean) => {
    localStorage.setItem('edu_completed_missions', JSON.stringify(missions));
    localStorage.setItem('edu_total_xp', points.toString());
    localStorage.setItem('edu_quiz_done', quizCompleted ? 'true' : 'false');
  };

  // Add XP helper
  const handleAddXP = (points: number) => {
    setTotalPoints(prev => {
      const next = prev + points;
      saveProgress(completedMissionIds, next, quizDone);
      return next;
    });
  };

  // Set Quiz Completed & Award XP
  const handleQuizDone = (done: boolean) => {
    if (done && !quizDone) {
      setQuizDone(true);
      setCompletedMissionIds(prev => {
        const next = [...prev, 'quiz_passed'];
        saveProgress(next, totalPoints + 100, true);
        return next;
      });
      setTotalPoints(prev => prev + 100);
      
      // Show celebration for quiz
      const mockQuizMission: Mission = {
        id: 'quiz_passed',
        title: 'Quiz Teoretyczny',
        category: 'teoria',
        difficulty: 'Łatwy',
        description: '',
        instructions: [],
        points: 100,
        initialState: { system: 'windows', currentPathId: 'root', nodes: {} },
        checkCompleted: () => ({ completed: true, progressText: '' }),
        successMessage: 'Brawo! Zdałeś test teoretyczny o plikach i systemach operacyjnych. Otrzymujesz odznakę "Mistrz Teorii"!'
      };
      setCelebrationMission(mockQuizMission);
    }
  };

  // Start / Load a Mission
  const handleLoadMissionState = (mission: Mission, startAsChallenge: boolean = false) => {
    setActiveMissionId(mission.id);
    setCommandHistory([]); // clear terminal logs for clean start
    
    setIsChallengeMode(startAsChallenge);
    if (startAsChallenge) {
      setChallengeTimeLeft(60);
      setChallengeActive(true);
      setChallengeFailed(false);
    } else {
      setChallengeActive(false);
      setChallengeFailed(false);
    }
    
    if (mission.initialState.system === 'windows') {
      setWindowsVfs(JSON.parse(JSON.stringify(mission.initialState.nodes)));
      setWindowsPathId(mission.initialState.currentPathId);
      setActiveTab('windows'); // switch to windows simulator automatically!
    } else {
      setLinuxVfs(JSON.parse(JSON.stringify(mission.initialState.nodes)));
      setLinuxPathId(mission.initialState.currentPathId);
      setActiveTab('linux'); // switch to linux simulator automatically!
    }
  };

  // Core verification triggers on file explorer or terminal action
  const handleVerifyActiveMission = (latestCommand?: string) => {
    if (!activeMissionId) return;

    const mission = MISSIONS.find(m => m.id === activeMissionId);
    if (!mission) return;

    // Build the latest history if a terminal command occurred
    let updatedHistory = [...commandHistory];
    if (latestCommand) {
      updatedHistory = [...commandHistory, latestCommand];
      setCommandHistory(updatedHistory);
    }

    const currentVfs = mission.initialState.system === 'windows' ? windowsVfs : linuxVfs;
    const currentPath = mission.initialState.system === 'windows' ? windowsPathId : linuxPathId;

    const checkResult = mission.checkCompleted(currentVfs, currentPath, updatedHistory);

    if (checkResult.completed && !completedMissionIds.includes(mission.id)) {
      // Mission successfully completed!
      playSuccessSound();
      
      const earnedXP = isChallengeMode ? (mission.points + 50) : mission.points;
      
      setCompletedMissionIds(prev => {
        const next = [...prev, mission.id];
        saveProgress(next, totalPoints + earnedXP, quizDone);
        return next;
      });
      setTotalPoints(prev => prev + earnedXP);
      
      // Stop timer
      setChallengeActive(false);
      
      // Wrap with custom success messaging
      const finalMission: Mission = {
        ...mission,
        points: earnedXP,
        successMessage: isChallengeMode 
          ? `🏆 WYZWANIE NA CZAS ZALICZONE! Zyskujesz premię +50 XP za refleks! ${mission.successMessage}`
          : mission.successMessage
      };
      
      setCelebrationMission(finalMission);
      setActiveMissionId(null); // clear active mission track
    }
  };

  // Reset entire educational progress to zero
  const handleResetAllProgress = () => {
    if (window.confirm('Czy na pewno chcesz zresetować całą naukę, punkty i odznaki? Te dane zostaną utracone!')) {
      localStorage.clear();
      setCompletedMissionIds([]);
      setTotalPoints(0);
      setActiveMissionId(null);
      setCommandHistory([]);
      setQuizDone(false);
      setWindowsVfs(createDefaultWindowsVFS());
      setWindowsPathId('root');
      setLinuxVfs(createDefaultLinuxVFS());
      setLinuxPathId('uczen');
      setStudentName('');
      setActiveTab('theory');
    }
  };

  // Save student name changes
  const handleSaveStudentName = (name: string) => {
    setStudentName(name);
    localStorage.setItem('edu_student_name', name);
  };

  // Rank determination
  const getRank = (xp: number) => {
    if (xp >= 450) return { title: 'Inżynier Architekt', level: 6, nextXp: 600, bg: 'bg-amber-600', text: 'text-amber-600' };
    if (xp >= 350) return { title: 'Administrator Sieci', level: 5, nextXp: 450, bg: 'bg-purple-600', text: 'text-purple-600' };
    if (xp >= 250) return { title: 'Mistrz Systemów', level: 4, nextXp: 350, bg: 'bg-rose-600', text: 'text-rose-600' };
    if (xp >= 150) return { title: 'Specjalista ds. Plików', level: 3, nextXp: 250, bg: 'bg-indigo-600', text: 'text-indigo-600' };
    if (xp >= 50) return { title: 'Młodszy Administrator', level: 2, nextXp: 150, bg: 'bg-emerald-600', text: 'text-emerald-600' };
    return { title: 'Kadet Plików', level: 1, nextXp: 50, bg: 'bg-blue-600', text: 'text-blue-600' };
  };

  const currentRank = getRank(totalPoints);
  const xpPercent = Math.min(100, (totalPoints / currentRank.nextXp) * 100);

  // Active mission reference for top banner
  const trackedMission = MISSIONS.find(m => m.id === activeMissionId);

  return (
    <div className="min-h-screen bg-[#E5E9F0] text-[#2E3440] font-sans flex flex-col justify-between p-4 md:p-6" id="app-root">
      
      {/* Print stylesheet override for printable certificate layout */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate-card, #printable-certificate-card * {
            visibility: visible;
          }
          #printable-certificate-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* TOP HEADER */}
      <header className="bg-white/80 backdrop-blur-md rounded-3xl border border-white p-4 md:p-6 shadow-sm mb-6 max-w-7xl mx-auto w-full sticky top-4 z-30 no-print" id="app-header">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo and Titles */}
          <div className="flex items-center gap-3">
            <div className="bg-[#5E81AC] text-white p-3 rounded-2xl shadow-sm flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#2E3440] tracking-tight font-sans">
                Akademia Systemów Operacyjnych
              </h1>
              <p className="text-xs text-[#4C566A] uppercase tracking-widest font-semibold">Panel Edukacyjny • Szkoła Podstawowa</p>
            </div>
          </div>

          {/* Profile Level Rank Status Bar */}
          <div className="flex items-center gap-4 bg-white/50 border border-white/80 p-2.5 sm:p-3 rounded-2xl max-w-sm w-full sm:w-auto">
            <div className="bg-white p-1.5 rounded-xl border border-gray-100/50 shadow-inner hidden sm:block">
              <User className="w-5 h-5 text-[#5E81AC]" />
            </div>
            <div className="text-left select-none flex-grow">
              <div className="flex items-center justify-between gap-3">
                <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider text-[#5E81AC]`}>
                  Level {currentRank.level}: {currentRank.title}
                </span>
                <span className="text-[10px] md:text-xs font-mono font-bold text-[#4C566A]">
                  {totalPoints} / {currentRank.nextXp} XP
                </span>
              </div>
              {/* Level Progress Bar */}
              <div className="w-full sm:w-36 bg-[#D8DEE9] h-2.5 rounded-full overflow-hidden mt-1.5 border border-white/40">
                <div 
                  className="h-full bg-[#88C0D0] transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto w-full space-y-6 no-print">
        
        {/* Active Mission Reminder Top Bar */}
        {trackedMission && (
          <div 
            className="bg-[#5E81AC] text-white px-5 py-3.5 rounded-3xl flex items-center justify-between gap-4 shadow-md animate-fadeIn select-none border border-white/20"
            id="active-mission-banner"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-white/10 p-1.5 rounded-xl flex-shrink-0 animate-pulse">
                <Compass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-[#D8DEE9] tracking-wider">Aktywna Misja:</p>
                <p className="font-bold text-xs sm:text-sm truncate">
                  {trackedMission.title} – <span className="font-normal text-[#ECEFF4]">Zrób zadanie w zakładce poniżej!</span>
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setActiveTab('missions')}
              className="bg-[#88C0D0] hover:bg-[#A3BE8C] text-[#2E3440] font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-colors shadow-sm"
            >
              Zobacz instrukcję
            </button>
          </div>
        )}

        {/* PRIMARY NAVIGATION TABS */}
        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-3xl border border-white shadow-sm overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex-1 py-3 px-4 text-xs md:text-sm font-semibold rounded-2xl whitespace-nowrap transition-all flex items-center justify-center gap-2 ${
              activeTab === 'theory' 
                ? 'bg-white text-[#5E81AC] shadow-xs border border-white font-bold' 
                : 'text-[#4C566A] hover:text-[#2E3440] hover:bg-white/30'
            }`}
            id="tab-btn-theory"
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Lekcja Teorii & Quiz</span>
          </button>
          
          <button
            onClick={() => setActiveTab('windows')}
            className={`flex-1 py-3 px-4 text-xs md:text-sm font-semibold rounded-2xl whitespace-nowrap transition-all flex items-center justify-center gap-2 ${
              activeTab === 'windows' 
                ? 'bg-white text-[#5E81AC] shadow-xs border border-white font-bold' 
                : 'text-[#4C566A] hover:text-[#2E3440] hover:bg-white/30'
            }`}
            id="tab-btn-windows"
          >
            <Monitor className="w-4 h-4" />
            <span>2. Eksplorator Windows 11</span>
          </button>

          <button
            onClick={() => setActiveTab('linux')}
            className={`flex-1 py-3 px-4 text-xs md:text-sm font-semibold rounded-2xl whitespace-nowrap transition-all flex items-center justify-center gap-2 ${
              activeTab === 'linux' 
                ? 'bg-white text-[#5E81AC] shadow-xs border border-white font-bold' 
                : 'text-[#4C566A] hover:text-[#2E3440] hover:bg-white/30'
            }`}
            id="tab-btn-linux"
          >
            <TerminalIcon className="w-4 h-4" />
            <span>3. Terminal Linux Ubuntu</span>
          </button>

          <button
            onClick={() => setActiveTab('missions')}
            className={`flex-1 py-3 px-4 text-xs md:text-sm font-semibold rounded-2xl whitespace-nowrap transition-all flex items-center justify-center gap-2 ${
              activeTab === 'missions' 
                ? 'bg-white text-[#5E81AC] shadow-xs border border-white font-bold' 
                : 'text-[#4C566A] hover:text-[#2E3440] hover:bg-white/30'
            }`}
            id="tab-btn-missions"
          >
            <Compass className="w-4 h-4" />
            <span>4. Zadania & Misje</span>
            {completedMissionIds.length > 0 && (
              <span className="bg-[#A3BE8C] text-[#2E3440] text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                {completedMissionIds.filter(id => id !== 'quiz_passed').length} / {MISSIONS.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex-1 py-3 px-4 text-xs md:text-sm font-semibold rounded-2xl whitespace-nowrap transition-all flex items-center justify-center gap-2 ${
              activeTab === 'certificate' 
                ? 'bg-white text-[#5E81AC] shadow-xs border border-white font-bold' 
                : 'text-[#4C566A] hover:text-[#2E3440] hover:bg-white/30'
            }`}
            id="tab-btn-certificate"
          >
            <Award className="w-4 h-4" />
            <span>5. Twój Certyfikat</span>
            {totalPoints >= 150 && (
              <span className="w-2 h-2 bg-[#88C0D0] rounded-full animate-ping"></span>
            )}
          </button>
        </div>

        {/* ACTIVE MODULE CONTAINER */}
        <div className="min-h-[500px]" id="active-tab-container">
          
          {/* 1. Theory & Quiz */}
          {activeTab === 'theory' && (
            <div className="animate-fadeIn">
              <TheorySection 
                onAddXP={handleAddXP} 
                quizDone={quizDone} 
                setQuizDone={handleQuizDone} 
              />
            </div>
          )}

          {/* 2. Windows Explorer */}
          {activeTab === 'windows' && (
            <div className="animate-fadeIn">
              {/* Optional Active Mission Notice */}
              {trackedMission && trackedMission.category === 'windows' && (
                <div className="bg-white rounded-2xl border border-white text-[#2E3440] p-3.5 mb-4 text-xs font-semibold flex items-center justify-between shadow-sm">
                  <span>🎯 Cel misji: {trackedMission.instructions[2] || trackedMission.title}</span>
                  <span className="text-[10px] bg-[#ECEFF4] text-[#5E81AC] font-bold px-2.5 py-1 rounded-lg border border-[#D8DEE9]">Zrób to poniżej</span>
                </div>
              )}
              <WindowsExplorer 
                vfs={windowsVfs}
                setVfs={setWindowsVfs}
                currentPathId={windowsPathId}
                setCurrentPathId={changeWindowsPathId}
                onAddXP={handleAddXP}
                onActionTriggered={handleVerifyActiveMission}
                isChallengeActive={challengeActive}
                challengeTimeLeft={challengeTimeLeft}
              />
            </div>
          )}

          {/* 3. Linux Terminal */}
          {activeTab === 'linux' && (
            <div className="animate-fadeIn">
              {/* Optional Active Mission Notice */}
              {trackedMission && trackedMission.category === 'linux' && (
                <div className="bg-white rounded-2xl border border-white text-[#2E3440] p-3.5 mb-4 text-xs font-semibold flex items-center justify-between shadow-sm">
                  <span>🎯 Cel misji: {trackedMission.instructions[1] || trackedMission.title}</span>
                  <span className="text-[10px] bg-[#ECEFF4] text-[#5E81AC] font-bold px-2.5 py-1 rounded-lg border border-[#D8DEE9]">Zrób to poniżej</span>
                </div>
              )}
              <LinuxTerminal 
                vfs={linuxVfs}
                setVfs={setLinuxVfs}
                currentPathId={linuxPathId}
                setCurrentPathId={changeLinuxPathId}
                onAddXP={handleAddXP}
                onActionTriggered={handleVerifyActiveMission}
                isChallengeActive={challengeActive}
                challengeTimeLeft={challengeTimeLeft}
              />
            </div>
          )}

          {/* 4. Missions Gamified Hub */}
          {activeTab === 'missions' && (
            <div className="animate-fadeIn">
              <MissionsSection 
                completedMissionIds={completedMissionIds}
                activeMissionId={activeMissionId}
                setActiveMissionId={setActiveMissionId}
                onLoadMissionState={handleLoadMissionState}
                vfs={activeMissionId && MISSIONS.find(m => m.id === activeMissionId)?.initialState.system === 'windows' ? windowsVfs : linuxVfs}
                currentPathId={activeMissionId && MISSIONS.find(m => m.id === activeMissionId)?.initialState.system === 'windows' ? windowsPathId : linuxPathId}
                commandHistory={commandHistory}
                totalPoints={totalPoints}
                isChallengeActive={challengeActive}
                challengeTimeLeft={challengeTimeLeft}
                isChallengeMode={isChallengeMode}
                challengeFailed={challengeFailed}
              />
            </div>
          )}

          {/* 5. Certificate Unlocking Panel */}
          {activeTab === 'certificate' && (
            <div className="animate-fadeIn">
              {totalPoints >= 150 ? (
                <div className="bg-white rounded-3xl border border-white p-6 md:p-8 shadow-lg max-w-4xl mx-auto space-y-8" id="certificate-unlocked-container">
                  
                  {/* Real-time Name configuration block */}
                  <div className="bg-[#ECEFF4] border border-[#D8DEE9] p-5 rounded-2xl space-y-2 select-none text-[#2E3440]">
                    <h4 className="font-bold text-[#5E81AC] text-sm">Wpisz swoje dane do certyfikatu:</h4>
                    <p className="text-xs text-[#4C566A]">Wpisz swoje Imię i Nazwisko poniżej, a system automatycznie naniesie je na dyplom ukończenia szkoły systemów plików!</p>
                    <div className="flex gap-2 max-w-md pt-1">
                      <input 
                        type="text" 
                        value={studentName}
                        onChange={(e) => handleSaveStudentName(e.target.value)}
                        placeholder="np. Jan Kowalski"
                        className="flex-1 px-3 py-2 border border-[#D8DEE9] rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#5E81AC]"
                        id="student-name-input"
                      />
                      <button 
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-[#5E81AC] hover:bg-[#81A1C1] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                        id="print-certificate-top-btn"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Drukuj Dyplom</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Premium printable Certificate layout */}
                  <div 
                    className="border-8 border-[#88C0D0]/30 p-8 md:p-12 rounded-3xl bg-white text-center relative overflow-hidden shadow-xl"
                    id="printable-certificate-card"
                  >
                    {/* Decorative elegant background rings */}
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full border-4 border-[#88C0D0]/10 pointer-events-none"></div>
                    <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full border-4 border-[#88C0D0]/10 pointer-events-none"></div>

                    {/* Badge Icon Emblem */}
                    <div className="mx-auto bg-gradient-to-tr from-[#5E81AC] to-[#81A1C1] w-20 h-20 rounded-full flex items-center justify-center text-white text-4xl shadow-md border-4 border-white mb-6">
                      🎓
                    </div>

                    <p className="text-[#5E81AC] font-bold font-mono tracking-widest text-xs md:text-sm uppercase select-none">
                      AKADEMIA SYSTEMÓW OPERACYJNYCH
                    </p>
                    
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#2E3440] tracking-tight font-sans mt-3">
                      CERTYFIKAT ADMINISTRATORA
                    </h2>
                    
                    <p className="text-xs text-[#4C566A] mt-1 uppercase font-semibold select-none">
                      Młody Mistrz Zarządzania Plikami i Folderami
                    </p>

                    <div className="my-8">
                      <p className="text-sm text-gray-500 italic select-none">Niniejszy dokument poświadcza, że</p>
                      
                      {/* Name placeholder display */}
                      <p className="text-2xl md:text-3xl font-black text-[#5E81AC] border-b-2 border-dashed border-[#D8DEE9] max-w-md mx-auto py-1 mt-2 tracking-tight min-h-[40px]">
                        {studentName || '(Twój podpis)'}
                      </p>
                    </div>

                    <p className="text-xs md:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed select-none">
                      pomyślnie ukończył praktyczny kurs operacji dyskowych. Opanował tworzenie i porządkowanie folderów, rozróżnianie rozszerzeń plików, struktury drzewiaste w systemie <strong>Windows 11</strong> oraz pisanie podstawowych komend administracyjnych w terminalu systemowym <strong>Linux Ubuntu</strong>.
                    </p>

                    {/* Emblems and signatures */}
                    <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto mt-12 pt-8 border-t border-gray-100 text-left select-none">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Wydawca Certyfikatu</span>
                        <span className="text-xs font-bold text-gray-800">Szkolny Wirtualny Profesor</span>
                        <span className="text-[10px] text-[#5E81AC] block font-mono font-bold mt-1">@aistudio-build-academy</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Data ukończenia</span>
                        <span className="text-xs font-bold text-gray-800">{getCurrentDateString().split(' ')[0]}</span>
                        <span className="text-[10px] text-[#A3BE8C] block font-bold mt-1">Status: Aktywny Mistrz ⭐</span>
                      </div>
                    </div>

                    {/* Gold Stamp */}
                    <div className="absolute right-8 bottom-8 bg-[#88C0D0]/10 text-[#5E81AC] border border-[#88C0D0]/30 w-16 h-16 rounded-full flex items-center justify-center text-[10px] font-bold uppercase tracking-tighter text-center leading-none rotate-12 select-none pointer-events-none">
                      A.S.O. MISTRZ 2026
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-white p-8 shadow-lg max-w-md mx-auto text-center space-y-4" id="certificate-locked-container">
                  <div className="bg-gray-100 text-gray-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl border-4 border-white shadow-xs">
                    🔒
                  </div>
                  <h3 className="text-lg font-bold text-[#2E3440]">Certyfikat jest jeszcze zablokowany</h3>
                  <p className="text-xs text-[#4C566A] leading-relaxed">
                    Aby odblokować swój spersonalizowany, oficjalny dyplom ukończenia, musisz zdobyć przynajmniej <strong>150 punktów XP</strong>. 
                  </p>
                  <p className="text-xs text-[#4C566A] bg-[#ECEFF4] p-2.5 rounded-xl border border-[#D8DEE9]">
                    Rozwiąż Quiz teoretyczny (+100 XP) oraz zrób kilka zadań praktycznych w dziale Zadania, a dyplom natychmiast się otworzy!
                  </p>
                  <button
                    onClick={() => setActiveTab('theory')}
                    className="w-full py-2.5 bg-[#5E81AC] hover:bg-[#81A1C1] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Idź zdawać Quiz!
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-transparent py-6 text-center text-xs text-[#4C566A] select-none no-print" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Akademia Systemów Operacyjnych. Stworzone do celów edukacyjnych dla szkół podstawowych.</p>
          <button 
            onClick={handleResetAllProgress}
            className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 hover:underline bg-white/60 px-2.5 py-1 rounded-xl border border-white transition-all shadow-xs"
            id="global-reset-progress-btn"
          >
            Zresetuj dane nauki
          </button>
        </div>
      </footer>

      {/* FLOAT ASSISTANT "PLIKUŚ" RETRO DISK CHAR */}
      {assistantOpen ? (
        <div 
          className="fixed bottom-6 right-6 bg-white border border-white shadow-2xl rounded-3xl p-4 max-w-xs flex gap-3 animate-fadeIn select-none z-40 no-print"
          id="assistant-plikus-card"
        >
          {/* Animated retro floppy/file mascot */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-tr from-[#5E81AC] to-[#81A1C1] text-white text-2xl w-10 h-10 rounded-2xl flex items-center justify-center shadow-md animate-bounce">
              💾
            </div>
            <span className="text-[9px] font-bold text-[#5E81AC] mt-1.5 bg-[#ECEFF4] px-1.5 py-0.5 rounded-lg">PLIKUŚ</span>
          </div>

          <div className="flex-1 text-xs text-[#2E3440]">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-[#4C566A]">Porada profesora:</span>
                <SpeechButton text={assistantTips[assistantTipIdx]} size="xs" />
              </div>
              <button 
                onClick={() => setAssistantOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold p-0.5"
                title="Zamknij pomocnika"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[#4C566A] mt-1 leading-normal italic">
              "{assistantTips[assistantTipIdx]}"
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAssistantOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-tr from-[#5E81AC] to-[#81A1C1] text-white p-3.5 rounded-full shadow-lg hover:shadow-[#5E81AC]/30 hover:scale-105 transition-all z-40 no-print"
          title="Otwórz pomocnika Plikusia"
          id="btn-open-assistant"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      )}

      {/* ANIMATED CONGRATULATION CELEBRATION POPUP MODAL */}
      {celebrationMission && (
        <div className="fixed inset-0 bg-[#2E3440]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 md:p-8 text-center border border-white relative overflow-hidden animate-scaleUp text-[#2E3440]">
            
            {/* Confetti simulation circles */}
            <div className="absolute top-4 left-6 text-xl animate-bounce">🎉</div>
            <div className="absolute top-12 right-8 text-xl animate-bounce">⭐</div>
            <div className="absolute bottom-8 left-12 text-lg">✨</div>

            <div className="w-16 h-16 bg-[#A3BE8C]/20 border-4 border-white text-[#A3BE8C] rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
              ✔
            </div>

            <h3 className="text-2xl font-black text-[#2E3440] tracking-tight font-sans">
              Zadanie Rozwiązane!
            </h3>
            
            <p className="text-xs uppercase font-bold text-[#5E81AC] tracking-wider mt-1 bg-[#ECEFF4] inline-block px-2.5 py-0.5 rounded-full">
              {celebrationMission.title}
            </p>

            <p className="text-sm text-[#4C566A] leading-relaxed mt-4">
              {celebrationMission.successMessage}
            </p>

            {/* Reward Summary */}
            <div className="mt-6 bg-[#ECEFF4]/50 border border-[#D8DEE9] p-4 rounded-2xl flex items-center justify-around">
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Nagroda</span>
                <span className="text-xl font-black text-[#5E81AC] font-mono">+{celebrationMission.points} XP</span>
              </div>
              <div className="h-8 w-px bg-[#D8DEE9]"></div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Nowy Status</span>
                <span className="text-xs font-bold text-[#2E3440]">{getRank(totalPoints).title}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setCelebrationMission(null);
                setActiveTab('missions'); // go to mission list to choose next
              }}
              className="w-full py-3 bg-[#5E81AC] hover:bg-[#81A1C1] text-white font-bold rounded-2xl text-xs mt-6 transition-colors shadow-md shadow-[#5E81AC]/20"
              id="celebration-confirm-btn"
            >
              Świetnie, lećmy dalej!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
