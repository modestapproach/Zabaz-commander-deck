import { useState } from "react";
import CardImage from "./CardImage.jsx";
import { CATEGORIES, COMBO_LINES } from "./deckData.js";

function scryfallUrl(name) {
  const clean = name.replace(/\d+x\s/, "").replace(/ \/\/ /g, " ");
  return `https://scryfall.com/search?q=!"${encodeURIComponent(clean)}"`;
}

export default function ZabazDeck() {
  const [activeCategory, setActiveCategory] = useState("Commander");
  const [showCombos, setShowCombos] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const allCards = Object.values(CATEGORIES).flat();
  const totalPrice = allCards.reduce((sum, c) => sum + c.price * (c.qty || 1), 0);
  const totalCards = allCards.reduce((count, c) => count + (c.qty || 1), 0);

  const categoryKeys = Object.keys(CATEGORIES);

  return (
    <div style={{ padding: "16px", maxWidth: 900, margin: "0 auto", position: "relative" }}>

      {/* Card image preview panel */}
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
              >View on Scryfall →</a>
            </div>
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
        }}>Commander Deck • Boros • Budget</div>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 28,
          fontWeight: 900,
          background: "linear-gradient(90deg, #f0c040, #c4553a, #f0c040)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: 2,
        }}>ZABAZ, THE GLIMMERWASP</h1>
        <div style={{ fontSize: 10, color: "#888", marginTop: 4 }}>
          Modular Aggro • Artifact Stax • Licid Tech
        </div>

        {/* Commander card image */}
        <div style={{ margin: "16px auto", maxWidth: 220 }}>
          <CardImage name="Zabaz, the Glimmerwasp" style={{ width: "100%" }} />
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

      {/* Combo / Category Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, justifyContent: "center" }}>
        <button
          onClick={() => setShowCombos(false)}
          style={{
            background: !showCombos ? "#c4553a" : "rgba(255,255,255,0.05)",
            color: !showCombos ? "#fff" : "#888",
            border: "1px solid rgba(196,85,58,0.4)",
            borderRadius: 4,
            padding: "6px 16px",
            fontSize: 11,
            fontFamily: "inherit",
            cursor: "pointer",
            fontWeight: !showCombos ? 700 : 400,
          }}
        >Decklist</button>
        <button
          onClick={() => setShowCombos(true)}
          style={{
            background: showCombos ? "#c4553a" : "rgba(255,255,255,0.05)",
            color: showCombos ? "#fff" : "#888",
            border: "1px solid rgba(196,85,58,0.4)",
            borderRadius: 4,
            padding: "6px 16px",
            fontSize: 11,
            fontFamily: "inherit",
            cursor: "pointer",
            fontWeight: showCombos ? 700 : 400,
          }}
        >Combo Lines</button>
      </div>

      {showCombos ? (
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {COMBO_LINES.map((combo, i) => (
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
      ) : (
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
            {(CATEGORIES[activeCategory] || []).map((card, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "8px 10px",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderRadius: 4,
                  borderLeft: card.note?.startsWith("★")
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
                        color: card.note?.startsWith("★") ? "#f0c040" : "#e0d8cc",
                        cursor: "pointer",
                      }}
                    >
                      {card.name}
                      {card.qty && card.qty > 1 ? ` ×${card.qty}` : ""}
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

      {/* Footer */}
      <div style={{
        textAlign: "center",
        marginTop: 20,
        fontSize: 9,
        color: "#555",
        lineHeight: 1.5,
      }}>
        Based on Vintage Sphere Shops shell (5-0, Jul 2025) • Budget version for Commander<br />
        Tap any card image → full preview • Card images from Scryfall • Prices approximate (TCGPlayer market)
      </div>
    </div>
  );
}
