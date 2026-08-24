/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import SpeechButton from './SpeechButton';
import { 
  BookOpen, 
  Folder, 
  FileText, 
  Terminal, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Award,
  ChevronRight,
  Info,
  Monitor,
  Trash2,
  Smile,
  Gamepad2,
  Keyboard,
  Search,
  Copy,
  Check,
  Sparkles,
  Filter,
  Layers,
  Zap,
  Laptop,
  Command
} from 'lucide-react';

interface TheorySectionProps {
  onAddXP: (points: number) => void;
  quizDone: boolean;
  setQuizDone: (done: boolean) => void;
}

export interface ShortcutItem {
  id: string;
  action: string;
  category: 'files' | 'navigation' | 'terminal' | 'clipboard';
  categoryLabel: string;
  windowsKeys: string[];
  linuxKeys: string[];
  description: string;
  proTip: string;
  level: 'Podstawowy' | 'Średni' | 'Zaawansowany';
  badgeColor: string;
}

export const SHORTCUTS_DATA: ShortcutItem[] = [
  {
    id: 'sc_new_folder',
    action: 'Tworzenie nowego folderu',
    category: 'files',
    categoryLabel: 'Pliki i Katalogi',
    windowsKeys: ['Ctrl', 'Shift', 'N'],
    linuxKeys: ['Ctrl', 'Shift', 'N', '(lub komenda: mkdir)'],
    description: 'Błyskawicznie tworzy pusty nowy katalog w aktualnie otwartym folderze lub w wierszu poleceń.',
    proTip: 'Nie musisz klikać prawym przyciskiem myszy i szukać w menu. Ten skrót działa natychmiast w Eksploratorze Windows i w menedżerze plików Nautilus!',
    level: 'Podstawowy',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'sc_rename',
    action: 'Zmiana nazwy pliku lub folderu',
    category: 'files',
    categoryLabel: 'Pliki i Katalogi',
    windowsKeys: ['F2'],
    linuxKeys: ['F2', '(lub komenda: mv)'],
    description: 'Włącza tryb szybkiej edycji nazwy zaznaczonego elementu.',
    proTip: 'Klawisz F2 chroni przed przypadkowym otwarciem pliku, które często zdarza się przy zbyt szybkim klikaniu myszką.',
    level: 'Podstawowy',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'sc_delete_perm',
    action: 'Trwałe usuwanie pliku (z pominięciem Kosza)',
    category: 'files',
    categoryLabel: 'Pliki i Katalogi',
    windowsKeys: ['Shift', 'Delete'],
    linuxKeys: ['Shift', 'Delete', '(lub komenda: rm)'],
    description: 'Kasuje plik od razu na stałe bez umieszczania go w buforze Kosza systemowego.',
    proTip: 'Używaj rozważnie! Plików usuniętych tą kombinacją nie da się przywrócić z Kosza jednym kliknięciem.',
    level: 'Średni',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'sc_copy',
    action: 'Kopiowanie do schowka',
    category: 'clipboard',
    categoryLabel: 'Schowek i Edycja',
    windowsKeys: ['Ctrl', 'C'],
    linuxKeys: ['Ctrl', 'C', '(w Terminalu: Ctrl + Shift + C)'],
    description: 'Kopiuje zaznaczony plik, folder lub fragment tekstu do pamięci podręcznej (RAM).',
    proTip: 'Ważna różnica: w terminalu Linux samo Ctrl+C przerywa działający program, dlatego do kopiowania tekstu w oknie konsoli wciskamy Ctrl+Shift+C!',
    level: 'Podstawowy',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'sc_paste',
    action: 'Wklejanie ze schowka',
    category: 'clipboard',
    categoryLabel: 'Schowek i Edycja',
    windowsKeys: ['Ctrl', 'V'],
    linuxKeys: ['Ctrl', 'V', '(w Terminalu: Ctrl + Shift + V)'],
    description: 'Wstawia skopiowany wcześniej obiekt do bieżącej lokalizacji lub edytowanego dokumentu.',
    proTip: 'W terminalu Linux wklejanie skryptów i poleceń ze schowka wykonujemy za pomocą Ctrl+Shift+V lub środkowego przycisku myszy.',
    level: 'Podstawowy',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'sc_cut',
    action: 'Wytnij (przenoszenie obiektu)',
    category: 'clipboard',
    categoryLabel: 'Schowek i Edycja',
    windowsKeys: ['Ctrl', 'X'],
    linuxKeys: ['Ctrl', 'X', '(lub komenda: mv plik cel/)'],
    description: 'Przygotowuje plik lub tekst do przeniesienia (po wklejeniu znika z pierwotnego miejsca).',
    proTip: 'Najszybsza metoda reorganizacji dysku: Ctrl+X w starym folderze, przejście do nowego i Ctrl+V.',
    level: 'Podstawowy',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'sc_select_all',
    action: 'Zaznacz wszystkie pliki w folderze',
    category: 'files',
    categoryLabel: 'Pliki i Katalogi',
    windowsKeys: ['Ctrl', 'A'],
    linuxKeys: ['Ctrl', 'A'],
    description: 'Zaznacza wszystkie pliki, podfoldery lub całą zawartość dokumentu tekstowego.',
    proTip: 'Używaj przed masowym kopiowaniem lub przenoszeniem setek plików naraz.',
    level: 'Podstawowy',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'sc_search',
    action: 'Wyszukiwanie plików i folderów',
    category: 'navigation',
    categoryLabel: 'Nawigacja i Eksplorator',
    windowsKeys: ['Ctrl', 'F', 'lub', 'F3'],
    linuxKeys: ['Ctrl', 'F', '(lub komenda: find / grep)'],
    description: 'Aktywuje pole szukania i pozwala filtrować po nazwach oraz rozszerzeniach (np. *.pdf).',
    proTip: 'W Eksploratorze Windows naciśnięcie Ctrl+F lub F3 od razu ustawia kursor w polu wyszukiwania u góry.',
    level: 'Podstawowy',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'sc_open_explorer',
    action: 'Otwarcie nowego okna Menedżera plików',
    category: 'navigation',
    categoryLabel: 'Nawigacja i Eksplorator',
    windowsKeys: ['Win', 'E', 'lub', 'Ctrl', 'N'],
    linuxKeys: ['Super', 'E', 'lub', 'Ctrl', 'N'],
    description: 'Otwiera nowe okno Eksploratora plików / Nautilus z dowolnego miejsca w systemie.',
    proTip: 'Skrót Win + E to najpopularniejszy skrót administratorów Windows do natychmiastowego dostępu do dysków.',
    level: 'Podstawowy',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'sc_properties',
    action: 'Właściwości pliku / atrybuty i rozmiar',
    category: 'files',
    categoryLabel: 'Pliki i Katalogi',
    windowsKeys: ['Alt', 'Enter'],
    linuxKeys: ['Alt', 'Enter', '(lub komenda: ls -l)'],
    description: 'Otwiera okno szczegółowych właściwości, atrybutów, rozmiaru na dysku i uprawnień.',
    proTip: 'Zamiast klikać prawym przyciskiem myszy i wybierać "Właściwości", zaznacz plik i wciśnij Alt+Enter.',
    level: 'Średni',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'sc_up_dir',
    action: 'Przejście do folderu nadrzędnego (w górę)',
    category: 'navigation',
    categoryLabel: 'Nawigacja i Eksplorator',
    windowsKeys: ['Alt', '↑ (Góra)'],
    linuxKeys: ['Alt', '↑ (Góra)', '(lub komenda: cd ..)'],
    description: 'Przechodzi o jeden poziom wyżej w hierarchii drzewa katalogów.',
    proTip: 'W terminalu odpowiada temu polecenie cd .. (dwie kropki oznaczają katalog nadrzędny).',
    level: 'Podstawowy',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'sc_tab_autocomplete',
    action: 'Autouzupełnianie nazw plików i komend (Tab)',
    category: 'terminal',
    categoryLabel: 'Terminal i Konsola',
    windowsKeys: ['Tab (w CMD / PowerShell)'],
    linuxKeys: ['Tab (w Bash / Terminal)'],
    description: 'Automatycznie dopełnia nazwę pliku, katalogu lub polecenia po wpisaniu pierwszych liter.',
    proTip: 'Najważniejszy klawisz w terminalu! Dwukrotne naciśnięcie klawisza Tab wyświetla listę wszystkich pasujących plików.',
    level: 'Zaawansowany',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'sc_clear_screen',
    action: 'Czyszczenie ekranu terminala',
    category: 'terminal',
    categoryLabel: 'Terminal i Konsola',
    windowsKeys: ['cls'],
    linuxKeys: ['Ctrl', 'L', '(lub komenda: clear)'],
    description: 'Błyskawicznie przewija i oczyszcza widok konsoli ze starych komunikatów.',
    proTip: 'Wciśnięcie Ctrl+L w terminalu Linux nie kasuje historii, lecz czyści ekran i umieszcza znak zachęty na samej górze.',
    level: 'Średni',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'sc_sigint_cancel',
    action: 'Przerwanie działającego procesu / skryptu',
    category: 'terminal',
    categoryLabel: 'Terminal i Konsola',
    windowsKeys: ['Ctrl', 'C'],
    linuxKeys: ['Ctrl', 'C'],
    description: 'Wysyła sygnał przerwania (SIGINT), natychmiast zatrzymując zablokowany program lub pętlę.',
    proTip: 'Niezbędny skrót, gdy program się zawiesi, wyświetla zbyt dużo tekstu (np. ping / cat) lub działa w nieskończoność.',
    level: 'Średni',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'sc_clear_line',
    action: 'Wyczyszczenie wpisywanego wiersza komendy',
    category: 'terminal',
    categoryLabel: 'Terminal i Konsola',
    windowsKeys: ['Esc'],
    linuxKeys: ['Ctrl', 'U'],
    description: 'Usuwa cały wpisany tekst w bieżącym wierszu od kursora do początku linii.',
    proTip: 'Zamiast 40 razy wciskać Backspace przy pomyłce w długiej ścieżce, wciśnij Ctrl+U w Linuxie lub Esc w Windows!',
    level: 'Zaawansowany',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'sc_history_search',
    action: 'Przeszukiwanie historii wpisanych komend',
    category: 'terminal',
    categoryLabel: 'Terminal i Konsola',
    windowsKeys: ['F7', 'lub', '↑ / ↓'],
    linuxKeys: ['Ctrl', 'R', 'lub', '↑ / ↓'],
    description: 'Pozwala błyskawicznie odnaleźć i ponownie uruchomić komendę wpisaną wcześniej.',
    proTip: 'Wciśnij Ctrl+R w terminalu Linux i zacznij pisać fragment komendy – system sam odnajdzie ją w historii!',
    level: 'Zaawansowany',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'sc_open_terminal',
    action: 'Szybkie uruchomienie okna Terminala',
    category: 'navigation',
    categoryLabel: 'Nawigacja i Eksplorator',
    windowsKeys: ['Win', 'X', '→', 'T'],
    linuxKeys: ['Ctrl', 'Alt', 'T'],
    description: 'Błyskawicznie uruchamia nowe okno konsoli/terminala z poziomu pulpitu.',
    proTip: 'W Ubuntu Linux kombinacja Ctrl+Alt+T to najpopularniejszy skrót klawiszowy na świecie!',
    level: 'Średni',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    id: 'sc_lock_screen',
    action: 'Blokada stacji roboczej (Bezpieczeństwo)',
    category: 'navigation',
    categoryLabel: 'Nawigacja i Eksplorator',
    windowsKeys: ['Win', 'L'],
    linuxKeys: ['Super', 'L'],
    description: 'Natychmiast blokuje ekran komputera, chroniąc otwarte pliki przed osobami postronnymi.',
    proTip: 'Złota zasada każdego administratora: odchodząc od biurka, zawsze blokuj ekran skrótem Win+L!',
    level: 'Podstawowy',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  }
];

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const ALL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Który ukośnik (separator) jest używany do zapisu ścieżek w systemie Windows 11?',
    options: [
      'Ukośnik prawy / (slash)',
      'Ukośnik lewy \\ (backslash)',
      'Dwukropek ::'
    ],
    correct: 1,
    explanation: 'W systemie Windows ścieżki rozdzielamy lewym ukośnikiem (np. C:\\Dokumenty), natomiast w systemie Linux prawym ukośnikiem (np. /home/uczen).'
  },
  {
    id: 2,
    question: 'Co oznacza komenda "mkdir" w terminalu Linux Ubuntu?',
    options: [
      'Usuń folder (make delete)',
      'Stwórz nowy plik tekstowy (make document)',
      'Stwórz nowy katalog / folder (make directory)'
    ],
    correct: 2,
    explanation: '"mkdir" to skrót od "make directory" i służy do tworzenia nowych folderów.'
  },
  {
    id: 3,
    question: 'Jakie rozszerzenie pliku odpowiada zazwyczaj za zwykły dokument tekstowy (Notatnik)?',
    options: [
      '.txt',
      '.png',
      '.exe'
    ],
    correct: 0,
    explanation: 'Rozszerzenie .txt to zwykły plik tekstowy, .png to obrazek, a .exe to program wykonywalny w Windows.'
  },
  {
    id: 4,
    question: 'Co oznacza specjalna nazwa folderu zapisywana jako dwie kropki ".." w ścieżce lub poleceniu "cd .."?',
    options: [
      'Obecny folder, w którym się znajdujemy',
      'Folder nadrzędny (poziom wyżej w strukturze)',
      'Kosz z usuniętymi plikami'
    ],
    correct: 1,
    explanation: '".." (dwie kropki) reprezentują folder o poziom wyżej (rodzica). Jedna kropka "." reprezentuje bieżący katalog.'
  },
  {
    id: 5,
    question: '👦👧 Wyobraź sobie, że folder na komputerze to pudełko na zabawki. Czym w takim razie są pliki?',
    options: [
      'Innymi pustymi pudełkami',
      'Konkretnymi zabawkami włożonymi do środka (np. rysunkiem, piosenką lub grą)',
      'Ekranem i obudową komputera'
    ],
    correct: 1,
    explanation: 'Wspaniale! Foldery to szafki lub pudełka, a pliki to konkretne rzeczy włożone do środka (np. Twój rysunek lub piosenka).'
  },
  {
    id: 6,
    question: '🗑️ Do czego służy magiczny Kosz na komputerze?',
    options: [
      'Do grania w koszykówkę na pulpicie',
      'Do chowania najgorszych ocen ze szkoły',
      'Na niepotrzebne rzeczy, które można z niego jeszcze wyratować, zanim znikną na zawsze'
    ],
    correct: 2,
    explanation: 'Super! Kosz to bezpieczny śmietnik – pliki tam czekają i możesz je jeszcze odzyskać, zanim opróżnisz kosz na stałe.'
  },
  {
    id: 7,
    question: '🐧 Jaką rolę pełni główny katalog "/" (ukośnik) w systemie Linux?',
    options: [
      'To folder domowy zalogowanego użytkownika',
      'To korzeń (root) – początek całej struktury plików i folderów',
      'To folder przeznaczony tylko na tymczasowe pliki'
    ],
    correct: 1,
    explanation: 'Główny ukośnik "/" to tzw. korzeń (root) w systemie Linux. Wszystkie inne foldery na komputerze znajdują się wewnątrz niego.'
  },
  {
    id: 8,
    question: '💿 Jeśli gra nazywa się "gra.exe", co oznacza część ".exe" na samym końcu?',
    options: [
      'To tajny szyfr, który komputer sam wymyślił',
      'To rozszerzenie pliku, które mówi komputerowi, że to program do uruchomienia',
      'To skrót od słowa "ekstra"'
    ],
    correct: 1,
    explanation: 'Rozszerzenie .exe (skrót od "executable") oznacza plik wykonywalny, czyli samodzielny program lub grę komputerową.'
  },
  {
    id: 9,
    question: '⌨️ Która komenda w terminalu Linux służy do pokazania listy wszystkich plików w obecnym folderze?',
    options: [
      'ls',
      'cd',
      'mkdir'
    ],
    correct: 0,
    explanation: 'Komenda "ls" (skrót od "list") służy do otwierania oczu i sprawdzania, jakie pliki oraz foldery znajdują się w bieżącym miejscu.'
  },
  {
    id: 10,
    question: '🗺️ Co to jest "Ścieżka dostępu" (path) do pliku w komputerze?',
    options: [
      'Droga, którą płynie prąd do monitora',
      'Dokładny adres pokazujący, przez jakie foldery trzeba po kolei przejść, by znaleźć dany plik',
      'Hasło zabezpieczające komputer przed wirusami'
    ],
    correct: 1,
    explanation: 'Ścieżka dostępu to taki drogowskaz lub dokładny adres domowy pliku, np. C:\\Szkola\\Zadania\\rysunek.png.'
  },
  {
    id: 11,
    question: '🔗 Co się stanie, jeśli usuniesz skrót do programu z Pulpitu (np. ikonę z małą strzałką)?',
    options: [
      'Cały program zostanie skasowany z dysku i stracisz go',
      'Usuniesz tylko szybką drogę (drogowskaz), a sam program nadal leży bezpiecznie na dysku',
      'Komputer automatycznie się zresetuje i zablokuje'
    ],
    correct: 1,
    explanation: 'Skrót to tylko drogowskaz z charakterystyczną strzałką. Jeśli go usuniesz, program nadal jest zainstalowany i bezpieczny!'
  },
  {
    id: 12,
    question: '💾 Gdzie przechowywane są pliki i system operacyjny, gdy wyłączymy komputer?',
    options: [
      'W pamięci operacyjnej RAM',
      'Na dysku twardym (HDD lub SSD)',
      'W głośnikach komputerowych'
    ],
    correct: 1,
    explanation: 'Dysk twardy (HDD/SSD) to trwała pamięć komputera. Dane na nim pozostają bezpieczne nawet po odłączeniu zasilania.'
  },
  {
    id: 13,
    question: '⌨️ Jaki klawisz pozwala błyskawicznie zmienić nazwę zaznaczonego pliku (np. w Eksploratorze Windows i Linuxie)?',
    options: [
      'Klawisz F2',
      'Klawisz Spacja',
      'Klawisz Caps Lock'
    ],
    correct: 0,
    explanation: 'Klawisz F2 włącza tryb edycji nazwy pliku lub folderu, chroniąc przed przypadkowym dwuklikiem otwierającym plik!'
  },
  {
    id: 14,
    question: '⚡ Dlaczego w terminalu Linux do kopiowania tekstu używamy Ctrl + Shift + C zamiast samego Ctrl + C?',
    options: [
      'Bo Linux nie pozwala na zwykłe kopiowanie tekstu',
      'Bo kombinacja Ctrl + C służy w terminalu do natychmiastowego przerwania/zatrzymania programu (SIGINT)',
      'Bo klawisz Shift sprawia, że litery kopiują się w kolorze zielonym'
    ],
    correct: 1,
    explanation: 'W konsoli Linux skrót Ctrl+C wysyła sygnał przerwania procesu (SIGINT), dlatego do operacji schowka klawiatura wymaga dodatkowego klawisza Shift (Ctrl+Shift+C / Ctrl+Shift+V).'
  }
];

