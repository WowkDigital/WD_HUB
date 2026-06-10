# 🤖 Instrukcja dla Agenta AI: Autonomiczne dodawanie nowej karty aplikacji do WD HUB

Niniejszy dokument jest przeznaczony dla autonomicznych agentów AI. Zawiera precyzyjne kroki, oczekiwane komendy, procedury obsługi błędów oraz wytyczne walidacji niezbędne do dodania nowej karty projektu/aplikacji w panelu **WD HUB**.

---

## 🎯 Cel
Zarejestrować nową aplikację w plikach konfiguracyjnych WD HUB (`js/data.js`), wygenerować lub dostarczyć odpowiedni zrzut ekranu (preview) do folderu `assets/` oraz upewnić się, że statystyki GitHub są prawidłowo pobierane i wyświetlane.

---

## 🛠️ Procedura dodawania aplikacji

Agent powinien dążyć do wykonania zadania za pomocą skryptu automatycznego, a w razie problemów (np. brak zależności środowiskowych dla Selenium) płynnie przejść do procedury manualnej.

> [!NOTE]
> Jeśli dodawana aplikacja posiada kod źródłowy na GitHubie, lecz jej wersja produkcyjna działa na własnej, dedykowanej domenie (np. `meme.wowkdigitalx.pl`), skorzystaj z osobnej instrukcji: [adding_custom_domain_app_guide.md](adding_custom_domain_app_guide.md).


### Krok 1: Wykorzystanie skryptu automatyzującego (Zalecane)

Uruchom skrypt `scripts/add_app.py` za pomocą powłoki systemowej (PowerShell / CMD). Skrypt ten pobiera dane z API GitHub, próbuje wykonać zrzut ekranu za pomocą Selenium, aktualizuje manifest zasobów oraz rejestruje nową aplikację w `js/data.js`.

**Format komendy:**
```powershell
python scripts/add_app.py <URL_Repozytorium_GitHub> [opcje]
```

**Dostępne parametry:**
- `<URL_Repozytorium_GitHub>`: Adres url repozytorium (np. `https://github.com/WowkDigital/MemoCard`) - **wymagany**.
- `--url`: Niestandardowy adres wdrożenia (jeśli różni się od GitHub Pages / pola `homepage` w repozytorium).
- `--icon`: Nazwa ikony z biblioteki Lucide Icons (np. `layers`, `atom`, `activity`, `globe`, `orbit`, `waves`).
- `--color`: Klasa koloru Tailwind (np. `indigo-500`, `emerald-500`, `amber-500`, `purple-500`, `slate-400`).
- `--effect`: Efekt najechania hover (do wyboru: `hueRotate`, `glitch`, `matrix`, `shake`, `neon`, domyślnie: `hueRotate`).
- `--title`: Niestandardowy tytuł karty.
- `--desc`: Krótki opis (do 1-2 zdań, max 100-120 znaków).
- `--long-desc`: Pełny opis wyświetlany w oknie modalnym.

**Przykład:**
```powershell
python scripts/add_app.py https://github.com/WowkDigital/MemoCard --icon layers --color indigo-500 --effect hueRotate
```

---

### Krok 2: Obsługa awarii środowiska Selenium (Fallback)

Skrypt `add_app.py` wymaga zainstalowanego pakietu `selenium` oraz zainstalowanej przeglądarki Chrome z odpowiednim WebDriverem. Jeśli podczas wykonywania skryptu napotkasz błąd typu `ModuleNotFoundError: No module named 'selenium'` lub błąd powiązany z WebDriverem Chrome, wykonaj następujące kroki:

1. **Ręczne utworzenie folderu zasobów:**
   Stwórz folder w katalogu `assets/` o nazwie odpowiadającej nazwie repozytorium (np. `assets/MemoCard`).
2. **Pozyskanie zrzutu ekranu:**
   - Jeśli posiadasz narzędzie przeglądarki (`browser_subagent`), otwórz docelowy adres URL aplikacji, zrób zrzut ekranu całej strony lub jej kluczowego widoku, a następnie zapisz go jako `preview.png` w nowo utworzonym folderze (np. `assets/MemoCard/preview.png`).
   - W przypadku braku możliwości wykonania screenshotu, wygeneruj lub skopiuj estetyczny obraz zastępczy (np. o wymiarach 16:9 w ciemnej kolorystyce) i zapisz go jako `preview.png`.
