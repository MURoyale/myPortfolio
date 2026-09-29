'use client';
import { useCallback, useEffect, useReducer } from 'react';
import { createSnake, readBest, saveBest, snakeReducer, TICK_MS, type SnakeDirection } from '@/lib/snake';

export function useSnake(enabled: boolean) {
  const [state, dispatch] = useReducer(snakeReducer, undefined, () => {
    try { return createSnake(readBest(window.localStorage)); } catch { return createSnake(); }
  });
  const running = enabled && state.status === 'running';
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => dispatch({ type: 'tick', random: Math.random() }), TICK_MS);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (!enabled) return;
    const pause = () => dispatch({ type: 'pause' });
    const visibility = () => { if (document.hidden) pause(); };
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', visibility);
    return () => { window.removeEventListener('blur', pause); document.removeEventListener('visibilitychange', visibility); };
  }, [enabled]);
  useEffect(() => {
    try { saveBest(window.localStorage, state.best); } catch { /* Storage may be blocked. */ }
  }, [state.best]);
  const turn = useCallback((direction: SnakeDirection) => dispatch({ type: 'turn', direction }), []);
  const toggle = useCallback(() => dispatch({ type: 'toggle' }), []);
  const pause = useCallback(() => dispatch({ type: 'pause' }), []);
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  const start = useCallback(() => dispatch({ type: 'start' }), []);
  return { state, turn, toggle, pause, reset, start };
}
export type SnakeController = ReturnType<typeof useSnake>;
