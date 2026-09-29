'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Component, useEffect, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Gamepad2 } from 'lucide-react';
import { useNavigation } from '@/hooks/use-navigation';
import { profile, sections } from '@/data/portfolio';
import { PortfolioFooter } from './footer';
import { SectionContent } from './section-content';
import { deviceLayouts, type DeviceMode } from '@/lib/device-layout';
const Scene = dynamic(() => import('@/components/scene/portfolio-scene'), { ssr: false });
class SceneBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFail(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export default function Portfolio() {
  const [mode, setMode] = useState<DeviceMode>('classic');
  const preferredReduced = useReducedMotion();
  const reduced = Boolean(preferredReduced);
  const navigation = useNavigation(reduced);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
    const canvas = document.createElement('canvas');
    try {
      const context = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
      setSupported(Boolean(context));
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      setSupported(false);
    }
    });
    const lost = () => setFailed(true);
    document.addEventListener('portfolio-context-lost', lost);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('portfolio-context-lost', lost); };
  }, []);
  const unavailable = supported === false || failed;
  const screenProps = { navigation, reduced };
  return <main className="portfolio" onKeyDown={navigation.onKeyDown} onKeyUp={navigation.onKeyUp} onBlurCapture={event => { if (navigation.state.game && (!(event.relatedTarget instanceof Element) || !event.relatedTarget.closest('#explore'))) navigation.pauseGames(); }}>
    <a className="skip-link" href="#explore">Skip to portfolio</a>
    <header className="site-header">
      <Link className="wordmark personal-wordmark" href="/" aria-label={`${profile.name} home`}><span>{profile.name}</span><i aria-hidden="true" /></Link>
      <div className="header-center"><span className="status-dot" /> A PERSONAL WORLD, READY TO EXPLORE</div>
      <div className="device-switch" role="group" aria-label="Choose 3D device">
        {(['classic', 'wide'] as const).map(value => <button key={value} aria-pressed={mode === value} onClick={() => { navigation.pauseGames(); setMode(value); }} disabled={unavailable}>
          <span className={`device-icon ${value}`} aria-hidden="true" />{deviceLayouts[value].label}<span className="mode-dimension">3D</span>
        </button>)}
      </div>
    </header>
    <section className="experience" aria-label="Interactive portfolio">
      <div className="intro"><div className="eyebrow"><span className="tiny-line" /> {profile.title.toUpperCase()}</div><h1>Small device.<br />A whole<br /><span>new world.</span><span className="headline-star">✳</span></h1><p>A familiar feeling. A different way to explore.<br />Pick up a chapter and discover what’s inside.</p><div className="intro-footnote"><span>01 — 07</span> SEVEN CHAPTERS. ONE LITTLE WORLD.</div></div>
      <div id="explore" className={`scene-stage mode-${mode}`} tabIndex={0} aria-label="Portfolio device. Up and Down select or read. A, Enter or Space activate. B, Backspace or Escape go back. Home returns to the menu." aria-describedby="control-help">
        {!unavailable && supported && <SceneBoundary onFail={() => setFailed(true)}><Scene {...screenProps} mode={mode} onReady={() => setReady(true)} /></SceneBoundary>}
        {!unavailable && !ready && <div className="loading" role="status"><Gamepad2 size={30} /><span>Booting your little world…</span></div>}
        {unavailable && <div className="graphics-unavailable"><h2>3D is unavailable in this browser</h2><p>You can still read the portfolio chapters below.</p>{sections.map(section => <details key={section.id}><summary>{section.title}</summary><SectionContent sectionId={section.id} /></details>)}</div>}


      </div>
      <div className="scene-caption"><span className="status-dot" /><span>{`${deviceLayouts[mode].label.toUpperCase()} / 3D EDITION`}</span><span className="caption-line" />DESIGNED TO BE EXPLORED</div>
      <div className="scene-tag"><span>INTERACTIVE EDITION</span><ArrowUpRight size={14} /></div>
    </section>
    <PortfolioFooter />
  </main>;
}
