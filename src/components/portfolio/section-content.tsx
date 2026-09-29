import type { ReactNode } from 'react';
import { profile, contactChannels, education, experience, profileFacts, projects, skills, type SectionId } from '@/data/portfolio';

function RecordFields({ fields }: { fields: readonly { label: string; value: string }[] }) {
  return <dl className="record-fields">{fields.map(field =>
    <div key={field.label}><dt>{field.label}</dt><dd>{field.value}</dd></div>
  )}</dl>;
}

type ContentProps = { sectionId: SectionId; expanded?: string[]; onToggle?: (id: string) => void };
function Disclosure({ id, title, expanded, onToggle, children }: {
  id: string; title: ReactNode; children: ReactNode;
  expanded?: string[]; onToggle?: (id: string) => void;
}) {
  return <details className="chapter-disclosure" open={expanded ? expanded.includes(id) : undefined}>
    <summary data-nav-id={id} onClick={onToggle ? event => { event.preventDefault(); onToggle(id); } : undefined}>{title}</summary>
    {children}
  </details>;
}

export function SectionContent({ sectionId, expanded, onToggle }: ContentProps) {
  switch (sectionId) {
    case 'games':
      return <p>Snake and Breakout are available inside either 3D device when graphics are supported.</p>;
    case 'profile':
      return <div className="chapter-content">
        <RecordFields fields={profileFacts} />
        <p>{profile.summary}</p>
        <h3>Languages</h3><ul className="tool-list">{profile.languages.map(language => <li key={language}>{language}</li>)}</ul>
      </div>;
    case 'skills':
      return <div className="chapter-content"><ul className="tool-list">{skills.map(skill => <li key={skill}>{skill}</li>)}</ul></div>;
    case 'projects':
      return <div className="chapter-content">{projects.map(project => <article key={project.id} data-nav-scope={project.id} className={`project-card${project.featured ? ' featured-project' : ''}`}>
        {project.featured && <span className="chapter-label">FEATURED PROJECT</span>}
        <h3>{project.title}</h3><p>{project.summary}</p>
        <Disclosure id={`project-${project.id}`} expanded={expanded} onToggle={onToggle} title={`Explore ${project.title}`}>
          {project.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          {project.platforms && <><h4>Platforms</h4><ul className="tool-list">{project.platforms.map(platform => <li key={platform}>{platform}</li>)}</ul></>}
          {project.contributions && <><h4>Contributions</h4><ul className="project-contributions">{project.contributions.map(item => <li key={item}>{item}</li>)}</ul></>}
          <h4>Technology & architecture</h4><RecordFields fields={project.stack} />
          {project.href && <a className="content-link" data-nav-action data-nav-id={`link-${project.id}`} href={project.href} target="_blank" rel="noopener noreferrer">Visit project ↗</a>}
        </Disclosure>
      </article>)}</div>;
    case 'experience':
      return <div className="chapter-content">{experience.map(record => <article className="timeline-record" data-nav-scope={record.organization} key={record.organization}>
        <h3>{record.organization}</h3><p>{record.role}</p>{record.dates && <p className="chapter-note">{record.dates}</p>}
      </article>)}</div>;
    case 'education':
      return <div className="chapter-content">{education.map(record => <article className="timeline-record" data-nav-scope={record.institution} key={record.institution}>
        <h3>{record.institution}</h3><p>{record.course}</p>{record.dates && <p className="chapter-note">{record.dates}</p>}
      </article>)}</div>;
    case 'contact':
      return <div className="chapter-content">
        <ul className="contact-channels">{contactChannels.map(channel => <li key={channel.label}><strong>{channel.label}</strong><a className="content-link" data-nav-action data-nav-id={`contact-${channel.label}`} href={channel.href} {...(channel.href.startsWith('https:') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{channel.value}</a></li>)}</ul>
        <p>{profile.location}</p>
      </div>;
  }
}
