import type { Metadata } from 'next';
import { Fira_Sans_Condensed, Nunito_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import AdminClientLayout from './AdminClientLayout';
import './pilotage.css';

// Même duo que le pilotage atelierzo : Fira Sans Condensed pour titres et chiffres, Nunito Sans pour le reste
const firaCondensed = Fira_Sans_Condensed({ weight: ['600', '700', '800'], subsets: ['latin', 'latin-ext'], variable: '--font-fira-condensed', display: 'swap' });
const nunito = Nunito_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-nunito', display: 'swap' });

export const metadata: Metadata = {
  title: 'Pilotage — ELROPHE',
  description: 'Back-office ELROPHE',
  robots: { index: false, follow: false },
};

export default function PilotageLayout({ children }: { children: ReactNode }) {
  return <AdminClientLayout fontClassName={`${firaCondensed.variable} ${nunito.variable}`}>{children}</AdminClientLayout>;
}
