'use client';
import { GameLibrary } from '@/components/games/game-library';
import { BreakoutGame } from '@/components/games/breakout-game';
import { SnakeGame } from '@/components/games/snake-game';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, BatteryFull, ChevronRight, Home } from 'lucide-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import type { DeviceMode } from '@/lib/device-layout';
import { sections } from '@/data/portfolio';
import { SectionContent } from './section-content';
import type { NavigationController } from '@/hooks/use-navigation';

export type ScreenProps = { navigation: NavigationController; reduced: boolean; mode?: DeviceMode };
export function Screen({ navigation, reduced, mode = 'classic' }: ScreenProps) {
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const { state, screenRef, syncScreen } = navigation;
  const section = sections[state.selected];
  useLayoutEffect(() => { syncScreen(state, mode); }, [state, mode, syncScreen]);
  useEffect(() => {
    const update = () => setClock(formatClock(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <div ref={screenRef} data-mode={mode} className={`device-screen screen-${mode}${state.game ? ' screen-gaming' : ''}`}>
    <div className="screen-status"><span><i /> {mode === 'wide' ? 'CHAPTER LIBRARY' : 'PORTFOLIO OS'}</span><span aria-label={`Current time ${clock}`}>{clock} <BatteryFull size={15} /></span></div>
    <motion.div className="screen-view" key={state.open ? section.id : 'menu'} initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.14 }}>
      {state.game === 'breakout' ? <BreakoutGame navigation={navigation} /> : state.game === 'snake' ? <SnakeGame navigation={navigation} /> : state.open ? <>
        <div className="detail-heading"><span>{section.eyebrow}</span><button aria-label="Back to previous screen" {...navigation.bind('back')}><ArrowLeft size={16} /></button></div>
        <div className="detail-scroll" data-nav-viewport tabIndex={0} role="region" aria-label={`${section.title} content`} onFocusCapture={event => navigation.focusContent(event.target as HTMLElement)}>
          <h2 data-nav-id="section-heading" tabIndex={-1}>{section.title}<ArrowUpRight size={23} /></h2>
          <p className="detail-intro">{section.description}</p>
          {section.id === 'games' ? <GameLibrary onLaunch={navigation.launchGame} /> : <SectionContent sectionId={section.id} expanded={state.expanded} onToggle={navigation.toggle} />}
          <nav className="chapter-navigation" data-nav-horizontal aria-label="Browse chapters">
            <button data-nav-action data-nav-id="previous-section" aria-label="Previous section" onClick={() => navigation.open((state.selected + sections.length - 1) % sections.length)}>← Previous</button>
            <span>{state.selected + 1} / {sections.length}</span>
            <button data-nav-action data-nav-id="next-section" aria-label="Next section" onClick={() => navigation.open((state.selected + 1) % sections.length)}>Next →</button>
          </nav>
        </div>
      </> : <>
        <div className="menu-heading"><div><span>HELLO, PLAYER ONE.</span><h2>{mode === 'wide' ? 'Find your next chapter.' : 'Choose your chapter'}<span>_</span></h2></div></div>
        <div className="menu-list" data-nav-viewport role="group" aria-label="Portfolio sections">
          {sections.map((item, index) => <button data-menu-index={index} key={item.id} className={state.selected === index ? 'selected' : ''} onFocus={() => navigation.highlight(index)} aria-current={state.selected === index ? 'true' : undefined} aria-label={`Open ${item.title}`} onClick={() => navigation.open(index)}>
            <span className="menu-number">0{index + 1}</span><span>{item.title}{mode === 'wide' && <small>{['The introduction', 'The toolkit', 'Selected work', 'The journey', 'Always learning', 'Next conversation', 'Take a play break'][index]}</small>}</span><ChevronRight size={14} />
          </button>)}
        </div>
      </>}
    </motion.div>
    <div className="screen-input-hint" aria-live="polite">{state.game === 'breakout' ? '←→ Paddle · A Launch / pause · B Games' : state.game ? 'D-pad Move · A Play / pause · B Games' : state.open ? '↑↓ Read · ←→ Choices · A Activate · B Back' : mode === 'wide' ? '↑↓ Rows · ←→ Columns · A Open' : '↑↓ Select · A Open · B Back'}</div>
    <div className="screen-footer"><span>SEVEN CHAPTERS / PORTFOLIO</span><button {...navigation.bind('home')} aria-label="Return home"><Home size={12} /> HOME</button></div>
  </div>;
}

function formatClock(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}
