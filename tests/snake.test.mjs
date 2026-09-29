import test from 'node:test';
import assert from 'node:assert/strict';
import { createSnake, snakeReducer, spawnFood, readBest, saveBest, BEST_SCORE_KEY, BOARD_WIDTH, BOARD_HEIGHT } from '../src/lib/snake.ts';
import { navigationReducer, initialNavigation } from '../src/lib/navigation.ts';
const tick = state => snakeReducer(state, { type: 'tick', random: 0.5 });
const turn = (state, direction) => snakeReducer(state, { type: 'turn', direction });
const start = () => snakeReducer(createSnake(), { type: 'start' });
test('ready, pause and resume do not advance the board until a running tick', () => {
  assert.deepEqual(tick(createSnake()), createSnake());
  let state = tick(start());
  assert.deepEqual(state.snake[0], { x: 6, y: 6 });
  state = snakeReducer(state, { type: 'toggle' });
  assert.equal(state.status, 'paused'); assert.deepEqual(tick(state), state);
  assert.equal(tick(snakeReducer(state, { type: 'toggle' })).snake[0].x, 7);
});
test('food grows the snake once, adds ten points, and spawns off the body', () => {
  const state = tick(tick(tick(start())));
  assert.equal(state.score, 10); assert.equal(state.best, 10); assert.equal(state.snake.length, 4);
  assert.ok(!state.snake.some(cell => cell.x === state.food.x && cell.y === state.food.y));
});
test('immediate reversals are ignored; rapid turns are applied one per tick', () => {
  let state = start(); assert.deepEqual(turn(state, 'left'), state);
  state = turn(turn(state, 'up'), 'left');
  assert.deepEqual(turn(state, 'down'), state); // The two-turn queue is full.
  state = tick(state); assert.deepEqual(state.snake[0], { x: 5, y: 5 });
  state = tick(state); assert.deepEqual(state.snake[0], { x: 4, y: 5 });
});
test('walls end the round and further ticks stop', () => {
  let state = start(); for (let i = 0; i < 11; i++) state = tick(state);
  assert.equal(state.status, 'over'); assert.deepEqual(tick(state), state);
});
test('self collision ends the round, but moving into a vacating tail is legal', () => {
  const state = { ...start(), direction: 'down', food: { x: 0, y: 0 }, snake: [{ x: 2, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }] };
  assert.equal(tick(state).status, 'over');
  assert.equal(tick({ ...state, snake: state.snake.slice(0, -1) }).status, 'running');
});
test('restart resets round and score while keeping best', () => {
  const state = snakeReducer(tick(tick(tick(start()))), { type: 'start' });
  assert.equal(state.score, 0); assert.equal(state.best, 10); assert.equal(state.status, 'running');
  assert.equal(state.snake.length, 3);
});
test('food selection handles the last free cell and a full board', () => {
  const cells = Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }, (_, i) => ({ x: i % BOARD_WIDTH, y: Math.floor(i / BOARD_WIDTH) }));
  assert.deepEqual(spawnFood(cells.slice(0, -1), 0.9), cells.at(-1));
  assert.equal(spawnFood(cells, 0.9), null);
  const remaining = cells.at(-1);
  const head = { x: remaining.x - 1, y: remaining.y };
  const state = { ...start(), snake: [head, ...cells.filter(c => !(c.x === head.x && c.y === head.y) && !(c.x === remaining.x && c.y === remaining.y))], food: remaining };
  assert.equal(tick(state).status, 'won');
});
test('best score survives storage reload and unavailable or corrupt storage is safe', () => {
  const data = new Map(); const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  saveBest(storage, 40); assert.equal(data.get(BEST_SCORE_KEY), '40'); assert.equal(readBest(storage), 40);
  for (const value of ['no', '-1', 'Infinity', '2.5']) { data.set(BEST_SCORE_KEY, value); assert.equal(readBest(storage), 0); }
  const blocked = { getItem: () => { throw Error(); }, setItem: () => { throw Error(); } };
  assert.equal(readBest(blocked), 0); assert.doesNotThrow(() => saveBest(blocked, 10));
});
test('Games occupies the last grid row and Back from Snake restores its library', () => {
  const reduce = (state, action) => navigationReducer(state, action, 7);
  let state = reduce(initialNavigation, { type: 'select', index: 6, scrollTop: 80 });
  state = reduce(state, { type: 'launch', game: 'snake', scrollTop: 50 });
  assert.equal(state.game, 'snake');
  const back = reduce(state, { type: 'back' });
  assert.equal(back.game, null); assert.equal(back.open, true); assert.equal(back.selected, 6); assert.equal(back.cursor, 'game-snake');
  assert.equal(reduce(back, { type: 'back' }).open, false);
  assert.equal(reduce(state, { type: 'home' }).game, null);
  const last = { ...initialNavigation, selected: 6 };
  assert.equal(reduce(last, { type: 'move', direction: 'right', columns: 2 }).selected, 6);
});
