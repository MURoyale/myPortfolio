'use client';
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { useBreakout } from './use-breakout';
import { useSnake } from './use-snake';
import type { GameId } from '@/data/games';
import { sections } from '@/data/portfolio';
import { initialNavigation, navigationReducer, type Direction, type NavigationAction, type NavigationState } from '@/lib/navigation';

export type Command = Direction | 'confirm' | 'back' | 'home';
const directions = new Set<Command>(['up', 'down', 'left', 'right']);
const repeatDelay = 350;
const repeatRate = 150;
const contentSelector = 'h2,h3,h4,p,.record-fields>div,summary,.tool-list,.project-contributions li,button[data-nav-action],a[data-nav-action]';
const reduce = (state: NavigationState, action: NavigationAction) => navigationReducer(state, action, sections.length);

function targets(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(contentSelector)).filter(element => {
    // Collapsed disclosures remain in the DOM, but are not navigation destinations.
    const details = element.closest('details');
    return element.getClientRects().length > 0 && (!details || details.open || element.tagName === 'SUMMARY');
  });
}
function identity(element: HTMLElement) {
  return element.dataset.navId ?? `${element.closest<HTMLElement>('[data-nav-scope]')?.dataset.navScope ?? ''}:${element.tagName}:${element.textContent?.trim()}`;
}
function localBounds(element: HTMLElement, viewport: HTMLElement) {
  const rect = viewport.getBoundingClientRect();
  const item = element.getBoundingClientRect();
  const scale = rect.height / viewport.offsetHeight || 1;
  return { top: (item.top - rect.top) / scale + viewport.scrollTop, height: item.height / scale };
}
function reveal(element: HTMLElement, viewport: HTMLElement, reduced: boolean) {
  const { top, height } = localBounds(element, viewport);
  const bottom = viewport.scrollTop + viewport.clientHeight;
  const next = top < viewport.scrollTop + 6 ? top - 6 : top + Math.min(height, viewport.clientHeight - 12) > bottom - 6
    ? top + Math.min(height, viewport.clientHeight - 12) - viewport.clientHeight + 6 : viewport.scrollTop;
  if (Math.abs(next - viewport.scrollTop) > 1) viewport.scrollTo({ top: Math.max(0, next), behavior: reduced ? 'instant' : 'smooth' });
}

