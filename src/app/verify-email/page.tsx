"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyEmail, resendVerification } from "@/lib/api/auth";
import { getErrorMessage } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";

type VerifyState = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [state, setState] = useState<VerifyState>(token ? "loading" : "error");
  const [errorMessage, setErrorMessage] = useState<string>(
    token ? "" : "No verification token found. Please check the link in your email."
  );
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!token || attemptedRef.current) return;
    attemptedRef.current = true;

    let cancelled = false;

    async function verify() {
      try {
        await verifyEmail(token!);
        if (cancelled) return;
        setState("success");

        // Optimistically update local user state
        const { isAuthenticated: authed, user: currentUser, setUser: updateUser } =
          useAuthStore.getState();
        if (authed && currentUser) {
          updateUser({
            ...currentUser,
            email_verified: true,
            email_verified_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        if (cancelled) return;
        setState("error");
        setErrorMessage(getErrorMessage(err));
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = useCallback(async () => {
    setIsResending(true);
    setResendSuccess(false);
    try {
      await resendVerification();
      setResendSuccess(true);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          {state === "loading" && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
              <CardTitle className="text-xl">Verifying your email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </>
          )}

          {state === "success" && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-7 w-7 text-success" />
              </div>
              <CardTitle className="text-xl">Email verified!</CardTitle>
              <CardDescription>
                Your email has been verified successfully. You can now upload
                and process documents.
              </CardDescription>
            </>
          )}

          {state === "error" && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-7 w-7 text-destructive" />
              </div>
              <CardTitle className="text-xl">Verification failed</CardTitle>
              <CardDescription>
                {errorMessage || "The verification link is invalid or has expired."}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {state === "success" && (
            <Button asChild className="w-full">
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight />
              </Link>
            </Button>
          )}

          {state === "error" && (
            <>
              {isAuthenticated ? (
                <Button
                  onClick={handleResend}
                  disabled={isResending || resendSuccess}
                  className="w-full"
                >
                  {isResending && <Loader2 className="animate-spin" />}
                  {resendSuccess ? (
                    <>
                      <CheckCircle />
                      Verification email sent!
                    </>
                  ) : (
                    <>
                      <Mail />
                      Resend verification email
                    </>
                  )}
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/login">
                    Sign in to resend
                    <ArrowRight />
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild className="w-full">
                <Link href="/">Back to home</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
