import { useState, useEffect, useMemo } from "react";
import { CATEGORIES, getAllDeckCards, parseCmc } from "./deckData.js";

const SORT_OPTIONS = [
  { key: "category", label: "Category" },
  { key: "name", label: "Name" },
  { key: "cmc", label: "Mana Value" },
  { key: "type", label: "Type" },
  { key: "price", label: "Price" },
];

function scryfallImageUrl(cardName) {
  const clean = cardName.replace(/ \/\/ /g, " ");
  return `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(clean)}&format=image&version=normal`;
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
  return "Other";
}

const TYPE_ORDER = {
  Creature: 0, Planeswalker: 1, Instant: 2, Sorcery: 3,
  Enchantment: 4, Artifact: 5, Land: 6, Other: 7,
};

export default function SetBrowser() {
  const [scryfallData, setScryfallData] = useState({});
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState("category");
  const [selectedCard, setSelectedCard] = useState(null);

  const deckCards = useMemo(() => getAllDeckCards(), []);

  // Fetch Scryfall data for each unique card to get type_line and image
  useEffect(() => {
    let cancelled = false;
    async function fetchCards() {
      const seen = new Set();
      const unique = deckCards.filter(c => {
        if (seen.has(c.name)) return false;
        seen.add(c.name);
        return true;
      });

      const data = {};
      // Batch via Scryfall collection endpoint (max 75 per request)
      const identifiers = unique.map(c => ({
        name: c.name.replace(/ \/\/ /g, " "),
      }));

      for (let i = 0; i < identifiers.length; i += 75) {
        const batch = identifiers.slice(i, i + 75);
        try {
          const res = await fetch("https://api.scryfall.com/cards/collection", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifiers: batch }),
          });
          if (res.ok) {
            const json = await res.json();
            for (const card of json.data) {
              data[card.name] = card;
            }
          }
        } catch (e) {
          console.error("Scryfall fetch error:", e);
        }
        if (i + 75 < identifiers.length) {
          await new Promise(r => setTimeout(r, 100));
        }
      }

      if (!cancelled) {
        setScryfallData(data);
        setLoading(false);
      }
    }
    fetchCards();
    return () => { cancelled = true; };
  }, [deckCards]);

  // Build enriched card list (skip basic land duplicates for display)
  const enrichedCards = useMemo(() => {
    const seen = new Set();
    return deckCards.filter(c => {
      if (seen.has(c.name)) return false;
      seen.add(c.name);
      return true;
    }).map(card => {
      const sf = scryfallData[card.name];
      return {
        ...card,
        type_line: sf?.type_line || (card.cost === "Land" ? "Land" : ""),
        cmc: sf?.cmc ?? parseCmc(card.cost),
        imageUrl: sf?.image_uris?.normal || sf?.card_faces?.[0]?.image_uris?.normal || scryfallImageUrl(card.name),
        smallUrl: sf?.image_uris?.small || sf?.card_faces?.[0]?.image_uris?.small || scryfallImageUrl(card.name),
        category: Object.entries(CATEGORIES).find(([, cards]) =>
          cards.some(c => c.name === card.name)
        )?.[0] || "",
      };
    });
  }, [deckCards, scryfallData]);

  const totalCards = deckCards.reduce((n, c) => n + (c.qty || 1), 0);
  const totalPrice = deckCards.reduce((s, c) => s + c.price * (c.qty || 1), 0);

  // Sort and group
  const groups = useMemo(() => {
    const cards = [...enrichedCards];

    if (sortKey === "category") {
      const result = [];
      for (const [cat, catCards] of Object.entries(CATEGORIES)) {
        const names = catCards.map(c => c.name);
        const matching = cards.filter(c => names.includes(c.name));
        if (matching.length > 0) result.push([cat, matching]);
      }
      return result;
    }

    if (sortKey === "name") {
      cards.sort((a, b) => a.name.localeCompare(b.name));
      return [["", cards]];
    }

    if (sortKey === "cmc") {
      cards.sort((a, b) => a.cmc - b.cmc || a.name.localeCompare(b.name));
      const groups = {};
      for (const card of cards) {
        const mv = Math.floor(card.cmc);
        const label = `Mana Value ${mv}`;
        if (!groups[label]) groups[label] = [];
        groups[label].push(card);
      }
      return Object.entries(groups);
    }

    if (sortKey === "type") {
      cards.sort((a, b) =>
        (TYPE_ORDER[getMainType(a.type_line)] ?? 99) - (TYPE_ORDER[getMainType(b.type_line)] ?? 99)
        || a.name.localeCompare(b.name)
      );
      const groups = {};
      for (const card of cards) {
        const label = getMainType(card.type_line);
        if (!groups[label]) groups[label] = [];
        groups[label].push(card);
      }
      return Object.entries(groups);
    }

    if (sortKey === "price") {
      cards.sort((a, b) => b.price - a.price);
      return [["", cards]];
    }

    return [["", cards]];
  }, [enrichedCards, sortKey]);

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
              src={selectedCard.imageUrl}
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
            }}>
              {selectedCard.type_line}
              {selectedCard.price > 0 && ` • $${selectedCard.price.toFixed(2)}`}
            </div>
            {selectedCard.note && (
              <div style={{
                textAlign: "center",
                marginTop: 6,
                fontSize: 10,
                color: "#666",
                fontStyle: "italic",
              }}>{selectedCard.note}</div>
            )}
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
        }}>Visual Browser</div>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 24,
          fontWeight: 900,
          background: "linear-gradient(90deg, #f0c040, #c4553a, #f0c040)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: 2,
        }}>ZABAZ DECK</h1>
        <div style={{ fontSize: 10, color: "#888", marginTop: 4 }}>
          {totalCards} cards &bull; ${totalPrice.toFixed(2)} estimated
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

      {loading && (
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
          <div style={{ fontSize: 11, color: "#888" }}>Loading card data from Scryfall...</div>
        </div>
      )}

      {!loading && groups.map(([groupLabel, groupCards]) => (
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
                background: "#0e0a0a",
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
            {groupCards.map((card, i) => (
              <div
                key={card.name + i}
                onClick={() => setSelectedCard(card)}
                className="card-grid-cell"
                style={{
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
                    src={card.smallUrl}
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
            ))}
          </div>
        </div>
      ))}

      <style>{`
        .card-grid-cell {
          width: calc(25% - 7px);
        }
        @media (max-width: 920px) {
          .card-grid-cell {
            width: calc(33.33% - 6px) !important;
          }
        }
        @media (max-width: 660px) {
          .card-grid-cell {
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
        Card images from Scryfall &bull; Tap any card for full preview
      </div>
    </div>
  );
}
