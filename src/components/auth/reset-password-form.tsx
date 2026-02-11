"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle, XCircle, ArrowLeft, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/utils/validation";
import { resetPassword } from "@/lib/api/auth";
import { getErrorMessage, isApiError } from "@/lib/api/client";

type ResetState = "form" | "success" | "invalid_token";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<ResetState>(token ? "form" : "invalid_token");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : "No reset token found. Please use the link from your email."
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      await resetPassword({
        token,
        new_password: data.new_password,
      });
      setState("success");
    } catch (err) {
      if (isApiError(err, "INVALID_RESET_TOKEN")) {
        setState("invalid_token");
        setError(
          "This password reset link is invalid or has expired. Please request a new one."
        );
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (state === "success") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-7 w-7 text-success" />
          </div>
          <CardTitle className="text-xl">Password reset!</CardTitle>
          <CardDescription>
            Your password has been reset successfully. You can now sign in with
            your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state === "invalid_token") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="text-xl">Link expired</CardTitle>
          <CardDescription>
            {error ||
              "This password reset link is invalid or has expired. Please request a new one."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request new link</Link>
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          Set new password
        </CardTitle>
        <CardDescription className="text-center">
          Enter your new password below. It must be at least 8 characters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="new_password">New password</Label>
            <Input
              id="new_password"
              type="password"
              placeholder="At least 8 characters"
              {...register("new_password")}
              disabled={isLoading}
              autoFocus
            />
            {errors.new_password && (
              <p className="text-sm text-destructive">
                {errors.new_password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm password</Label>
            <Input
              id="confirm_password"
              type="password"
              {...register("confirm_password")}
              disabled={isLoading}
            />
            {errors.confirm_password && (
              <p className="text-sm text-destructive">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            Reset password
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
