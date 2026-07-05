# 🤖 Uniwersalna Instrukcja dla Agenta AI: Rejestracja nowej aplikacji w WD HUB

Niniejszy dokument stanowi jedyną, kompletną i uniwersalną instrukcję dla agentów AI dotyczącą dodawania nowych aplikacji/kart projektów do panelu **WD HUB**.

---

## 🧭 Analiza Danych Wejściowych (Rozróżnienie Typu Wdrożenia)

Agent musi przeanalizować dane wejściowe dostarczone przez użytkownika w celu ustalenia lokalizacji wdrożenia (adresu produkcyjnego strony):

1. **SCENARIUSZ A: Podano tylko link do repozytorium GitHub**
   - *Przykład:* `https://github.com/WowkDigital/MemoCard`
   - *Lokalizacja strony (URL wdrożenia):* Domyślne GitHub Pages o formacie:
     `https://wowkdigital.github.io/<NazwaRepozytorium>/` (np. `https://wowkdigital.github.io/MemoCard/`).

2. **SCENARIUSZ B: Podano link do GitHub oraz dodatkowy link zewnętrzny (spoza GitHub)**
   - *Przykład:* GitHub: `https://github.com/WowkDigital/MemeBattleWD`, Zewnętrzny: `meme.wowkdigitalx.pl` lub `https://wowkdigital.dkonto.pl/ftp/map_hex/`
   - *Lokalizacja strony (URL wdrożenia):* Dostarczony dodatkowy adres zewnętrzny.
   - > [!IMPORTANT]
     > Upewnij się, że adres wdrożenia posiada pełny protokół (np. `https://meme.wowkdigitalx.pl/`). Jeśli podano surową domenę `meme.wowkdigitalx.pl`, przed użyciem w skrypcie/konfiguracji dodaj do niej protokół `https://` oraz końcowy ukośnik `/`.

---

## ⚡ Metoda 1: Automatyczna przy użyciu skryptu (Zalecana)

Głównym sposobem dodawania aplikacji jest uruchomienie skryptu `scripts/add_app.py`. Skrypt ten automatycznie odpytuje GitHub API, wykonuje screenshot strony za pomocą Selenium, aktualizuje manifest zasobów w `js/data.js` oraz rejestruje nową aplikację.

### Uruchomienie skryptu w zależności od scenariusza:

* **Dla Scenariusza A (Tylko GitHub Pages):**
  ```powershell
  python scripts/add_app.py https://github.com/WowkDigital/<NazwaRepozytorium> [opcje_stylu]
  ```
  *Przykład:*
  ```powershell
  python scripts/add_app.py https://github.com/WowkDigital/MemoCard --icon layers --color indigo-500 --effect hueRotate
  ```

* **Dla Scenariusza B (Wdrożenie na własnej domenie / zewnętrznym URL):**
  ```powershell
  python scripts/add_app.py https://github.com/WowkDigital/<NazwaRepozytorium> --url https://<Zewnetrzny_Adres_Aplikacji>/ [opcje_stylu]
  ```
  *Przykład:*
  ```powershell
  python scripts/add_app.py https://github.com/WowkDigital/MemeBattleWD --url https://meme.wowkdigitalx.pl/ --icon globe --color purple-500 --effect neon
  ```

### Opcje stylu i konfiguracji (`[opcje_stylu]`):
- `--icon`: Identyfikator ikony z Lucide Icons (np. `layers`, `atom`, `globe`, `activity`, `orbit`, `waves`, `train`, `pen-tool`). Domyślnie: `globe`.
- `--color`: Klasa koloru Tailwind CSS dla obramowań i akcentów (np. `indigo-500`, `emerald-500`, `amber-500`, `purple-500`, `pink-500`, `sky-400`). Domyślnie: `primary`.
- `--effect`: Efekt najechania hover na kartę (do wyboru: `hueRotate`, `glitch`, `matrix`, `shake`, `neon`; domyślnie: `hueRotate`).
- `--title`: Niestandardowy tytuł karty (domyślnie pobierany z nazwy repozytorium GitHub).
- `--desc`: Krótki opis wyświetlany bezpośrednio na karcie (maksymalnie 1-2 zdania, do 120 znaków).
- `--long-desc`: Pełny, szczegółowy opis wyświetlany w oknie modalnym (szczegóły technologii itp.).
- `--no-screenshot`: Pomija automatyczne tworzenie zrzutu ekranu przez przeglądarkę bezgłową (Selenium), przyspieszając proces.

---

## 🛠️ Metoda 2: Procedura ręczna (Fallback)

