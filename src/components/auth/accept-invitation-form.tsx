"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus, XCircle, ShieldAlert, ArrowLeft } from "lucide-react";

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
  acceptInvitationSchema,
  type AcceptInvitationFormData,
} from "@/lib/utils/validation";
import { acceptInvitation } from "@/lib/api/auth";
import { getUser } from "@/lib/api/users";
import { useAuthStore } from "@/store/auth-store";
import { getErrorMessage, isApiError, renewAuthCookie } from "@/lib/api/client";

type InvitationState = "form" | "invalid_token" | "user_inactive";

interface AcceptInvitationFormProps {
  token?: string;
}

export function AcceptInvitationForm({ token }: AcceptInvitationFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const loginToStore = useAuthStore((state) => state.login);

  const [state, setState] = useState<InvitationState>(
    token ? "form" : "invalid_token"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : "No invitation token found. Please use the link from your email."
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInvitationFormData>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: AcceptInvitationFormData) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await acceptInvitation({
        token,
        password: data.password,
      });

      // Clear any stale cache
      queryClient.clear();

      // Auto-login: store tokens
      loginToStore(
        {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_at: response.expires_at,
        },
        response.user,
        "satvos",
        false
      );

      // Fetch full user profile
      if (response.user?.id) {
        try {
          const fullUser = await getUser(response.user.id);
          useAuthStore.getState().setUser(fullUser);
        } catch {
          // Non-critical — continue with partial user data
        }
      }

      // Set cookie for middleware
      renewAuthCookie();

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (isApiError(err, "INVALID_INVITATION_TOKEN")) {
        setState("invalid_token");
        setError(
          "This invitation link is invalid or has expired. Please contact your administrator to resend the invitation."
        );
      } else if (isApiError(err, "USER_INACTIVE")) {
        setState("user_inactive");
        setError(
          "Your account has been deactivated. Please contact your administrator."
        );
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (state === "invalid_token") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="text-xl">Invalid invitation</CardTitle>
          <CardDescription>
            {error ||
              "This invitation link is invalid or has expired. Please contact your administrator to resend the invitation."}
          </CardDescription>
        </CardHeader>
        <CardContent>
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

  if (state === "user_inactive") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning/10">
            <ShieldAlert className="h-7 w-7 text-warning" />
          </div>
          <CardTitle className="text-xl">Account deactivated</CardTitle>
          <CardDescription>
            {error ||
              "Your account has been deactivated. Please contact your administrator."}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          Join your team
        </CardTitle>
        <CardDescription className="text-center">
          Set your password to complete your account setup.
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              {...register("password")}
              disabled={isLoading}
              autoFocus
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
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
            Set password & join
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
