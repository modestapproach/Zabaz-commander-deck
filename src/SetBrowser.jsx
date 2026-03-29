import { useState, useEffect, useMemo } from "react";
import CardImage from "./CardImage.jsx";

const API_BASE = "https://api.scryfall.com/cards/search";

const SORT_OPTIONS = [
  { key: "set", label: "Set #" },
  { key: "name", label: "Name" },
  { key: "cmc", label: "Mana Value" },
  { key: "type", label: "Type" },
  { key: "rarity", label: "Rarity" },
  { key: "color", label: "Color" },
];

const RARITY_ORDER = { mythic: 0, rare: 1, uncommon: 2, common: 3 };
const COLOR_ORDER = { W: 0, U: 1, B: 2, R: 3, G: 4 };

function getColorGroup(card) {
  const colors = card.colors || [];
  if (colors.length === 0) return "Colorless";
  if (colors.length > 1) return "Multicolor";
  const map = { W: "White", U: "Blue", B: "Black", R: "Red", G: "Green" };
  return map[colors[0]] || "Colorless";
}

function getMainType(typeLine) {
  if (!typeLine) return "Other";
  const t = typeLine.split("—")[0].trim().split("//")[0].trim();
  if (t.includes("Creature")) return "Creature";
  if (t.includes("Planeswalker")) return "Planeswalker";
  if (t.includes("Instant")) return "Instant";
  if (t.includes("Sorcery")) return "Sorcery";
  if (t.includes("Enchantment")) return "Enchantment";
  if (t.includes("Artifact")) return "Artifact";
  if (t.includes("Land")) return "Land";
  if (t.includes("Battle")) return "Battle";
  return "Other";
}

const TYPE_ORDER = {
  Creature: 0, Planeswalker: 1, Battle: 2, Instant: 3, Sorcery: 4,
  Enchantment: 5, Artifact: 6, Land: 7, Other: 8,
};

function colorSortValue(card) {
  const c = card.colors || [];
  if (c.length === 0) return 100;
  if (c.length > 1) return 50 + c.length;
  return COLOR_ORDER[c[0]] ?? 10;
}

function sortCards(cards, sortKey) {
  const sorted = [...cards];
  switch (sortKey) {
    case "set":
      return sorted.sort((a, b) => parseInt(a.collector_number) - parseInt(b.collector_number));
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "cmc":
      return sorted.sort((a, b) => a.cmc - b.cmc || a.name.localeCompare(b.name));
    case "type":
      return sorted.sort((a, b) =>
        (TYPE_ORDER[getMainType(a.type_line)] ?? 99) - (TYPE_ORDER[getMainType(b.type_line)] ?? 99)
        || a.name.localeCompare(b.name)
      );
    case "rarity":
      return sorted.sort((a, b) =>
        (RARITY_ORDER[a.rarity] ?? 9) - (RARITY_ORDER[b.rarity] ?? 9)
        || a.name.localeCompare(b.name)
      );
    case "color":
      return sorted.sort((a, b) =>
        colorSortValue(a) - colorSortValue(b) || a.name.localeCompare(b.name)
      );
    default:
      return sorted;
  }
}

function groupCards(cards, sortKey) {
  if (sortKey === "cmc") {
    const groups = {};
    for (const card of cards) {
      const mv = Math.floor(card.cmc);
      const label = mv === 0 ? "Mana Value 0" : `Mana Value ${mv}`;
      if (!groups[label]) groups[label] = [];
      groups[label].push(card);
    }
    return Object.entries(groups);
  }
  if (sortKey === "type") {
    const groups = {};
    for (const card of cards) {
      const label = getMainType(card.type_line);
      if (!groups[label]) groups[label] = [];
      groups[label].push(card);
    }
    return Object.entries(groups);
  }
  if (sortKey === "rarity") {
    const groups = {};
    for (const card of cards) {
      const label = card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1);
      if (!groups[label]) groups[label] = [];
      groups[label].push(card);
    }
    return Object.entries(groups);
  }
  if (sortKey === "color") {
    const groups = {};
    for (const card of cards) {
      const label = getColorGroup(card);
      if (!groups[label]) groups[label] = [];
      groups[label].push(card);
    }
    return Object.entries(groups);
  }
  return [["", cards]];
}

function getCardImageUrl(card) {
  if (card.image_uris) return card.image_uris.normal;
  if (card.card_faces && card.card_faces[0]?.image_uris) {
    return card.card_faces[0].image_uris.normal;
  }
  return null;
}

function getCardSmallUrl(card) {
  if (card.image_uris) return card.image_uris.small;
  if (card.card_faces && card.card_faces[0]?.image_uris) {
    return card.card_faces[0].image_uris.small;
  }
  return null;
}

