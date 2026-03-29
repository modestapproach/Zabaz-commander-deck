import { useState } from 'react'
import ZabazDeck from './ZabazDeck.jsx'
import SetBrowser from './SetBrowser.jsx'

export default function App() {
  const [page, setPage] = useState("deck");

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a1a 100%)",
      color: "#e0d8cc",
      minHeight: "100vh",
    }}>
      {/* Top nav */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        padding: "14px 16px 0",
        borderBottom: "1px solid rgba(196,85,58,0.15)",
        paddingBottom: 10,
      }}>
        <button
          onClick={() => setPage("deck")}
          style={{
            background: page === "deck" ? "#c4553a" : "transparent",
            color: page === "deck" ? "#fff" : "#666",
            border: "none",
            borderRadius: 4,
            padding: "6px 16px",
            fontSize: 11,
            fontFamily: "inherit",
            cursor: "pointer",
            fontWeight: page === "deck" ? 700 : 400,
          }}
        >Zabaz Deck</button>
        <button
          onClick={() => setPage("set")}
          style={{
            background: page === "set" ? "#c4553a" : "transparent",
            color: page === "set" ? "#fff" : "#666",
            border: "none",
            borderRadius: 4,
            padding: "6px 16px",
            fontSize: 11,
            fontFamily: "inherit",
            cursor: "pointer",
            fontWeight: page === "set" ? 700 : 400,
          }}
        >Visual Browser</button>
      </div>

      {page === "deck" ? <ZabazDeck /> : <SetBrowser />}
    </div>
  );
}
