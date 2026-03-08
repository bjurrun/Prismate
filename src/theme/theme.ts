import { Card, Container, createTheme, Paper, rem, Select } from "@mantine/core";
import type { MantineThemeOverride } from "@mantine/core";

const CONTAINER_SIZES: Record<string, string> = {
  xxs: rem("200px"),
  xs: rem("300px"),
  sm: rem("400px"),
  md: rem("500px"),
  lg: rem("600px"),
  xl: rem("1400px"),
  xxl: rem("1600px"),
};

export const mantineTheme: MantineThemeOverride = createTheme({
  /** Put your mantine theme override here */
  fontSizes: {
    xs: rem("12px"),
    sm: rem("14px"),
    md: rem("16px"),
    lg: rem("18px"),
    xl: rem("20px"),
    "2xl": rem("24px"),
    "3xl": rem("30px"),
    "4xl": rem("36px"),
    "5xl": rem("48px"),
  },
  spacing: {
    "3xs": rem("4px"),
    "2xs": rem("8px"),
    xs: rem("10px"),
    sm: rem("12px"),
    md: rem("16px"),
    lg: rem("20px"),
    xl: rem("24px"),
    "2xl": rem("28px"),
    "3xl": rem("32px"),
  },
  colors: {
    'blue-spruce': [
      '#e7fefc',
      '#cffcf9',
      '#9ff9f3',
      '#6ef7ee',
      '#3ef4e8',
      '#0ef1e2',
      '#0bc1b5',
      '#089188',
      '#06605a',
      '#03302d',
    ],
    'alice-blue': [
      '#e5f4ff',
      '#cceaff',
      '#99d5ff',
      '#66bfff',
      '#33aaff',
      '#0095ff',
      '#0077cc',
      '#005999',
      '#003c66',
      '#001e33',
    ],
    'raspberry': [
      '#fbeaec',
      '#f7d4d9',
      '#efa9b3',
      '#e77e8c',
      '#de5466',
      '#d62940',
      '#ab2133',
      '#811826',
      '#56101a',
      '#2b080d',
    ],
    'honey-bronze': [
      '#fef5e6',
      '#feebcd',
      '#fdd79b',
      '#fcc469',
      '#fbb037',
      '#fa9c05',
      '#c87d04',
      '#965e03',
      '#643e02',
      '#321f01',
    ],
  },
  primaryColor: "blue",
  components: {
    /** Put your mantine component override here */
    Container: Container.extend({
      vars: (_, { size, fluid }) => ({
        root: {
          "--container-size": fluid
            ? "100%"
            : size !== undefined && size in CONTAINER_SIZES
              ? CONTAINER_SIZES[size]
              : rem(size),
        },
      }),
    }),
    Paper: Paper.extend({
      defaultProps: {
        radius: "md",
      },
    }),
    Card: Card.extend({
      defaultProps: {
        radius: "var(--mantine-radius-default)",
      },
    }),
    Select: Select.extend({
      defaultProps: {
        checkIconPosition: "right",
      },
    }),
  },
});
