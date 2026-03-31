# Commander Deck Browser

Multi-deck browser app for Magic: The Gathering Commander decks. Built with Vite + React. Card images from Scryfall API.

## Project Structure

```
src/
  decks/           ← Deck data files (one per deck)
    zabaz.js        ← Example: Zabaz, the Glimmerwasp
    index.js        ← Auto-exports all decks
  components/       ← React components
    DeckSelector.jsx ← Landing page, shows all decks
    DeckView.jsx     ← Unified deck detail view (decklist, combos, visual browser)
    CardImage.jsx    ← Scryfall image component with caching
  utils.js          ← Shared helpers (parseCmc, scryfallUrl, getDeckStats, etc.)
  App.jsx           ← Top-level routing between selector and deck views
  main.jsx          ← Entry point
  index.css         ← Global styles (dark theme, fonts)
docs/               ← Built output for GitHub Pages (auto-generated)
```

## Adding a New Deck

1. Create a new file in `src/decks/` (e.g., `src/decks/my-commander.js`)
2. Export a default object following the schema below
3. Import and add it to the `decks` array in `src/decks/index.js`
4. Run `npm run build` — the app will automatically show the new deck on the landing page

## Deck Data Schema

```js
export default {
  // Required fields
  id: "unique-slug",                    // URL-safe identifier
  name: "Commander Name",               // Display name
  commander: "Commander Name",          // Exact card name for Scryfall image lookup
  colors: ["R", "W"],                   // Color identity: W, U, B, R, G
  strategy: "Aggro • Combo • Control",  // Short tagline shown on deck card
  description: "Longer description of the deck's game plan and key synergies.",

  // Card categories — flexible names and counts
  // Category names appear as tabs in the decklist view
  categories: {
    "Commander": [
      { name: "Card Name", cost: "{2}{R}", note: "Brief note about role", price: 1.50 },
    ],
    "Creatures (20)": [
      { name: "Another Card", cost: "{1}", note: "★ CORE — prefix with star for key cards", price: 5.00 },
      // Cards with qty field represent multiples (e.g., basic lands)
      { name: "Mountain", cost: "Land", note: "×8", price: 0.00, qty: 8 },
    ],
    // Add as many categories as needed — they become tabs
  },

  // Combo lines — pairs/groups of cards that combo together
  combos: [
    {
      title: "Combo Name",
      cards: ["Card A", "Card B"],      // Exact names — shown as images
      desc: "Explanation of how the combo works and why it's good.",
    },
  ],

  // Optional custom sections — rendered after the main views
  // Use these for deck-specific content that doesn't fit the standard layout
  sections: [
    {
      title: "Section Title",
      type: "prose",                    // Currently supports "prose"
      content: "Freeform text explaining something unique about this deck.",
    },
  ],
};
```

## Card Data Notes

- **name**: Must be the exact English card name as it appears on Scryfall
- **cost**: Mana cost in `{X}{2}{R}` format, or `"Land"` for lands
- **note**: Prefix with `★` to highlight as a key card (gold border + text)
- **price**: Approximate TCGPlayer market price in USD
- **qty**: Only needed for multiples (basic lands). Defaults to 1

## Styling Conventions

The app uses inline styles with a consistent dark theme:
- Background: `linear-gradient(135deg, #0a0a0a, #1a0a0a, #0a0a1a)`
- Primary red: `#c4553a`
- Accent gold: `#f0c040`
- Text: `#e0d8cc`
- Body font: JetBrains Mono
- Heading font: Cinzel

Key cards (★ prefix) get a gold left border and gold text color.

## API Usage

- **Card images**: `https://api.scryfall.com/cards/named?exact=CARDNAME&format=image&version=normal`
- **Batch card data**: POST to `https://api.scryfall.com/cards/collection` with `{identifiers: [{name: "Card Name"}, ...]}` (max 75 per batch)
- **Scryfall links**: `https://scryfall.com/search?q=!"CARDNAME"`
- Respect Scryfall's rate limits: 100ms delay between requests

## Build & Deploy

```bash
npm install          # Install dependencies
npm run dev          # Local dev server
npm run build        # Build to dist/
```

GitHub Pages deploys from `docs/` on `main` branch. After building:
```bash
npx vite build --outDir docs
touch docs/.nojekyll
# Copy public assets: cp public/favicon.svg docs/ && cp public/icons.svg docs/
# Commit and push docs/ to main
```

The GitHub Actions workflow also auto-deploys to `gh-pages` on push to `main`.

## Vite Config

Base path is set to `/Zabaz-commander-deck/` for GitHub Pages project site hosting.
