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
  ShieldAlert,
  Download,
  Laptop
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

  // Footer Legal Modal State ('none' | 'regulamin' | 'licencja')
  const [footerModal, setFooterModal] = useState<'none' | 'regulamin' | 'licencja'>('none');

  // PWA Installation States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [pwaModalOpen, setPwaModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if app is already running in standalone (PWA) mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      setPwaModalOpen(true);
      return;
    }
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Error triggering PWA install:', err);
      setPwaModalOpen(true);
    }
  };

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

  // Stop speaking when assistant is closed or tip changes
  useEffect(() => {
    stopSpeaking();
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

          {/* Right Section: PWA Install + Profile Rank */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* PWA Installation Button */}
            <button
              onClick={handleInstallPWA}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs border cursor-pointer w-full sm:w-auto justify-center ${
                isInstalled 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
              id="pwa-install-header-btn"
              title="Kliknij, aby dowiedzieć się jak zainstalować program na komputerze lub telefonie"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalled ? 'Zainstalowano ✓' : 'Zainstaluj (PWA)'}</span>
            </button>

            {/* Profile Level Rank Status Bar */}
            <div className="flex items-center gap-4 bg-white/50 border border-white/80 p-2.5 sm:p-3 rounded-2xl w-full sm:w-auto">
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
                activeMissionId={activeMissionId}
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
                activeMissionId={activeMissionId}
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
      <footer className="bg-white/60 border-t border-gray-200/80 mt-12 py-8 text-xs text-[#4C566A] no-print" id="app-footer">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 select-none">
          
          {/* Column 1: O programie */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#2E3440] font-bold text-sm">
              <span className="text-lg">💻</span>
              <span>O programie</span>
            </div>
            <p className="leading-relaxed text-gray-600">
              <strong>Akademia Systemów Operacyjnych</strong> to interaktywny symulator systemów plików Windows 11 oraz Linux Ubuntu, stworzony specjalnie dla uczniów szkoły podstawowej. Pomaga opanować zarządzanie plikami, tworzenie folderów, czytanie ścieżek dostępu oraz pisanie poleceń w terminalu poprzez angażujące grywalizacyjne misje.
            </p>
          </div>

          {/* Column 2: O autorze */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#2E3440] font-bold text-sm">
              <span className="text-lg">👨‍🏫</span>
              <span>Autor programu</span>
            </div>
            <div className="leading-relaxed text-gray-600 space-y-1">
              <p className="font-semibold text-[#2E3440]">mgr Krzysztof Jureczek</p>
              <p>Nauczyciel i promotor nowoczesnych metod nauczania informatyki w szkołach.</p>
              <p className="pt-1 flex items-center gap-1">
                <span>📧</span> 
                <a href="mailto:KrzJur@gmail.com" className="text-[#5E81AC] hover:underline">KrzJur@gmail.com</a>
              </p>
              <p className="flex items-center gap-1">
                <span>🐙</span> 
                <a href="https://github.com/krzjur-oss" target="_blank" rel="noopener noreferrer" className="text-[#5E81AC] hover:underline">github.com/krzjur-oss</a>
              </p>
            </div>
          </div>

          {/* Column 3: Regulamin i Licencja */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#2E3440] font-bold text-sm">
              <span className="text-lg">📄</span>
              <span>Zasady i Licencja</span>
            </div>
            <p className="leading-relaxed text-gray-600 mb-2">
              Aplikacja jest dystrybuowana bezpłatnie do użytku domowego oraz edukacyjnego na warunkach autorskiej licencji WLDE.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => setFooterModal('regulamin')}
                className="px-3.5 py-2 bg-white hover:bg-gray-100 text-[#2E3440] font-bold rounded-xl border border-gray-200 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                id="footer-btn-regulamin"
              >
                <span>📜</span> Regulamin i RODO
              </button>
              <button
                onClick={() => setFooterModal('licencja')}
                className="px-3.5 py-2 bg-white hover:bg-gray-100 text-[#2E3440] font-bold rounded-xl border border-gray-200 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                id="footer-btn-licencja"
              >
                <span>⚖️</span> Licencja WLDE
              </button>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 mt-8 pt-6 border-t border-gray-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <p>© 2026 Krzysztof Jureczek. Wszystkie prawa zastrzeżone. Stworzone z myślą o edukacji dzieci.</p>
          <button 
            onClick={handleResetAllProgress}
            className="text-[10px] font-semibold text-rose-500 hover:text-rose-700 hover:underline bg-white/60 px-3 py-1.5 rounded-xl border border-white transition-all shadow-xs cursor-pointer"
            id="global-reset-progress-btn"
          >
            Zresetuj dane nauki
          </button>
        </div>
      </footer>

      {/* REGULAMIN MODAL POPUP */}
      {footerModal === 'regulamin' && (
        <div className="fixed inset-0 bg-[#2E3440]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
          <div className="bg-[#F8FAFC] rounded-3xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-white flex flex-col overflow-hidden text-[#2E3440]">
            
            {/* Modal Header */}
            <div className="bg-[#ECEFF4] border-b border-[#D8DEE9] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📜</span>
                <h3 className="text-lg font-bold text-[#2E3440]">Regulamin i Polityka Prywatności</h3>
              </div>
              <button
                onClick={() => setFooterModal('none')}
                className="text-gray-500 hover:text-gray-800 font-bold p-1 hover:bg-white/80 rounded-lg transition-all"
                title="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-sm leading-relaxed text-[#4C566A]">
              <div>
                <h4 className="text-base font-extrabold text-[#2E3440] mb-1">Regulamin i Polityka Prywatności aplikacji „Akademia Systemów Operacyjnych”</h4>
                <p className="text-xs text-gray-500 font-semibold">Wersja 1.0.0 · obowiązuje od 16 lipca 2026 r.</p>
              </div>

              <div className="border-t border-[#D8DEE9] pt-4 space-y-4">
                <div>
                  <h5 className="font-bold text-[#2E3440] mb-1">§ 1. Postanowienia ogólne</h5>
                  <ul className="list-decimal pl-5 space-y-1">
                    <li>Niniejszy Regulamin określa zasady korzystania z aplikacji <strong>„Akademia Systemów Operacyjnych”</strong> (dalej: „Aplikacja”).</li>
                    <li>Właścicielem, twórcą i jedynym autorem Aplikacji jest <strong>mgr Krzysztof Jureczek</strong> (dalej: „Autor”).</li>
                    <li>Aplikacja dystrybuowana jest na warunkach <strong>Wolnej Licencji Domowo-Edukacyjnej (Zastrzeżonej)</strong> — pełna treść dostępna w Licencji WLDE. Regulamin i Licencja stanowią spójną całość.</li>
                    <li>Korzystanie z Aplikacji oznacza pełną akceptację niniejszego Regulaminu oraz Licencji.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-[#2E3440] mb-1">§ 2. Przeznaczenie Aplikacji</h5>
                  <p>Aplikacja przeznaczona jest wyłącznie do:</p>
                  <ul className="list-decimal pl-5 space-y-1">
                    <li><strong>Użytku domowego / prywatnego</strong> — korzystanie przez osoby fizyczne w celach własnych, w tym rozrywkowych i samokształceniowych.</li>
                    <li><strong>Użytku edukacyjnego</strong> — wykorzystanie w placówkach oświatowych (przedszkola, szkoły, uczelnie, świetlice, placówki opiekuńczo-wychowawcze i terapeutyczne) w ramach zajęć dydaktycznych.</li>
                  </ul>
                  <p className="mt-2 text-xs text-amber-600 font-semibold italic">Wszelkie inne zastosowania, w tym komercyjne, wymagają uprzedniej pisemnej zgody Autora.</p>
                </div>

                <div>
                  <h5 className="font-bold text-[#2E3440] mb-1">§ 3. Zasady korzystania</h5>
                  <ul className="list-decimal pl-5 space-y-1">
                    <li>Aplikacja jest całkowicie bezpłatna dla celów prywatnych i edukacyjnych.</li>
                    <li>Aplikacja nie zawiera reklam, mikropłatności ani płatnych subskrypcji.</li>
                    <li>Użytkownik zobowiązuje się korzystać z Aplikacji zgodnie z jej przeznaczeniem oraz obowiązującym prawem.</li>
                    <li>Zabronione jest podejmowanie działań mogących zakłócić działanie Aplikacji lub narazić innych użytkowników na szkodę.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-[#2E3440] mb-1">§ 4. Prawa autorskie i licencja</h5>
                  <p>Wszelkie prawa do Aplikacji — w tym kod źródłowy, interfejs graficzny, projekt wizualny, treści edukacyjne i dokumentacja — należą wyłącznie do Autora i są chronione prawem autorskim.</p>
                  <div className="bg-white border border-[#D8DEE9] rounded-xl p-3.5 mt-2 text-xs space-y-1">
                    <p className="text-red-500 font-semibold">❌ Zabronione:</p>
                    <p className="text-gray-600 pl-4">Kopiowanie, modyfikowanie, dekompilowanie, rozpowszechnianie, sprzedaż lub komercjalizacja Aplikacji bądź jej części bez pisemnej zgody Autora.</p>
                    <p className="text-emerald-600 font-semibold pt-1">✅ Dozwolone:</p>
                    <p className="text-gray-600 pl-4">Korzystanie z Aplikacji zgodnie z jej przeznaczeniem domowo-edukacyjnym oraz swobodne udostępnianie adresu internetowego do Aplikacji innym osobom.</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-[#2E3440] mb-1">§ 5. Dane i prywatność (RODO / GDPR)</h5>
                  <ul className="list-decimal pl-5 space-y-1">
                    <li>Aplikacja <strong>nie wymaga rejestracji ani logowania</strong> i nie zbiera żadnych danych osobowych na zewnętrznych serwerach.</li>
                    <li>Wszelkie dane wprowadzane do Aplikacji (np. imię ucznia na certyfikacie, zdobyte punkty XP, stan ukończenia misji i quizu) przechowywane są <strong>wyłącznie lokalnie w pamięci przeglądarki użytkownika (localStorage)</strong> i nigdy nie są wysyłane do sieci.</li>
                    <li>Administratorem danych wprowadzanych lokalnie (jeśli dotyczy) jest wyłącznie Użytkownik końcowy (np. szkoła, nauczyciel lub uczeń) — Autor nie ma technicznej możliwości dostępu do tych danych.</li>
                    <li>Aplikacja nie używa marketingowych ani śledzących plików cookie ani zewnętrznych systemów profilowania.</li>
                    <li>Użytkownik może w każdej chwili trwale usunąć swoje dane, czyszcząc historię przeglądarki lub klikając przycisk "Zresetuj dane nauki" w stopce.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-[#2E3440] mb-1">§ 6. Odpowiedzialność</h5>
                  <ul className="list-decimal pl-5 space-y-1">
                    <li>Aplikacja udostępniana jest w stanie „takim, jakim jest” (<em>as is</em>), bez jakichkolwiek gwarancji poprawnego działania we wszystkich środowiskach.</li>
                    <li>Autor nie ponosi odpowiedzialności za utratę danych (np. wskutek wyczyszczenia pamięci podręcznej przeglądarki), błędy działania, ani szkody wynikające z korzystania bądź niemożności korzystania z Aplikacji.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-[#2E3440] mb-1">§ 7. Postanowienia końcowe</h5>
                  <p>W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego oraz ustawy o prawie autorskim i prawach pokrewnych. Wszelkie uwagi prosimy kierować na adres: <span className="font-semibold text-[#5E81AC]">KrzJur@gmail.com</span>.</p>
                </div>
              </div>

              <div className="pt-4 text-center border-t border-[#D8DEE9]">
                <p className="text-xs font-semibold text-[#2E3440]">© 2026 Krzysztof Jureczek · Wszelkie prawa zastrzeżone</p>
              </div>
            </div>

            {/* Modal Footer Close button */}
            <div className="bg-[#ECEFF4] border-t border-[#D8DEE9] px-6 py-4 flex justify-end">
              <button
                onClick={() => setFooterModal('none')}
                className="px-5 py-2 bg-[#5E81AC] hover:bg-[#81A1C1] text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Zamknij i zaakceptuj
              </button>
            </div>

          </div>
        </div>
      )}

      {/* LICENCJA MODAL POPUP */}
      {footerModal === 'licencja' && (
        <div className="fixed inset-0 bg-[#2E3440]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
          <div className="bg-[#F8FAFC] rounded-3xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-white flex flex-col overflow-hidden text-[#2E3440]">
            
            {/* Modal Header */}
            <div className="bg-[#ECEFF4] border-b border-[#D8DEE9] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <h3 className="text-lg font-bold text-[#2E3440]">Licencja Użytkowania (WLDE)</h3>
              </div>
              <button
                onClick={() => setFooterModal('none')}
                className="text-gray-500 hover:text-gray-800 font-bold p-1 hover:bg-white/80 rounded-lg transition-all"
                title="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-sm leading-relaxed text-[#4C566A]">
              <div>
                <h4 className="text-base font-extrabold text-[#2E3440] mb-0.5">Wolna Licencja Domowo-Edukacyjna (Zastrzeżona) — WLDE</h4>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider text-[#5E81AC]">Projekt: Akademia Systemów Operacyjnych (wersja 1.0.0 i wyższe)</p>
                <p className="text-xs text-gray-400 mt-1">Copyright © 2026 Krzysztof Jureczek. Wszelkie prawa zastrzeżone.</p>
              </div>

              <div className="border-t border-[#D8DEE9] pt-4 space-y-4">
                <div className="bg-[#ECEFF4] p-4 rounded-2xl border border-[#D8DEE9] text-xs text-gray-600">
                  <span className="font-bold text-[#2E3440] block mb-1">PREAMBUŁA</span>
                  Niniejsza licencja ma na celu zabezpieczenie niekomercyjnego charakteru projektu <strong>„Akademia Systemów Operacyjnych”</strong>. Intenją Autora jest bezpłatne udostępnienie aplikacji do użytku domowego (prywatnego) oraz placówkom edukacyjnym, przy jednoczesnym pełnym zachowaniu praw autorskich, integralności kodu źródłowego oraz zakazie jakiejkolwiek komercjalizacji, kopiowania, modyfikacji i rozpowszechniania Oprogramowania bez pisemnej zgody Autora.
                </div>

                <div>
                  <h5 className="font-bold text-[#2E3440] mb-1">§ 1. Definicje</h5>
                  <ul className="list-decimal pl-5 space-y-1">
                    <li><strong>Oprogramowanie</strong> – aplikacja „Akademia Systemów Operacyjnych” wraz z kodem źródłowym, grafiką, tekstami, zadaniami, dźwiękami oraz powiązaną dokumentacją.</li>
                    <li><strong>Autor / Licencjodawca</strong> – mgr Krzysztof Jureczek, jedyny twórca i wyłączny dysponent autorskich praw majątkowych i osobistych do Oprogramowania.</li>
                    <li><strong>Użytkownik / Licencjobiorca</strong> – każda osoba fizyczna korzystająca z Oprogramowania prywatnie, a także placówki oświatowo-wychowawcze (np. szkoły podstawowe, świetlice) korzystające z programu w celach dydaktycznych.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-[#2E3440] mb-1">§ 2. Dozwolony użytek (Bezpłatny)</h5>
                  <p>Autor udziela Użytkownikowi bezpłatnej, niewyłącznej, nieprzenoszalnej i ograniczonej licencji na korzystanie z Oprogramowania wyłącznie w następujących celach:</p>
                  <ul className="list-decimal pl-5 space-y-1 mt-1">
                    <li><strong>Użytek domowy / prywatny</strong> – instalowanie i uruchamianie Oprogramowania przez osoby fizyczne na własny, niekomercyjny użytek, w tym cele rozrywkowe i samokształceniowe.</li>
                    <li><strong>Użytek edukacyjny</strong> – wykorzystanie Oprogramowania w placówkach oświatowych (przedszkola, szkoły podstawowe i ponadpodstawowe, uczelnie wyższe, świetlice, placówki opiekuńczo-wychowawcze i terapeutyczne) na zajęciach, lekcjach, wykładach i kołach zainteresowań.</li>
                    <li><strong>Instalacja lokalna</strong> – uruchamianie i przechowywanie Oprogramowania (w tym w trybie offline/PWA, jeśli dotyczy) na urządzeniach własnych Użytkownika lub placówki.</li>
                    <li><strong>Prezentacje niekomercyjne</strong> – publiczne demonstrowanie działania Oprogramowania w celach popularyzacji nauki i technologii, pod warunkiem wskazania autorstwa.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-[#2E3440] mb-1">§ 3. Zakazy i ograniczenia</h5>
                  <p className="font-semibold text-red-500 mb-1">Wszelkie działania wykraczające poza § 2 wymagają uprzedniej, pisemnej zgody Autora. W szczególności surowo zabrania się:</p>
                  <ul className="list-decimal pl-5 space-y-1">
                    <li><strong>Kopiowania kodu</strong> – kopiowania, powielania, pobierania w celu redystrybucji, dekompilacji lub inżynierii wstecznej kodu źródłowego lub skompilowanych plików Oprogramowania.</li>
                    <li><strong>Modyfikacji</strong> – wprowadzania jakichkolwiek zmian w kodzie źródłowym, interfejsie, grafice, logotypach, treściach lub innych zasobach Oprogramowania.</li>
                    <li><strong>Rozpowszechniania</strong> – dystrybuowania, udostępniania, sublicencjonowania, wynajmu, publikowania kopii lub „forków” Oprogramowania osobom trzecim, w tym poprzez publiczne repozytoria (GitHub, GitLab), sklepy z aplikacjami lub inne serwery.</li>
                    <li><strong>Sprzedaży i komercjalizacji</strong> – sprzedaży, pobierania jakichkolwiek opłat za dostęp, instalację lub użytkowanie Oprogramowania, umieszczania go w płatnych pakietach, za bramkami płatniczymi, w serwisach z reklamami czerpiącymi zysk z ruchu użytkowników, ani wykorzystywania go do świadczenia odpłatnych usług.</li>
                    <li><strong>Usuwania oznaczeń autorskich</strong> – usuwania, ukrywania lub modyfikowania informacji o Autorze, prawach autorskich, logotypach oraz odnośników do niniejszej licencji.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-[#2E3440] mb-1">§ 4. Wyłączenie odpowiedzialności</h5>
                  <ul className="list-decimal pl-5 space-y-1">
                    <li>Oprogramowanie dostarczane jest w stanie, w jakim się znajduje („as is”), bez jakichkolwiek gwarancji, wyraźnych lub dorozumianych.</li>
                    <li>Autor nie ponosi odpowiedzialności za jakiekolwiek szkody bezpośrednie, pośrednie lub następcze wynikłe z użytkowania lub niemożności użytkowania Oprogramowania, w tym za utratę postępów nauki.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-[#2E3440] mb-1">§ 5. Rozwiązanie licencji</h5>
                  <p>Naruszenie któregokolwiek z warunków niniejszej licencji skutkuje jej natychmiastowym i automatycznym wygaśnięciem. Użytkownik zobowiązany jest wówczas do zaprzestania korzystania z programu i trwałego usunięcia wszystkich kopii Oprogramowania ze swoich nośników.</p>
                </div>
              </div>

              <div className="pt-4 text-center border-t border-[#D8DEE9]">
                <p className="text-xs text-gray-500">Miejscowość i data sporządzenia: Kraków, lipiec 2026 r.</p>
                <p className="text-xs font-semibold text-[#2E3440] mt-1">mgr Krzysztof Jureczek · github.com/krzjur-oss</p>
              </div>
            </div>

            {/* Modal Footer Close button */}
            <div className="bg-[#ECEFF4] border-t border-[#D8DEE9] px-6 py-4 flex justify-end">
              <button
                onClick={() => setFooterModal('none')}
                className="px-5 py-2 bg-[#5E81AC] hover:bg-[#81A1C1] text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Zamknij i zaakceptuj
              </button>
            </div>

          </div>
        </div>
      )}

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

      {/* PWA INSTALLATION DETAILED EDUCATIONAL MODAL */}
      {pwaModalOpen && (
        <div className="fixed inset-0 bg-[#2E3440]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
          <div className="bg-[#F8FAFC] rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-white flex flex-col overflow-hidden text-[#2E3440]">
            
            {/* Header */}
            <div className="bg-[#ECEFF4] border-b border-[#D8DEE9] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">💻</span>
                <h3 className="text-lg font-bold text-[#2E3440]">Instalacja Aplikacji Offline (PWA)</h3>
              </div>
              <button
                onClick={() => setPwaModalOpen(false)}
                className="text-gray-500 hover:text-gray-800 font-bold p-1 hover:bg-white/80 rounded-lg transition-all"
                title="Zamknij"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-sm leading-relaxed text-[#4C566A]">
              
              {/* Alert explaining Iframe limits */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span>⚠️</span>
                  <span>Ważna informacja o bezpieczeństwie przeglądarki:</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-800">
                  Przeglądarki internetowe (np. Chrome, Edge, Safari) ze względów bezpieczeństwa <strong>blokują automatyczną instalację PWA</strong>, gdy strona jest uruchomiona <strong>wewnątrz ramki (iframe)</strong> w panelu podglądu lub edytorze kodu.
                </p>
                <p className="text-xs font-semibold leading-relaxed text-amber-900">
                  Aby bez problemu zainstalować program na komputerze lub telefonie jako osobną aplikację, kliknij poniższy przycisk, aby otworzyć go bezpośrednio, a następnie skorzystaj z opcji instalacji!
                </p>
                
                <div className="pt-2">
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    <span>🚀</span> Otwórz w nowej karcie
                  </a>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-white border border-[#D8DEE9] rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-[#2E3440] text-xs uppercase tracking-wider text-[#5E81AC]">Status Aplikacji na Twoim urządzeniu:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-lg">📦</span>
                    <div>
                      <p className="font-semibold text-gray-500">Service Worker:</p>
                      <p className="text-emerald-600 font-bold">Zarejestrowany (Działa offline) ✓</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="text-lg">⚙️</span>
                    <div>
                      <p className="font-semibold text-gray-500">Stan instalacji:</p>
                      <p className={isInstalled ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                        {isInstalled ? "Zainstalowano jako aplikację ✓" : "Gotowa do instalacji"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Installation Guide */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-[#2E3440]">Jak zainstalować ręcznie w 3 sekundy?</h4>
                
                <div className="space-y-4 text-xs">
                  {/* Option 1: Chrome / Edge Desktop */}
                  <div className="border-l-4 border-[#5E81AC] pl-4 space-y-1">
                    <p className="font-bold text-[#2E3440] flex items-center gap-1.5 text-xs sm:text-sm">
                      <span>🖥️</span> Na komputerze (Chrome, Edge, Opera)
                    </p>
                    <p className="text-gray-600">
                      Spójrz na pasek adresu URL na samej górze przeglądarki. Po prawej stronie paska (tuż obok gwiazdki do zakładek) zobaczysz ikonę <strong>„Instaluj aplikację”</strong> (mały monitor ze strzałką w dół). Kliknij ją i zatwierdź!
                    </p>
                    <p className="text-gray-500 italic">
                      Alternatywnie: kliknij menu z trzema kropkami <strong className="text-gray-700">⁝</strong> w prawym górnym rogu przeglądarki i wybierz <strong>„Zapisz i zainstaluj” → „Zainstaluj aplikację...”</strong>.
                    </p>
                  </div>

                  {/* Option 2: Android Chrome */}
                  <div className="border-l-4 border-[#A3BE8C] pl-4 space-y-1">
                    <p className="font-bold text-[#2E3440] flex items-center gap-1.5 text-xs sm:text-sm">
                      <span>🤖</span> Na telefonie Android (Chrome)
                    </p>
                    <p className="text-gray-600">
                      Kliknij ikonkę trzech kropek <strong className="text-gray-700">⁝</strong> w prawym górnym rogu Chrome, a następnie wybierz pozycję <strong>„Dodaj do ekranu głównego”</strong> lub <strong>„Zainstaluj aplikację”</strong>.
                    </p>
                  </div>

                  {/* Option 3: iOS Safari (iPhone / iPad) */}
                  <div className="border-l-4 border-[#B48EAD] pl-4 space-y-1">
                    <p className="font-bold text-[#2E3440] flex items-center gap-1.5 text-xs sm:text-sm">
                      <span>🍏</span> Na telefonie iPhone i iPadzie (Safari)
                    </p>
                    <p className="text-gray-600">
                      W dolnym menu Safari kliknij ikonkę <strong>Udostępnij</strong> (kwadrat z wychodzącą strzałką w górę), przewiń menu w dół i wybierz pozycję <strong>„Dodaj do ekranu początkowego”</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Offline mode benefits */}
              <div className="bg-[#ECEFF4] p-4 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-[#2E3440]">Co zyskujesz instalując program?</p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li><strong>Pełne działanie offline:</strong> Możesz uczyć się i grać bez połączenia z internetem na lekcji informatyki.</li>
                  <li><strong>Szybkie uruchamianie:</strong> Własna ikona na pulpicie komputera lub ekranie głównym telefonu.</li>
                  <li><strong>Więcej miejsca na naukę:</strong> Brak pasków przeglądarki oznacza większy i czytelniejszy ekran symulatora!</li>
                </ul>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-[#ECEFF4] border-t border-[#D8DEE9] px-6 py-4 flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase">PWA Akademia SO 1.0.0</span>
              <button
                onClick={() => setPwaModalOpen(false)}
                className="px-5 py-2 bg-[#5E81AC] hover:bg-[#81A1C1] text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Rozumiem
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
