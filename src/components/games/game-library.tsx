import { games, type GameId } from '@/data/games';
export function GameLibrary({ onLaunch }: { onLaunch: (id: GameId) => void }) {
  return <div className="game-library">{games.map(game => <button key={game.id} className="game-card" aria-label={`Play ${game.title}`} data-nav-action data-nav-id={`game-${game.id}`} onClick={() => onLaunch(game.id)}>
    <span className="game-card-icon" aria-hidden="true">▰ ▰ ▰</span>
    <strong>{game.title}</strong><span>{game.description}</span><small>{game.controls}</small><b>Play game →</b>
  </button>)}</div>;
}
