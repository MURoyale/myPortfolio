export const FIELD = { width: 320, height: 200 };
export const PADDLE = { width: 64, height: 7, y: 181, speed: 240 };
export const BALL_RADIUS = 4;
export const BALL_SPEED = 125;
export const FIXED_STEP = 1 / 120;
export type Brick = { id: number; x: number; y: number; width: number; height: number; row: number };
export type BreakoutState = {
  status: 'ready' | 'running' | 'paused' | 'serve' | 'over' | 'won';
  paddle: number; ball: { x: number; y: number; vx: number; vy: number };
  bricks: Brick[]; score: number; lives: number;
  resumeStatus: 'ready' | 'running' | 'serve';
};
export function createBreakout(): BreakoutState {
  return { status: 'ready', resumeStatus: 'ready', paddle: 128, ball: { x: 160, y: PADDLE.y - BALL_RADIUS - 1, vx: 0, vy: 0 }, score: 0, lives: 3,
    bricks: Array.from({ length: 28 }, (_, id) => ({ id, row: Math.floor(id / 7), x: 12 + id % 7 * 43, y: 24 + Math.floor(id / 7) * 14, width: 38, height: 10 })) };
}
export function toggleBreakout(state: BreakoutState): BreakoutState {
  if (state.status === 'running') return pauseBreakout(state);
  if (state.status === 'paused') return { ...state, status: state.resumeStatus };
  if (state.status === 'won' || state.status === 'over') return toggleBreakout(createBreakout());
  // Every serve starts upwards from the paddle at the same controlled angle.
  return { ...state, status: 'running', resumeStatus: 'running', ball: { ...state.ball, vx: BALL_SPEED * 0.32, vy: -BALL_SPEED * Math.sqrt(1 - 0.32 ** 2) } };
}
export function pauseBreakout(state: BreakoutState): BreakoutState {
  return ['running', 'ready', 'serve'].includes(state.status) ? { ...state, status: 'paused', resumeStatus: state.status as BreakoutState['resumeStatus'] } : state;
}
export function movePaddle(state: BreakoutState, x: number): BreakoutState {
  if (['paused', 'over', 'won'].includes(state.status)) return state;
  const paddle = Math.max(0, Math.min(FIELD.width - PADDLE.width, x));
  return { ...state, paddle, ball: state.status === 'running' ? state.ball : { ...state.ball, x: paddle + PADDLE.width / 2 } };
}
export function stepBreakout(state: BreakoutState, direction: number, target: number | null = null): BreakoutState {
  if (['paused', 'over', 'won'].includes(state.status)) return state;
  const move = PADDLE.speed * FIXED_STEP;
  const delta = direction ? direction * move : target === null ? 0 : Math.max(-move, Math.min(move, target - PADDLE.width / 2 - state.paddle));
  const moved = movePaddle(state, state.paddle + delta);
  if (state.status !== 'running') return moved;
  const ball = { ...moved.ball, x: moved.ball.x + moved.ball.vx * FIXED_STEP, y: moved.ball.y + moved.ball.vy * FIXED_STEP };
  if (ball.x < BALL_RADIUS) { ball.x = BALL_RADIUS; ball.vx = Math.abs(ball.vx); }
  if (ball.x > FIELD.width - BALL_RADIUS) { ball.x = FIELD.width - BALL_RADIUS; ball.vx = -Math.abs(ball.vx); }
  if (ball.y < BALL_RADIUS) { ball.y = BALL_RADIUS; ball.vy = Math.abs(ball.vy); }
  if (ball.vy > 0 && moved.ball.y + BALL_RADIUS <= PADDLE.y && ball.y + BALL_RADIUS >= PADDLE.y && ball.x + BALL_RADIUS >= moved.paddle && ball.x - BALL_RADIUS <= moved.paddle + PADDLE.width) {
    const offset = Math.max(-1, Math.min(1, (ball.x - moved.paddle - PADDLE.width / 2) / (PADDLE.width / 2)));
    // Paddle contact steers the ball; its total speed stays constant.
    const angle = offset * Math.PI / 3;
    ball.vx = BALL_SPEED * Math.sin(angle);
    ball.vy = -BALL_SPEED * Math.cos(angle);
    ball.y = PADDLE.y - BALL_RADIUS - 0.01;
  }
  const hit = moved.bricks.find(brick => {
    const nearestX = Math.max(brick.x, Math.min(brick.x + brick.width, ball.x));
    const nearestY = Math.max(brick.y, Math.min(brick.y + brick.height, ball.y));
    return (ball.x - nearestX) ** 2 + (ball.y - nearestY) ** 2 < BALL_RADIUS ** 2;
  });
  let bricks = moved.bricks, score = moved.score;
  if (hit) {
    const penetration = [ball.x + BALL_RADIUS - hit.x, hit.x + hit.width - ball.x + BALL_RADIUS, ball.y + BALL_RADIUS - hit.y, hit.y + hit.height - ball.y + BALL_RADIUS];
    const side = penetration.indexOf(Math.min(...penetration));
    if (side === 0) { ball.x = hit.x - BALL_RADIUS; ball.vx = -Math.abs(ball.vx); }
    if (side === 1) { ball.x = hit.x + hit.width + BALL_RADIUS; ball.vx = Math.abs(ball.vx); }
    if (side === 2) { ball.y = hit.y - BALL_RADIUS; ball.vy = -Math.abs(ball.vy); }
    if (side === 3) { ball.y = hit.y + hit.height + BALL_RADIUS; ball.vy = Math.abs(ball.vy); }
    bricks = bricks.filter(brick => brick.id !== hit.id); score += 10;
  }
  if (!bricks.length) return { ...moved, ball, bricks, score, status: 'won' };
  if (ball.y - BALL_RADIUS > FIELD.height) {
    const lives = moved.lives - 1;
    return { ...moved, bricks, score, lives, status: lives ? 'serve' : 'over', ball: { x: moved.paddle + PADDLE.width / 2, y: PADDLE.y - BALL_RADIUS - 1, vx: 0, vy: 0 } };
  }
  return { ...moved, ball, bricks, score };
}
// Fixed simulation steps make 30/60/120Hz displays behave identically. Long stalls
// are capped instead of teleporting the ball or consuming lives off-screen.
export function advanceBreakout(state: BreakoutState, elapsed: number, remainder: number, direction: number, target: number | null) {
  let accumulator = remainder + Math.min(0.05, Math.max(0, elapsed));
  while (accumulator + 1e-10 >= FIXED_STEP) { state = stepBreakout(state, direction, target); accumulator -= FIXED_STEP; }
  return { state, remainder: Math.max(0, accumulator) };
}
