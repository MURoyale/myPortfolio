export type SnakeDirection = 'up' | 'down' | 'left' | 'right';
export type Cell = { x: number; y: number };
export const BOARD_WIDTH = 16;
export const BOARD_HEIGHT = 12;
export const TICK_MS = 160;
export const BEST_SCORE_KEY = 'mustafa-portfolio.snake.best.v1';
export type SnakeState = {
  snake: Cell[]; food: Cell | null; direction: SnakeDirection; queued: SnakeDirection[];
  status: 'ready' | 'running' | 'paused' | 'over' | 'won'; score: number; best: number;
};
export type SnakeAction = { type: 'reset' | 'start' | 'toggle' | 'pause' } | { type: 'turn'; direction: SnakeDirection } | { type: 'tick'; random: number };
const vectors: Record<SnakeDirection, Cell> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const opposite: Record<SnakeDirection, SnakeDirection> = { up: 'down', down: 'up', left: 'right', right: 'left' };
export function createSnake(best = 0): SnakeState {
  return { snake: [{ x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }], food: { x: 8, y: 6 }, direction: 'right', queued: [], status: 'ready', score: 0, best };
}
export function spawnFood(snake: Cell[], random: number): Cell | null {
  const free: Cell[] = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) for (let x = 0; x < BOARD_WIDTH; x++) {
    if (!snake.some(cell => cell.x === x && cell.y === y)) free.push({ x, y });
  }
  return free.length ? free[Math.min(free.length - 1, Math.max(0, Math.floor(random * free.length)))] : null;
}
export function snakeReducer(state: SnakeState, action: SnakeAction): SnakeState {
  if (action.type === 'reset') return createSnake(state.best);
  if (action.type === 'start') return { ...createSnake(state.best), status: 'running' };
  if (action.type === 'pause') return state.status === 'running' ? { ...state, status: 'paused', queued: [] } : state;
  if (action.type === 'toggle') {
    if (state.status === 'ready' || state.status === 'over' || state.status === 'won') return { ...createSnake(state.best), status: 'running' };
    return { ...state, status: state.status === 'running' ? 'paused' : 'running', queued: [] };
  }
  if (action.type === 'turn') {
    const direction = state.queued.at(-1) ?? state.direction;
    if (state.status !== 'running' || state.queued.length >= 2 || action.direction === direction || action.direction === opposite[direction]) return state;
    return { ...state, queued: [...state.queued, action.direction] };
  }
  if (action.type !== 'tick' || state.status !== 'running') return state;
  const direction = state.queued[0] ?? state.direction;
  const vector = vectors[direction];
  const head = { x: state.snake[0].x + vector.x, y: state.snake[0].y + vector.y };
  const eats = head.x === state.food?.x && head.y === state.food?.y;
  const body = eats ? state.snake : state.snake.slice(0, -1);
  if (head.x < 0 || head.x >= BOARD_WIDTH || head.y < 0 || head.y >= BOARD_HEIGHT || body.some(cell => cell.x === head.x && cell.y === head.y)) return { ...state, status: 'over', queued: [] };
  const snake = [head, ...body];
  const food = eats ? spawnFood(snake, action.random) : state.food;
  const score = state.score + (eats ? 10 : 0);
  return { ...state, snake, food, direction, queued: state.queued.slice(1), score, best: Math.max(state.best, score), status: food ? 'running' : 'won' };
}
export function readBest(storage: Pick<Storage, 'getItem'>): number {
  try { const value = Number(storage.getItem(BEST_SCORE_KEY)); return Number.isSafeInteger(value) && value >= 0 ? value : 0; } catch { return 0; }
}
export function saveBest(storage: Pick<Storage, 'setItem'>, score: number) {
  try { storage.setItem(BEST_SCORE_KEY, String(score)); } catch { /* Gameplay also works without storage. */ }
}
