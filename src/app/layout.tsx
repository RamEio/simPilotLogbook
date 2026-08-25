import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Nav } from "@/components/nav";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sim Pilot Logbook",
  description:
    "Carnet de vol collaboratif multi-simulateurs pour un petit groupe de pilotes.",
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('spl-theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-bg-deep font-sans text-ink-primary antialiased">
        <ThemeProvider>
          <Nav />
          <main className="mx-auto max-w-content px-4 py-6 md:px-8 lg:px-16">
            {children}
          </main>
          <Toaster
            theme="system"
            position="bottom-right"
            toastOptions={{
              className: "border border-line-default bg-bg-card text-ink-primary",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
