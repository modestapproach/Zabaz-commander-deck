import { useState } from 'react'
import decks, { getDeckById } from './decks/index.js'
import DeckSelector from './components/DeckSelector.jsx'
import DeckView from './components/DeckView.jsx'

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedDeckId, setSelectedDeckId] = useState(null);

  const handleSelectDeck = (id) => {
    setSelectedDeckId(id);
    setPage("deck");
  };

  const handleBack = () => {
    setPage("home");
    setSelectedDeckId(null);
  };

  const selectedDeck = selectedDeckId ? getDeckById(selectedDeckId) : null;

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a1a 100%)",
      color: "#e0d8cc",
      minHeight: "100vh",
    }}>
      {page === "home" && (
        <DeckSelector decks={decks} onSelectDeck={handleSelectDeck} />
      )}
      {page === "deck" && selectedDeck && (
        <DeckView deck={selectedDeck} onBack={handleBack} />
      )}
    </div>
  );
}
