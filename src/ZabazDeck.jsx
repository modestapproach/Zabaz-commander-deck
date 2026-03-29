import { useState } from "react";
import CardImage from "./CardImage.jsx";

const CATEGORIES = {
  "Commander": [
    { name: "Zabaz, the Glimmerwasp", cost: "{X}", note: "Commander — doubles modular triggers, sacs artifacts for value", price: 1.40 },
  ],
  "Modular Creatures (15)": [
    { name: "Arcbound Worker", cost: "{1}", note: "Modular 1 — cheap fodder, feeds Ravager/Oswald chains", price: 0.25 },
    { name: "Arcbound Mouser", cost: "{1}", note: "Modular 1 — cat with lifelink upside", price: 0.15 },
    { name: "Arcbound Javelineer", cost: "{1}", note: "Modular 1 — pings attackers/blockers", price: 0.15 },
    { name: "Arcbound Stinger", cost: "{2}", note: "Modular 1 + flying — evasive counter carrier", price: 0.15 },
    { name: "Arcbound Slasher", cost: "{4}{R}", note: "Modular 4 + riot — haste or extra counter", price: 0.25 },
    { name: "Arcbound Tracker", cost: "{2}{R}", note: "Modular — grows on 2nd spell each turn", price: 0.15 },
    { name: "Arcbound Shikari", cost: "{R}{W}", note: "Modular 1 + equip matters — first strike", price: 0.50 },
    { name: "Arcbound Ravager", cost: "{2}", note: "Modular — THE sac outlet, dumps counters on death", price: 8.00 },
    { name: "Arcbound Overseer", cost: "{8}", note: "Modular 6 — top end bomb, gives counters to all modular", price: 1.50 },
    { name: "Arcbound Whelp", cost: "{3}{R}", note: "Modular 2 + flying + firebreathing", price: 0.25 },
    { name: "Arcbound Crusher", cost: "{4}", note: "Modular 1 + trample — grows on every artifact ETB", price: 0.35 },
    { name: "Arcbound Hybrid", cost: "{4}", note: "Modular 2 + haste", price: 0.15 },
    { name: "Stonecoil Serpent", cost: "{X}", note: "Protection from multicolor, trample, reach — scales beautifully", price: 3.00 },
    { name: "Walking Ballista", cost: "{X}{X}", note: "THE win condition — converts counters to damage", price: 12.00 },
    { name: "Hangarback Walker", cost: "{X}{X}", note: "Dies into Thopters — great with modular", price: 2.50 },
  ],
  "Key Creatures (10)": [
    { name: "Oswald Fiddlebender", cost: "{1}{W}", note: "★ CORE — Birthing Pod for artifacts, tutors your whole toolbox", price: 2.00 },
    { name: "Patchwork Automaton", cost: "{2}", note: "Ward 2, grows on artifact casts — resilient beater", price: 1.00 },
    { name: "Steel Overseer", cost: "{2}", note: "Taps to put +1/+1 on all artifact creatures", price: 2.50 },
    { name: "Scrap Trawler", cost: "{3}", note: "Artifact dies → get back cheaper artifact — recursion engine", price: 1.00 },
    { name: "Junk Diver", cost: "{3}", note: "Dies → return artifact from graveyard", price: 0.50 },
    { name: "Myr Retriever", cost: "{2}", note: "Dies → return artifact from graveyard (loops with Junk Diver)", price: 0.25 },
    { name: "Scrapyard Recombiner", cost: "{3}", note: "Modular 1 + sac a construct to tutor a construct", price: 0.50 },
    { name: "Phyrexian Revoker", cost: "{2}", note: "Names a card, shuts down activated abilities — stax piece", price: 0.50 },
    { name: "Esper Sentinel", cost: "{W}", note: "Artifact creature tax — draws cards when opponents cast noncreatures", price: 4.00 },
    { name: "Sparring Construct", cost: "{1}", note: "Dies → put +1/+1 counter on target creature", price: 0.10 },
  ],
  "Licids (5)": [
    { name: "Quickening Licid", cost: "{W}", note: "Becomes aura granting first strike — great on Zabaz or Ballista", price: 0.25 },
    { name: "Calming Licid", cost: "{2}{W}", note: "Becomes aura that shuts down an attacker — removal on a body", price: 0.15 },
    { name: "Enraging Licid", cost: "{R}", note: "Forces creature to attack — political tool, disrupts combo players", price: 0.25 },
    { name: "Convulsing Licid", cost: "{2}{R}", note: "Becomes aura preventing blocking — pushes damage through", price: 0.15 },
    { name: "Transmogrifying Licid", cost: "{3}", note: "★ Artifact Licid — turns creature into artifact. Enables Oswald/Ravager on opponents' stuff", price: 0.50 },
  ],
  "Artifacts & Equipment (13)": [
    { name: "Agatha's Soul Cauldron", cost: "{2}", note: "★ CORE — exile creatures from GY, share activated abilities via +1/+1 counters", price: 8.00 },
    { name: "The Ozolith", cost: "{1}", note: "Saves counters when creatures leave — modular insurance policy", price: 5.00 },
    { name: "Animation Module", cost: "{1}", note: "Counter placed → pay 1 to make a Servo. Engine piece", price: 0.50 },
    { name: "Sol Ring", cost: "{1}", note: "It's Sol Ring", price: 1.00 },
    { name: "Arcane Signet", cost: "{2}", note: "Boros mana rock", price: 0.50 },
    { name: "Mind Stone", cost: "{2}", note: "Ramp or sac for a card", price: 0.25 },
    { name: "Boros Signet", cost: "{2}", note: "Mana fixing", price: 0.25 },
    { name: "Swiftfoot Boots", cost: "{2}", note: "Hexproof + haste for Zabaz/Oswald", price: 0.50 },
    { name: "Skullclamp", cost: "{1}", note: "Equip to 1-toughness modular creatures → draw 2 + modular triggers", price: 1.50 },
    { name: "Spine of Ish Sah", cost: "{7}", note: "Destroys any permanent, returns to hand on death — Oswald target at 7", price: 0.50 },
    { name: "Ichor Wellspring", cost: "{2}", note: "ETB draw + dies draw — perfect Oswald/Ravager fodder", price: 0.15 },
    { name: "Mycosynth Wellspring", cost: "{2}", note: "ETB tutor land + dies tutor land — more Oswald food", price: 0.15 },
  ],
  "Stax & Disruption (6)": [
    { name: "Sphere of Resistance", cost: "{2}", note: "From the Vintage list — taxes all spells by {1}", price: 4.00 },
    { name: "Thorn of Amethyst", cost: "{2}", note: "Taxes noncreature spells — your deck is mostly creatures/artifacts", price: 0.50 },
    { name: "Lodestone Golem", cost: "{4}", note: "5/3 that taxes nonartifact spells", price: 0.50 },
    { name: "Damping Sphere", cost: "{2}", note: "Hoses storm and Tron-style ramp", price: 0.25 },
    { name: "Grafdigger's Cage", cost: "{1}", note: "Shuts down graveyard and library-to-battlefield effects", price: 1.50 },
    { name: "Chalice of the Void", cost: "{X}{X}", note: "From the Vintage list — set on 1 to lock out Sol Rings & Swords", price: 15.00 },
  ],
  "Removal & Protection (8)": [
    { name: "Swords to Plowshares", cost: "{W}", note: "Best white removal in the game", price: 1.50 },
    { name: "Path to Exile", cost: "{W}", note: "Second best white removal", price: 1.00 },
    { name: "Dispatch", cost: "{W}", note: "Metalcraft exile — trivial in this deck", price: 0.25 },
    { name: "Wear // Tear", cost: "{R}/{W}", note: "Artifact + enchantment removal in one card", price: 0.50 },
    { name: "Teferi's Protection", cost: "{2}{W}", note: "Phase out everything — ultimate panic button", price: 6.00 },
    { name: "Flawless Maneuver", cost: "{2}{W}", note: "Free if commander is out — indestructible for the team", price: 2.00 },
    { name: "Generous Gift", cost: "{2}{W}", note: "Destroy any permanent at instant speed", price: 0.50 },
    { name: "Abrade", cost: "{1}{R}", note: "Kills creature or artifact — flexible", price: 0.25 },
  ],
  "Card Draw & Tutors (5)": [
    { name: "Inventor's Fair", cost: "Land", note: "Gains life + sac to tutor artifact", price: 3.00 },
    { name: "Urza's Saga", cost: "Land", note: "Makes constructs + tutors 0-1 cost artifacts (Sol Ring, Skullclamp, etc.)", price: 8.00 },
    { name: "Buried Ruin", cost: "Land", note: "Sac to return artifact from GY", price: 0.25 },
    { name: "Goblin Engineer", cost: "{1}{R}", note: "ETB tutors artifact to GY + activated swap from GY to play", price: 1.50 },
    { name: "Reckoner Bankbuster", cost: "{2}", note: "Draw cards, then becomes a crew vehicle", price: 0.25 },
  ],
  "Lands (35)": [
    { name: "Command Tower", cost: "Land", note: "", price: 0.25 },
    { name: "Battlefield Forge", cost: "Land", note: "Pain land — R/W", price: 1.50 },
    { name: "Inspiring Vantage", cost: "Land", note: "Fast land — R/W", price: 2.50 },
    { name: "Sacred Foundry", cost: "Land", note: "Shock land — fetchable", price: 10.00 },
    { name: "Rugged Prairie", cost: "Land", note: "Filter land", price: 1.50 },
    { name: "Needle Spires", cost: "Land", note: "Creature land", price: 0.25 },
    { name: "Darksteel Citadel", cost: "Land", note: "Indestructible artifact land — Oswald/Ravager fodder", price: 0.50 },
    { name: "Ancient Den", cost: "Land", note: "Artifact land (W) — sac to Oswald for 1-drops", price: 1.50 },
    { name: "Great Furnace", cost: "Land", note: "Artifact land (R) — sac to Oswald for 1-drops", price: 1.50 },
    { name: "Treasure Vault", cost: "Land", note: "Sac to make treasures — artifact land for metalcraft", price: 2.00 },
    { name: "Power Depot", cost: "Land", note: "Artifact land + modular 1", price: 0.25 },
    { name: "Temple of Triumph", cost: "Land", note: "Scry land", price: 0.25 },
    { name: "Clifftop Retreat", cost: "Land", note: "Check land", price: 1.00 },
    { name: "Slayers' Stronghold", cost: "Land", note: "Gives haste + vigilance + +2/+0", price: 0.50 },
    { name: "War Room", cost: "Land", note: "Draw a card — colorless utility", price: 1.00 },
    { name: "Minas Tirith", cost: "Land", note: "Boros utility land with card draw", price: 1.50 },
    { name: "Mountain", cost: "Land", note: "×8", price: 0.00, qty: 8 },
    { name: "Plains", cost: "Land", note: "×8", price: 0.00, qty: 8 },
  ],
};

