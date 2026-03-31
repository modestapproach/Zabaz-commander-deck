import zabaz from './zabaz.js'

const decks = [zabaz]

export default decks

export function getDeckById(id) {
  return decks.find(d => d.id === id)
}
