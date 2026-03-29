import { useState, useEffect } from 'react';

const imageCache = {};

function scryfallImageUrl(cardName) {
  const clean = cardName.replace(/\d+x\s/, '').replace(/ \/\/ /g, ' ');
  return `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(clean)}&format=image&version=normal`;
}

export default function CardImage({ name, style }) {
  const [loaded, setLoaded] = useState(!!imageCache[name]);
  const [error, setError] = useState(false);
  const url = scryfallImageUrl(name);

  useEffect(() => {
    if (imageCache[name]) {
      setLoaded(true);
      return;
    }
    const img = new Image();
    img.onload = () => {
      imageCache[name] = true;
      setLoaded(true);
    };
    img.onerror = () => setError(true);
    img.src = url;
  }, [name, url]);

  if (error) return null;

  return (
    <div style={{
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      transition: 'opacity 0.3s',
      opacity: loaded ? 1 : 0,
      ...style,
    }}>
      <img
        src={url}
        alt={name}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
        }}
      />
    </div>
  );
}
