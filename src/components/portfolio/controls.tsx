'use client';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import type { ScreenProps } from './screen';
export function Controls({ navigation, mode = 'classic' }: Pick<ScreenProps, 'navigation' | 'mode'>) {
  return <div className={`device-controls controls-${mode}`}>
    <div className="dpad" aria-label="Directional controls">
      <button className="up" disabled={navigation.state.game === 'breakout'} aria-label={navigation.state.game === 'breakout' ? 'Up: unused in Breakout' : navigation.state.game ? 'Move snake up' : 'Up: previous item or scroll up'} {...navigation.bind('up')}><ChevronUp /></button>
      <button className="left" aria-label={navigation.state.game === 'breakout' ? 'Paddle left' : navigation.state.game ? 'Move snake left' : 'Left: previous horizontal option'} {...navigation.bind('left')}><ChevronLeft /></button>
      <span className="dpad-center" />
      <button className="right" aria-label={navigation.state.game === 'breakout' ? 'Paddle right' : navigation.state.game ? 'Move snake right' : 'Right: next horizontal option'} {...navigation.bind('right')}><ChevronRight /></button>
      <button className="down" disabled={navigation.state.game === 'breakout'} aria-label={navigation.state.game === 'breakout' ? 'Down: unused in Breakout' : navigation.state.game ? 'Move snake down' : 'Down: next item or scroll down'} {...navigation.bind('down')}><ChevronDown /></button>
    </div>
    <div className="action-buttons"><div><button className="button-b" aria-label={navigation.state.game ? 'B: Return to Games' : 'B: Back to previous screen'} {...navigation.bind('back')}>B</button><span>BACK</span></div><div><button className="button-a" aria-label={navigation.state.game === 'breakout' ? 'A: Launch or pause Breakout' : navigation.state.game ? 'A: Play or pause Snake' : 'A: Activate selected item'} {...navigation.bind('confirm')}>A</button><span>ENTER</span></div></div>
    <div className="system-buttons"><button {...navigation.bind('home')}>HOME</button><span>EXPLORE / CONNECT</span></div>
    <div className="speaker" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <i key={i} />)}</div>
  </div>;
}
