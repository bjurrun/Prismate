import { IconSun, IconMoon } from "@tabler/icons-react";
import * as React from 'react';
import { useMantineColorScheme, Switch, Tooltip } from '@mantine/core';

export function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const dark = colorScheme === 'dark';

  if (!mounted) {
    return <Switch size="md" color="blue" />;
  }

  return (
    <Tooltip label={dark ? "Lichte modus" : "Donkere modus"} position="right" withArrow>
      <Switch
        checked={dark}
        onChange={() => toggleColorScheme()}
        size="md"
        color="blue"
        thumbIcon={
          dark ? (
            <IconMoon size={12} stroke={1.2} color="var(--mantine-color-blue-7)" />
          ) : (
            <IconSun size={12} stroke={1.2} color="var(--mantine-color-blue-7)" />
          )
        }
      />
    </Tooltip>
  );
}