3. **Uruchomienie synchronizacji manifestu zasobów:**
   Wpis do manifestu (`assetsManifest` w `js/data.js`) musi zostać zaktualizowany. Uruchom skrypt synchronizujący za pomocą Node.js:
   ```powershell
   node scripts/sync-assets.js
   ```
4. **Ręczna edycja pliku `js/data.js`:**
   Otwórz plik `js/data.js` i dodaj obiekt reprezentujący nową aplikację na końcu tablicy `projects`.
   
   **Format obiektu:**
   ```javascript
   {
       title: "Nazwa Aplikacji",
       description: "Krótki, dynamiczny opis wyświetlany na karcie (1-2 zdania).",
       longDescription: "Szczegółowy opis projektu, jego kluczowych funkcjonalności oraz technologii użytych do budowy. Ten opis wyświetli się w oknie modalnym.",
       url: "https://wowkdigital.github.io/NazwaRepozytorium/",
       github: "https://github.com/WowkDigital/NazwaRepozytorium",
       icon: "activity", // Identyfikator ikony z Lucide Icons
       color: "emerald-500", // Klasa koloru Tailwind CSS
       effect: "hueRotate", // Efekt hover ('hueRotate', 'glitch', 'matrix', 'shake', 'neon' lub brak)
       imageFolder: "assets/NazwaRepozytorium" // Dokładna ścieżka do folderu z preview.png
   }
   ```

---

### Krok 3: Czyszczenie pamięci podręcznej i restart serwera

Aby dane statystyk GitHub (data utworzenia i ostatniej aktualizacji) zostały natychmiastowo pobrane z API i przypisane do nowej karty, należy zresetować cache.

1. **Usuń plik pamięci podręcznej:**
   ```powershell
   Remove-Item -Path "github-stats-cache.json" -ErrorAction SilentlyContinue
   ```
2. **Zrestartuj serwer backendowy (Node.js):**
   Jeśli serwer `server.js` jest uruchomiony w tle, zrestartuj go. Jeśli nie jest uruchomiony, uruchom go ponownie za pomocą:
   ```powershell
   node server.js
   ```
   Serwer przy starcie zauważy brak pliku `github-stats-cache.json`, wyśle nowe żądania do API GitHub i wygeneruje aktualny cache zawierający statystyki dla wszystkich zarejestrowanych projektów.

---

## 🔍 Kryteria Weryfikacji (Checklista dla Agenta)

Po dokonaniu zmian wykonaj poniższą walidację (wykorzystaj do tego `browser_subagent` lub testy integracyjne):

1. [ ] **Poprawność składniowa JS:** Plik `js/data.js` nie posiada błędów składniowych i poprawnie eksportuje tablicę `projects` oraz obiekt `assetsManifest`.
2. [ ] **Karta na Dashboardzie:** Nowy projekt pojawia się zarówno w sekcji "Featured Projects", jak i w "A-Z Gallery" na stronie głównej `http://localhost:3000/`.
3. [ ] **Ikona Lucide:** Ikona zdefiniowana w parametrze `icon` renderuje się poprawnie (nie wyświetla się pusty obszar).
4. [ ] **Zrzut ekranu (Preview Image):** Po kliknięciu w kartę otwiera się modal szczegółów, a grafika zrzutu ekranu wczytuje się bez błędów 404.
5. [ ] **Adresy URL:** Linki "Launch Project" (przycisk otwierania) oraz "GitHub" (ikona kodu źródłowego) kierują na właściwe adresy.
6. [ ] **Statystyki GitHub:** Na karcie wyświetlają się poprawne daty w formatach "Created" oraz "Updated" zamiast "N/A" lub ciągłego stanu "Loading...".

---
> **Wskazówka:** W przypadku braku tokenu GitHub API w środowisku, zapytania o statystyki mogą napotkać limity (Rate Limit). W takiej sytuacji serwer może pobrać dane z dużym opóźnieniem lub wyświetlić domyślne dane zapasowe. Agent powinien upewnić się, że serwer pomyślnie przetworzył zapytanie i nie zgłosił krytycznych wyjątków.
