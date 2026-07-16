# Akademia Systemów Operacyjnych 💻

Interaktywny, grywalizacyjny symulator systemów operacyjnych Windows 11 oraz Linux Ubuntu stworzony specjalnie dla uczniów szkoły podstawowej. Pomaga opanować pracę na plikach i folderach, ścieżki dostępu oraz podstawowe polecenia terminala.

---

## 🚀 Jak opublikować aplikację na GitHub Pages?

Aplikacja została przygotowana do łatwej publikacji na darmowym hostingu **GitHub Pages**. Wybierz jedną z poniższych metod:

### Metoda 1: Automatyczna przez GitHub Actions (Zalecana)

W projekcie został już w pełni skonfigurowany proces automatycznego wdrażania (plik `.github/workflows/deploy.yml`). 

1. **Utwórz nowe repozytorium na swoim GitHubie** (np. `akademia-systemow-operacyjnych`). Dozwolone jest zarówno repozytorium prywatne, jak i publiczne.
2. **Wyślij kod ze swojego komputera do repozytorium na GitHubie**:
   ```bash
   git init
   git add .
   git commit -m "Inicjalizacja projektu Akademii"
   git branch -M main
   git remote add origin https://github.com/TWÓJ-LOGIN/NAZWA-REPOZYTORIUM.git
   git push -u origin main
   ```
3. **Włącz uprawnienia do publikacji na GitHubie**:
   - Wejdź w swoim repozytorium na GitHubie w zakładkę **Settings** (Ustawienia).
   - W menu bocznym po lewej stronie kliknij **Pages**.
   - W sekcji **Build and deployment** znajdź opcję **Source** i zmień ją z `Deploy from a branch` na **`GitHub Actions`**.
4. **Gotowe!** Przy każdym kolejnym wysłaniu kodu poleceniem `git push`, GitHub sam skompiluje i opublikuje najnowszą wersję gry. Adres strony wyświetli się w zakładce *Pages* oraz w sekcji *Deployments* na stronie głównej repozytorium.

---

### Metoda 2: Ręczna publikacja na gałęzi `gh-pages`

Jeśli wolisz tradycyjną metodę z budowaniem na swoim komputerze:

1. Zainstaluj darmowe narzędzie pomocnicze `gh-pages`:
   ```bash
   npm install gh-pages --save-dev
   ```
2. Dodaj skrypty wdrożeniowe do pliku `package.json` w sekcji `"scripts"`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. Uruchom wdrożenie wpisując w terminalu:
   ```bash
   npm run deploy
   ```
   Projekt zostanie zbudowany i automatycznie przesłany na nowo utworzoną gałąź `gh-pages` w Twoim repozytorium, skąd GitHub wyświetli gotową stronę.

---

## 🛠️ Zastosowane dostosowania pod GitHub Pages

W ramach przygotowania kodu do publikacji:
* **`vite.config.ts`**: Skonfigurowano parametr `base: './'`, co pozwala na relatywne wczytywanie plików graficznych, czcionek oraz skryptów JS. Dzięki temu strona działa bezbłędnie bez względu na to, czy znajduje się w głównym adresie, czy w podfolderze (np. `https://username.github.io/akademia-so/`).
* **`.github/workflows/deploy.yml`**: Utworzono definicję potoku CI/CD dla GitHub Actions, która automatycznie i bezpłatnie kompiluje i serwuje produkcyjny folder `dist`.

---
*Autor programu: mgr Krzysztof Jureczek · KrzJur@gmail.com*
