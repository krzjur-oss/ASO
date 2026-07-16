/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mission, VFSNode, Badge } from '../types';
import { 
  createDefaultWindowsVFS, 
  createDefaultLinuxVFS,
  getChildren
} from './fileSystem';

// Badges list
export const BADGES: Badge[] = [
  {
    id: 'badge_quiz',
    title: 'Mistrz Teorii',
    description: 'Pomyślnie ukończono test wiedzy o systemach plików.',
    icon: '💡',
    requirement: 'Ukończenie Quizu Teoretycznego'
  },
  {
    id: 'badge_folder_win',
    title: 'Młody Odkrywca',
    description: 'Stworzono pierwszy folder "Prace_Domowe" w eksploratorze Windows.',
    icon: '🎒',
    requirement: 'Ukończenie Misji 1'
  },
  {
    id: 'badge_clean_win',
    title: 'Mistrz Porządku',
    description: 'Pomyślnie usunięto zbędne tymczasowe pliki i posprzątano dysk.',
    icon: '🧹',
    requirement: 'Ukończenie Misji 3'
  },
  {
    id: 'badge_rename_win',
    title: 'Mistrz Nazewnictwa',
    description: 'Uporządkowano pobrane pliki poprzez właściwą zmianę nazwy.',
    icon: '🏷️',
    requirement: 'Ukończenie Misji 7'
  },
  {
    id: 'badge_structure_win',
    title: 'Młody Architekt',
    description: 'Utworzono pliki głęboko w wielopoziomowej strukturze folderów.',
    icon: '🏗️',
    requirement: 'Ukończenie Misji 10'
  },
  {
    id: 'badge_linux_basic',
    title: 'Terminalowy Kadet',
    description: 'Opanowano podstawowe komendy odczytu pwd oraz ls w konsoli.',
    icon: '⚡',
    requirement: 'Ukończenie Misji 4'
  },
  {
    id: 'badge_linux_ninja',
    title: 'Konsolowy Ninja',
    description: 'Utworzono foldery i pliki bezpośrednio z linii komend Linux.',
    icon: '🥷',
    requirement: 'Ukończenie Misji 6'
  },
  {
    id: 'badge_linux_guru',
    title: 'Terminalowy Czytelnik',
    description: 'Wypisano i usunięto pliki z poziomu konsoli za pomocą rm i cat.',
    icon: '📖',
    requirement: 'Ukończenie Misji 8 i 9'
  },
  {
    id: 'badge_chmod_linux',
    title: 'Strażnik Uprawnień',
    description: 'Opanowano zarządzanie uprawnieniami w systemie Linux przy użyciu komendy chmod.',
    icon: '🔑',
    requirement: 'Ukończenie Misji 11 oraz 12'
  },
  {
    id: 'badge_sorting_win',
    title: 'Analityk Przestrzeni',
    description: 'Uporządkowano pliki w systemie Windows przy użyciu funkcji sortowania.',
    icon: '📊',
    requirement: 'Ukończenie Misji 13'
  },
  {
    id: 'badge_linux_grep',
    title: 'Detektyw Tekstu',
    description: 'Pomyślnie wyszukano ukryte frazy w plikach tekstowych za pomocą polecenia grep.',
    icon: '🔍',
    requirement: 'Ukończenie Misji 15'
  },
  {
    id: 'badge_win_search',
    title: 'Szybki Poszukiwacz',
    description: 'Opanowano wyszukiwanie zagubionych dokumentów w Eksploratorze Windows.',
    icon: '🔎',
    requirement: 'Ukończenie Misji 16'
  },
  {
    id: 'badge_master',
    title: 'Certyfikowany Administrator',
    description: 'Ukończono wszystkie praktyczne wyzwania z Windows i Linux.',
    icon: '🏆',
    requirement: 'Ukończenie wszystkich 16 misji'
  }
];

