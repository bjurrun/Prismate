'use client';

import { MantineProvider } from '@mantine/core';
import { mantineTheme } from '@/theme/theme';
import { mantineCssVariableResolver } from '@/theme/css.VariableResolver';

export function MantineThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider
      theme={{
        ...mantineTheme,
        fontFamily: 'var(--font-geist-sans), sans-serif',
      }}
      cssVariablesResolver={mantineCssVariableResolver}
      defaultColorScheme="light"
    >
      {children}
    </MantineProvider>
  );
}
