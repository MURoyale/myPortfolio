'use client';
import { GameActions, GameOverlay } from './arcade-ui';
import { useRef } from 'react';
import { BOARD_HEIGHT, BOARD_WIDTH } from '@/lib/snake';
import type { NavigationController } from '@/hooks/use-navigation';

export function SnakeGame({ navigation }: { navigation: NavigationController }) {
  const { snake: game } = navigation;
  const { snake, food, direction, status, score, best } = game.state;
  const board = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const toggle = () => { game.toggle(); board.current?.focus({ preventScroll: true }); };
  const restart = () => { game.start(); board.current?.focus({ preventScroll: true }); };
  const message = { ready: 'Ready to play', running: 'Playing', paused: 'Paused', over: 'Game over', won: 'Board complete!' }[status];
  return <div className="arcade-game">
    <div className="arcade-hud"><strong>Snake</strong><span>Score <b>{score}</b></span><span>Best <b>{best}</b></span></div>
    <div ref={board} className="arcade-board" tabIndex={0} role="group" aria-label="Snake playfield" aria-describedby="snake-instructions" onPointerDown={event => {
      if (event.button !== 0 || (event.target as Element).closest('button')) return;
      event.currentTarget.focus({ preventScroll: true });
      event.currentTarget.setPointerCapture(event.pointerId);
      gesture.current = { x: event.clientX, y: event.clientY };
    }} onPointerUp={event => {
      if (!gesture.current) return;
      const dx = event.clientX - gesture.current.x, dy = event.clientY - gesture.current.y;
      gesture.current = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) >= 10) game.turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }} onPointerCancel={() => { gesture.current = null; }}>
      <svg preserveAspectRatio="none" viewBox={`0 0 ${BOARD_WIDTH * 10} ${BOARD_HEIGHT * 10}`} role="img" aria-label={`Snake board. Score ${score}. ${message}.`}>
        <defs><pattern id="snake-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.4" /></pattern></defs>
        <rect x="0.5" y="0.5" width="159" height="119" className="snake-field" rx="2" stroke="#81b48b" strokeWidth="1" />
        <rect width="160" height="120" fill="url(#snake-grid)" />
        {food && <g className="snake-food" data-food={`${food.x},${food.y}`}><rect x={food.x * 10 + 2} y={food.y * 10 + 2} width="6" height="6" rx="1" /><path d={`M${food.x * 10 + 5} ${food.y * 10}v3`} stroke="currentColor" strokeWidth="1.2" /></g>}
        {snake.map((cell, i) => <rect key={`${cell.x},${cell.y}`} data-head={i === 0 ? `${cell.x},${cell.y}` : undefined} className={i === 0 ? 'snake-head' : 'snake-segment'} x={cell.x * 10 + 0.7} y={cell.y * 10 + 0.7} width="8.6" height="8.6" rx="1.5" />)}
        <path className="snake-eye" d="M-1.5 -2 L1.5 0 L-1.5 2" transform={`translate(${snake[0].x * 10 + 5} ${snake[0].y * 10 + 5}) rotate(${{ right: 0, down: 90, left: 180, up: 270 }[direction]})`} />
      </svg>
      {status !== 'running' && <GameOverlay message={message} detail={status === 'ready' ? 'Collect food. Avoid walls & yourself.' : `Score ${score} · Best ${best}`} action={status === 'paused' ? 'Resume Snake' : status === 'ready' ? 'Start Snake' : 'Play again'} onAction={toggle} />}
    </div>
    <span className="arcade-live" role="status">{message}</span>
    <GameActions title="Snake" action={status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : status === 'ready' ? 'Start' : 'Restart'} onAction={toggle} onRestart={restart} onExit={() => navigation.perform('back')}>Arrows / WASD / swipe · Enter / Space / P pause</GameActions>
  </div>;
}
