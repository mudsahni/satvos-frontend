"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, X, Loader2, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resendVerification } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";

const RESEND_COOLDOWN_SECONDS = 60;
const COOLDOWN_STORAGE_KEY = "satvos-resend-cooldown";

function getRemainingCooldown(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(COOLDOWN_STORAGE_KEY);
  if (!stored) return 0;
  const expiresAt = parseInt(stored, 10);
  const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
}

function setCooldown() {
  localStorage.setItem(
    COOLDOWN_STORAGE_KEY,
    String(Date.now() + RESEND_COOLDOWN_SECONDS * 1000)
  );
}

interface EmailVerificationBannerProps {
  email: string;
  onDismiss?: () => void;
  variant?: "banner" | "inline";
}

export function EmailVerificationBanner({
  email,
  onDismiss,
  variant = "banner",
}: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldownState] = useState(() => getRemainingCooldown());

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      const remaining = getRemainingCooldown();
      setCooldownState(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      await resendVerification();
      setResendSuccess(true);
      setCooldown();
      setCooldownState(RESEND_COOLDOWN_SECONDS);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  }, []);

  const canResend = cooldown <= 0 && !isResending;

  if (variant === "inline") {
    return (
      <Alert className="border-warning-border bg-warning-bg">
        <Mail className="h-4 w-4 text-warning" />
        <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm">
            Verify your email ({email}) to upload documents.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={!canResend}
            className="shrink-0"
          >
            {isResending && <Loader2 className="animate-spin" />}
            {resendSuccess ? (
              <>
                <CheckCircle className="text-success" />
                Sent!
              </>
            ) : cooldown > 0 ? (
              `Resend (${cooldown}s)`
            ) : (
              "Resend email"
            )}
          </Button>
        </AlertDescription>
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </Alert>
    );
  }

  return (
    <div className="bg-warning-bg border-b border-warning-border px-4 py-2.5">
      <div className="flex items-center justify-between gap-3 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <Mail className="h-4 w-4 text-warning shrink-0" />
          <p className="text-sm text-foreground truncate">
            <span className="hidden sm:inline">
              We sent a verification email to{" "}
              <span className="font-medium">{email}</span>. Please verify to
              upload documents.
            </span>
            <span className="sm:hidden">Verify your email to upload files.</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={!canResend}
            className="h-7 text-xs"
          >
            {isResending && <Loader2 className="animate-spin" />}
            {resendSuccess ? (
              <>
                <CheckCircle className="text-success" />
                Sent!
              </>
            ) : cooldown > 0 ? (
              `Resend (${cooldown}s)`
            ) : (
              "Resend"
            )}
          </Button>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-7 w-7"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      {error && (
        <p className="text-xs text-destructive mt-1 max-w-screen-2xl mx-auto pl-6.5">
          {error}
        </p>
      )}
    </div>
  );
}