function getRandomSubset<T>(array: T[], size: number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled.slice(0, size);
}

export default function TheorySection({ onAddXP, quizDone, setQuizDone }: TheorySectionProps) {
  const [activeTab, setActiveTab] = useState<'basics' | 'paths' | 'terminal' | 'shortcuts' | 'quiz'>('basics');
  
  // Shortcuts interactive state
  const [shortcutCategory, setShortcutCategory] = useState<'all' | 'files' | 'navigation' | 'terminal' | 'clipboard'>('all');
  const [shortcutOS, setShortcutOS] = useState<'all' | 'windows' | 'linux'>('all');
  const [shortcutSearch, setShortcutSearch] = useState<string>('');
  const [copiedShortcutId, setCopiedShortcutId] = useState<string | null>(null);
  const [testedShortcuts, setTestedShortcuts] = useState<Record<string, boolean>>({});

  const handleTestOrCopy = (shortcut: ShortcutItem) => {
    const textToCopy = `[${shortcut.action}] Windows: ${shortcut.windowsKeys.join(' + ')} | Linux: ${shortcut.linuxKeys.join(' ')}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    
    setCopiedShortcutId(shortcut.id);
    setTimeout(() => {
      setCopiedShortcutId(null);
    }, 2200);

    if (!testedShortcuts[shortcut.id]) {
      setTestedShortcuts(prev => ({ ...prev, [shortcut.id]: true }));
      onAddXP(5);
    }
  };

  const filteredShortcuts = SHORTCUTS_DATA.filter(sc => {
    if (shortcutCategory !== 'all' && sc.category !== shortcutCategory) {
      return false;
    }
    const query = shortcutSearch.toLowerCase().trim();
    if (query !== '') {
      const matchAction = sc.action.toLowerCase().includes(query);
      const matchDesc = sc.description.toLowerCase().includes(query);
      const matchTip = sc.proTip.toLowerCase().includes(query);
      const matchCategory = sc.categoryLabel.toLowerCase().includes(query);
      const matchWin = sc.windowsKeys.some(k => k.toLowerCase().includes(query));
      const matchLin = sc.linuxKeys.some(k => k.toLowerCase().includes(query));
      if (!matchAction && !matchDesc && !matchTip && !matchCategory && !matchWin && !matchLin) {
        return false;
      }
    }
    return true;
  });
  
  // Quiz State
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(() => {
    return getRandomSubset(ALL_QUIZ_QUESTIONS, 5);
  });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (checked) return;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleCheckQuiz = () => {
    let rightAnswers = 0;
    activeQuestions.forEach(q => {
      if (answers[q.id] === q.correct) {
        rightAnswers++;
      }
    });
    setScore(rightAnswers);
    setChecked(true);
    
    if (!quizDone) {
      setQuizDone(true);
      // Award XP for taking quiz: 20 XP per correct answer (max 100 XP)
      const xpEarned = rightAnswers * 20;
      onAddXP(xpEarned);
    }
  };

  const handleResetQuiz = () => {
    setAnswers({});
    setChecked(false);
    setScore(0);
    setActiveQuestions(getRandomSubset(ALL_QUIZ_QUESTIONS, 5));
  };

  return (
    <div className="bg-white rounded-3xl border border-white shadow-xl overflow-hidden text-[#2E3440]" id="theory-section-container">
      {/* Upper bar */}
      <div className="bg-[#5E81AC] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-sans tracking-tight">Akademia Systemów Operacyjnych</h2>
            <p className="text-sm text-sky-100">Naucz się podstaw zarządzania plikami i folderami, a potem zdobądź Certyfikat!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 self-start md:self-auto">
          <Award className="w-5 h-5 text-yellow-300 animate-bounce" />
          <span className="text-sm font-semibold">Quiz z nagrodą: do +100 XP!</span>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-[#ECEFF4] overflow-x-auto bg-[#F8FAFC]">
        <button
          onClick={() => setActiveTab('basics')}
          className={`flex-1 py-4 px-5 text-sm font-bold border-b-2 text-center whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'basics'
              ? 'border-[#5E81AC] text-[#5E81AC] bg-white shadow-sm'
              : 'border-transparent text-[#4C566A] hover:text-[#2E3440] hover:bg-[#ECEFF4]/50'
          }`}
          id="tab-basics-btn"
        >
          <Folder className="w-4 h-4" />
          1. Pliki i Katalogi
        </button>
        <button
          onClick={() => setActiveTab('paths')}
          className={`flex-1 py-4 px-5 text-sm font-bold border-b-2 text-center whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'paths'
              ? 'border-[#5E81AC] text-[#5E81AC] bg-white shadow-sm'
              : 'border-transparent text-[#4C566A] hover:text-[#2E3440] hover:bg-[#ECEFF4]/50'
          }`}
          id="tab-paths-btn"
        >
          <ChevronRight className="w-4 h-4" />
          2. Ścieżki (Windows vs Linux)
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex-1 py-4 px-5 text-sm font-bold border-b-2 text-center whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'terminal'
              ? 'border-[#5E81AC] text-[#5E81AC] bg-white shadow-sm'
              : 'border-transparent text-[#4C566A] hover:text-[#2E3440] hover:bg-[#ECEFF4]/50'
          }`}
          id="tab-terminal-btn"
        >
          <Terminal className="w-4 h-4" />
          3. Komendy Terminala
        </button>
        <button
          onClick={() => setActiveTab('shortcuts')}
          className={`flex-1 py-4 px-5 text-sm font-bold border-b-2 text-center whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'shortcuts'
              ? 'border-[#5E81AC] text-[#5E81AC] bg-white shadow-sm'
              : 'border-transparent text-[#4C566A] hover:text-[#2E3440] hover:bg-[#ECEFF4]/50'
          }`}
          id="tab-shortcuts-btn"
        >
          <Keyboard className="w-4 h-4 text-[#5E81AC]" />
          <span>4. Skróty Klawiszowe</span>
          <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Nowość</span>
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-4 px-5 text-sm font-bold border-b-2 text-center whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'quiz'
              ? 'border-[#5E81AC] text-[#5E81AC] bg-white shadow-sm'
              : 'border-transparent text-[#4C566A] hover:text-[#2E3440] hover:bg-[#ECEFF4]/50'
          }`}
          id="tab-quiz-btn"
        >
          <HelpCircle className="w-4 h-4" />
          5. Sprawdź Wiedzę (Quiz)
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 md:p-8">
        {/* Tab 1: Basics */}
        {activeTab === 'basics' && (
          <div className="space-y-8 animate-fadeIn" id="content-basics">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 flex-wrap">
                  <Folder className="w-6 h-6 text-amber-500" />
                  <span>Co to jest folder (katalog)?</span>
                  <SpeechButton text="Co to jest folder (katalog)? Wyobraź sobie folder jako papierowy segregator lub kartonowe pudełko w szafie. Sam z siebie nie zawiera rysunku ani tekstu, ale służy do organizowania i grupowania innych rzeczy. Wewnątrz jednego folderu możesz mieć inne foldery, nazywamy je podfolderami, lub pliki. Dzięki nim na komputerze panuje porządek! Pamiętaj: w systemach komputerowych słowa folder oraz katalog oznaczają dokładnie to samo!" size="xs" />
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Wyobraź sobie <strong>folder</strong> jako papierowy segregator lub kartonowe pudełko w szafie. Sam z siebie nie zawiera rysunku ani tekstu, ale służy do <strong>organizowania i grupowania</strong> innych rzeczy. 
                </p>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Wewnątrz jednego folderu możesz mieć inne foldery (nazywamy je podfolderami) lub pliki. Dzięki nim na komputerze panuje porządek!
                </p>
                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    <strong>Pamiętaj:</strong> W systemach komputerowych słowa <strong>folder</strong> oraz <strong>katalog</strong> (directory) oznaczają dokładnie to samo!
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 flex-wrap">
                  <FileText className="w-6 h-6 text-blue-500" />
                  <span>Co to jest plik?</span>
                  <SpeechButton text="Co to jest plik? Plik to konkretny dokument ukryty w pudełku. Może to być wypracowanie z języka polskiego, rysunek pieska, piosenka czy nawet gra komputerowa! Każdy plik ma swoją nazwę oraz rozszerzenie, które informuje komputer, jakim programem ma go otworzyć." size="xs" />
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  <strong>Plik</strong> to konkretny dokument ukryty w pudełku. Może to być wypracowanie z języka polskiego, rysunek pieska, piosenka czy nawet gra komputerowa!
                </p>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Każdy plik ma swoją <strong>nazwę</strong> oraz <strong>rozszerzenie</strong> (np. <code className="bg-gray-100 px-1 py-0.5 rounded text-red-600 font-mono font-semibold">.txt</code>), które informuje komputer, jakim programem ma go otworzyć.
                </p>
                
                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    Rozszerzenie pliku to kropka i kilka liter na samym końcu jego nazwy.
                  </p>
                </div>
              </div>
            </div>

            {/* Common Extensions Interactive Grid */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                <h4 className="font-bold text-gray-800 text-center">Najpopularniejsze rozszerzenia plików, które musisz znać:</h4>
                <SpeechButton text="Najpopularniejsze rozszerzenia plików, które musisz znać. Kropka te ix te to Dokument Tekstowy, czyli zwykły tekst. Kropka pe en gie oraz kropka jot pe gie to Obrazy i Zdjęcia, na przykład tapety. Kropka em pe trzy i kropka wav to Pliki Dźwiękowe, czyli utwory muzyczne. Kropka e ikse e to Program Wykonywalny, który uruchamia gry i aplikacje w Windows." size="xs" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center hover:shadow-sm transition-shadow">
                  <span className="inline-block bg-blue-100 text-blue-700 font-mono text-xs font-bold px-2 py-1 rounded mb-2">.txt</span>
                  <p className="text-sm font-semibold text-gray-800">Dokument Tekstowy</p>
                  <p className="text-xs text-gray-400 mt-1">Zwykły tekst, otwierany np. w Notatniku.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center hover:shadow-sm transition-shadow">
                  <span className="inline-block bg-emerald-100 text-emerald-700 font-mono text-xs font-bold px-2 py-1 rounded mb-2">.png / .jpg</span>
                  <p className="text-sm font-semibold text-gray-800">Obrazy i Zdjęcia</p>
                  <p className="text-xs text-gray-400 mt-1">Twoje zdjęcia z wakacji, grafiki lub tapety.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center hover:shadow-sm transition-shadow">
                  <span className="inline-block bg-purple-100 text-purple-700 font-mono text-xs font-bold px-2 py-1 rounded mb-2">.mp3 / .wav</span>
                  <p className="text-sm font-semibold text-gray-800">Pliki Dźwiękowe</p>
                  <p className="text-xs text-gray-400 mt-1">Utwory muzyczne, podcasty i efekty audio.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center hover:shadow-sm transition-shadow">
                  <span className="inline-block bg-amber-100 text-amber-700 font-mono text-xs font-bold px-2 py-1 rounded mb-2">.exe</span>
                  <p className="text-sm font-semibold text-gray-800">Program Wykonywalny</p>
                  <p className="text-xs text-gray-400 mt-1">Plik, który uruchamia gry i aplikacje w Windows.</p>
                </div>
              </div>
            </div>

            {/* Kids Corner for Basics */}
            <div className="bg-amber-50/80 border border-yellow-200 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute right-4 top-4 text-6xl opacity-10 select-none pointer-events-none">🧸</div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl">👦👧🎒</span>
                <h4 className="text-lg font-extrabold text-amber-800">Kącik Najmłodszych (Klasy 1-3)</h4>
                <SpeechButton text="Cześć! Jeśli jesteś w klasie pierwszej, drugiej lub trzeciej, mamy dla Ciebie super proste wyjaśnienie. Wyobraź sobie, że komputer to wielki pokój z zabawkami. Folder to kolorowe, plastikowe pudełko. Samo pudełko jest puste, ale służy do tego, żeby zabawki się nie rozsypały! Możesz do niego wkładać inne, mniejsze pudełka. Plik to konkretna zabawka włożona do pudełka, na przykład Twój piękny rysunek pieska, fajna piosenka o kotku albo gra komputerowa! Każdy plik ma swoją nazwę, żebyś go łatwo znalazł." size="xs" />
              </div>
              
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                <div className="bg-white p-4 rounded-xl border border-yellow-100 flex gap-3">
                  <div className="text-3xl flex-shrink-0">📦</div>
                  <div>
                    <h5 className="font-bold text-amber-900 text-sm">Folder (Nasze Pudełko)</h5>
                    <p className="text-xs text-gray-600 mt-1">Służy do utrzymywania porządku. W nim chowasz swoje skarby, rysunki i gry!</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-yellow-100 flex gap-3">
                  <div className="text-3xl flex-shrink-0">🎨</div>
                  <div>
                    <h5 className="font-bold text-amber-900 text-sm">Plik (Twój Skarb)</h5>
                    <p className="text-xs text-gray-600 mt-1">To konkretna rzecz, np. wierszyk (.txt), rysunek (.png) lub piosenka o piesku (.mp3)!</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-yellow-100 flex gap-3 sm:col-span-2 md:col-span-1">
                  <div className="text-3xl flex-shrink-0">🗑️</div>
                  <div>
                    <h5 className="font-bold text-amber-900 text-sm">Kosz (Magiczny Śmietnik)</h5>
                    <p className="text-xs text-gray-600 mt-1">Tu wrzucasz niepotrzebne pliki. Możesz je jeszcze wyjąć, jeśli zmienisz zdanie!</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 p-4 rounded-xl border border-yellow-100 mt-2">
                <h5 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  <span>⌨️</span> Czarodziejskie klawisze (Supermoce Klawiatury):
                </h5>
                <div className="grid sm:grid-cols-2 gap-3 mt-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-yellow-50 flex items-center gap-2">
                    <span className="bg-yellow-100 text-yellow-800 font-bold px-1.5 py-0.5 rounded font-mono">Ctrl + C</span>
                    <span className="text-gray-600">Klonuje (kopiuje) zaznaczony plik w pamięci.</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-yellow-50 flex items-center gap-2">
                    <span className="bg-yellow-100 text-yellow-800 font-bold px-1.5 py-0.5 rounded font-mono">Ctrl + V</span>
                    <span className="text-gray-600">Stawia (wkleja) sklonowany plik w nowym miejscu!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Paths */}
        {activeTab === 'paths' && (
          <div className="space-y-6 animate-fadeIn" id="content-paths">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 flex-wrap">
                <ChevronRight className="w-6 h-6 text-indigo-600" />
                <span>Co to jest ścieżka dostępu (Path)?</span>
                <SpeechButton text="Co to jest ścieżka dostępu? Ścieżka to adres, który mówi komputerowi dokładnie, gdzie dany plik lub folder się znajduje. Działa to jak tradycyjny adres pocztowy: Kraj, Miasto, Ulica, Numer domu. W hierarchii komputera zaczynamy od głównego miejsca, tak zwanego katalogu głównego, przechodzimy przez foldery pośrednie, aż docieramy do pliku." size="xs" />
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                <strong>Ścieżka</strong> to adres, który mówi komputerowi dokładnie, gdzie dany plik lub folder się znajduje. Działa to jak tradycyjny adres pocztowy: <br />
                <span className="font-semibold text-indigo-600">Kraj → Miasto → Ulica → Numer domu</span>.
              </p>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                W komputera hierarchii zaczynamy od głównego miejsca (tzw. <strong>katalogu głównego</strong>), przechodzimy przez foldery pośrednie, aż docieramy do pliku.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {/* Windows 11 */}
              <div className="border border-sky-100 rounded-2xl p-6 bg-sky-50/20">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className="bg-sky-500 text-white font-bold p-1 rounded text-xs px-2">Windows 11</div>
                  <h4 className="font-bold text-gray-800 text-base">Ścieżki w Windows</h4>
                  <SpeechButton text="Ścieżki w systemie Windows zaczynają się od litery dysku, najczęściej dysku głównego C. Elementy rozdzielamy lewym ukośnikiem, zwanym backslash. Przykładowa ścieżka to: C, dwukropek, lewy ukośnik, Dokumenty, lewy ukośnik, Szkoła, lewy ukośnik, matematyka kropka te ix te." size="xs" />
                </div>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-500 font-bold">•</span>
                    Zaczynają się od litery dysku, najczęściej dysku głównego <code className="bg-sky-50 px-1 py-0.5 rounded text-sky-700 font-mono font-semibold">C:</code>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-500 font-bold">•</span>
                    Elementy rozdzielamy <strong>lewym ukośnikiem</strong> <code className="bg-sky-50 px-1.5 py-0.5 rounded text-sky-700 font-mono font-bold">\</code> (tzw. backslash)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-500 font-bold">•</span>
                    <strong>Przykładowa ścieżka:</strong>
                    <div className="mt-1 bg-gray-900 text-white font-mono text-xs p-2 rounded block w-full overflow-x-auto">
                      C:\Dokumenty\Szkola\matematyka.txt
                    </div>
                  </li>
                </ul>
              </div>

              {/* Linux Ubuntu */}
              <div className="border border-purple-100 rounded-2xl p-6 bg-purple-50/20">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className="bg-purple-600 text-white font-bold p-1 rounded text-xs px-2">Linux Ubuntu</div>
                  <h4 className="font-bold text-gray-800 text-base">Ścieżki w Linuxie</h4>
                  <SpeechButton text="Ścieżki w systemie Linux nie mają liter dysków. Wszystko zaczyna się od jednego znaku prawego ukośnika, czyli korzenia systemu. Elementy rozdzielamy prawym ukośnikiem. Przykładowa ścieżka to: prawy ukośnik, home, prawy ukośnik, uczen, prawy ukośnik, Documents, prawy ukośnik, welcome kropka te ix te." size="xs" />
                </div>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    Nie ma liter dysków (C:, D:). Wszystko zaczyna się od jednego znaku <code className="bg-purple-50 px-1 py-0.5 rounded text-purple-700 font-mono font-semibold">/</code> (tzw. root / korzeń)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    Elementy rozdzielamy <strong>prawym ukośnikiem</strong> <code className="bg-purple-50 px-1.5 py-0.5 rounded text-purple-700 font-mono font-bold">/</code> (tzw. slash)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <strong>Przykładowa ścieżka:</strong>
                    <div className="mt-1 bg-gray-900 text-white font-mono text-xs p-2 rounded block w-full overflow-x-auto">
                      /home/uczen/Documents/welcome.txt
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3 text-sm">
              <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-indigo-900">Ścieżka względna vs bezwzględna</p>
                  <SpeechButton text="Ścieżka względna kontra bezwzględna. Ścieżka bezwzględna zawsze opisuje drogę od samego początku dysku, na przykład od C lub od głównego ukośnika. Ścieżka względna opisuje drogę od miejsca, w którym obecnie się znajdujesz. Na przykład, jeśli jesteś w folderze Dokumenty, plik notatka kropka te ix te leży tuż obok ciebie, więc wystarczy podać tylko jego nazwę." size="xs" />
                </div>
                <p className="text-indigo-800 text-xs mt-1">
                  Ścieżka <strong>bezwzględna</strong> zawsze opisuje drogę od samego początku dysku (np. od <code className="font-mono">C:\</code> lub od <code className="font-mono">/</code>). <br />
                  Ścieżka <strong>względna</strong> opisuje drogę od miejsca, w którym <strong>obecnie się znajdujesz</strong> (np. jeśli jesteś w folderze <code className="font-mono">Dokumenty</code>, plik <code className="font-mono">notatka.txt</code> leży tuż obok ciebie, więc wystarczy podać tylko jego nazwę).
                </p>
              </div>
            </div>

            {/* Kids Corner for Paths */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm relative overflow-hidden mt-6">
              <div className="absolute right-4 top-4 text-6xl opacity-10 select-none pointer-events-none">🗺️</div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl">🗺️🎒</span>
                <h4 className="text-lg font-extrabold text-emerald-800">Mapa Skarbów dla Klas 1-3!</h4>
                <SpeechButton text="Wyobraź sobie, że ścieżka dostępu to mapa skarbu, która prowadzi piratów do złota! Pokazuje ona kroki, które musisz przejść, żeby znaleźć swój plik. Na przykład, ścieżka C, ukośnik, Zdjęcia, ukośnik, piesek kropka jot pe gie, mówi komputerowi tak: wejdź do pokoju C, znajdź szafkę o nazwie Zdjęcia, a potem wyciągnij z niej obrazek pieska! W Windowsie kroki rozdzielamy lewym ukośnikiem, a w Linuxie prawym ukośnikiem!" size="xs" />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <div className="bg-white p-4 rounded-xl border border-emerald-100">
                  <h5 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                    <span>🧭</span> Jak czytać mapę skarbów?
                  </h5>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Każdy krok na mapie oddzielamy ukośnikiem. <br />
                    <code className="font-mono text-emerald-600 font-bold">Dysk C:</code> ➡️ <code className="font-mono text-emerald-600 font-bold">Zabawki</code> ➡️ <code className="font-mono text-emerald-600 font-bold">Misiu.txt</code> oznacza: wejdź na dysk, znajdź szafkę "Zabawki", a w niej pluszaka "Misiu".
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-emerald-100">
                  <h5 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
                    <span>🧙‍♂️</span> Dwa ukośniki - strażnicy
                  </h5>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    W Windowsie drogowskazem jest lewy ukośnik <code className="font-mono font-bold text-sky-600 bg-sky-50 px-1 py-0.5 rounded">\</code> (backslash). <br />
                    W Linuxie drogowskazem jest prawy ukośnik <code className="font-mono font-bold text-purple-600 bg-purple-50 px-1 py-0.5 rounded">/</code> (slash).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Terminal */}
        {activeTab === 'terminal' && (
          <div className="space-y-6 animate-fadeIn" id="content-terminal">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 flex-wrap">
                <Terminal className="w-6 h-6 text-emerald-600" />
                <span>Co to jest Terminal i dlaczego jest ważny?</span>
                <SpeechButton text="Co to jest Terminal i dlaczego jest ważny? Zazwyczaj klikasz ikonki myszką. Ale profesjonaliści, programiści i administratorzy sieci na całym świecie używają Terminala, czyli interfejsu tekstowego, aby wydawać polecenia bezpośrednio do komputera za pomocą klawiatury! Dzięki temu możesz pracować setki razy szybciej, pisać skrypty automatyzujące nudne zadania oraz sterować serwerami na drugim końcu świata!" size="xs" />
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Zazwyczaj klikasz ikonki myszką (jest to interfejs graficzny - GUI). Ale profesjonaliści, programiści i administratorzy sieci na całym świecie używają <strong>Terminala (interfejs tekstowy - CLI)</strong>, aby wydawać polecenia bezpośrednio do komputera za pomocą klawiatury!
              </p>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                Dzięki temu możesz pracować setki razy szybciej, pisać skrypty automatyzujące nudne zadania oraz sterować serwerami na drugim końcu świata!
              </p>
            </div>

            {/* Commands list cheat sheet */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white text-xs md:text-sm font-semibold">
                    <th className="p-3 md:p-4">Komenda Linux</th>
                    <th className="p-3 md:p-4">Co oznacza?</th>
                    <th className="p-3 md:p-4">Przykład użycia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 md:p-4 font-mono font-bold text-indigo-600">pwd</td>
                    <td className="p-3 md:p-4 font-semibold text-gray-700">Pokazuje obecną ścieżkę (Gdzie jestem?)</td>
                    <td className="p-3 md:p-4"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">pwd</code></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 md:p-4 font-mono font-bold text-indigo-600">ls</td>
                    <td className="p-3 md:p-4 font-semibold text-gray-700">Lista plików i folderów w obecnym katalogu</td>
                    <td className="p-3 md:p-4"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">ls</code></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 md:p-4 font-mono font-bold text-indigo-600">cd [folder]</td>
                    <td className="p-3 md:p-4 font-semibold text-gray-700">Wejdź do podanego folderu</td>
                    <td className="p-3 md:p-4"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">cd Documents</code></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 md:p-4 font-mono font-bold text-indigo-600">cd ..</td>
                    <td className="p-3 md:p-4 font-semibold text-gray-700">Cofnij się o jeden folder wyżej</td>
                    <td className="p-3 md:p-4"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">cd ..</code></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 md:p-4 font-mono font-bold text-indigo-600">mkdir [nazwa]</td>
                    <td className="p-3 md:p-4 font-semibold text-gray-700">Utwórz nowy folder</td>
                    <td className="p-3 md:p-4"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">mkdir Projekty</code></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 md:p-4 font-mono font-bold text-indigo-600">touch [nazwa]</td>
                    <td className="p-3 md:p-4 font-semibold text-gray-700">Stwórz nowy, pusty plik tekstowy</td>
                    <td className="p-3 md:p-4"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">touch notatka.txt</code></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 md:p-4 font-mono font-bold text-indigo-600">rm [nazwa]</td>
                    <td className="p-3 md:p-4 font-semibold text-gray-700">Usuń plik</td>
                    <td className="p-3 md:p-4"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">rm śmieć.txt</code></td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 md:p-4 font-mono font-bold text-indigo-600">cat [plik]</td>
                    <td className="p-3 md:p-4 font-semibold text-gray-700">Wyświetl zawartość pliku tekstowego</td>
                    <td className="p-3 md:p-4"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">cat witaj.txt</code></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Kids Corner for Terminal */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm relative overflow-hidden mt-6">
              <div className="absolute right-4 top-4 text-6xl opacity-10 select-none pointer-events-none">🪄</div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl">🪄👾🎒</span>
                <h4 className="text-lg font-extrabold text-purple-800">Czarodziejski mikrofon (Terminal)!</h4>
                <SpeechButton text="Zazwyczaj klikasz w rysunki myszką. Ale wyobraź sobie, że komputer ma magiczne ucho! Terminal to czarodziejski mikrofon, do którego wpisujesz zaklęcia (czyli komendy). Gdy wpiszesz zaklęcie 'mkdir' i podasz imię, komputer sam wyczaruje nowy folder! A gdy wpiszesz 'ls', pokaże Ci listę wszystkich skarbów w Twoim pudełku. Ucząc się tych komend, stajesz się prawdziwym komputerowym czarodziejem!" size="xs" />
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4 mt-2">
                <div className="bg-white p-3.5 rounded-xl border border-purple-100 text-center">
                  <div className="text-2xl mb-1">🔍</div>
                  <h5 className="font-bold text-purple-950 text-xs">Komenda "ls"</h5>
                  <p className="text-[11px] text-gray-600 mt-1">To czar "Otwórz oczy!" - pokazuje, jakie zabawki są w pudełku.</p>
                </div>
                
                <div className="bg-white p-3.5 rounded-xl border border-purple-100 text-center">
                  <div className="text-2xl mb-1">✨</div>
                  <h5 className="font-bold text-purple-950 text-xs">Komenda "mkdir"</h5>
                  <p className="text-[11px] text-gray-600 mt-1">To zaklęcie "Stwórz pudełko!" - tworzy nowy pusty folder o dowolnej nazwie.</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-purple-100 text-center">
                  <div className="text-2xl mb-1">🏃‍♂️</div>
                  <h5 className="font-bold text-purple-950 text-xs">Komenda "cd"</h5>
                  <p className="text-[11px] text-gray-600 mt-1">To czar "Biegnij!" - pozwala Ci wejść do wnętrza wybranego folderu.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Shortcuts (Windows & Linux) */}
        {activeTab === 'shortcuts' && (
          <div className="space-y-8 animate-fadeIn" id="content-shortcuts">
            {/* Header section with audio and stats */}
            <div className="bg-gradient-to-r from-sky-50 via-indigo-50/40 to-purple-50/50 border border-sky-200/80 rounded-2xl p-6 md:p-7 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="p-2 bg-[#5E81AC] text-white rounded-xl shadow-sm">
                      <Keyboard className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                      Interaktywna Tabela Skrótów Klawiszowych
                    </h3>
                    <SpeechButton
                      text="Interaktywna Tabela Skrótów Klawiszowych dla systemów Windows 11 i Linux Ubuntu. Skróty klawiszowe to sekret profesjonalnych administratorów i programistów. Pozwalają tworzyć foldery, zmieniać nazwy, kopiować i zarządzać plikami nawet dziesięć razy szybciej niż myszką. Kliknij przycisk Wypróbuj lub Kopiuj przy dowolnym skrócie, aby go przetestować i zdobyć dodatkowe punkty doświadczenia!"
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
                    Poznaj kluczowe skróty klawiszowe do zarządzania plikami, folderami, oknami oraz terminalem w systemach <strong>Windows 11</strong> i <strong>Linux Ubuntu</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white/90 p-3.5 rounded-xl border border-sky-200 shadow-xs self-start lg:self-auto">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
                    <div className="text-xs">
                      <div className="font-bold text-gray-800">
                        Przetestowano: {Object.keys(testedShortcuts).length} / {SHORTCUTS_DATA.length}
                      </div>
                      <div className="text-emerald-600 font-semibold">
                        +{Object.keys(testedShortcuts).length * 5} XP zdobyte!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-[#F8FAFC] border border-[#E5E9F0] rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={shortcutSearch}
                    onChange={(e) => setShortcutSearch(e.target.value)}
                    placeholder="Szukaj skrótu lub akcji (np. Ctrl+C, F2, nowy folder, usuń, tab, terminal)..."
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E81AC] focus:border-transparent transition-all shadow-xs"
                    id="shortcuts-search-input"
                  />
                  {shortcutSearch && (
                    <button
                      onClick={() => setShortcutSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center"
                      title="Wyczyść wyszukiwanie"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* OS Switcher */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-xs self-start md:self-auto">
                  <button
                    onClick={() => setShortcutOS('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      shortcutOS === 'all'
                        ? 'bg-[#5E81AC] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    id="filter-os-all"
                  >
                    Wszystkie OS
                  </button>
                  <button
                    onClick={() => setShortcutOS('windows')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      shortcutOS === 'windows'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    id="filter-os-win"
                  >
                    <span>🪟 Windows</span>
                  </button>
                  <button
                    onClick={() => setShortcutOS('linux')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      shortcutOS === 'linux'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    id="filter-os-lin"
                  >
                    <span>🐧 Linux</span>
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-gray-500 font-medium flex items-center gap-1 pl-1">
                  <Filter className="w-3.5 h-3.5" />
                  Kategoria:
                </span>
                <button
                  onClick={() => setShortcutCategory('all')}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    shortcutCategory === 'all'
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  Wszystkie ({SHORTCUTS_DATA.length})
                </button>
                <button
                  onClick={() => setShortcutCategory('files')}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    shortcutCategory === 'files'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  Pliki i Foldery
                </button>
                <button
                  onClick={() => setShortcutCategory('navigation')}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    shortcutCategory === 'navigation'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Nawigacja i Eksplorator
                </button>
                <button
                  onClick={() => setShortcutCategory('terminal')}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    shortcutCategory === 'terminal'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Terminal i Konsola
                </button>
                <button
                  onClick={() => setShortcutCategory('clipboard')}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    shortcutCategory === 'clipboard'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Schowek i Edycja
                </button>
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>
                Znaleziono: <strong>{filteredShortcuts.length}</strong> {filteredShortcuts.length === 1 ? 'skrót' : filteredShortcuts.length < 5 ? 'skróty' : 'skrótów'}
              </span>
              <span className="text-[11px] text-gray-400">
                💡 Kliknij przycisk <span className="text-sky-600 font-semibold">„Wypróbuj / Kopiuj”</span>, aby przetestować skrót i zdobyć punkty XP!
              </span>
            </div>

            {/* Interactive Shortcuts Table */}
            {filteredShortcuts.length > 0 ? (
              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse" id="shortcuts-interactive-table">
                    <thead>
                      <tr className="bg-[#ECEFF4] text-[#2E3440] text-xs font-extrabold uppercase tracking-wider border-b border-gray-200">
                        <th className="py-4 px-5 w-1/4">Akcja i Kategoria</th>
                        {(shortcutOS === 'all' || shortcutOS === 'windows') && (
                          <th className="py-4 px-5 w-1/4">
                            <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-md">
                              🪟 Windows (Eksplorator / CMD)
                            </span>
                          </th>
                        )}
                        {(shortcutOS === 'all' || shortcutOS === 'linux') && (
                          <th className="py-4 px-5 w-1/4">
                            <span className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-md">
                              🐧 Linux Ubuntu (Files / Bash)
                            </span>
                          </th>
                        )}
                        <th className="py-4 px-5">Opis i Wskazówka (Pro-Tip)</th>
                        <th className="py-4 px-5 text-center w-28">Akcje</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredShortcuts.map((sc) => {
                        const isCopied = copiedShortcutId === sc.id;
                        const isTested = testedShortcuts[sc.id];

                        return (
                          <tr
                            key={sc.id}
                            className={`hover:bg-sky-50/40 transition-colors ${
                              isTested ? 'bg-emerald-50/20' : ''
                            }`}
                            id={`shortcut-row-${sc.id}`}
                          >
                            {/* Action & Category */}
                            <td className="py-4 px-5 align-top">
                              <div className="space-y-1.5">
                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                  <span>{sc.action}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                    {sc.categoryLabel}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${sc.badgeColor}`}
                                  >
                                    {sc.level}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Windows Keys */}
                            {(shortcutOS === 'all' || shortcutOS === 'windows') && (
                              <td className="py-4 px-5 align-top">
                                <div className="flex flex-wrap items-center gap-1.5 font-mono">
                                  {sc.windowsKeys.map((key, kIdx) => (
                                    <React.Fragment key={kIdx}>
                                      {key === 'lub' || key === 'potem' || key === '→' ? (
                                        <span className="text-xs text-gray-400 font-sans font-medium px-1">
                                          {key}
                                        </span>
                                      ) : (
                                        <kbd className="inline-flex items-center justify-center min-w-[28px] px-2.5 py-1 bg-gradient-to-b from-white to-gray-100 border border-gray-300 rounded-lg shadow-xs font-mono text-xs font-bold text-gray-800 tracking-wide border-b-2">
                                          {key}
                                        </kbd>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </td>
                            )}

                            {/* Linux Keys */}
                            {(shortcutOS === 'all' || shortcutOS === 'linux') && (
                              <td className="py-4 px-5 align-top">
                                <div className="flex flex-wrap items-center gap-1.5 font-mono">
                                  {sc.linuxKeys.map((key, kIdx) => (
                                    <React.Fragment key={kIdx}>
                                      {key === 'lub' || key === 'potem' || key.startsWith('(') ? (
                                        <span className="text-xs text-gray-500 font-sans font-medium px-1">
                                          {key}
                                        </span>
                                      ) : key.startsWith('rm') || key.startsWith('mv') || key.startsWith('mkdir') || key.startsWith('cls') || key.startsWith('clear') || key.startsWith('find') ? (
                                        <kbd className="inline-flex items-center px-2 py-1 bg-gray-900 border border-gray-700 text-emerald-400 rounded-lg shadow-xs font-mono text-xs font-bold tracking-wide">
                                          {key}
                                        </kbd>
                                      ) : (
                                        <kbd className="inline-flex items-center justify-center min-w-[28px] px-2.5 py-1 bg-gradient-to-b from-orange-50 to-amber-100 border border-amber-300 rounded-lg shadow-xs font-mono text-xs font-bold text-amber-950 tracking-wide border-b-2">
                                          {key}
                                        </kbd>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </td>
                            )}

                            {/* Description & Pro-Tip */}
                            <td className="py-4 px-5 align-top space-y-2">
                              <p className="text-xs text-gray-700 leading-relaxed">
                                {sc.description}
                              </p>
                              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong className="font-semibold text-amber-950">Wskazówka: </strong>
                                  {sc.proTip}
                                </div>
                              </div>
                            </td>

                            {/* Action buttons (Speech & Copy/Test) */}
                            <td className="py-4 px-5 align-top text-center">
                              <div className="flex flex-col items-center gap-2">
                                <button
                                  onClick={() => handleTestOrCopy(sc)}
                                  className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                                    isCopied
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-[#5E81AC] hover:bg-[#4C566A] text-white'
                                  }`}
                                  title="Skopiuj skrót i zdobądź +5 XP!"
                                  id={`btn-copy-${sc.id}`}
                                >
                                  {isCopied ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Zrobione!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Kopiuj</span>
                                    </>
                                  )}
                                </button>

                                <SpeechButton
                                  text={`Skrót: ${sc.action}. Klawisze w systemie Windows: ${sc.windowsKeys.join(' plus ')}. Klawisze w systemie Linux: ${sc.linuxKeys.join(' ')}. Opis działania: ${sc.description}. Praktyczna wskazówka: ${sc.proTip}`}
                                  size="xs"
                                />

                                {isTested && (
                                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3 h-3" /> +5 XP
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center space-y-3">
                <Search className="w-10 h-10 text-gray-400 mx-auto" />
                <h4 className="text-base font-bold text-gray-700">Brak pasujących skrótów</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Nie znaleziono skrótu pasującego do zapytania „{shortcutSearch}”. Spróbuj wpisać inną frazę lub zresetować filtry.
                </p>
                <button
                  onClick={() => {
                    setShortcutSearch('');
                    setShortcutCategory('all');
                    setShortcutOS('all');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-all shadow-xs"
                >
                  Wyczyść wszystkie filtry
                </button>
              </div>
            )}

            {/* Kids Corner / Strefa Mistrza Klawiatury */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 rounded-2xl p-6 md:p-8 space-y-5 shadow-sm relative overflow-hidden">
              <div className="absolute right-4 top-4 text-7xl opacity-10 select-none pointer-events-none">⌨️</div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl">⚡🧙‍♂️🚀</span>
                <h4 className="text-lg font-extrabold text-indigo-950">
                  Strefa Mistrza Klawiatury – Dlaczego warto znać skróty?
                </h4>
                <SpeechButton
                  text="Dlaczego prawdziwy informatyk i administrator kocha skróty klawiszowe? Po pierwsze: szybkość! Używając skrótów, Twoje dłonie nie muszą wędrować między klawiaturą a myszką, co pozwala wykonać zadania nawet dziesięć razy szybciej. Po drugie: brak pomyłek. Klawisze F2 lub Tab zabezpieczają Cię przed przypadkowymi literówkami. Po trzecie: serwery w chmurze i w internecie często w ogóle nie mają myszki ani kolorowych okienek – tam całe zarządzanie plikami opiera się wyłącznie na komendach i skrótach!"
                  size="xs"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mt-2">
                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs">
                  <div className="text-2xl mb-1.5">🚀</div>
                  <h5 className="font-bold text-indigo-950 text-xs">Superszybkość (10x)</h5>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    Nie musisz celować kursorem myszy w małe ikonki ani klikać prawym przyciskiem. Dwa klawisze robią to w ułamku sekundy!
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs">
                  <div className="text-2xl mb-1.5">🛡️</div>
                  <h5 className="font-bold text-indigo-950 text-xs">Zero pomyłek i literówek</h5>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    Klawisz <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 font-mono text-[10px]">Tab</kbd> w terminalu sam dokańcza długie nazwy plików, więc nie ma szans na błąd!
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs">
                  <div className="text-2xl mb-1.5">🌐</div>
                  <h5 className="font-bold text-indigo-950 text-xs">Serwery w chmurze bez myszki</h5>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    Większość serwerów internetowych nie ma pulpitu graficznego. Administratorzy pracują na nich wyłącznie za pomocą skrótów i terminala.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Quiz */}
        {activeTab === 'quiz' && (
          <div className="space-y-6 animate-fadeIn" id="content-quiz">
            <div className="text-center max-w-xl mx-auto mb-8">
              <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800">Sprawdź swoją wiedzę!</h3>
              <p className="text-gray-500 text-sm">Rozwiąż ten krótki quiz, aby ugruntować swoją wiedzę przed symulatorem i zgarnąć punkty!</p>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
              {activeQuestions.map((q, idx) => {
                const selectedOpt = answers[q.id];
                const isCorrect = selectedOpt === q.correct;
                
                return (
                  <div key={q.id} className="border border-gray-100 rounded-2xl p-5 md:p-6 bg-gray-50/30" id={`quiz-q-${q.id}`}>
                    <h4 className="font-bold text-gray-800 text-sm md:text-base mb-3 flex items-center gap-2 flex-wrap">
                      <span className="text-blue-600">{idx + 1}.</span>
                      <span className="flex-1">{q.question}</span>
                      <SpeechButton 
                        text={`Pytanie numer ${idx + 1}: ${q.question}. Opcje do wyboru: Opcja pierwsza: ${q.options[0]}. Opcja druga: ${q.options[1]}. Opcja trzecia: ${q.options[2]}.${checked ? ` Wyjaśnienie: ${q.explanation}` : ''}`} 
                        size="xs" 
                      />
                    </h4>
                    
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = 'border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700';
                        if (selectedOpt === optIdx) {
                          btnStyle = 'border-blue-500 bg-blue-50 text-blue-800 font-semibold';
                        }
                        if (checked) {
                          if (optIdx === q.correct) {
                            btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold';
                          } else if (selectedOpt === optIdx) {
                            btnStyle = 'border-red-500 bg-red-50 text-red-800 font-semibold';
                          } else {
                            btnStyle = 'border-gray-200 text-gray-400 opacity-60';
                          }
                        }
                        
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            disabled={checked}
                            className={`w-full text-left p-3 rounded-xl border text-xs md:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                            id={`quiz-q-${q.id}-opt-${optIdx}`}
                          >
                            <span>{opt}</span>
                            {checked && optIdx === q.correct && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                            {checked && selectedOpt === optIdx && optIdx !== q.correct && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {checked && (
                      <div className="mt-4 p-3 bg-white rounded-xl border border-gray-100 text-xs md:text-sm text-gray-600 flex gap-2">
                        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p>{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                {!checked ? (
                  <button
                    onClick={handleCheckQuiz}
                    disabled={Object.keys(answers).length < activeQuestions.length}
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    id="submit-quiz-btn"
                  >
                    Sprawdź Odpowiedzi
                  </button>
                ) : (
                  <div className="flex items-center gap-4 w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-6 h-6 text-yellow-500" />
                      <span className="font-bold text-gray-800">
                        Twój wynik: {score} / {activeQuestions.length} (+{score * 20} XP!)
                      </span>
                    </div>
                    <button
                      onClick={handleResetQuiz}
                      className="px-6 py-2.5 border border-gray-300 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 font-medium text-sm transition-all"
                      id="reset-quiz-btn"
                    >
                      Spróbuj Ponownie
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
