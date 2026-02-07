"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Sun, CloudSun, Moon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

function getGreeting(): { text: string; icon: typeof Sun } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sun };
  if (hour < 18) return { text: "Good afternoon", icon: CloudSun };
  return { text: "Good evening", icon: Moon };
}

function getFirstName(user: { full_name?: string } | null): string {
  if (!user?.full_name) return "";
  return user.full_name.split(" ")[0];
}

function formatToday(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Decorative stacked documents illustration (pure CSS) */
function DocumentStack() {
  return (
    <div className="relative w-36 h-28 shrink-0 hidden sm:block" aria-hidden="true">
      {/* Back document — rotated left */}
      <div className="absolute bottom-1 left-2 w-24 h-[4.5rem] rounded-lg bg-white/10 border border-white/15 -rotate-6 shadow-sm">
        <div className="p-2.5 space-y-1.5">
          <div className="h-1 w-10 rounded-full bg-white/15" />
          <div className="h-1 w-14 rounded-full bg-white/10" />
          <div className="h-1 w-8 rounded-full bg-white/10" />
        </div>
      </div>
      {/* Middle document — slight rotation */}
      <div className="absolute bottom-3 left-5 w-24 h-[4.5rem] rounded-lg bg-white/15 border border-white/20 rotate-2 shadow-sm">
        <div className="p-2.5 space-y-1.5">
          <div className="h-1 w-12 rounded-full bg-white/20" />
          <div className="h-1 w-9 rounded-full bg-white/15" />
          <div className="h-1 w-14 rounded-full bg-white/15" />
          <div className="h-1 w-6 rounded-full bg-white/10" />
        </div>
      </div>
      {/* Front document — upright, with checkmark */}
      <div className="absolute bottom-5 left-9 w-24 h-[4.5rem] rounded-lg bg-white/20 border border-white/25 rotate-6 shadow-md">
        <div className="p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="h-1.5 w-10 rounded-full bg-white/30" />
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/80">
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 6.5L5 9L9.5 3.5" />
              </svg>
            </div>
          </div>
          <div className="h-1 w-14 rounded-full bg-white/20" />
          <div className="h-1 w-11 rounded-full bg-white/15" />
          <div className="h-1 w-8 rounded-full bg-white/15" />
        </div>
      </div>
    </div>
  );
}

interface GreetingBannerProps {
  pendingReview?: number;
  needsValidation?: number;
  parsingActive?: number;
  failedParsing?: number;
}

export function GreetingBanner({ pendingReview = 0, needsValidation = 0, parsingActive = 0, failedParsing = 0 }: GreetingBannerProps) {
  const { user } = useAuthStore();
  const greeting = useMemo(() => getGreeting(), []);
  const firstName = getFirstName(user);
  const today = useMemo(() => formatToday(), []);
  const Icon = greeting.icon;

  const subtitle = useMemo(() => {
    const parts: string[] = [];
    if (needsValidation > 0) parts.push(`${needsValidation} need${needsValidation === 1 ? "s" : ""} validation`);
    if (pendingReview > 0) parts.push(`${pendingReview} pending review`);
    if (failedParsing > 0) parts.push(`${failedParsing} failed parsing`);
    if (parsingActive > 0) parts.push(`${parsingActive} processing`);
    if (parts.length > 0) return parts.join(" · ");
    return "All documents are up to date";
  }, [pendingReview, needsValidation, parsingActive, failedParsing]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-[hsl(var(--accent-purple))] p-6 text-white shadow-lg dark:from-primary/80 dark:via-primary/70 dark:to-[hsl(var(--accent-purple)/0.6)]">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-white/70">{today}</p>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2.5">
            <Icon className="h-6 w-6 text-amber-300 shrink-0" />
            {greeting.text}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-white/70">{subtitle}</p>
          <div className="pt-2">
            <Button
              size="sm"
              asChild
              className="bg-white/15 hover:bg-white/25 text-white border-0 backdrop-blur-sm"
            >
              <Link href="/upload">
                <Upload />
                Upload Documents
              </Link>
            </Button>
          </div>
        </div>
        <DocumentStack />
      </div>
    </div>
  );
}
