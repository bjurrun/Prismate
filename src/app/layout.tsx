import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AppShell } from "@/components/app-shell";
import { MantineProvider, createTheme, ColorSchemeScript, MantineColorsTuple } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "dayjs/locale/nl";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prismate - Grip op je werk",
  description: "Vang je taken en krijg grip op je dag.",
};

const myColor: MantineColorsTuple = [
  '#ecefff',
  '#d5dafb',
  '#a9b1f1',
  '#7a87e9',
  '#5362e1',
  '#3a4bdd',
  '#2c40dc',
  '#1f32c4',
  '#182cb0',
  '#0a259c'
];

const theme = createTheme({
  primaryColor: 'myColor',
  colors: {
    myColor,
  },
  fontFamily: 'var(--font-geist-sans), sans-serif',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="nl" className="antialiased" data-mantine-color-scheme="light">
        <head>
          <ColorSchemeScript defaultColorScheme="light" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans`}
        >
          <MantineProvider theme={theme} defaultColorScheme="light">
            <AppShell>
              {children}
            </AppShell>
          </MantineProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
