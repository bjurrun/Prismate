import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AppShell } from "@/components/app-shell";
import { SidebarProvider } from "@/components/ui/sidebar";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
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
  const { userId } = await auth();

  const projects = userId ? await prisma.project.findMany({
    where: { user: { id: userId } },
    orderBy: { displayName: 'asc' }
  }) : [];

  return (
    <ClerkProvider>
      <html lang="nl" className="antialiased">
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground font-sans`}
        >
          <SidebarProvider className="bg-sidebar">
            <AppShell projects={projects}>
              {children}
            </AppShell>
          </SidebarProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
