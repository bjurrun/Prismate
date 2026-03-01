import * as React from 'react';
import { useMantineColorScheme, Switch, Tooltip } from '@mantine/core';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const dark = colorScheme === 'dark';

  if (!mounted) {
    return (
      <Switch
        size="md"
        styles={{ 
          track: { backgroundColor: 'var(--mantine-color-indigo-5)', border: 'none' },
          thumb: { display: 'flex', alignItems: 'center', justifyContent: 'center' } 
        }}
      />
    );
  }

  return (
    <Tooltip label={dark ? "Lichte modus" : "Donkere modus"} position="right" withArrow>
      <Switch
        checked={dark}
        onChange={() => toggleColorScheme()}
        size="md"
        thumbIcon={
          dark ? (
            <MoonIcon className="size-[12px] text-indigo-700" strokeWidth={1.2} />
          ) : (
            <SunIcon className="size-[12px] text-indigo-700" strokeWidth={1.2} />
          )
        }
        styles={{
          track: {
            cursor: 'pointer',
            backgroundColor: dark ? 'var(--mantine-color-indigo-3)' : 'var(--mantine-color-indigo-5)',
            border: 'none',
          },
          thumb: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--mantine-color-white)',
          }
        }}
      />
    </Tooltip>
  );
}