// Definition of 10 structured interactive educational missions
export const MISSIONS: Mission[] = [
  {
    id: 'm1_win_folder',
    title: 'Misja 1: Tworzenie Folderów (Windows)',
    category: 'windows',
    difficulty: 'Łatwy',
    description: 'Naucz się tworzyć foldery w Eksploratorze Plików Windows 11, aby uporządkować swoje dokumenty.',
    instructions: [
      'Upewnij się, że jesteś w zakładce "Eksplorator Windows".',
      'Przejdź do folderu "Dokumenty" (kliknij go dwukrotnie w oknie lub wybierz z bocznego paska).',
      'Kliknij przycisk "Nowy Folder" u góry ekranu.',
      'Nazwij nowy folder dokładnie: "Prace_Domowe" i potwierdź przyciskiem Stwórz.'
    ],
    points: 30,
    initialState: {
      system: 'windows',
      currentPathId: 'root',
      nodes: createDefaultWindowsVFS()
    },
    checkCompleted: (nodes, currentPathId) => {
      // Find 'Dokumenty' folder first
      const docsId = 'dokumenty';
      const children = getChildren(nodes, docsId);
      const target = children.find(child => child.name === 'Prace_Domowe' && child.type === 'directory');

      if (target) {
        return {
          completed: true,
          progressText: 'Super! Folder "Prace_Domowe" został pomyślnie utworzony wewnątrz Dokumentów.'
        };
      }

      return {
        completed: false,
        progressText: 'Wskazówka: Wejdź do "Dokumenty" i utwórz folder o nazwie "Prace_Domowe".',
        hint: 'Czy nazwa folderu na pewno brzmi "Prace_Domowe"? Wielkość liter ma znaczenie!'
      };
    },
    successMessage: 'Wspaniale! Nauczyłeś się tworzyć katalogi w Windows 11. Twój dysk staje się czysty i uporządkowany!'
  },
  {
    id: 'm2_win_file',
    title: 'Misja 2: Tworzenie Plików Tekstowych',
    category: 'windows',
    difficulty: 'Łatwy',
    description: 'Stwórz swój pierwszy plik z rozszerzeniem tekstowym .txt, aby móc zapisywać notatki ze szkoły.',
    instructions: [
      'Wejdź do folderu "Dokumenty", a następnie wejdź do folderu "Szkoła".',
      'Kliknij przycisk "Nowy Plik" w górnym pasku narzędzi.',
      'Nazwij plik: "matematyka.txt" i zatwierdź.',
      'Zauważ, jak rozszerzenie .txt wskazuje komputerowi, że to zwykły plik tekstowy.'
    ],
    points: 40,
    initialState: {
      system: 'windows',
      currentPathId: 'dokumenty',
      nodes: createDefaultWindowsVFS()
    },
    checkCompleted: (nodes, currentPathId) => {
      const schoolFolderId = 'szkola_folder';
      const children = getChildren(nodes, schoolFolderId);
      const target = children.find(child => child.name.toLowerCase() === 'matematyka.txt' && child.type === 'file');

      if (target) {
        return {
          completed: true,
          progressText: 'Świetnie! Plik "matematyka.txt" leży bezpiecznie w folderze Szkoła.'
        };
      }

      return {
        completed: false,
        progressText: 'Wskazówka: Wejdź do Dokumenty → Szkoła i stwórz tam plik tekstowy "matematyka.txt".'
      };
    },
    successMessage: 'Doskonale! Rozszerzenie .txt informuje system, że plik zawiera tekst i można go otworzyć w Notatniku!'
  },
  {
    id: 'm3_win_delete',
    title: 'Misja 3: Usuwanie Zbędnych Plików',
    category: 'windows',
    difficulty: 'Łatwy',
    description: 'Posprzątaj śmieci! Czasami programy tworzą tymczasowe pliki .tmp, które tylko zapychają dysk twardy.',
    instructions: [
      'Wejdź do folderu "Dokumenty", a następnie wejdź do folderu "Szkoła".',
      'Znajdź niepotrzebny plik o nazwie "smieci.tmp".',
      'Kliknij na niego raz lewym przyciskiem myszy, aby go zaznaczyć.',
      'Użyj ikony "Usuń" (czerwony kosz) u góry paska narzędzi.'
    ],
    points: 40,
    initialState: {
      system: 'windows',
      currentPathId: 'szkola_folder',
      nodes: createDefaultWindowsVFS()
    },
    checkCompleted: (nodes, currentPathId) => {
      // Find if "smieci.tmp" still exists inside school folder
      const schoolFolderId = 'szkola_folder';
      const children = getChildren(nodes, schoolFolderId);
      const exists = children.some(child => child.name === 'smieci.tmp');

      if (!exists) {
        return {
          completed: true,
          progressText: 'Plik "smieci.tmp" zniknął z folderu Szkoła. Dobra robota!'
        };
      }

      return {
        completed: false,
        progressText: 'Wskazówka: Zaznacz plik "smieci.tmp" w folderze Dokumenty/Szkoła i kliknij przycisk "Usuń" u góry.'
      };
    },
    successMessage: 'Fantastycznie! Usunąłeś śmieciowy plik tymczasowy. Zwalnianie miejsca na dysku to klucz do szybkiego komputera.'
  },
  {
    id: 'm4_linux_basics',
    title: 'Misja 4: Pierwsze kroki w Terminalu (pwd & ls)',
    category: 'linux',
    difficulty: 'Łatwy',
    description: 'Wejdź do świata hakerów! Naucz się sprawdzać swoją pozycję na dysku (pwd) i listować zawartość (ls) za pomocą poleceń tekstowych.',
    instructions: [
      'Przełącz się do zakładki "Terminal Linux".',
      'Wpisz komendę "pwd" i naciśnij Enter. Zobaczysz, w jakim katalogu obecnie jesteś (/home/uczen).',
      'Wpisz komendę "ls" i kliknij Enter. Wyświetlą się dostępne podfoldery (Desktop, Documents, Downloads).'
    ],
    points: 30,
    initialState: {
      system: 'linux',
      currentPathId: 'uczen',
      nodes: createDefaultLinuxVFS()
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const history = commandHistory || [];
      const hasPwd = history.some(cmd => cmd.toLowerCase().trim() === 'pwd');
      const hasLs = history.some(cmd => cmd.toLowerCase().trim() === 'ls');

      if (hasPwd && hasLs) {
        return {
          completed: true,
          progressText: 'Wspaniale! Wywołałeś pwd oraz ls. Wiesz już, gdzie jesteś i co leży w Twoim folderze!'
        };
      }

      return {
        completed: false,
        progressText: `Postęp: pwd: [${hasPwd ? 'ZROBIONE' : 'CZEKA'}], ls: [${hasLs ? 'ZROBIONE' : 'CZEKA'}]. Wpisz je i naciśnij Enter.`
      };
    },
    successMessage: 'Niesamowite! pwd (print working directory) oraz ls (list) to absolutne fundamenty pracy z linią komend.'
  },
  {
    id: 'm5_linux_mkdir',
    title: 'Misja 5: Tworzenie folderu w Linux (mkdir)',
    category: 'linux',
    difficulty: 'Średni',
    description: 'Czas na działanie. Stwórz nowy katalog "Zadania" w folderze Documents za pomocą komendy tekstowej mkdir.',
    instructions: [
      'Wejdź do folderu Documents za pomocą komendy: "cd Documents" i naciśnij Enter.',
      'Sprawdź paski po prawej stronie - "Wizualny Podgląd Dysku" powinien automatycznie pokazać, że jesteś w Documents!',
      'Stwórz nowy katalog komendą: "mkdir Zadania" i naciśnij Enter.',
      'Spójrz na Wizualny Podgląd - folder Zadania powinien natychmiast się tam pojawić!'
    ],
    points: 50,
    initialState: {
      system: 'linux',
      currentPathId: 'uczen',
      nodes: createDefaultLinuxVFS()
    },
    checkCompleted: (nodes, currentPathId) => {
      // Find if folder "Zadania" exists inside "documents" node
      const docsId = 'documents';
      const children = getChildren(nodes, docsId);
      const hasZadania = children.find(child => child.name === 'Zadania' && child.type === 'directory');

      if (hasZadania) {
        return {
          completed: true,
          progressText: 'Sukces! Katalog "Zadania" został poprawnie utworzony wewnątrz Documents.'
        };
      }

      return {
        completed: false,
        progressText: 'Wskazówka: Wpisz najpierw "cd Documents", a potem "mkdir Zadania".'
      };
    },
    successMessage: 'Brawo! mkdir to skrót od "make directory". Nowy folder powstał błyskawicznie bez użycia myszki.'
  },
  {
    id: 'm6_linux_ninja',
    title: 'Misja 6: Pliki w linii komend (touch)',
    category: 'linux',
    difficulty: 'Trudny',
    description: 'Ostatnie wyzwanie! Połącz wszystkie umiejętności: wejdź głęboko w strukturę folderów i stwórz tam plik tekstowy za pomocą polecenia touch.',
    instructions: [
      'Wpisz komendę "cd Documents/Zadania" (lub wchodź po kolei: "cd Documents", a następnie "cd Zadania").',
      'Utwórz plik tekstowy za pomocą polecenia: "touch notatki.txt".',
      'Sprawdź, czy plik "notatki.txt" pojawił się w Wizualnym Podglądzie Dysku po prawej stronie.',
      'Na koniec, wpisz "ls", aby zweryfikować jego obecność w konsoli!'
    ],
    points: 60,
    initialState: {
      system: 'linux',
      currentPathId: 'uczen',
      // We start with Zadania already created, or we can use standard default Linux VFS but with Zadania pre-created to make it direct
      nodes: (() => {
        const base = createDefaultLinuxVFS();
        base['zadania_folder'] = {
          id: 'zadania_folder',
          name: 'Zadania',
          type: 'directory',
          parentId: 'documents',
          createdAt: '2026-07-15 11:00',
          size: 'Folder'
        };
        return base;
      })()
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      // We look for any directory named 'Zadania' and check if inside it there is 'notatki.txt'
      const zadaniaNode = Object.values(nodes).find(n => n.name === 'Zadania' && n.type === 'directory');
      
      if (zadaniaNode) {
        const children = getChildren(nodes, zadaniaNode.id);
        const hasFile = children.find(child => child.name === 'notatki.txt' && child.type === 'file');
        
        if (hasFile) {
          return {
            completed: true,
            progressText: 'Rewelacja! Utworzyłeś plik "notatki.txt" wewnątrz katalogu Zadania.'
          };
        }
      }

      return {
        completed: false,
        progressText: 'Wskazówka: Wejdź do folderu Zadania ("cd Documents/Zadania") i wpisz "touch notatki.txt".'
      };
    },
    successMessage: 'Niesamowite! Zdałeś Egzamin Mistrza Terminala! Umiesz nawigować i zarządzać plikami jak profesjonalny inżynier systemów.'
  },
  {
    id: 'm7_win_rename',
    title: 'Misja 7: Porządki w Pobranych (Windows)',
    category: 'windows',
    difficulty: 'Średni',
    description: 'Naucz się zmieniać nazwy plików na krótsze i łatwiejsze do zidentyfikowania, aby utrzymać porządek.',
    instructions: [
      'Wejdź do folderu "Pobrane" za pomocą lewego panelu bocznego lub klikając go dwukrotnie.',
      'Zaznacz plik "śmieszny_piesek.png" klikając na niego raz.',
      'Kliknij przycisk "Zmień Nazwę" (ikona ołówka) u góry paska narzędzi.',
      'Wpisz nową nazwę dokładnie: "piesek.png" i kliknij Zapisz.'
    ],
    points: 40,
    initialState: {
      system: 'windows',
      currentPathId: 'root',
      nodes: createDefaultWindowsVFS()
    },
    checkCompleted: (nodes, currentPathId) => {
      const downloadsFolderId = 'pobrane';
      const children = getChildren(nodes, downloadsFolderId);
      const hasPiesek = children.some(child => child.name === 'piesek.png' && child.type === 'file');
      const hasOld = children.some(child => child.name === 'śmieszny_piesek.png');

      if (hasPiesek && !hasOld) {
        return {
          completed: true,
          progressText: 'Super! Nazwa pliku została pomyślnie zmieniona na "piesek.png".'
        };
      }

      return {
        completed: false,
        progressText: 'Wskazówka: Przejdź do folderu Pobrane, zaznacz "śmieszny_piesek.png", kliknij "Zmień Nazwę" i nazwij go "piesek.png".'
      };
    },
    successMessage: 'Doskonale! Zmiana nazwy pliku na prostszą ułatwia zarządzanie i utrzymanie porządku na Twoim dysku twardym!'
  },
  {
    id: 'm8_linux_cat',
    title: 'Misja 8: Odczytywanie plików (cat)',
    category: 'linux',
    difficulty: 'Średni',
    description: 'Czas nauczyć się czytać zawartość plików bezpośrednio w konsoli bez uruchamiania edytorów graficznych!',
    instructions: [
      'Wejdź do katalogu Documents wpisując polecenie: "cd Documents" i wciskając Enter.',
      'Użyj komendy: "cat welcome.txt", aby wyświetlić i przeczytać powitalną zawartość pliku.',
      'Spójrz na historię wyjścia terminala, by zobaczyć wypisany tekst!'
    ],
    points: 40,
    initialState: {
      system: 'linux',
      currentPathId: 'uczen',
      nodes: createDefaultLinuxVFS()
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const history = commandHistory || [];
      const hasCatCommand = history.some(cmd => {
        const normalized = cmd.toLowerCase().trim().replace(/\s+/g, ' ');
        return normalized === 'cat welcome.txt' || normalized === 'cat documents/welcome.txt';
      });

      if (hasCatCommand) {
        return {
          completed: true,
          progressText: 'Sukces! Użyłeś polecenia cat do odczytania pliku welcome.txt.'
        };
      }

      return {
        completed: false,
        progressText: 'Wskazówka: Wpisz najpierw "cd Documents", a następnie "cat welcome.txt" i zatwierdź Enterem.'
      };
    },
    successMessage: 'Genialnie! Polecenie cat (od concatenate) wypisuje całą zawartość wskazanego pliku bezpośrednio na ekran terminala.'
  },
  {
    id: 'm9_linux_rm',
    title: 'Misja 9: Porządki w Terminalu (rm)',
    category: 'linux',
    difficulty: 'Średni',
    description: 'Czas posprzątać niepotrzebne pliki w Linuxie. Naucz się bezpiecznie usuwać pliki za pomocą polecenia rm.',
    instructions: [
      'Upewnij się, że jesteś w folderze domowym /home/uczen (wpisz cd lub pwd).',
      'Wpisz ls, aby sprawdzić zawartość. Zauważysz tam plik tymczasowy "temp.txt".',
      'Usuń ten plik wpisując polecenie: "rm temp.txt" i naciśnij Enter.'
    ],
    points: 50,
    initialState: {
      system: 'linux',
      currentPathId: 'uczen',
      nodes: (() => {
        const base = createDefaultLinuxVFS();
        base['temp_txt'] = {
          id: 'temp_txt',
          name: 'temp.txt',
          type: 'file',
          parentId: 'uczen',
          content: 'Tymczasowe notatki do usunięcia.',
          createdAt: '2026-07-15 12:00',
          size: '100 B'
        };
        return base;
      })()
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const hasTempFile = Object.values(nodes).some(node => node.name === 'temp.txt' && node.parentId === 'uczen');

      if (!hasTempFile) {
        return {
          completed: true,
          progressText: 'Wspaniale! Plik "temp.txt" został pomyślnie usunięty z Twojego folderu domowego!'
        };
      }

      return {
        completed: false,
        progressText: 'Wskazówka: Będąc w katalogu głównym uczen, wpisz polecenie "rm temp.txt" i zatwierdź Enterem.'
      };
    },
    successMessage: 'Świetna robota! Polecenie rm (od remove) natychmiastowo i trwale usuwa wskazany plik z systemu.'
  },
  {
    id: 'm10_win_subfolder_creation',
    title: 'Misja 10: Organizacja folderu Moje Gry',
    category: 'windows',
    difficulty: 'Trudny',
    description: 'Pokaż, że potrafisz zarządzać głębszymi poziomami struktury plików! Wejdź do podfolderu gier na Pulpicie i stwórz tam plik konfiguracyjny.',
    instructions: [
      'Przejdź na "Pulpit" (kliknij go na lewym panelu lub kliknij dwukrotnie w oknie głównym).',
      'Wejdź do folderu "Moje Gry", który znajduje się na Pulpicie.',
      'Kliknij przycisk "Nowy Plik" w górnym menu.',
      'Utwórz plik tekstowy o nazwie "gry.txt", aby zapisać plany rozgrywek.'
    ],
    points: 50,
    initialState: {
      system: 'windows',
      currentPathId: 'root',
      nodes: createDefaultWindowsVFS()
    },
    checkCompleted: (nodes, currentPathId) => {
      const gamesFolderId = 'gry_folder';
      const children = getChildren(nodes, gamesFolderId);
      const hasGryTxt = children.some(child => child.name === 'gry.txt' && child.type === 'file');

      if (hasGryTxt) {
        return {
          completed: true,
          progressText: 'Super! Stworzyłeś plik "gry.txt" wewnątrz folderu Moje Gry.'
        };
      }

      return {
        completed: false,
        progressText: 'Wskazówka: Wejdź na Pulpit → Moje Gry, a następnie utwórz tam plik tekstowy "gry.txt".'
      };
    },
    successMessage: 'Niewiarygodne! Opanowałeś struktury wielopoziomowe w systemie Windows do perfekcji. Jesteś prawdziwym ekspertem!'
  },
  {
    id: 'm11_linux_chmod_basic',
    title: 'Misja 11: Zabezpieczanie plików (chmod)',
    category: 'linux',
    difficulty: 'Średni',
    description: 'Chroń swoją prywatność! W systemie Linux uprawnienia określają, kto może czytać, zapisywać i uruchamiać pliki. Zmień uprawnienia pliku "welcome.txt", aby tylko właściciel miał do niego dostęp (użyj chmod 600).',
    instructions: [
      'Upewnij się, że jesteś w zakładce "Terminal Linux".',
      'Wejdź do podkatalogu Documents wpisując: "cd Documents" i wciskając Enter.',
      'Wpisz "ls -l" i naciśnij Enter, aby sprawdzić obecne szczegółowe uprawnienia pliku "welcome.txt" (oznaczone np. jako -rw-r--r--).',
      'Zmień uprawnienia pliku komendą: "chmod 600 welcome.txt" i zatwierdź Enterem.'
    ],
    points: 40,
    initialState: {
      system: 'linux',
      currentPathId: 'uczen',
      nodes: createDefaultLinuxVFS()
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const welcomeFile = Object.values(nodes).find(node => node.name === 'welcome.txt' && node.parentId === 'documents');
      if (welcomeFile && welcomeFile.permissions === '600') {
        return {
          completed: true,
          progressText: 'Fantastycznie! Zmieniłeś uprawnienia pliku "welcome.txt" na 600 (tylko odczyt i zapis dla właściciela).'
        };
      }
      return {
        completed: false,
        progressText: 'Wskazówka: Przejdź do Documents ("cd Documents") i wpisz komendę "chmod 600 welcome.txt".'
      };
    },
    successMessage: 'Świetnie! Wartość ósemkowa 600 (w binarnym 110 000 000) oznacza, że właściciel ma pełne prawa zapisu i odczytu (6 = rw-), a pozostali nie mają żadnych praw (0 = ---).'
  },
  {
    id: 'm12_linux_chmod_exec',
    title: 'Misja 12: Nadawanie praw wykonywania (chmod +x)',
    category: 'linux',
    difficulty: 'Trudny',
    description: 'Masz napisany skrypt w języku Python o nazwie "gra.py", ale w systemach Linux pliki skryptów nie mogą być uruchamiane bezpośrednio jako programy, dopóki nie nadasz im specjalnego prawa wykonywania (executable). Nadaj to uprawnienie dla "gra.py".',
    instructions: [
      'Upewnij się, że jesteś w katalogu Documents ("cd Documents").',
      'Wpisz "ls -l", aby zaobserwować domyślne uprawnienia pliku gra.py (brak litery "x" na końcu).',
      'Uruchom komendę: "chmod +x gra.py" (lub "chmod 755 gra.py") i naciśnij Enter.',
      'Ponownie wywołaj "ls -l" - zobaczysz, że plik stał się wykonywalny i zaznaczony na zielono!'
    ],
    points: 50,
    initialState: {
      system: 'linux',
      currentPathId: 'uczen',
      nodes: createDefaultLinuxVFS()
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const graFile = Object.values(nodes).find(node => node.name === 'gra.py' && node.parentId === 'documents');
      if (graFile && (graFile.permissions === '+x' || graFile.permissions === '755' || graFile.permissions === 'rwxr-xr-x')) {
        return {
          completed: true,
          progressText: 'Doskonale! Skrypt "gra.py" otrzymał prawa wykonywalności (executable).'
        };
      }
      return {
        completed: false,
        progressText: 'Wskazówka: Wejdź do Documents ("cd Documents") i wpisz komendę "chmod +x gra.py".'
      };
    },
    successMessage: 'Niesamowicie! Flaga "+x" (lub wartość 755) nadaje uprawnienia wykonywania (execute), przez co system wie, że plik można uruchomić jako program/skrypt.'
  },
  {
    id: 'm13_win_sort',
    title: 'Misja 13: Sortowanie plików w Windows 11',
    category: 'windows',
    difficulty: 'Średni',
    description: 'Uporządkuj pobrane pliki! W folderze "Pobrane" masz dużo plików o różnych rozmiarach i datach. Naucz się sortować zawartość folderu według rozmiaru malejąco (od największego), aby szybko namierzyć pliki pożerające miejsce na dysku.',
    instructions: [
      'Przejdź do folderu "Pobrane" w Eksploratorze Windows (kliknij go na lewym pasku bocznym).',
      'Zauważ nowo dodaną opcję "Sortuj" na górnym pasku narzędzi.',
      'Kliknij przycisk "Sortuj" i wybierz opcję "Rozmiar (Malejąco)", aby ułożyć pliki od największego do najmniejszego.'
    ],
    points: 40,
    initialState: {
      system: 'windows',
      currentPathId: 'root',
      nodes: createDefaultWindowsVFS()
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const history = commandHistory || [];
      const hasSorted = history.some(cmd => cmd === 'sort-size-desc');
      if (hasSorted && currentPathId === 'pobrane') {
        return {
          completed: true,
          progressText: 'Doskonale! Posortowałeś elementy w folderze Pobrane według rozmiaru malejąco.'
        };
      }
      return {
        completed: false,
        progressText: 'Wskazówka: Wejdź do folderu Pobrane, kliknij przycisk "Sortuj" i wybierz "Rozmiar (Malejąco)".'
      };
    },
    successMessage: 'Genialna robota! Sortowanie po rozmiarze malejąco to podstawowa metoda administratorów na szybkie odnajdywanie ciężkich instalatorów (np. plików .exe lub obrazów .iso) w celu zwolnienia miejsca na dysku!'
  },
  {
    id: 'm14_win_challenge_move',
    title: '⏱️ Misja Wyzwanie: Szybka Przeprowadzka',
    category: 'windows',
    difficulty: 'Trudny',
    description: 'Szybkie wyzwanie na czas! W folderze "Pobrane" masz bałagan. Znajdują się tam 3 pliki graficzne: "piesek.png", "kotek.jpg" oraz "rybka.gif". Twoim zadaniem jest przenieść wszystkie te 3 pliki do folderu "Zdjęcia" za pomocą paska narzędzi "Wytnij" i "Wklej" przed upływem czasu!',
    instructions: [
      'Wejdź do folderu "Pobrane" z paska bocznego w Eksploratorze Windows.',
      'Zaznacz plik, kliknij "Wytnij" na górnym pasku narzędzi.',
      'Wejdź do folderu "Zdjęcia", kliknij "Wklej" na górnym pasku narzędzi.',
      'Przenieś w ten sposób wszystkie 3 pliki: "piesek.png", "kotek.jpg", "rybka.gif"!'
    ],
    points: 60,
    initialState: {
      system: 'windows',
      currentPathId: 'root',
      nodes: {
        ...createDefaultWindowsVFS(),
        'obrazek_png': { id: 'obrazek_png', name: 'piesek.png', type: 'file', parentId: 'pobrane', content: '[Obrazek] Uroczy piesek.', createdAt: '2026-07-15 08:05', size: '180 KB' },
        'kotek_jpg': { id: 'kotek_jpg', name: 'kotek.jpg', type: 'file', parentId: 'pobrane', content: '[Obrazek] Słodki kotek bawiący się kłębkiem wełny.', createdAt: '2026-07-15 08:06', size: '220 KB' },
        'rybka_gif': { id: 'rybka_gif', name: 'rybka.gif', type: 'file', parentId: 'pobrane', content: '[Animacja] Złota rybka pływająca w akwarium.', createdAt: '2026-07-15 08:07', size: '450 KB' }
      }
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const p1 = nodes['obrazek_png'];
      const p2 = nodes['kotek_jpg'];
      const p3 = nodes['rybka_gif'];
      
      const p1Moved = p1 && p1.parentId === 'zdjęcia';
      const p2Moved = p2 && p2.parentId === 'zdjęcia';
      const p3Moved = p3 && p3.parentId === 'zdjęcia';
      
      let count = 0;
      if (p1Moved) count++;
      if (p2Moved) count++;
      if (p3Moved) count++;
      
      if (count === 3) {
        return {
          completed: true,
          progressText: 'Fantastycznie! Wszystkie 3 pliki zostały pomyślnie przeniesione do folderu Zdjęcia.'
        };
      }
      return {
        completed: false,
        progressText: `Przeniesiono: ${count}/3 plików ("piesek.png", "kotek.jpg", "rybka.gif"). Przenieś je wszystkie do folderu Zdjęcia!`
      };
    },
    successMessage: 'Genialnie! Opanowałeś sprawne posługiwanie się schowkiem systemowym do przenoszenia wielu plików. Wytnij i Wklej pozwala przenosić pliki bez pozostawiania kopii w starym miejscu, oszczędzając czas i zachowując idealny porządek!'
  },
  {
    id: 'm15_linux_grep',
    title: 'Misja 15: Przeszukiwanie plików tekstowych (grep)',
    description: 'Naucz się przeszukiwać wnętrza plików tekstowych za pomocą potężnej komendy grep w systemie Linux.',
    instructions: [
      'Wejdź do katalogu Documents wpisując „cd Documents”.',
      'Użyj polecenia „grep haslo raport.txt”, aby znaleźć linie zawierające słowo kluczowe.',
      'Zobacz odnalezione hasło wyróżnione na czerwono w terminalu!'
    ],
    category: 'linux',
    difficulty: 'Średni',
    points: 45,
    initialState: {
      system: 'linux',
      currentPathId: 'uczen',
      nodes: {
        ...createDefaultLinuxVFS(),
        'raport_txt': {
          id: 'raport_txt',
          name: 'raport.txt',
          type: 'file',
          parentId: 'documents',
          content: 'Raport bezpieczeństwa systemowego.\nBrak problemów w systemie.\nUruchomiono moduł szyfrujący.\nZapisano nowe tajne haslo: admin123\nKoniec raportu.',
          createdAt: '2026-07-15 10:15',
          size: '120 B'
        }
      }
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const history = commandHistory || [];
      const hasGrep = history.some(cmd => {
        const norm = cmd.toLowerCase().trim().replace(/\s+/g, ' ');
        return norm.startsWith('grep ') && (norm.includes('haslo') || norm.includes('hasło')) && norm.includes('raport.txt');
      });
      if (hasGrep) {
        return {
          completed: true,
          progressText: 'Super! Znalazłeś tajne hasło przy użyciu komendy grep.'
        };
      }
      return {
        completed: false,
        progressText: 'Wejdź do Documents (cd Documents) i użyj komendy: grep haslo raport.txt'
      };
    },
    successMessage: 'Niezwykłe! Komenda grep to jedno z najważniejszych narzędzi w systemach Linux. Pozwala błyskawicznie przeszukać tysiące linii kodu i logów w poszukiwaniu konkretnej informacji, bez konieczności ręcznego otwierania każdego pliku!'
  },
  {
    id: 'm16_win_search',
    title: 'Misja 16: Szukaj i znajdź w Windows',
    description: 'Wykorzystaj wbudowaną wyszukiwarkę w Eksploratorze Windows, aby błyskawicznie namierzyć zgubiony plik projektu szkolnego.',
    instructions: [
      'Kliknij na pole wyszukiwania „Szukaj...” w prawym górnym rogu Eksploratora Windows.',
      'Wpisz słowo „projekt”, aby uruchomić dynamiczne wyszukiwanie.',
      'Kliknij lewym przyciskiem myszy na znaleziony plik „projekt_semestralny.docx”, aby go zaznaczyć.'
    ],
    category: 'windows',
    difficulty: 'Średni',
    points: 45,
    initialState: {
      system: 'windows',
      currentPathId: 'root',
      nodes: {
        ...createDefaultWindowsVFS(),
        'szkola_projekt_folder': {
          id: 'szkola_projekt_folder',
          name: 'Archiwum_2025',
          type: 'directory',
          parentId: 'szkola_folder',
          createdAt: '2026-07-15 10:16',
          size: 'Folder'
        },
        'projekt_semestralny_docx': {
          id: 'projekt_semestralny_docx',
          name: 'projekt_semestralny.docx',
          type: 'file',
          parentId: 'szkola_projekt_folder',
          content: '[Dokument MS Word] Projekt semestralny na temat systemów operacyjnych. Ocena: celujący!',
          createdAt: '2026-07-15 10:20',
          size: '28 KB'
        }
      }
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const history = commandHistory || [];
      const hasSearched = history.some(action => action.startsWith('search:') && action.includes('projekt'));
      const hasSelected = history.some(action => action === 'select:projekt_semestralny_docx');
      
      if (hasSearched && hasSelected) {
        return {
          completed: true,
          progressText: 'Świetnie! Wyszukałeś słowo "projekt" i zaznaczyłeś plik projekt_semestralny.docx.'
        };
      } else if (hasSearched) {
        return {
          completed: false,
          progressText: 'Dobrze! Wpisałeś frazę w wyszukiwarkę. Teraz kliknij lewym przyciskiem myszy na znaleziony plik "projekt_semestralny.docx", aby go zaznaczyć.'
        };
      }
      return {
        completed: false,
        progressText: 'Wpisz "projekt" w wyszukiwarkę (u góry po prawej stronie), aby znaleźć plik "projekt_semestralny.docx".'
      };
    },
    successMessage: 'Wspaniale! Funkcja wyszukiwania w systemach operacyjnych to potężny sprzymierzeniec. Kiedy masz do czynienia z głębokimi strukturami katalogów, wbudowana wyszukiwarka oszczędza mnóstwo czasu, indeksując nazwy oraz zawartość plików dla błyskawicznych rezultatów!'
  }
];
