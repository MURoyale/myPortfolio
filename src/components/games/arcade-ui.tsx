import type { ReactNode } from 'react';
export function GameOverlay({ message, detail, action, onAction }: { message: string; detail: string; action: string; onAction: () => void }) {
  return <div className="arcade-overlay"><strong>{message}</strong><span>{detail}</span><button onClick={onAction}>{action}</button></div>;
}
export function GameActions({ title, action, onAction, onRestart, onExit, children }: { title: string; action: string; onAction: () => void; onRestart: () => void; onExit: () => void; children: ReactNode }) {
  return <><div className="arcade-actions"><button onClick={onAction}>{action}</button><button onClick={onRestart}>Restart {title}</button><button onClick={onExit}>Games</button></div><p id={`${title.toLowerCase()}-instructions`} className="arcade-instructions">{children}</p></>;
}
