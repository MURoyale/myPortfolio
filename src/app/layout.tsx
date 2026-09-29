import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { profile } from "@/data/portfolio";

export const viewport: Viewport = { viewportFit: 'cover', themeColor: '#10251f' };

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.title}`,
  description: profile.summary,
  icons: {
    icon: '/game-icon.svg',
    shortcut: '/game-icon.svg',
    apple: '/game-icon.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
