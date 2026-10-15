'use client';

import type { ReactNode } from 'react';

// .pz scope le design system du pilotage (app/pilotage/pilotage.css)
export default function AdminClientLayout({ children, fontClassName = '' }: { children: ReactNode; fontClassName?: string }) {
  return <div className={`pz ${fontClassName}`}>{children}</div>;
}
