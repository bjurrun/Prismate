import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { UserNav } from "@/components/user-nav";
import Link from "next/link";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="nl" className="antialiased">
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground font-sans flex flex-col`}
        >
          {/* DE ENE ECHTE TOPBAR — NU GLOBAAL */}
          <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <h2 className="text-xl font-bold tracking-tight text-foreground">Prismate</h2>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                  <Link href="/" className="text-foreground transition-colors hover:text-primary">
                    Dashboard
                  </Link>
                  <Link href="/debug" className="text-muted-foreground hover:text-foreground transition-colors">
                    Data Monitor
                  </Link>
                  <span className="text-muted-foreground/50 cursor-not-allowed italic">Projecten</span>
                </nav>
              </div>

              {/* Hier komt de UserNav rechtsbovenin */}
              <div className="flex items-center gap-4">
                <UserNav />
              </div>
            </div>
          </header>

          <div className="flex-1">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
