# 🤖 Instrukcja dla Agenta: Dodawanie aplikacji z kodem na GitHub i wdrożeniem na własnej domenie (Custom Domain)

Niniejsza instrukcja opisuje procedurę rejestracji w **WD HUB** aplikacji, których kod źródłowy znajduje się w repozytorium GitHub, ale sama aplikacja działa na zewnętrznej, dedykowanej domenie (np. `meme.wowkdigitalx.pl`).

W tym scenariuszu dostarczane są dwa parametry wejściowe:
1. **Adres aplikacji (Dedykowana domena):** Np. `meme.wowkdigitalx.pl`
2. **URL Repozytorium GitHub:** Np. `https://github.com/WowkDigital/MemeBattleWD`

---

## 🛠️ Sposób 1: Automatyczny skrypt (Zalecany)

Uruchom skrypt `scripts/add_app.py`, przekazując repozytorium GitHub jako główny argument oraz dedykowany adres strony za pomocą parametru `--url`.

> [!IMPORTANT]
> Skrypt oraz sterownik Selenium wymagają podania pełnego protokołu (np. `https://` lub `http://`). Jeśli podano surową domenę `meme.wowkdigitalx.pl`, na potrzeby komendy musisz dopisać przed nią protokół `https://` (czyli `https://meme.wowkdigitalx.pl`).

### Format komendy:
```powershell
python scripts/add_app.py <URL_Repozytorium_GitHub> --url https://<Dedykowana_Domena> [dodatkowe opcje]
```

### Przykład użycia:
Dla parametrów:
- GitHub: `https://github.com/WowkDigital/MemeBattleWD`
- Strona: `meme.wowkdigitalx.pl`

Uruchom:
```powershell
python scripts/add_app.py https://github.com/WowkDigital/MemeBattleWD --url https://meme.wowkdigitalx.pl --icon globe --color purple-500 --effect neon
```

Skrypt automatycznie:
1. Pobierze dane z repozytorium GitHub (w tym opis, jeśli istnieje).
2. Uruchomi przeglądarkę headless i wykona zrzut ekranu strony `https://meme.wowkdigitalx.pl` do folderu `assets/MemeBattleWD/preview.png`.
3. Zsynchronizuje manifest zasobów za pomocą `sync-assets.js`.
4. Doda nowy wpis do pliku `js/data.js`.
5. Usunie cache statystyk (`github-stats-cache.json`).

---

## 🛠️ Sposób 2: Procedura ręczna (Fallback)

Jeśli automatyczny skrypt lub Selenium zgłosi błąd, wykonaj procedurę ręcznie:

### Krok 1: Struktura plików i zrzut ekranu
1. Utwórz folder w katalogu `assets/` o nazwie tożsamej z nazwą repozytorium (np. `assets/MemeBattleWD`).
2. Otwórz domenę docelową (np. `https://meme.wowkdigitalx.pl`) w przeglądarce za pomocą narzędzia `browser_subagent`.
3. Wykonaj zrzut ekranu całej strony (lub jej reprezentatywnego elementu) i zapisz go jako `preview.png` w utworzonym folderze (np. `assets/MemeBattleWD/preview.png`).
4. Uruchom synchronizację zasobów w terminalu:
   ```powershell
   node scripts/sync-assets.js
   ```

### Krok 2: Wpis w bazie danych projektów (`js/data.js`)
Otwórz plik `js/data.js` i dopisz nową aplikację na końcu tablicy `projects`. Skonfiguruj klucze `url` oraz `github` zgodnie z poniższym wzorem:

```javascript
    {
        title: "Meme Battle WD", // Tytuł aplikacji
        description: "Dynamiczna aplikacja do głosowania na najlepsze memy.", // Krótki opis (do 120 znaków)
        longDescription: "Projekt MemeBattleWD to platforma pozwalająca użytkownikom na ocenianie memów w systemie ELO ranking. Całość działa na dedykowanym serwerze i posiada pełną integrację z bazą danych.", // Długi opis w oknie modalnym
        url: "https://meme.wowkdigitalx.pl/", // Dedykowana domena aplikacji (zakończona slashem '/')
        github: "https://github.com/WowkDigital/MemeBattleWD", // URL repozytorium na GitHubie
        icon: "globe", // Wybrana ikona Lucide (np. globe, layers, atom itp.)
        color: "purple-500", // Kolor wiodący Tailwind CSS
        effect: "neon", // Efekt hover ('neon', 'glitch', 'hueRotate', 'matrix')
        imageFolder: "assets/MemeBattleWD" // Ścieżka do folderu ze zrzutami
    }
```

---

## 🔄 Finalizacja i czyszczenie pamięci podręcznej (Cache)

Niezależnie od wybranego sposobu wdrożenia karty, musisz zresetować pamięć podręczną statystyk GitHub, aby WD HUB poprawnie wczytał dane o gwiazdkach i dacie aktualizacji nowego repozytorium.

1. **Skasuj plik cache:**
   ```powershell
   Remove-Item -Path "github-stats-cache.json" -ErrorAction SilentlyContinue
   ```
2. **Zrestartuj serwer backendowy Node.js:**
   Jeżeli serwer działa w tle, zatrzymaj go i uruchom ponownie za pomocą:
   ```powershell
   node server.js
   ```
3. **Przeprowadź weryfikację wizualną:**
   Otwórz `http://localhost:3000/` w przeglądarce i upewnij się, że:
   - Nowa karta pojawiła się na dashboardzie.
   - Kliknięcie ikony GitHub kieruje do `https://github.com/WowkDigital/MemeBattleWD`.
   - Kliknięcie przycisku "Launch Project" otwiera `https://meme.wowkdigitalx.pl/`.
   - Zrzut ekranu w oknie modalnym wczytuje się bez błędów 404.
