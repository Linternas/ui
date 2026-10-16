import type { ReactNode } from 'react';
import { DesignSystemProvider } from '@mingu/interaction-ui/system';
import '@mingu/interaction-ui/system.css';
import '@mingu/interaction-ui/styles.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ko"><body style={{ margin: 0 }}><DesignSystemProvider theme="system" style={{ minHeight: '100dvh' }}>{children}</DesignSystemProvider></body></html>;
}