Jeśli automatyczny skrypt zgłosi błąd (np. błąd Selenium, brak zainstalowanego WebDrivera/Chrome, błędy sieciowe), wykonaj poniższe kroki ręcznie:

### Krok 1: Struktura folderów i zrzut ekranu (Preview Image)
1. Utwórz folder dla zasobów aplikacji w katalogu `assets/` o nazwie tożsamej z nazwą repozytorium:
   ```powershell
   mkdir "assets/<NazwaRepozytorium>"
   ```
2. Pozyskaj zrzut ekranu aplikacji (preferowany ciemny motyw, proporcje 16:9, rozdzielczość minimum 1280x720) i zapisz go jako `preview.png` w nowo utworzonym folderze (np. `assets/<NazwaRepozytorium>/preview.png`).

### Krok 2: Uruchomienie synchronizacji zasobów
WD HUB korzysta z automatycznie wygenerowanego manifestu plików graficznych w `js/data.js`. Aby zarejestrować nowo dodany plik `preview.png`, możesz poczekać aż skrypt zrobi to w pythonie automatycznie lub uruchomić:
```powershell
node scripts/sync-assets.js
```

### Krok 3: Rejestracja konfiguracji w `js/data.js`
Otwórz plik `js/data.js` i ręcznie dopisz obiekt nowej aplikacji na końcu tablicy `projects`.

**Wzór obiektu konfiguracji:**
```javascript
    {
        title: "Tytuł Aplikacji", // np. "MemoCard" lub "Meme Battle WD"
        description: "Krótki opis na karcie (1-2 zdania, do 120 znaków).",
        longDescription: "Długi i szczegółowy opis projektu wyświetlany w oknie modalnym.",
        url: "https://wowkdigital.github.io/MemoCard/", // URL wdrożenia (Scenariusz A lub B) - zawsze zakończony ukośnikiem '/'
        github: "https://github.com/WowkDigital/MemoCard", // URL repozytorium na GitHubie
        icon: "layers", // Nazwa ikony Lucide Icons
        color: "indigo-500", // Kolor wiodący Tailwind CSS
        effect: "hueRotate", // Efekt hover ('hueRotate', 'glitch', 'matrix', 'shake', 'neon')
        imageFolder: "assets/MemoCard" // Ścieżka do folderu z plikiem preview.png (musi odpowiadać kluczowi z assetsManifest)
    }
```

---

## 🔄 Zarządzanie Pamięcią Podręczną (Cache) i Serwerem

Aby nowo dodana aplikacja natychmiast posiadała daty utworzenia i aktualizacji bez oczekiwania na odświeżenie API (oraz w celu uniknięcia limitów zapytań GitHub API):

1. **W przypadku metody automatycznej:**
   Skrypt `add_app.py` sam modyfikuje plik `github-stats-cache.json` dodając dane nowego projektu. **NIGDY nie usuwaj pliku `github-stats-cache.json`**, gdyż wymusi to na serwerze ponowne pobranie danych dla wszystkich projektów, co skutkuje zablokowaniem zapytań (403 Rate Limit Exceeded) i pustymi wartościami "N/A".

2. **W przypadku metody ręcznej:**
   Otwórz plik `github-stats-cache.json` i dopisz do obiektu `data` klucz z adresem repozytorium oraz statystykami (lub aktualną datą w formacie ISO w razie braku danych):
   ```json
       "https://github.com/WowkDigital/NazwaRepozytorium": {
         "created_at": "2026-06-30T12:00:00Z",
         "pushed_at": "2026-06-30T12:00:00Z",
         "updated_at": "2026-06-30T12:00:00Z"
       }
   ```

3. **Zrestartuj serwer backendowy Node.js:**
   Zatrzymaj aktualnie działający proces serwera i uruchom go ponownie w głównym katalogu `WD_HUB`:
   ```powershell
   node server.js
   ```

---

## 🔍 Weryfikacja (Walidacja dla Agenta)

Sprawdzanie działania w przeglądarce zostało usunięte z procesu, ponieważ wdrożenie zawsze działa poprawnie. Agent powinien jedynie sprawdzić syntaktyczną i strukturalną poprawność plików:
- Plik `js/data.js` musi być poprawny syntaktycznie i nie zawierać błędów składniowych.
- Wpis o nowym projekcie musi poprawnie wskazywać na folder w `assets/` w polu `imageFolder` oraz mieć odpowiedni format obiektu.
- Statystyki w `github-stats-cache.json` muszą być poprawnie zarejestrowane dla nowej aplikacji.
