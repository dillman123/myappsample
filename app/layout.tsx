import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "STUDYTERM // AI Study Companion",
  description:
    "Developer-focused AI study companion — degree tracking, session workspaces, assessments and an AI tutor in a retro terminal shell.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="crt-scanlines crt-flicker min-h-screen antialiased">
        <header className="border-b border-phosphor-500/25 bg-charcoal-900/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="term-glow text-sm font-bold tracking-widest">
              <span className="text-phosphor-300">┌─[</span> STUDYTERM v1.0{" "}
              <span className="text-phosphor-300">]─┐</span>
            </Link>
            <nav className="flex items-center gap-6 text-xs uppercase tracking-widest text-phosphor-muted">
              <Link href="/" className="transition-colors hover:text-phosphor-300">
                ~/dashboard
              </Link>
              <span aria-hidden className="text-phosphor-muted/50">|</span>
              <span className="text-phosphor-muted/70">
                usr: <span className="text-phosphor-400">student</span>
              </span>
              <span
                className="hidden items-center gap-1 sm:flex"
                title="All auth & AI keys stay server-side"
              >
                <span className="h-2 w-2 rounded-full bg-phosphor-500 shadow-[0_0_6px_#2eff6e]" />
                <span className="text-phosphor-400">SECURE</span>
              </span>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-7xl px-4 pb-6 pt-2 text-[10px] uppercase tracking-widest text-phosphor-muted/60">
          <p>─── session encrypted · credentials never leave the server ───</p>
        </footer>
      </body>
    </html>
  );
}
