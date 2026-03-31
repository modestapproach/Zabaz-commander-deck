import { useState, useEffect, useMemo } from "react";
import CardImage from "./CardImage.jsx";
import { scryfallUrl, scryfallImageUrl, parseCmc } from "../utils.js";

const SORT_OPTIONS = [
  { key: "category", label: "Category" },
  { key: "name", label: "Name" },
  { key: "cmc", label: "Mana Value" },
  { key: "type", label: "Type" },
  { key: "price", label: "Price" },
];

function getMainType(typeLine) {
  if (!typeLine) return "Other";
  const t = typeLine.split("\u2014")[0].trim().split("//")[0].trim();
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

const COLOR_MAP = {
  W: { label: "W", bg: "#f9faf4", border: "#d4c5a0" },
  U: { label: "U", bg: "#0e67ab", border: "#0a4f85" },
  B: { label: "B", bg: "#2b2a2a", border: "#555" },
  R: { label: "R", bg: "#d3202a", border: "#a01a20" },
  G: { label: "G", bg: "#00733e", border: "#005a2f" },
};

export default function DeckView({ deck, onBack }) {
  const [view, setView] = useState("decklist"); // "decklist" | "combos" | "visual"
  const [activeCategory, setActiveCategory] = useState(() => Object.keys(deck.categories)[0] || "Commander");
  const [selectedCard, setSelectedCard] = useState(null);

  // Visual browser state
  const [scryfallData, setScryfallData] = useState({});
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState("category");
  const [visualSelectedCard, setVisualSelectedCard] = useState(null);

  const allCards = useMemo(() => Object.values(deck.categories).flat(), [deck]);
  const totalPrice = useMemo(() => allCards.reduce((sum, c) => sum + c.price * (c.qty || 1), 0), [allCards]);
  const totalCards = useMemo(() => allCards.reduce((count, c) => count + (c.qty || 1), 0), [allCards]);

  const categoryKeys = Object.keys(deck.categories);

  // Fetch Scryfall data when visual browser is opened
  useEffect(() => {
    if (view !== "visual") return;
    if (Object.keys(scryfallData).length > 0) return; // already loaded

    let cancelled = false;
    setLoading(true);

    async function fetchCards() {
      const seen = new Set();
      const unique = allCards.filter(c => {
        if (seen.has(c.name)) return false;
        seen.add(c.name);
        return true;
      });

      const data = {};
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
  }, [view, allCards, scryfallData]);

  // Build enriched card list for visual browser
  const enrichedCards = useMemo(() => {
    const seen = new Set();
    return allCards.filter(c => {
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
        category: Object.entries(deck.categories).find(([, cards]) =>
          cards.some(c => c.name === card.name)
        )?.[0] || "",
      };
    });
  }, [allCards, scryfallData, deck.categories]);

  // Sort and group for visual browser
  const groups = useMemo(() => {
    const cards = [...enrichedCards];

    if (sortKey === "category") {
      const result = [];
      for (const [cat, catCards] of Object.entries(deck.categories)) {
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
      const g = {};
      for (const card of cards) {
        const mv = Math.floor(card.cmc);
        const label = `Mana Value ${mv}`;
        if (!g[label]) g[label] = [];
        g[label].push(card);
      }
      return Object.entries(g);
    }

    if (sortKey === "type") {
      cards.sort((a, b) =>
        (TYPE_ORDER[getMainType(a.type_line)] ?? 99) - (TYPE_ORDER[getMainType(b.type_line)] ?? 99)
        || a.name.localeCompare(b.name)
      );
      const g = {};
      for (const card of cards) {
        const label = getMainType(card.type_line);
        if (!g[label]) g[label] = [];
        g[label].push(card);
      }
      return Object.entries(g);
    }

    if (sortKey === "price") {
      cards.sort((a, b) => b.price - a.price);
      return [["", cards]];
    }

    return [["", cards]];
  }, [enrichedCards, sortKey, deck.categories]);

  const viewButton = (label, value) => (
    <button
      onClick={() => setView(value)}
      style={{
        background: view === value ? "#c4553a" : "rgba(255,255,255,0.05)",
        color: view === value ? "#fff" : "#888",
        border: "1px solid rgba(196,85,58,0.4)",
        borderRadius: 4,
        padding: "6px 16px",
        fontSize: 11,
        fontFamily: "inherit",
        cursor: "pointer",
        fontWeight: view === value ? 700 : 400,
      }}
    >{label}</button>
  );

  return (
    <div style={{ padding: "16px", maxWidth: view === "visual" ? 1000 : 900, margin: "0 auto", position: "relative" }}>

      {/* Decklist lightbox */}
      {selectedCard && (
        <div
          onClick={() => setSelectedCard(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 350, width: "90%" }}>
            <CardImage name={selectedCard} style={{ width: "100%" }} />
            <div style={{
              textAlign: "center",
              marginTop: 12,
              fontSize: 13,
              color: "#f0c040",
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
            }}>{selectedCard}</div>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <a
                href={scryfallUrl(selectedCard)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#c4553a",
                  fontSize: 11,
                  textDecoration: "none",
                  border: "1px solid rgba(196,85,58,0.4)",
                  padding: "4px 12px",
                  borderRadius: 4,
                }}
              >View on Scryfall &rarr;</a>
            </div>
          </div>
        </div>
      )}

      {/* Visual browser lightbox */}
      {visualSelectedCard && (
        <div
          onClick={() => setVisualSelectedCard(null)}
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
              src={visualSelectedCard.imageUrl}
              alt={visualSelectedCard.name}
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
            }}>{visualSelectedCard.name}</div>
            <div style={{
              textAlign: "center",
              marginTop: 4,
              fontSize: 11,
              color: "#888",
            }}>
              {visualSelectedCard.type_line}
              {visualSelectedCard.price > 0 && ` \u2022 $${visualSelectedCard.price.toFixed(2)}`}
            </div>
            {visualSelectedCard.note && (
              <div style={{
                textAlign: "center",
                marginTop: 6,
                fontSize: 10,
                color: "#666",
                fontStyle: "italic",
              }}>{visualSelectedCard.note}</div>
            )}
          </div>
        </div>
      )}

      {/* Back button */}
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            color: "#c4553a",
            border: "1px solid rgba(196,85,58,0.3)",
            borderRadius: 4,
            padding: "5px 14px",
            fontSize: 11,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >&larr; All Decks</button>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: "#c4553a",
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}>
          <span>Commander Deck</span>
          <span style={{ display: "flex", gap: 4 }}>
            {deck.colors.map(c => (
              <span key={c} style={{
                display: "inline-block",
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: COLOR_MAP[c]?.bg || "#666",
                border: `1.5px solid ${COLOR_MAP[c]?.border || "#444"}`,
              }} />
            ))}
          </span>
        </div>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 28,
          fontWeight: 900,
          background: "linear-gradient(90deg, #f0c040, #c4553a, #f0c040)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: 2,
        }}>{deck.name.toUpperCase()}</h1>
        <div style={{ fontSize: 10, color: "#888", marginTop: 4 }}>
          {deck.strategy}
        </div>

        {/* Description */}
        <div style={{
          fontSize: 11,
          color: "#777",
          marginTop: 10,
          maxWidth: 600,
          margin: "10px auto 0",
          lineHeight: 1.5,
        }}>{deck.description}</div>

        {/* Commander card image */}
        <div style={{ margin: "16px auto", maxWidth: 220 }}>
          <CardImage name={deck.commander} style={{ width: "100%" }} />
        </div>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 24,
          marginTop: 12,
          fontSize: 11,
        }}>
          <div style={{
            background: "rgba(196,85,58,0.15)",
            border: "1px solid rgba(196,85,58,0.3)",
            borderRadius: 6,
            padding: "6px 14px",
          }}>
            <span style={{ color: "#888" }}>Cards</span>{" "}
            <span style={{ color: "#f0c040", fontWeight: 700 }}>{totalCards}</span>
          </div>
          <div style={{
            background: "rgba(240,192,64,0.1)",
            border: "1px solid rgba(240,192,64,0.25)",
            borderRadius: 6,
            padding: "6px 14px",
          }}>
            <span style={{ color: "#888" }}>Est. Total</span>{" "}
            <span style={{ color: "#f0c040", fontWeight: 700 }}>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* View toggle buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, justifyContent: "center" }}>
        {viewButton("Decklist", "decklist")}
        {viewButton("Combo Lines", "combos")}
        {viewButton("Visual Browser", "visual")}
      </div>

      {/* === COMBO LINES VIEW === */}
      {view === "combos" && (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {deck.combos.map((combo, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(196,85,58,0.2)",
              borderRadius: 8,
              padding: 14,
              marginBottom: 10,
            }}>
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 13,
                fontWeight: 700,
                color: "#f0c040",
                marginBottom: 6,
              }}>{combo.title}</div>
              <div style={{
                display: "flex",
                gap: 12,
                marginBottom: 10,
                justifyContent: "center",
              }}>
                {combo.cards.map((card) => (
                  <div
                    key={card}
                    style={{ width: 130, cursor: "pointer" }}
                    onClick={() => setSelectedCard(card)}
                  >
                    <CardImage name={card} style={{ width: "100%" }} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "#bbb", lineHeight: 1.5 }}>{combo.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* === DECKLIST VIEW === */}
      {view === "decklist" && (
        <>
          {/* Category tabs */}
          <div style={{
            display: "flex",
            gap: 4,
            overflowX: "auto",
            paddingBottom: 8,
            marginBottom: 12,
          }}>
            {categoryKeys.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat
                    ? "linear-gradient(135deg, #c4553a, #a03020)"
                    : "rgba(255,255,255,0.04)",
                  color: activeCategory === cat ? "#fff" : "#777",
                  border: activeCategory === cat
                    ? "1px solid #c4553a"
                    : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 4,
                  padding: "5px 10px",
                  fontSize: 10,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontWeight: activeCategory === cat ? 700 : 400,
                  flexShrink: 0,
                }}
              >{cat}</button>
            ))}
          </div>

          {/* Card grid */}
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            {(deck.categories[activeCategory] || []).map((card, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 10px",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderRadius: 4,
                  borderLeft: card.note?.startsWith("\u2605")
                    ? "3px solid #f0c040"
                    : "3px solid transparent",
                }}
              >
                {/* Card thumbnail */}
                <div
                  onClick={() => setSelectedCard(card.name)}
                  style={{
                    width: 60,
                    minWidth: 60,
                    cursor: "pointer",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <CardImage name={card.name} style={{ width: "100%" }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <span
                      onClick={() => setSelectedCard(card.name)}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: card.note?.startsWith("\u2605") ? "#f0c040" : "#e0d8cc",
                        cursor: "pointer",
                      }}
                    >
                      {card.name}
                      {card.qty && card.qty > 1 ? ` \u00d7${card.qty}` : ""}
                    </span>
                    <span style={{ fontSize: 10, color: "#666", flexShrink: 0 }}>{card.cost}</span>
                  </div>
                  {card.note && (
                    <div style={{
                      fontSize: 10,
                      color: "#888",
                      marginTop: 2,
                      lineHeight: 1.4,
                    }}>{card.note}</div>
                  )}
                </div>

                {card.price > 0 && (
                  <div style={{
                    fontSize: 10,
                    color: card.price >= 10 ? "#c4553a" : card.price >= 5 ? "#d4944a" : "#666",
                    fontWeight: card.price >= 5 ? 700 : 400,
                    flexShrink: 0,
                  }}>${card.price.toFixed(2)}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* === VISUAL BROWSER VIEW === */}
      {view === "visual" && (
        <>
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
                    onClick={() => setVisualSelectedCard(card)}
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
        </>
      )}

      {/* Footer */}
      <div style={{
        textAlign: "center",
        marginTop: 20,
        fontSize: 9,
        color: "#555",
        lineHeight: 1.5,
      }}>
        Tap any card image &rarr; full preview &bull; Card images from Scryfall &bull; Prices approximate (TCGPlayer market)
      </div>
    </div>
  );
}
