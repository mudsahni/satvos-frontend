"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { freeLoginSchema, type FreeLoginFormData, getSafeRedirectUrl } from "@/lib/utils/validation";
import { login, socialLogin } from "@/lib/api/auth";
import { getUser } from "@/lib/api/users";
import { useAuthStore } from "@/store/auth-store";
import { getErrorMessage, isApiError, renewAuthCookie } from "@/lib/api/client";
import { decodeJwtPayload } from "@/types/auth";
import { GoogleSignInButton } from "./google-sign-in-button";

interface FreeLoginFormProps {
  returnUrl?: string;
  sessionExpired?: boolean;
}

export function FreeLoginForm({
  returnUrl: returnUrlProp,
  sessionExpired = false,
}: FreeLoginFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const returnUrl = getSafeRedirectUrl(returnUrlProp ?? null);
  const [error, setError] = useState<string | null>(null);
  const [invitationPending, setInvitationPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setSocialLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const loginToStore = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FreeLoginFormData>({
    resolver: zodResolver(freeLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FreeLoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await login({
        tenant_slug: "satvos",
        email: data.email,
        password: data.password,
      });

      // Clear any stale cache from a previous user session
      queryClient.clear();

      // Store auth state with tokens first (enables authenticated API calls)
      const partialUser = response.user ?? null;
      loginToStore(
        {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_at: response.expires_at,
        },
        partialUser as import("@/types/user").User,
        "satvos",
        rememberMe
      );

      // Fetch full user profile using user ID from login response or JWT
      let userId = response.user?.id;
      if (!userId) {
        const payload = decodeJwtPayload(response.access_token);
        userId = (payload?.user_id ?? payload?.sub) as string | undefined;
      }

      if (userId) {
        try {
          const fullUser = await getUser(userId);
          useAuthStore.getState().setUser(fullUser);
        } catch {
          // Non-critical — continue with partial user data
        }
      }

      // Set cookie for middleware
      renewAuthCookie();

      // Redirect to return URL or dashboard
      router.push(returnUrl);
      router.refresh();
    } catch (err) {
      if (isApiError(err, "INVITATION_PENDING")) {
        setInvitationPending(true);
        setError(
          "Please check your email and accept the invitation to set your password before signing in."
        );
      } else if (isApiError(err, "PASSWORD_LOGIN_NOT_ALLOWED")) {
        setInvitationPending(false);
        setError(
          "This account uses Google sign-in. Please use the Google button below to log in."
        );
      } else {
        setInvitationPending(false);
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    setSocialLoading(true);
    setError(null);

    try {
      const response = await socialLogin({ provider: "google", id_token: idToken });

      queryClient.clear();

      loginToStore(
        response.tokens,
        response.user,
        "satvos",
        rememberMe
      );

      // Fetch full user profile
      if (response.user?.id) {
        try {
          const fullUser = await getUser(response.user.id);
          useAuthStore.getState().setUser(fullUser);
        } catch {
          // Non-critical
        }
      }

      renewAuthCookie();
      router.push(returnUrl);
      router.refresh();
    } catch (err) {
      if (isApiError(err, "INVALID_SOCIAL_TOKEN")) {
        setError("Google sign-in failed. Please try again.");
      } else if (isApiError(err, "NOT_FOUND")) {
        setError("Social login is not available.");
      } else if (isApiError(err, "USER_INACTIVE")) {
        setError("Your account has been deactivated. Contact support.");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in to Satvos</CardTitle>
        <CardDescription>
          Enter your email and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {sessionExpired && (
            <Alert variant="warning">
              <AlertDescription>
                Your session has expired. Please sign in again to continue.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant={invitationPending ? "warning" : "destructive"}>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              disabled={isLoading || isSocialLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              disabled={isLoading || isSocialLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              disabled={isLoading || isSocialLoading}
            />
            <div className="grid gap-0.5 leading-none">
              <Label htmlFor="remember-me" className="text-sm font-medium cursor-pointer">
                Remember me
              </Label>
              <p className="text-xs text-muted-foreground">
                Stay signed in for 30 days
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || isSocialLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            Sign in
          </Button>

          <GoogleSignInButton
            onCredentialResponse={handleGoogleLogin}
            disabled={isLoading || isSocialLoading}
          />

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Sign up free
              </Link>
            </p>
            <p>
              Enterprise user?{" "}
              <Link href="/login/enterprise" className="text-primary hover:underline font-medium">
                Log in with your organization
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
