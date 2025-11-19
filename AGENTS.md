# AGENTS.md

## Build & Run
- **Run Server**: `python server.py` (Access at http://localhost:5000)
- **Build**: No build step (Vanilla JS/CSS/HTML).
- **Test**: Manual testing only. No test framework configured.

## Architecture & Structure
- **Core**: SPA-like vanilla app. `loader.js` dynamically injects HTML from `components/` and `sections/`.
- **Data**: `data/products.json` for catalog. `localStorage` for cart/user state.
- **Styling**: Modular CSS in `css/` directory, aggregated by `style.css`.
- **Files**: `server.py` (Host), `js/*.js` (Logic), `sections/*.html` (Views).

## Code Style & Conventions
- **JavaScript**: ES6+ syntax. Use `fetch()` for data/components. No frameworks.
- **Formatting**: 2-space indentation. Keep logic separated in `js/` modules.
- **Naming**: camelCase for JS vars/funcs. kebab-case for CSS classes/filenames.
- **State**: Use `localStorage` for persistence (`gm_cart`, `gm_users`).
- **Error Handling**: Use try/catch blocks for `fetch` and JSON parsing.
