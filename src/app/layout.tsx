import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AppShell } from "@/components/app-shell";
import { ColorSchemeScript } from "@mantine/core";
import { MantineThemeProvider } from "@/components/theme-provider";
import { PrismateSpotlight } from "@/components/providers/PrismateSpotlight";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/spotlight/styles.css";
import "@/theme/style.css";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="nl" className="antialiased" suppressHydrationWarning>
        <head>
          <ColorSchemeScript defaultColorScheme="light" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans`}
        >
          <MantineThemeProvider>
            <PrismateSpotlight />
            <AppShell>
              {children}
            </AppShell>
          </MantineThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
