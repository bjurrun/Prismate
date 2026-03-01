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
        color="indigo.4"
        styles={{ thumb: { display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
      />
    );
  }

  return (
    <Tooltip label={dark ? "Lichte modus" : "Donkere modus"} position="right" withArrow>
      <Switch
        checked={dark}
        onChange={() => toggleColorScheme()}
        size="md"
        color="indigo.4"
        thumbIcon={
          dark ? (
            <MoonIcon className="size-[12px] text-indigo-600" strokeWidth={3} />
          ) : (
            <SunIcon className="size-[12px] text-yellow-500" strokeWidth={3} />
          )
        }
        styles={{
          track: {
            cursor: 'pointer',
          },
          thumb: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }
        }}
      />
    </Tooltip>
  );
}
