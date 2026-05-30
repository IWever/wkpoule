# WK Poule 2026 — refactor v2

Deze versie gaat een stap verder dan de eerste refactor en splitst ook de UI op in componentmodules.

## Structuur

- `src/App.jsx` — root-app, sessie en schermrouting
- `src/data/tournamentData.js` — teams, wedstrijden, puntenschema's en constants
- `src/pouleEngine.js` — business logic, standings, storage, seeds en berekeningen
- `src/styles/ui.js` — gedeelde style helpers
- `src/components/common.jsx` — gedeelde UI-atomen (Alert, TabBar, SlotDisplay, etc.)
- `src/components/auth.jsx` — login/admin-login schermen
- `src/components/compare.jsx` — vergelijkingsoverlays
- `src/components/forms.jsx` — formulieren voor groepsfase, extra vragen en KO-fase
- `src/components/views.jsx` — hoofdviews zoals overzicht, regels, stand en adminpanel

## Uitgevoerde tweede refactorstap

1. Grote UI-blokken opgesplitst in losse componentbestanden.
2. `App.jsx` teruggebracht naar alleen de rootflow.
3. De gedeelde UI-elementen samengebracht in één `common.jsx` module.
4. De eerdere dubbele datum/tijd-helpers zijn niet opnieuw meegenomen in de opgesplitste structuur.

## Browser-first gebruik

Importeer deze map in CodeSandbox of StackBlitz en laat daar eventueel resterende buildchecks lopen.
