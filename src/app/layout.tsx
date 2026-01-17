import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import { CommandPaletteProvider } from "@/components/layout/command-palette";

// Inter font imports (all weights for body and display)
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";

// JetBrains Mono for data/metrics
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";

import "./globals.css";

export const metadata: Metadata = {
  title: "Mortis Atlas | Elite VC Fund Management",
  description:
    "Mortis Atlas - A comprehensive platform for venture capital fund management, deal flow tracking, and portfolio analytics.",
  keywords: ["VC", "venture capital", "fund management", "deal flow", "portfolio"],
  authors: [{ name: "Mortis" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <CommandPaletteProvider>
          {children}
        </CommandPaletteProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
