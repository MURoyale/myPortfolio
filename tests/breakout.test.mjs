import test from 'node:test';
import assert from 'node:assert/strict';
import { createBreakout, toggleBreakout, pauseBreakout, movePaddle, stepBreakout, advanceBreakout, BALL_SPEED, BALL_RADIUS, FIELD, PADDLE, FIXED_STEP } from '../src/lib/breakout.ts';
import { navigationReducer, initialNavigation } from '../src/lib/navigation.ts';
const running = () => toggleBreakout(createBreakout());
const ballAt = (x, y, vx, vy) => ({ ...running(), ball: { x, y, vx, vy } });
test('initial board has 28 bricks, three lives, and a stationary ball on the paddle', () => {
  const state = createBreakout(); assert.equal(state.bricks.length, 28); assert.equal(state.lives, 3); assert.equal(state.ball.vy, 0);
  const moved = stepBreakout(state, 1); assert.equal(moved.ball.x, moved.paddle + PADDLE.width / 2);
  const launched = toggleBreakout(moved); assert.ok(launched.ball.vy < 0); assert.ok(launched.ball.vx > 0);
  assert.ok(Math.abs(Math.hypot(launched.ball.vx, launched.ball.vy) - BALL_SPEED) < 1e-8);
});
test('paddle input clamps at walls and pointer travel uses the same bounded speed', () => {
  assert.equal(movePaddle(createBreakout(), -100).paddle, 0);
  assert.equal(movePaddle(createBreakout(), 1000).paddle, FIELD.width - PADDLE.width);
  const state = createBreakout();
  assert.equal(stepBreakout(state, 1).paddle - state.paddle, PADDLE.speed * FIXED_STEP);
  assert.equal(stepBreakout(state, 0, 320).paddle - state.paddle, PADDLE.speed * FIXED_STEP);
});
test('left, right and ceiling collisions point the ball back into the field', () => {
  assert.ok(stepBreakout(ballAt(4.1, 110, -100, -75), 0).ball.vx > 0);
  assert.ok(stepBreakout(ballAt(315.9, 110, 100, -75), 0).ball.vx < 0);
  assert.ok(stepBreakout(ballAt(160, 4.1, 75, -100), 0).ball.vy > 0);
});
test('paddle rebounds are upward, steered by contact, and keep constant speed', () => {
  for (const offset of [-24, 0, 24]) {
    const state = stepBreakout(ballAt(160 + offset, PADDLE.y - BALL_RADIUS - 0.5, 0, BALL_SPEED), 0);
    assert.ok(state.ball.vy < 0);
    assert.equal(Math.sign(state.ball.vx), Math.sign(offset));
    assert.ok(Math.abs(Math.hypot(state.ball.vx, state.ball.vy) - BALL_SPEED) < 1e-8);
    assert.ok(state.ball.y + BALL_RADIUS < PADDLE.y);
  }
});
test('bottom and side brick impacts remove one brick, reflect correctly, and score once', () => {
  const bottom = stepBreakout(ballAt(30, 80.5, 0, -BALL_SPEED), 0);
  assert.equal(bottom.bricks.length, 27); assert.equal(bottom.score, 10); assert.ok(bottom.ball.vy > 0);
  const next = stepBreakout(bottom, 0); assert.equal(next.score, 10);
  const side = stepBreakout(ballAt(7.5, 29, BALL_SPEED, 0), 0);
  assert.equal(side.score, 10); assert.ok(side.ball.vx < 0);
});
test('missing the paddle costs one life and waits for a deliberate upward relaunch', () => {
  const missed = stepBreakout(ballAt(10, FIELD.height + BALL_RADIUS, 0, BALL_SPEED), 0);
  assert.equal(missed.lives, 2); assert.equal(missed.status, 'serve'); assert.equal(missed.ball.vy, 0);
  const waiting = stepBreakout(missed, 0); assert.equal(waiting.lives, 2);
  assert.ok(toggleBreakout(waiting).ball.vy < 0);
  const last = stepBreakout({ ...ballAt(10, 205, 0, BALL_SPEED), lives: 1 }, 0);
  assert.equal(last.status, 'over'); assert.equal(last.lives, 0); assert.deepEqual(stepBreakout(last, 0), last);
});
test('clearing the final brick wins and freezes the simulation', () => {
  const state = running();
  const won = stepBreakout({ ...state, bricks: [state.bricks[0]], ball: { x: 30, y: 38.5, vx: 0, vy: -BALL_SPEED } }, 0);
  assert.equal(won.status, 'won'); assert.equal(won.score, 10); assert.equal(won.bricks.length, 0);
  assert.deepEqual(stepBreakout(won, 1), won);
  assert.equal(toggleBreakout(won).bricks.length, 28);
});
test('pause/resume preserves ball, lives and score; restart creates a clean ready round', () => {
  const state = stepBreakout(running(), -1); const paused = pauseBreakout(state);
  assert.deepEqual(stepBreakout(paused, 1), paused);
  assert.deepEqual(toggleBreakout(paused), state);
  const fresh = createBreakout(); assert.equal(fresh.status, 'ready'); assert.equal(fresh.score, 0); assert.equal(fresh.lives, 3);
  assert.equal(toggleBreakout(pauseBreakout(fresh)).status, 'ready');
});
test('fixed steps give the same result at 30, 60 and 120 FPS and cap large stalls', () => {
  const simulate = fps => { let state = running(), remainder = 0; for(let i=0;i<fps;i++) ({ state, remainder } = advanceBreakout(state, 1/fps, remainder, 0, null)); return state; };
  assert.deepEqual(simulate(30), simulate(60)); assert.deepEqual(simulate(60), simulate(120));
  assert.deepEqual(advanceBreakout(running(), 5, 0, 0, null), advanceBreakout(running(), 0.05, 0, 0, null));
});
test('game switching preserves library history and restores each game selection', () => {
  const reduce = (state, action) => navigationReducer(state, action, 7);
  let state = reduce(initialNavigation, { type: 'select', index: 6, scrollTop: 0 });
  state = reduce(state, { type: 'launch', game: 'breakout', scrollTop: 150 });
  state = reduce(state, { type: 'back' }); assert.equal(state.game, null); assert.equal(state.cursor, 'game-breakout');
  state = reduce(state, { type: 'launch', game: 'snake', scrollTop: 0 }); assert.equal(state.game, 'snake');
  assert.equal(reduce(state, { type: 'home' }).game, null);
});
