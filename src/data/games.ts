export const games = [
  { id: 'snake', title: 'Snake', description: 'Collect food, grow your snake, and keep clear of the walls.', controls: 'Arrows / WASD / D-pad / swipe' },
  { id: 'breakout', title: 'Breakout', description: 'Clear the bricks, guide the ball, and protect your three lives.', controls: 'Left / Right / A D / pointer' },
] as const;
export type GameId = (typeof games)[number]['id'];
