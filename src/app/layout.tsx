import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono, Barlow_Condensed } from "next/font/google";
import { Toaster } from "sonner";
import { Nav } from "@/components/nav";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-barlow-condensed",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Sim Pilot Logbook",
  description:
    "Carnet de vol collaboratif multi-simulateurs pour un petit groupe de pilotes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${barlowCondensed.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-bg-primary font-body text-ink-primary antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <Toaster
          theme="light"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#d6dae0",
              border: "2px solid #8a929c",
              color: "#1a1e24",
              fontFamily: "var(--font-barlow-condensed), sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
