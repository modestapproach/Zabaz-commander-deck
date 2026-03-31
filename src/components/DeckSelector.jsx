import { useMemo } from 'react';
import CardImage from './CardImage.jsx';

const COLOR_MAP = {
  W: { label: "W", bg: "#f9faf4", border: "#d4c5a0" },
  U: { label: "U", bg: "#0e67ab", border: "#0a4f85" },
  B: { label: "B", bg: "#2b2a2a", border: "#555" },
  R: { label: "R", bg: "#d3202a", border: "#a01a20" },
  G: { label: "G", bg: "#00733e", border: "#005a2f" },
};

export default function DeckSelector({ decks, onSelectDeck }) {
  return (
    <div style={{ padding: "40px 16px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: "#c4553a",
          marginBottom: 8,
        }}>Commander Deck Collection</div>
        <h1 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 32,
          fontWeight: 900,
          background: "linear-gradient(90deg, #f0c040, #c4553a, #f0c040)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: 2,
        }}>DECK BROWSER</h1>
        <div style={{ fontSize: 11, color: "#888", marginTop: 8 }}>
          {decks.length} {decks.length === 1 ? "deck" : "decks"} available
        </div>
      </div>

      {/* Deck cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: 20,
        justifyItems: "center",
      }}>
        {decks.map(deck => (
          <DeckCard key={deck.id} deck={deck} onSelect={() => onSelectDeck(deck.id)} />
        ))}
      </div>
    </div>
  );
}

function DeckCard({ deck, onSelect }) {
  const stats = useMemo(() => {
    const allCards = Object.values(deck.categories).flat();
    const totalCards = allCards.reduce((n, c) => n + (c.qty || 1), 0);
    const totalPrice = allCards.reduce((s, c) => s + c.price * (c.qty || 1), 0);
    return { totalCards, totalPrice };
  }, [deck]);

  return (
    <div
      onClick={onSelect}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(196,85,58,0.25)",
        borderRadius: 12,
        padding: 20,
        cursor: "pointer",
        transition: "all 0.2s",
        width: "100%",
        maxWidth: 420,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = "1px solid rgba(240,192,64,0.5)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = "1px solid rgba(196,85,58,0.25)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Commander image */}
      <div style={{ maxWidth: 180, margin: "0 auto 16px" }}>
        <CardImage name={deck.commander} style={{ width: "100%" }} />
      </div>

      {/* Commander name */}
      <h2 style={{
        fontFamily: "'Cinzel', serif",
        fontSize: 18,
        fontWeight: 900,
        textAlign: "center",
        background: "linear-gradient(90deg, #f0c040, #c4553a, #f0c040)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: 8,
      }}>{deck.name}</h2>

      {/* Color identity badges */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
        {deck.colors.map(c => (
          <div key={c} style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: COLOR_MAP[c]?.bg || "#666",
            border: `2px solid ${COLOR_MAP[c]?.border || "#444"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 700,
            color: c === "W" ? "#333" : "#fff",
          }}>{c}</div>
        ))}
      </div>

      {/* Strategy tagline */}
      <div style={{
        textAlign: "center",
        fontSize: 10,
        color: "#888",
        marginBottom: 12,
      }}>{deck.strategy}</div>

      {/* Stats row */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 16,
        fontSize: 11,
      }}>
        <div style={{
          background: "rgba(196,85,58,0.15)",
          border: "1px solid rgba(196,85,58,0.3)",
          borderRadius: 6,
          padding: "4px 12px",
        }}>
          <span style={{ color: "#888" }}>Cards </span>
          <span style={{ color: "#f0c040", fontWeight: 700 }}>{stats.totalCards}</span>
        </div>
        <div style={{
          background: "rgba(240,192,64,0.1)",
          border: "1px solid rgba(240,192,64,0.25)",
          borderRadius: 6,
          padding: "4px 12px",
        }}>
          <span style={{ color: "#888" }}>Est. </span>
          <span style={{ color: "#f0c040", fontWeight: 700 }}>${stats.totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
