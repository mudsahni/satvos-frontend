"use client";

import Link from "next/link";
import { FileStack } from "lucide-react";

export function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        {/* Left — branding */}
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground">
            <FileStack className="h-3 w-3" />
          </div>
          <span>&copy; {currentYear} Satvos. All rights reserved.</span>
        </div>

        {/* Right — links */}
        <nav className="flex items-center gap-4">
          <Link
            href="/settings"
            className="hover:text-foreground transition-colors"
          >
            Settings
          </Link>
          <span className="text-border">|</span>
          <a
            href="https://github.com/mudsahni/satvos-ui"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <span className="text-border">|</span>
          <span>v0.1.0</span>
        </nav>
      </div>
    </footer>
  );
}