export default function SetBrowser() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState("set");
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchAll() {
      try {
        let allCards = [];
        let url = `${API_BASE}?order=set&q=set%3Aeoe&unique=cards`;
        while (url) {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Scryfall API error: ${res.status}`);
          const data = await res.json();
          allCards = allCards.concat(data.data);
          url = data.has_more ? data.next_page : null;
          // Scryfall asks for 50-100ms between requests
          if (url) await new Promise(r => setTimeout(r, 100));
        }
        if (!cancelled) {
          setCards(allCards);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const sorted = useMemo(() => sortCards(cards, sortKey), [cards, sortKey]);
  const groups = useMemo(() => groupCards(sorted, sortKey), [sorted, sortKey]);

  return (
    <div style={{ padding: "16px", maxWidth: 1000, margin: "0 auto" }}>

      {/* Lightbox */}
      {selectedCard && (
        <div
          onClick={() => setSelectedCard(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 380, width: "90%" }}>
            <img
              src={getCardImageUrl(selectedCard)}
              alt={selectedCard.name}
              style={{
                width: "100%",
                borderRadius: "4.75%",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              }}
            />
            <div style={{
              textAlign: "center",
              marginTop: 10,
              fontSize: 14,
              color: "#f0c040",
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
            }}>{selectedCard.name}</div>
            <div style={{
              textAlign: "center",
              marginTop: 4,
              fontSize: 11,
              color: "#888",
            }}>{selectedCard.type_line} {selectedCard.rarity && `\u2022 ${selectedCard.rarity}`}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: "#c4553a",
          marginBottom: 4,
        }}>Set Browser</div>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 24,
          fontWeight: 900,
          background: "linear-gradient(90deg, #f0c040, #c4553a, #f0c040)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: 2,
        }}>EDGE OF ETERNITIES</h1>
        <div style={{ fontSize: 10, color: "#888", marginTop: 4 }}>
          {loading ? "Loading cards..." : `${cards.length} cards`}
        </div>
      </div>

      {/* Sort chips */}
      <div style={{
        display: "flex",
        gap: 6,
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: 16,
      }}>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortKey(opt.key)}
            style={{
              background: sortKey === opt.key
                ? "linear-gradient(135deg, #c4553a, #a03020)"
                : "rgba(255,255,255,0.05)",
              color: sortKey === opt.key ? "#fff" : "#777",
              border: sortKey === opt.key
                ? "1px solid #c4553a"
                : "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              fontWeight: sortKey === opt.key ? 700 : 400,
              transition: "all 0.15s",
            }}
          >{opt.label}</button>
        ))}
      </div>

      {error && (
        <div style={{ textAlign: "center", color: "#c4553a", padding: 40, fontSize: 13 }}>
          Failed to load cards: {error}
        </div>
      )}

      {loading && !error && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{
            width: 32,
            height: 32,
            border: "3px solid rgba(196,85,58,0.2)",
            borderTopColor: "#c4553a",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 11, color: "#888" }}>Fetching from Scryfall...</div>
        </div>
      )}

      {!loading && !error && groups.map(([groupLabel, groupCards]) => (
        <div key={groupLabel || "__all"}>
          {groupLabel && (
            <div style={{
              position: "relative",
              textAlign: "center",
              margin: "20px 0 14px",
            }}>
              <div style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: 1,
                background: "rgba(196,85,58,0.25)",
              }} />
              <span style={{
                position: "relative",
                display: "inline-block",
                background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a1a 100%)",
                padding: "0 16px",
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "#c4553a",
              }}>
                {groupLabel}
                <span style={{
                  color: "rgba(196,85,58,0.4)",
                  margin: "0 8px",
                }}>&bull;</span>
                <span style={{
                  color: "#888",
                  fontWeight: 400,
                  fontSize: 11,
                  letterSpacing: 0,
                  textTransform: "none",
                }}>{groupCards.length} cards</span>
              </span>
            </div>
          )}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 9,
            justifyContent: "flex-start",
          }}>
            {groupCards.map(card => {
              const imgUrl = getCardSmallUrl(card);
              if (!imgUrl) return null;
              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  style={{
                    width: "calc(25% - 7px)",
                    cursor: "pointer",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <div style={{
                    position: "relative",
                    width: "100%",
                    paddingBottom: "139.34%",
                    height: 0,
                    borderRadius: "4.75%",
                    overflow: "hidden",
                    boxShadow: "1px 1px 6px rgba(0,0,0,0.45)",
                    background: "#1a1a1a",
                  }}>
                    <img
                      src={imgUrl}
                      alt={card.name}
                      loading="lazy"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <style>{`
        @media (max-width: 920px) {
          div[style*="calc(25%"] {
            width: calc(33.33% - 6px) !important;
          }
        }
        @media (max-width: 660px) {
          div[style*="calc(25%"] {
            width: calc(50% - 5px) !important;
          }
        }
      `}</style>

      <div style={{
        textAlign: "center",
        marginTop: 24,
        fontSize: 9,
        color: "#555",
        lineHeight: 1.5,
      }}>
        Card images and data from Scryfall • Tap any card for full preview
      </div>
    </div>
  );
}
