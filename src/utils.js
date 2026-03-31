// Parse mana cost string like "{2}{R}" into a CMC number
export function parseCmc(cost) {
  if (!cost || cost === "Land") return 0;
  let total = 0;
  const matches = cost.matchAll(/\{([^}]+)\}/g);
  for (const m of matches) {
    const val = m[1];
    if (/^\d+$/.test(val)) total += parseInt(val);
    else if (val === "X") total += 0;
    else total += 1; // colored mana
  }
  return total;
}

export function scryfallUrl(name) {
  const clean = name.replace(/\d+x\s/, "").replace(/ \/\/ /g, " ");
  return `https://scryfall.com/search?q=!"${encodeURIComponent(clean)}"`;
}

export function scryfallImageUrl(cardName) {
  const clean = cardName.replace(/\d+x\s/, "").replace(/ \/\/ /g, " ");
  return `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(clean)}&format=image&version=normal`;
}

export function getDeckStats(deck) {
  const allCards = Object.values(deck.categories).flat();
  const totalCards = allCards.reduce((n, c) => n + (c.qty || 1), 0);
  const totalPrice = allCards.reduce((s, c) => s + c.price * (c.qty || 1), 0);
  return { totalCards, totalPrice, allCards };
}

const COLOR_MAP = {
  W: { label: "White", hex: "#F9FAF4" },
  U: { label: "Blue", hex: "#0E68AB" },
  B: { label: "Black", hex: "#150B00" },
  R: { label: "Red", hex: "#D3202A" },
  G: { label: "Green", hex: "#00733E" },
};

export function getColorInfo(code) {
  return COLOR_MAP[code] || { label: code, hex: "#888" };
}
