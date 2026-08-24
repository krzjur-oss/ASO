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
    id: 'badge_win_recycle_bin',
    title: 'Ratownik Danych',
    description: 'Przywrócono omyłkowo usunięty plik z Kosza w systemie Windows.',
    icon: '🩹',
    requirement: 'Ukończenie Misji 17'
  },
  {
    id: 'badge_linux_rm_perm',
    title: 'Świadomy Użytkownik',
    description: 'Zrozumiano bezpowrotne usuwanie plików komendą rm w Linux.',
    icon: '🗑️',
    requirement: 'Ukończenie Misji 18'
  },
  {
    id: 'badge_win_del_files',
    title: 'Pogromca Śmieci',
    description: 'Pomyślnie oczyszczono folder z niepotrzebnych plików tymczasowych i logów.',
    icon: '🧹',
    requirement: 'Ukończenie Misji 19'
  },
  {
    id: 'badge_linux_chown',
    title: 'Zarządca Własności',
    description: 'Opanowano przydzielanie praw własności do plików za pomocą komendy chown w Linux.',
    icon: '👑',
    requirement: 'Ukończenie Misji 20'
  },
  {
    id: 'badge_search_ext',
    title: 'Mistrz Rozszerzeń',
    description: 'Wyszukano dokumenty w całym systemie filtrując je po rozszerzeniu pliku.',
    icon: '🔍',
    requirement: 'Ukończenie Misji 21'
  },
  {
    id: 'badge_master',
    title: 'Certyfikowany Administrator',
    description: 'Ukończono wszystkie praktyczne wyzwania z Windows i Linux.',
    icon: '🏆',
    requirement: 'Ukończenie wszystkich 21 misji'
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
  },
  {
    id: 'm17_win_recycle_bin',
    title: 'Misja 17: Ratowanie z Kosza (Windows)',
    category: 'windows',
    difficulty: 'Średni',
    description: 'Opanuj korzystanie z Kosza systemowego. Przez pomyłkę usunięto z folderu Dokumenty plik „Przepis_na_naleśniki.txt”. Twoim zadaniem jest wejść do Kosza i go przywrócić!',
    instructions: [
      'Upewnij się, że jesteś w Eksploratorze Windows.',
      'Przejdź do folderu Dokumenty, zaznacz plik „Przepis_na_naleśniki.txt” i kliknij przycisk „Usuń” u góry (czerwony kosz).',
      'Następnie kliknij „Kosz” w lewym boczny panelu szybkiego dostępu.',
      'Zaznacz usunięty przepis w Koszu i kliknij przycisk „Przywróć dane” w górnym menu.'
    ],
    points: 45,
    initialState: {
      system: 'windows',
      currentPathId: 'dokumenty',
      nodes: createDefaultWindowsVFS()
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const history = commandHistory || [];
      const hasDeleted = history.includes('delete:przepis_txt');
      const hasRestored = history.includes('restore:przepis_txt');
      const fileNode = nodes['przepis_txt'];

      if (hasDeleted && hasRestored && fileNode && fileNode.parentId === 'dokumenty') {
        return {
          completed: true,
          progressText: 'Brawo! Pomyślnie usunąłeś plik Przepis_na_naleśniki.txt do Kosza, a następnie go stamtąd przywróciłeś.'
        };
      } else if (hasDeleted) {
        if (fileNode && fileNode.parentId === 'kosz') {
          return {
            completed: false,
            progressText: 'Super, plik jest w Koszu! Teraz kliknij na "Kosz" w lewym panelu, zaznacz plik Przepis_na_naleśniki.txt i kliknij przycisk "Przywróć dane".'
          };
        } else {
          return {
            completed: false,
            progressText: 'Dobrze, usunąłeś plik, ale jeszcze nie przywróciłeś go z Kosza. Przejdź do Kosza, kliknij lewym przyciskiem myszy na plik i kliknij "Przywróć dane".'
          };
        }
      }

      return {
        completed: false,
        progressText: 'Wejdź do folderu Dokumenty, zaznacz Przepis_na_naleśniki.txt, kliknij "Usuń" u góry, a potem przywróć go z Kosza.'
      };
    },
    successMessage: 'Niezwykłe! Kosz systemowy to warstwa bezpieczeństwa przed przypadkowym skasowaniem cennych plików. Usunięte elementy nie znikają od razu z dysku, dając użytkownikowi szansę na ich bezproblemowe odzyskanie!'
  },
  {
    id: 'm18_linux_rm_perm',
    title: 'Misja 18: Bezpowrotne usuwanie (Linux)',
    category: 'linux',
    difficulty: 'Średni',
    description: 'Naucz się, że w konsoli Linux komenda rm usuwa pliki bezpowrotnie. W tym systemie nie ma domyślnego Kosza w linii poleceń. Usuń niepotrzebny plik „welcome.txt” za pomocą polecenia rm.',
    instructions: [
      'Przełącz się do zakładki "Terminal Linux".',
      'Przejdź do folderu Documents wpisując „cd Documents” i wciskając Enter.',
      'Wpisz polecenie „rm welcome.txt”, aby bezpowrotnie usunąć plik.',
      'Wpisz komendę „ls”, aby upewnić się, że plik zniknął na zawsze.'
    ],
    points: 45,
    initialState: {
      system: 'linux',
      currentPathId: 'uczen',
      nodes: createDefaultLinuxVFS()
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const history = commandHistory || [];
      const hasRmCmd = history.some(cmd => {
        const norm = cmd.toLowerCase().trim().replace(/\s+/g, ' ');
        return norm === 'rm welcome.txt' || (norm.startsWith('rm ') && norm.includes('welcome.txt'));
      });
      const fileExists = 'notes_txt' in nodes || Object.values(nodes).some(n => n.name === 'welcome.txt');

      if (hasRmCmd && !fileExists) {
        return {
          completed: true,
          progressText: 'Doskonale! Usunąłeś plik welcome.txt na zawsze za pomocą rm.'
        };
      } else if (hasRmCmd) {
        return {
          completed: false,
          progressText: 'Wpisałeś polecenie, ale plik wciąż istnieje. Upewnij się, że jesteś w folderze Documents (cd Documents) i wpisz: rm welcome.txt'
        };
      }
      return {
        completed: false,
        progressText: 'Wejdź do Documents (cd Documents) i wpisz polecenie: rm welcome.txt'
      };
    },
    successMessage: 'Świetnie! Linia poleceń Linuxa zakłada, że administrator wie, co robi. Komenda rm nie przenosi plików do żadnego kosza — usuwa je od razu i na stałe. Zawsze używaj rm z dużą ostrożnością!'
  },
  {
    id: 'm19_win_delete_files',
    title: 'Misja 19: Usuwanie zbędnych plików (Windows)',
    category: 'windows',
    difficulty: 'Średni',
    description: 'W systemie Windows gromadzenie zbędnych plików tymczasowych oraz starych logów zaśmieca przestrzeń dyskową. Twoim zadaniem jest przejść do folderu „Pobrane” i usunąć niepotrzebne pliki: „instalator_stary.tmp” oraz „bledy_instalacji.log”, pozostawiając ważny dokument „Wazna_umowa.pdf” nienaruszony.',
    instructions: [
      'Upewnij się, że jesteś w Eksploratorze Windows i przejdź do folderu „Pobrane”.',
      'Zaznacz plik tymczasowy „instalator_stary.tmp” i usuń go (klikając przycisk „Usuń” w menu głównym lub używając klawisza Delete).',
      'Następnie zaznacz plik dziennika „bledy_instalacji.log” i również go usuń.',
      'Upewnij się, że ważny plik „Wazna_umowa.pdf” pozostał bezpieczny w folderze!'
    ],
    points: 50,
    initialState: {
      system: 'windows',
      currentPathId: 'pobrane',
      nodes: {
        ...createDefaultWindowsVFS(),
        'instalator_stary_tmp': {
          id: 'instalator_stary_tmp',
          name: 'instalator_stary.tmp',
          type: 'file',
          parentId: 'pobrane',
          content: 'Tymczasowe pliki instalatora gry...',
          createdAt: '2026-07-20 14:10',
          size: '124 MB'
        },
        'bledy_instalacji_log': {
          id: 'bledy_instalacji_log',
          name: 'bledy_instalacji.log',
          type: 'file',
          parentId: 'pobrane',
          content: '[LOG 2026-07-20] Nieudana próba instalacji biblioteki.',
          createdAt: '2026-07-20 14:12',
          size: '18 KB'
        },
        'wazna_umowa_pdf': {
          id: 'wazna_umowa_pdf',
          name: 'Wazna_umowa.pdf',
          type: 'file',
          parentId: 'pobrane',
          content: '[DOKUMENT PDF] Umowa gwarancyjna sprzętu komputerowego.',
          createdAt: '2026-07-21 09:30',
          size: '1.4 MB'
        }
      }
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const history = commandHistory || [];
      const hasDeletedTmp = history.includes('delete:instalator_stary_tmp') || !nodes['instalator_stary_tmp'] || nodes['instalator_stary_tmp'].parentId === 'kosz' || nodes['instalator_stary_tmp'].parentId !== 'pobrane';
      const hasDeletedLog = history.includes('delete:bledy_instalacji_log') || !nodes['bledy_instalacji_log'] || nodes['bledy_instalacji_log'].parentId === 'kosz' || nodes['bledy_instalacji_log'].parentId !== 'pobrane';
      const keepPdf = nodes['wazna_umowa_pdf'] && nodes['wazna_umowa_pdf'].parentId === 'pobrane';

      if (hasDeletedTmp && hasDeletedLog && keepPdf) {
        return {
          completed: true,
          progressText: 'Brawo! Pomyślnie usunąłeś zbędne pliki instalator_stary.tmp i bledy_instalacji.log, zachowując ważny plik Wazna_umowa.pdf.'
        };
      } else if (!keepPdf) {
        return {
          completed: false,
          progressText: 'Uwaga! Usunąłeś ważny plik "Wazna_umowa.pdf". Przywróć go z Kosza lub zresetuj misję.'
        };
      } else if (hasDeletedTmp && !hasDeletedLog) {
        return {
          completed: false,
          progressText: 'Dobrze! Usunąłeś instalator_stary.tmp. Teraz zaznacz i usuń plik dziennika "bledy_instalacji.log".'
        };
      } else if (!hasDeletedTmp && hasDeletedLog) {
        return {
          completed: false,
          progressText: 'Dobrze! Usunąłeś bledy_instalacji.log. Teraz zaznacz i usuń plik tymczasowy "instalator_stary.tmp".'
        };
      }

      return {
        completed: false,
        progressText: 'Przejdź do folderu Pobrane i usuń pliki "instalator_stary.tmp" oraz "bledy_instalacji.log".'
      };
    },
    successMessage: 'Świetna robota! Regularne czyszczenie plików tymczasowych (.tmp) oraz starych dzienników (.log) pozwala odzyskać cenne gigabajty na dysku i utrzymać porządek w systemie operacyjnym.'
  },
  {
    id: 'm20_linux_chown',
    title: 'Misja 20: Zmiana właściciela pliku – chown (Linux)',
    category: 'linux',
    difficulty: 'Średni',
    description: 'W systemie Linux każdy plik i folder ma przypisanego właściciela (użytkownika) oraz grupę. Jako administrator musisz przekazać własność kluczowego skryptu systemowego „skrypt_sieciowy.sh” użytkownikowi „root” za pomocą polecenia chown.',
    instructions: [
      'Przełącz się do zakładki "Terminal Linux".',
      'Wpisz polecenie „ls -l”, aby wyświetlić szczegółowe informacje o plikach, w tym ich właściciela (kolumna obok uprawnień).',
      'Wpisz polecenie „chown root skrypt_sieciowy.sh” (lub „sudo chown root skrypt_sieciowy.sh”), aby zmienić właściciela pliku na root.',
      'Wpisz ponownie „ls -l”, aby sprawdzić, czy użytkownik root stał się nowym właścicielem pliku.'
    ],
    points: 50,
    initialState: {
      system: 'linux',
      currentPathId: 'uczen',
      nodes: {
        ...createDefaultLinuxVFS(),
        'skrypt_sieciowy_sh': {
          id: 'skrypt_sieciowy_sh',
          name: 'skrypt_sieciowy.sh',
          type: 'file',
          parentId: 'uczen',
          permissions: '755',
          owner: 'uczen',
          group: 'uczen',
          content: '#!/bin/bash\necho "Konfiguracja interfejsu sieciowego eth0..."\nsystemctl restart networking',
          createdAt: '2026-07-22 11:00',
          size: '340 B'
        }
      }
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const history = commandHistory || [];
      const node = nodes['skrypt_sieciowy_sh'] || Object.values(nodes).find(n => n.name === 'skrypt_sieciowy.sh');
      const isOwnerRoot = node && node.owner === 'root';
      const hasChownCmd = history.some(cmd => {
        const norm = cmd.toLowerCase().trim().replace(/\s+/g, ' ');
        return norm.startsWith('chown ') || norm.startsWith('sudo chown ');
      });

      if (isOwnerRoot) {
        return {
          completed: true,
          progressText: 'Znakomicie! Zmieniłeś właściciela skryptu skrypt_sieciowy.sh na użytkownika root.'
        };
      } else if (hasChownCmd) {
        return {
          completed: false,
          progressText: 'Wpisałeś polecenie chown, ale upewnij się, że podałeś poprawnego właściciela i plik: chown root skrypt_sieciowy.sh'
        };
      }

      return {
        completed: false,
        progressText: 'Wpisz polecenie: chown root skrypt_sieciowy.sh, aby przekazać własność pliku administratorowi.'
      };
    },
    successMessage: 'Doskonale! Polecenie chown (change owner) jest fundamentem bezpieczeństwa i administracji w środowisku Linux. Pozwala administratorowi (root) kontrolować, które procesy i użytkownicy mają prawo zarządzać poszczególnymi plikami i usługami systemowymi.'
  },
  {
    id: 'm21_search_by_extension',
    title: 'Misja 21: Wyszukiwanie plików po rozszerzeniu (*.pdf / *.log)',
    category: 'windows',
    difficulty: 'Średni',
    description: 'Gdy na dysku znajduje się mnóstwo katalogów i podkatalogów, ręczne szukanie konkretnych typów dokumentów jest czasochłonne. Wykorzystaj wyszukiwanie z użyciem filtra rozszerzenia (*.pdf lub .pdf), aby odnaleźć i zaznaczyć zagubiony raport w formacie PDF.',
    instructions: [
      'Otwórz Eksplorator Windows.',
      'W polu wyszukiwania w prawym górnym rogu wpisz „*.pdf” (lub „.pdf”), aby wyświetlić wszystkie pliki PDF w całym systemie.',
      'Zobacz, jak wyszukiwarka natychmiast filtruje pliki wyłącznie o tym rozszerzeniu z różnych folderów.',
      'Kliknij lewym przyciskiem myszy na odnaleziony plik „Raport_Finansowy_2026.pdf”, aby go zaznaczyć.'
    ],
    points: 50,
    initialState: {
      system: 'windows',
      currentPathId: 'root',
      nodes: {
        ...createDefaultWindowsVFS(),
        'projekty_archiwum_folder': {
          id: 'projekty_archiwum_folder',
          name: 'Archiwum_Projektow',
          type: 'directory',
          parentId: 'dokumenty',
          createdAt: '2026-07-10 09:00',
          size: 'Folder'
        },
        'raport_finansowy_pdf': {
          id: 'raport_finansowy_pdf',
          name: 'Raport_Finansowy_2026.pdf',
          type: 'file',
          parentId: 'projekty_archiwum_folder',
          content: '[DOKUMENT PDF] Roczny bilans finansowy projektu szkolnego. Wszystkie wskaźniki na zielono.',
          createdAt: '2026-07-10 09:15',
          size: '3.2 MB'
        },
        'specyfikacja_pdf': {
          id: 'specyfikacja_pdf',
          name: 'Specyfikacja_Techniczna.pdf',
          type: 'file',
          parentId: 'pobrane',
          content: '[DOKUMENT PDF] Specyfikacja techniczna infrastruktury serwerowej.',
          createdAt: '2026-07-12 14:20',
          size: '820 KB'
        },
        'log_systemu_txt': {
          id: 'log_systemu_txt',
          name: 'log_systemu.txt',
          type: 'file',
          parentId: 'dokumenty',
          content: 'Zapis zdarzeń systemowych.',
          createdAt: '2026-07-12 15:00',
          size: '14 KB'
        }
      }
    },
    checkCompleted: (nodes, currentPathId, commandHistory) => {
      const history = commandHistory || [];
      const hasSearchedPdf = history.some(action => 
        action.startsWith('search:') && (
          action.includes('.pdf') || 
          action.includes('*.pdf') || 
          action.includes('pdf')
        )
      );
      const hasSelectedRaport = history.some(action => 
        action === 'select:raport_finansowy_pdf' || 
        action.includes('raport_finansowy')
      );

      if (hasSearchedPdf && hasSelectedRaport) {
        return {
          completed: true,
          progressText: 'Świetnie! Wyszukałeś pliki po rozszerzeniu PDF i zaznaczyłeś Raport_Finansowy_2026.pdf.'
        };
      } else if (hasSearchedPdf) {
        return {
          completed: false,
          progressText: 'Bardzo dobrze! Wpisałeś filtr rozszerzenia. Teraz kliknij lewym przyciskiem myszy na znaleziony plik "Raport_Finansowy_2026.pdf", aby go zaznaczyć.'
        };
      }

      return {
        completed: false,
        progressText: 'Wpisz "*.pdf" lub ".pdf" w pole wyszukiwania u góry, a następnie zaznacz plik "Raport_Finansowy_2026.pdf".'
      };
    },
    successMessage: 'Wspaniale! Filtrowanie plików po rozszerzeniu (*.pdf, *.docx, *.jpg, *.log) to niesamowicie przydatna umiejętność. Pozwala wyodrębnić tylko te pliki, których w danej chwili potrzebujesz, bez konieczności pamiętania ich pełnych nazw.'
  }
];
