'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { advanceBreakout, createBreakout, movePaddle, pauseBreakout, toggleBreakout, type BreakoutState } from '@/lib/breakout';

export function useBreakout(enabled: boolean) {
  const [state, setState] = useState(createBreakout);
  const model = useRef(state);
  const paint = useRef<((state: BreakoutState) => void) | null>(null);
  const inputs = useRef(new Map<string, number>());
  const target = useRef<number | null>(null);
  const publish = useCallback((next: BreakoutState) => {
    const previous = model.current;
    model.current = next;
    paint.current?.(next);
    // Ball and paddle move directly in SVG; React only renders game events.
    if (previous.status !== next.status || previous.bricks !== next.bricks || previous.lives !== next.lives || previous.score !== next.score) setState(next);
  }, []);
  const clearInput = useCallback(() => { inputs.current.clear(); target.current = null; }, []);
  const pause = useCallback(() => { clearInput(); publish(pauseBreakout(model.current)); }, [clearInput, publish]);
  const toggle = useCallback(() => { clearInput(); publish(toggleBreakout(model.current)); }, [clearInput, publish]);
  const reset = useCallback(() => { clearInput(); publish(createBreakout()); }, [clearInput, publish]);
  const setHeld = useCallback((source: string, direction: number | null) => {
    target.current = null;
    if (direction === null) inputs.current.delete(source); else inputs.current.set(source, direction);
  }, []);
  const nudge = useCallback((direction: number) => publish(movePaddle(model.current, model.current.paddle + direction * 12)), [publish]);
  const point = useCallback((x: number) => { if (Number.isFinite(x)) target.current = x; }, []);
  const moving = enabled && ['ready', 'serve', 'running'].includes(state.status);
  useEffect(() => {
    if (!moving) return;
    let frame = 0, last: number | null = null, remainder = 0;
    const animate = (now: number) => {
      if (last !== null) {
        const result = advanceBreakout(model.current, (now - last) / 1000, remainder, Array.from(inputs.current.values()).at(-1) ?? 0, target.current);
        remainder = result.remainder; publish(result.state);
      }
      last = now; frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); clearInput(); };
  }, [moving, clearInput, publish]);
  useEffect(() => {
    if (!enabled) return;
    const hidden = () => { if (document.hidden) pause(); };
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', hidden);
    return () => { window.removeEventListener('blur', pause); document.removeEventListener('visibilitychange', hidden); clearInput(); };
  }, [enabled, pause, clearInput]);
  const subscribe = useCallback((draw: (state: BreakoutState) => void) => {
    paint.current = draw; draw(model.current);
    return () => { if (paint.current === draw) paint.current = null; };
  }, []);
  return { state, subscribe, toggle, reset, pause, setHeld, nudge, point, clearInput };
}
