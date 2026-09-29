import { Sparkles } from 'lucide-react';
import { profile } from '@/data/portfolio';

export function PortfolioFooter() {
  return <footer className="page-footer" aria-label="Portfolio information and controls">
    <div className="site-footer">
      <div id="control-help" className="control-help">
        <span className="control-pair"><span className="key">↑ ↓</span> Select / scroll</span>
        <span className="control-pair"><span className="key">A / ↵ / Space</span> Activate</span>
        <span className="control-pair"><span className="key">B / Esc / ⌫</span> Back</span>
        <span className="control-pair"><span className="key">Home</span> Menu</span>
      </div>
      <span className="footer-edition">TWO DEVICES / ONE WORLD</span>
    </div>
    <div className="project-note"><Sparkles size={12} /> {profile.title} · {profile.location}</div>
  </footer>;
}