const COMBO_LINES = [
  {
    title: "Walking Ballista + Agatha's Soul Cauldron",
    cards: ["Walking Ballista", "Agatha's Soul Cauldron"],
    desc: "Exile a creature with a tap-to-add-counter ability (like Steel Overseer) under the Cauldron. Now Ballista taps to add counters AND removes them for damage — repeatable machine gun."
  },
  {
    title: "Oswald Fiddlebender Toolbox Chain",
    cards: ["Oswald Fiddlebender", "Darksteel Citadel"],
    desc: "Sac artifact lands (0-cost) to find Sol Ring/Skullclamp. Sac 1-drops to find The Ozolith/Animation Module. Sac 2-drops to find Agatha's Soul Cauldron. Chains all the way up to Spine of Ish Sah at 7."
  },
  {
    title: "Arcbound Ravager + Walking Ballista",
    cards: ["Arcbound Ravager", "Walking Ballista"],
    desc: "Sac all artifacts to Ravager, stack modular counters (doubled by Zabaz), then sac Ravager targeting Ballista. Dump all counters as direct damage."
  },
  {
    title: "Transmogrifying Licid + Oswald/Ravager",
    cards: ["Transmogrifying Licid", "Oswald Fiddlebender"],
    desc: "Attach Transmogrifying Licid to an opponent's creature — it becomes an artifact. Now Oswald can sac it, or Ravager can eat it. Repeatable theft-to-sac engine."
  },
  {
    title: "Cauldron + Licid Tech",
    cards: ["Agatha's Soul Cauldron", "Quickening Licid"],
    desc: "Exile a Licid with the Cauldron. Now any creature with a +1/+1 counter can become an aura and revert back. Modular creatures with counters become flexible aura/creatures at will."
  }
];

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
