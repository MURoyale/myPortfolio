// Personal and project information supplied by the owner from their CV.
export const profile = {
  name: 'Mustafa Wissam Sabah',
  title: 'Full Stack Developer',
  location: 'Al-Dora, Baghdad, Iraq',
  phone: '07821291789',
  email: 'mustafa.irq1999@gmail.com',
  github: 'https://github.com/muroyale',
  summary: 'Software developer specializing in modern full-stack development with Next.js, React, React Native, NestJS, and ASP.NET Core. Builds web and mobile applications with a focus on clean architecture, secure APIs, scalability, and responsive user experiences. Interested in creating efficient software that solves practical business needs.',
  languages: ['English', 'Arabic'],
} as const;

export const sections = [
  { id: 'profile', title: 'Profile', eyebrow: '01 / THE INTRODUCTION', description: profile.title },
  { id: 'skills', title: 'Skills', eyebrow: '02 / THE TOOLKIT', description: 'Web and mobile development technologies.' },
  { id: 'projects', title: 'Projects', eyebrow: '03 / SELECTED WORK', description: 'Smart TV, university, and healthcare applications.' },
  { id: 'experience', title: 'Experience', eyebrow: '04 / THE JOURNEY', description: 'Development roles and organizations.' },
  { id: 'education', title: 'Education', eyebrow: '05 / ALWAYS LEARNING', description: 'University education and developer training.' },
  { id: 'contact', title: 'Contact', eyebrow: '06 / NEXT CONVERSATION', description: 'Get in touch.' },
  { id: 'games', title: 'Games', eyebrow: '07 / PLAY A LITTLE', description: 'A short break, one game at a time.' },
] as const;
export type SectionId = (typeof sections)[number]['id'];
export const profileFacts = [
  { label: 'Name', value: profile.name },
  { label: 'Professional title', value: profile.title },
  { label: 'Location', value: profile.location },
];
export const skills = ['React.js', 'Next.js', 'React Native', 'JavaScript', 'Tailwind CSS', 'NestJS', 'ASP.NET Core'];
export const experience = [
  { organization: 'Al-Hadi University', role: 'Full Stack Developer', dates: 'November 2023–2026' },
  { organization: 'E2next', role: 'Full Stack Developer', dates: 'January 2026–March' },
  { organization: 'Al Rabiaa TV', role: 'Front-End Developer', dates: null },
];
export const education = [
  { institution: 'Mustansiriyah University', course: 'College of Tourism Sciences', dates: 'November 2019–June 2023' },
  { institution: 'Aon Bootcamp', course: 'Front-End Developer', dates: null },
];
export const contactChannels = [
  { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
  { label: 'Phone', value: profile.phone, href: `tel:${profile.phone}` },
  { label: 'GitHub', value: profile.github, href: profile.github },
];

type Project = {
  id: string; title: string; summary: string; featured?: boolean;
  paragraphs: string[]; contributions?: string[]; platforms?: string[];
  stack: { label: string; value: string }[]; href?: string;
};
export const projects: Project[] = [
  {
    id: 'qi-tv', title: 'QI TV Platform Development', featured: true,
    summary: 'A cross-platform Smart TV streaming interface for Al Rabiaa TV, dedicated to QI Company.',
    paragraphs: ['QI TV is the fourth QI TV platform project, created for Al Rabiaa TV and dedicated to QI Company. It is a Smart TV streaming platform designed to deliver a consistent, TV-friendly experience across LG webOS, Samsung Tizen OS, and Hisense VIDAA OS.'],
    contributions: [
      'Built a reusable Smart TV streaming interface using React and Next.js.',
      'Rendered content dynamically from API responses rather than hardcoding sections.',
      'Adapted interface sections to API data, including banners, movies, series, categories, and content details.',
      'Built interfaces for Smart TV use, with attention to smooth navigation, performance, and TV-friendly interactions.',
      'Used Zustand for state management.',
      'Organized the application with modular, reusable components and clean architecture principles.',
      'Supported reusable UI and features across Home, Cinema, Categories, and Content Details.',
      'Contributed to a unified cross-platform experience that can be extended with future features.',
    ],
    platforms: ['LG webOS', 'Samsung Tizen OS', 'Hisense VIDAA OS'],
    stack: [{ label: 'Interface', value: 'React · Next.js' }, { label: 'State management', value: 'Zustand' }, { label: 'Architecture', value: 'API-driven content rendering · Modular component architecture' }],
  },
  {
    id: 'ahu-main', title: 'Al-Hadi University Main Website and Main Dashboard',
    summary: 'A public university website and administration dashboard backed by an ASP.NET Core API.',
    paragraphs: [
      'The Al-Hadi University Main Website is the university’s public-facing platform, built with Next.js. It presents information about colleges, departments, academic programs, news, events, and university services. The responsive platform is designed for a bilingual academic institution.',
      'The administration dashboard is built with React.js and supports management of content such as news, departments, banners, academic data, and university modules. Both applications use an ASP.NET Core Web API backend with authentication, role-based authorization, file management, and SQL Server integration.',
    ],
    stack: [{ label: 'Public website', value: 'Next.js' }, { label: 'Admin dashboard', value: 'React.js' }, { label: 'Backend', value: 'ASP.NET Core Web API' }, { label: 'Database', value: 'SQL Server' }],
    href: 'https://ahu.edu.iq/',
  },
  {
    id: 'ahu-continuing', title: 'Al-Hadi University Continuing Education System',
    summary: 'Course administration, enrollment tracking, and certification workflows.',
    paragraphs: ['The Continuing Education System manages professional training programs, workshops, and certification courses. Its React.js frontend supports course management, enrollment tracking, and administrative workflows. The ASP.NET Core backend handles course data, registration, authentication, certificate generation, and system security.'],
    stack: [{ label: 'Frontend', value: 'React.js' }, { label: 'Backend', value: 'ASP.NET Core Web API' }, { label: 'Database', value: 'SQL Server' }],
    href: 'https://clc.ahu.edu.iq/',
  },
  {
    id: 'student-data', title: 'Student Data Submission System',
    summary: 'Structured submission and management of student academic and personal information.',
    paragraphs: ['The Student Data Submission System allows students to securely submit and manage academic and personal information. Its React.js frontend provides a structured submission experience, while an ASP.NET Core Web API handles validation, authentication, secure processing, and database storage.'],
    stack: [{ label: 'Frontend', value: 'React.js' }, { label: 'Backend', value: 'ASP.NET Core Web API' }, { label: 'Database', value: 'SQL Server' }],
  },
  {
    id: 'cure', title: 'CURE — Medical Record Network (MRN) Application',
    summary: 'An Android and iOS healthcare application integrated with Frappe Healthcare.',
    paragraphs: [
      'CURE is a healthcare mobile application for managing patient records, appointments, and medical reports. The React Native app supports Android and iOS. Its NestJS backend handles JWT authentication, role-based access control, API validation, and healthcare workflows.',
      'The system integrates with Frappe Healthcare, which serves as the primary source of patient, doctor, hospital, and appointment data. The backend communicates with Frappe APIs to synchronize information.',
    ],
    stack: [{ label: 'Mobile app', value: 'React Native' }, { label: 'Backend', value: 'NestJS' }, { label: 'Healthcare integration', value: 'Frappe Healthcare' }, { label: 'Local-mode database', value: 'Prisma' }, { label: 'Primary data source', value: 'Frappe Healthcare' }],
  },
];