export function useNavigation(reduced: boolean) {
  const [state, dispatch] = useReducer(reduce, initialNavigation);
  const snake = useSnake(state.game === 'snake');
  const breakout = useBreakout(state.game === 'breakout');
  const { toggle: toggleBreakout, reset: resetBreakout, nudge, setHeld, clearInput, pause: pauseBreakout } = breakout;
  const { turn, toggle: toggleSnake, reset: resetSnake, pause: pauseSnake } = snake;
  const pauseGames = useCallback(() => { pauseSnake(); pauseBreakout(); }, [pauseSnake, pauseBreakout]);
  const screenRef = useRef<HTMLDivElement>(null);
  const latest = useRef(state);
  const syncing = useRef(false);
  const lastSync = useRef({ revision: -1, mode: '' });
  const keyTime = useRef(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const suppressClick = useRef(false);
  const performRef = useRef<(command: Command) => void>(() => {});
  useLayoutEffect(() => { latest.current = state; }, [state]);

  const viewport = useCallback(() => screenRef.current?.querySelector<HTMLElement>('[data-nav-viewport]') ?? null, []);
  const open = useCallback((index: number) => dispatch({ type: 'select', index, scrollTop: viewport()?.scrollTop ?? 0 }), [viewport]);
  const launchGame = useCallback((game: GameId) => { if (game === 'snake') resetSnake(); else resetBreakout(); dispatch({ type: 'launch', game, scrollTop: viewport()?.scrollTop ?? 0 }); }, [resetSnake, resetBreakout, viewport]);
  const toggle = useCallback((id: string) => dispatch({ type: 'toggle', id, scrollTop: viewport()?.scrollTop ?? 0 }), [viewport]);
  const highlight = useCallback((index: number) => { if (!syncing.current) dispatch({ type: 'highlight', index }); }, []);
  const focusContent = useCallback((element: HTMLElement) => {
    if (!syncing.current && latest.current.open && element.matches(contentSelector)) dispatch({ type: 'cursor', id: identity(element) });
  }, []);

  const perform = useCallback((command: Command) => {
    const current = latest.current;
    const root = viewport();
    if (command === 'home' || command === 'back') { dispatch({ type: command }); return; }
    if (current.game === 'breakout') {
      if (command === 'confirm') toggleBreakout();
      else if (command === 'left' || command === 'right') nudge(command === 'left' ? -1 : 1);
      return;
    }
    if (current.game) {
      if (command === 'confirm') toggleSnake();
      else turn(command);
      return;
    }
    if (!root) return;
    if (!current.open) {
      if (command === 'confirm') open(current.selected);
      else dispatch({ type: 'move', direction: command, columns: screenRef.current?.dataset.mode === 'wide' ? 2 : 1 });
      return;
    }
    const items = targets(root);
    const index = items.findIndex(element => identity(element) === current.cursor);
    const active = items[index];
    if (command === 'confirm') {
      if (active?.matches('button,summary,a[href]')) {
        const bounds = localBounds(active, root);
        if (bounds.top < root.scrollTop || bounds.top + Math.min(bounds.height, root.clientHeight - 12) > root.scrollTop + root.clientHeight) reveal(active, root, reduced);
        else active.click();
      }
      return;
    }
    if (command === 'left' || command === 'right') {
      const row = active?.closest('[data-nav-horizontal]');
      if (!row) return;
      const choices = Array.from(row.querySelectorAll<HTMLElement>('button'));
      const next = choices[choices.indexOf(active) + (command === 'left' ? -1 : 1)];
      if (next) dispatch({ type: 'cursor', id: identity(next) });
      return;
    }
    const delta = command === 'down' ? 1 : -1;
    if (active) {
      const bounds = localBounds(active, root);
      // Read oversized blocks in viewport-sized steps before advancing selection.
      const unread = delta > 0 ? bounds.top + bounds.height - root.scrollTop - root.clientHeight : root.scrollTop - bounds.top;
      if (unread > 8) {
        root.scrollBy({ top: delta * Math.min(unread, root.clientHeight * 0.65), behavior: reduced ? 'instant' : 'smooth' });
        return;
      }
    }
    let nextIndex = index < 0 ? (delta > 0 ? 0 : items.length - 1) : index + delta;
    const horizontalRow = active?.closest('[data-nav-horizontal]');
    // Vertical input leaves a horizontal control row instead of moving sideways.
    while (horizontalRow && items[nextIndex]?.closest('[data-nav-horizontal]') === horizontalRow) nextIndex += delta;
    if (nextIndex < 0 || nextIndex >= items.length) nextIndex = index;
    if (items[nextIndex]) {
      const id = identity(items[nextIndex]);
      if (id === current.cursor) reveal(items[nextIndex], root, reduced);
      else dispatch({ type: 'cursor', id });
    }
  }, [open, reduced, viewport, turn, toggleSnake, toggleBreakout, nudge]);
  useLayoutEffect(() => { performRef.current = perform; }, [perform]);

  const stopHold = useCallback(() => {
    setHeld('pointer', null);
    held.current = false;
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
  }, [setHeld]);
  useLayoutEffect(() => { stopHold(); clearInput(); }, [state.revision, stopHold, clearInput]);
  useEffect(() => {
    const stopOnHide = () => { if (document.hidden) stopHold(); };
    window.addEventListener('blur', stopHold);
    document.addEventListener('visibilitychange', stopOnHide);
    return () => { stopHold(); window.removeEventListener('blur', stopHold); document.removeEventListener('visibilitychange', stopOnHide); };
  }, [stopHold]);

  const bind = useCallback((command: Command) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      if (!directions.has(command) || event.button !== 0) return;
      event.preventDefault();
      stopHold();
      suppressClick.current = true;
      held.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      performRef.current(command);
      if (latest.current.game === 'breakout') {
        if (command === 'left' || command === 'right') setHeld('pointer', command === 'left' ? -1 : 1);
        return;
      }
      const repeat = () => {
        if (!held.current) return;
        performRef.current(command);
        holdTimer.current = setTimeout(repeat, repeatRate);
      };
      holdTimer.current = setTimeout(repeat, repeatDelay);
    },
    onPointerUp: stopHold,
    onPointerCancel: () => { stopHold(); suppressClick.current = false; },
    onLostPointerCapture: stopHold,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.detail > 0 && suppressClick.current && directions.has(command)) { suppressClick.current = false; return; }
      suppressClick.current = false;
      performRef.current(command);
    },
  }), [stopHold, setHeld]);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing || target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])')) return;
    // Header links and mode buttons keep native behavior; shortcuts belong to the device.
    if (!target.closest('#explore')) return;
    const keys: Record<string, Command> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'confirm', ' ': 'confirm', a: 'confirm', A: 'confirm', b: 'back', B: 'back', Backspace: 'back', Escape: 'back', Home: 'home' };
    if (latest.current.game) Object.assign(keys, { w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right', p: 'confirm', P: 'confirm' });
    const command = keys[event.key];
    if (!command) return;
    event.preventDefault();
    event.stopPropagation();
    if (latest.current.game === 'breakout' && (command === 'left' || command === 'right')) {
      if (!event.repeat) { nudge(command === 'left' ? -1 : 1); setHeld(event.key.toLowerCase(), command === 'left' ? -1 : 1); }
      return;
    }
    if (event.repeat && (!directions.has(command) || performance.now() - keyTime.current < repeatRate)) return;
    if (latest.current.game && event.repeat) return;
    keyTime.current = performance.now();
    // Enter/Space on a focused semantic control activate that control, not a stale selection.
    const button = target.closest<HTMLElement>('button,summary,a[href]');
    if ((event.key === 'Enter' || event.key === ' ') && button) button.click();
    else perform(command);
  }, [perform, nudge, setHeld]);
  const onKeyUp = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (latest.current.game === 'breakout') setHeld(event.key.toLowerCase(), null);
    if ((event.key === ' ' || event.key === 'Enter') && (event.target as HTMLElement).closest('#explore') && !(event.target as HTMLElement).closest('input,textarea,select,[contenteditable]')) event.preventDefault();
  }, [setHeld]);

  const syncScreen = useCallback((current: NavigationState, mode: string) => {
    if (current.game) {
      const changed = lastSync.current.revision !== current.revision;
      lastSync.current = { revision: current.revision, mode };
      if (changed) screenRef.current?.querySelector<HTMLElement>('.arcade-board')?.focus({ preventScroll: true });
      return;
    }
    const root = viewport();
    if (!root) return;
    const restored = lastSync.current.revision !== current.revision;
    const modeChanged = lastSync.current.mode !== mode;
    const initial = lastSync.current.revision === -1;
    lastSync.current = { revision: current.revision, mode };
    const items = current.open ? targets(root) : Array.from(root.querySelectorAll<HTMLElement>('[data-menu-index]'));
    const active = current.open ? items.find(element => identity(element) === current.cursor) : items[current.selected];
    items.forEach(element => {
      element.toggleAttribute('data-nav-selected', element === active);
      if (!element.matches('button,summary,a[href]')) element.tabIndex = -1;
    });
    if (restored) root.scrollTop = current.scrollTop;
    if (!active) return;
    // Resizing a device never steals focus from its mode selector.
    const outside = document.activeElement?.closest('.device-switch');
    syncing.current = true;
    if (!initial && !outside && !modeChanged) active.focus({ preventScroll: true });
    syncing.current = false;
    if (modeChanged && current.open) {
      const bounds = localBounds(active, root);
      if (bounds.top + bounds.height < root.scrollTop || bounds.top > root.scrollTop + root.clientHeight) reveal(active, root, true);
    } else if (!restored || !current.open) reveal(active, root, reduced || restored);
  }, [reduced, viewport]);

  return { state, snake, breakout, pauseGames, launchGame, screenRef, open, toggle, highlight, focusContent, perform, bind, onKeyDown, onKeyUp, syncScreen };
}
export type NavigationController = ReturnType<typeof useNavigation>;
