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
  Info
} from 'lucide-react';

interface TheorySectionProps {
  onAddXP: (points: number) => void;
  quizDone: boolean;
  setQuizDone: (done: boolean) => void;
}

export default function TheorySection({ onAddXP, quizDone, setQuizDone }: TheorySectionProps) {
  const [activeTab, setActiveTab] = useState<'basics' | 'paths' | 'terminal' | 'quiz'>('basics');
  
  // Quiz State
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const quizQuestions = [
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
    }
  ];

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (checked) return;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleCheckQuiz = () => {
    let rightAnswers = 0;
    quizQuestions.forEach(q => {
      if (answers[q.id] === q.correct) {
        rightAnswers++;
      }
    });
    setScore(rightAnswers);
    setChecked(true);
    
    if (!quizDone) {
      setQuizDone(true);
      // Award XP for taking quiz: 25 XP per correct answer, min 50 XP
      const xpEarned = Math.max(50, rightAnswers * 25);
      onAddXP(xpEarned);
    }
  };

  const handleResetQuiz = () => {
    setAnswers({});
    setChecked(false);
    setScore(0);
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
          className={`flex-1 py-4 px-6 text-sm font-bold border-b-2 text-center whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'basics'
              ? 'border-[#5E81AC] text-[#5E81AC] bg-white'
              : 'border-transparent text-[#4C566A] hover:text-[#2E3440] hover:bg-[#ECEFF4]/50'
          }`}
          id="tab-basics-btn"
        >
          <Folder className="w-4 h-4" />
          1. Pliki i Katalogi
        </button>
        <button
          onClick={() => setActiveTab('paths')}
          className={`flex-1 py-4 px-6 text-sm font-bold border-b-2 text-center whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'paths'
              ? 'border-[#5E81AC] text-[#5E81AC] bg-white'
              : 'border-transparent text-[#4C566A] hover:text-[#2E3440] hover:bg-[#ECEFF4]/50'
          }`}
          id="tab-paths-btn"
        >
          <ChevronRight className="w-4 h-4" />
          2. Ścieżki (Windows vs Linux)
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex-1 py-4 px-6 text-sm font-bold border-b-2 text-center whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'terminal'
              ? 'border-[#5E81AC] text-[#5E81AC] bg-white'
              : 'border-transparent text-[#4C566A] hover:text-[#2E3440] hover:bg-[#ECEFF4]/50'
          }`}
          id="tab-terminal-btn"
        >
          <Terminal className="w-4 h-4" />
          3. Komendy Terminala
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-4 px-6 text-sm font-bold border-b-2 text-center whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'quiz'
              ? 'border-[#5E81AC] text-[#5E81AC] bg-white'
              : 'border-transparent text-[#4C566A] hover:text-[#2E3440] hover:bg-[#ECEFF4]/50'
          }`}
          id="tab-quiz-btn"
        >
          <HelpCircle className="w-4 h-4" />
          4. Sprawdź Wiedzę (Quiz)
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
          </div>
        )}

        {/* Tab 4: Quiz */}
        {activeTab === 'quiz' && (
          <div className="space-y-6 animate-fadeIn" id="content-quiz">
            <div className="text-center max-w-xl mx-auto mb-8">
              <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800">Sprawdź swoją wiedzę!</h3>
              <p className="text-gray-500 text-sm">Rozwiąż ten krótki quiz, aby ugruntować swoją wiedzę przed symulatorem i zgarnąć punkty!</p>
            </div>

            <div className="space-y-6 max-w-3xl mx-auto">
              {quizQuestions.map((q, idx) => {
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
                    disabled={Object.keys(answers).length < quizQuestions.length}
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
                        Twój wynik: {score} / {quizQuestions.length} ({Math.max(50, score * 25)} XP!)
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
