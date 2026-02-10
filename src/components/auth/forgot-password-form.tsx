"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

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
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/utils/validation";
import { forgotPassword } from "@/lib/api/auth";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      // Always returns 200 — no email enumeration
      await forgotPassword({
        tenant_slug: "satvos",
        email: data.email,
      });
    } catch {
      // Show success regardless to prevent email enumeration.
      // The backend always returns 200 for valid requests.
      // Network errors are the only real failure case.
    } finally {
      setSubmittedEmail(data.email);
      setSubmitted(true);
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            If an account exists for{" "}
            <span className="font-medium text-foreground">
              {submittedEmail}
            </span>
            , we&apos;ve sent a password reset link. Check your inbox and spam
            folder.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setSubmittedEmail("");
            }}
            className="w-full"
          >
            Try a different email
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
        <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
        <CardDescription>
          Enter the email address associated with your account and we&apos;ll
          send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              disabled={isLoading}
              autoFocus
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            Send reset link
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
