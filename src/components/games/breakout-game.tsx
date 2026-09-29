'use client';
import { useLayoutEffect, useRef, type PointerEvent } from 'react';
import { BALL_RADIUS, FIELD, PADDLE, type BreakoutState } from '@/lib/breakout';
import type { NavigationController } from '@/hooks/use-navigation';
import { GameActions, GameOverlay } from './arcade-ui';

export function BreakoutGame({ navigation }: { navigation: NavigationController }) {
  const game = navigation.breakout;
  const { status, score, lives, bricks } = game.state;
  const board = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const ball = useRef<SVGCircleElement>(null);
  const paddle = useRef<SVGRectElement>(null);
  const { subscribe } = game;
  useLayoutEffect(() => {
    const draw = (state: BreakoutState) => {
      ball.current?.setAttribute('cx', String(state.ball.x)); ball.current?.setAttribute('cy', String(state.ball.y));
      paddle.current?.setAttribute('x', String(state.paddle));
    };
    return subscribe(draw);
  }, [subscribe, game.state]);
  const focus = () => board.current?.focus({ preventScroll: true });
  const toggle = () => { game.toggle(); focus(); };
  const restart = () => { game.reset(); focus(); };
  const point = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest('button') || !svg.current) return;
    // Invert the projected SVG transform so pointer input stays aligned with
    // the slightly rotated 3D screen in both device modes.
    const matrix = svg.current.getScreenCTM();
    if (!matrix || Math.abs(matrix.a * matrix.d - matrix.b * matrix.c) < 1e-8) return;
    const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    game.point(local.x);
  };
  const message = { ready: 'Ready to launch', running: 'Playing', paused: 'Paused', serve: 'Ball lost', over: 'Game over', won: 'Board cleared!' }[status];
  const action = status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : status === 'ready' || status === 'serve' ? 'Launch ball' : 'Play again';
  return <div className="arcade-game breakout-game">
    <div className="arcade-hud"><strong>Breakout</strong><span>Score <b>{score}</b></span><span>Lives <b>{lives}</b></span></div>
    <div ref={board} className="arcade-board breakout-board" role="group" tabIndex={0} aria-label="Breakout playfield" aria-describedby="breakout-instructions"
      onPointerMove={point} onPointerDown={event => {
        if (event.button !== 0 || (event.target as Element).closest('button')) return;
        focus(); event.currentTarget.setPointerCapture(event.pointerId); point(event);
      }}>
      <svg ref={svg} preserveAspectRatio="none" viewBox={`0 0 ${FIELD.width} ${FIELD.height}`} role="img" aria-label={`Breakout board. ${bricks.length} bricks left. ${lives} lives.`}>
        <rect x="1" y="1" width="318" height="198" rx="3" className="breakout-field" />
        <path d="M12 192H308" stroke="#759683" strokeDasharray="2 4" strokeOpacity="0.4" />
        {bricks.map(brick => <rect key={brick.id} className={`breakout-brick brick-row-${brick.row}`} x={brick.x} y={brick.y} width={brick.width} height={brick.height} rx="2" />)}
        <rect ref={paddle} className="breakout-paddle" x={game.state.paddle} y={PADDLE.y} width={PADDLE.width} height={PADDLE.height} rx="3" />
        <circle ref={ball} className="breakout-ball" cx={game.state.ball.x} cy={game.state.ball.y} r={BALL_RADIUS} />
      </svg>
      {status !== 'running' && <GameOverlay message={message} detail={status === 'ready' ? 'Clear every brick. Three lives.' : `Score ${score} · ${lives} lives remaining`} action={action === 'Resume' ? 'Resume Breakout' : action} onAction={toggle} />}
    </div>
    <span className="arcade-live" role="status">{message}. {lives} lives.</span>
    <GameActions title="Breakout" action={action} onAction={toggle} onRestart={restart} onExit={() => navigation.perform('back')}>← → / A D / pointer · Enter / Space / P launch or pause</GameActions>
  </div>;
}
