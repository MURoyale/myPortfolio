import type { GameId } from '@/data/games';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type NavigationFrame = {
  game: GameId | null;
  selected: number;
  open: boolean;
  cursor: string | null;
  expanded: string[];
  scrollTop: number;
};
export type NavigationState = NavigationFrame & {
  history: NavigationFrame[];
  revision: number;
};
export type NavigationAction =
  | { type: 'move'; direction: Direction; columns: number }
  | { type: 'highlight'; index: number }
  | { type: 'cursor'; id: string }
  | { type: 'select'; index: number; scrollTop: number }
  | { type: 'toggle'; id: string; scrollTop: number }
  | { type: 'launch'; game: GameId; scrollTop: number }
  | { type: 'back' | 'home' };

export const initialNavigation: NavigationState = {
  game: null, selected: 0, open: false, cursor: null, expanded: [], scrollTop: 0,
  history: [], revision: 0,
};

function snapshot(state: NavigationState, scrollTop: number): NavigationFrame {
  return { game: state.game, selected: state.selected, open: state.open, cursor: state.cursor, expanded: state.expanded, scrollTop };
}

export function navigationReducer(state: NavigationState, action: NavigationAction, count: number): NavigationState {
  switch (action.type) {
    case 'move': {
      if (state.open) return state;
      let next = state.selected;
      if (action.direction === 'up' && next - action.columns >= 0) next -= action.columns;
      if (action.direction === 'down' && next + action.columns < count) next += action.columns;
      if (action.columns > 1 && action.direction === 'left' && next % action.columns > 0) next--;
      if (action.columns > 1 && action.direction === 'right' && next % action.columns < action.columns - 1) next++;
      next = Math.max(0, Math.min(count - 1, next));
      return next === state.selected ? state : { ...state, selected: next };
    }
    case 'highlight':
      return state.open || action.index === state.selected ? state : { ...state, selected: action.index };
    case 'cursor':
      return state.cursor === action.id ? state : { ...state, cursor: action.id };
    case 'launch':
      return { ...state, game: action.game, history: [...state.history, { ...snapshot(state, action.scrollTop), cursor: `game-${action.game}` }], revision: state.revision + 1 };
    case 'select':
      if (action.index < 0 || action.index >= count || (state.open && state.selected === action.index)) return state;
      return { ...state, game: null, selected: action.index, open: true, cursor: 'section-heading', expanded: [], scrollTop: 0,
        history: [...state.history, snapshot(state.open ? state : { ...state, selected: action.index }, action.scrollTop)], revision: state.revision + 1 };
    case 'toggle': {
      if (!state.open) return state;
      if (state.expanded.includes(action.id)) {
        // Closing a disclosure also removes its matching nested-history frame.
        const previous = state.history.findLastIndex(frame => frame.open && frame.selected === state.selected && !frame.expanded.includes(action.id));
        if (previous >= 0) return { ...state.history[previous], history: state.history.slice(0, previous), revision: state.revision + 1 };
        return { ...state, cursor: action.id, expanded: state.expanded.filter(id => id !== action.id) };
      }
      return { ...state, cursor: action.id, expanded: [...state.expanded, action.id],
        history: [...state.history, { ...snapshot(state, action.scrollTop), cursor: action.id }] };
    }
    case 'back': {
      const previous = state.history.at(-1);
      if (previous) return { ...previous, history: state.history.slice(0, -1), revision: state.revision + 1 };
      return state.open ? { ...state, open: false, cursor: null, expanded: [], scrollTop: 0, revision: state.revision + 1 } : state;
    }
    case 'home':
      return { ...initialNavigation, revision: state.revision + 1 };
  }
}
