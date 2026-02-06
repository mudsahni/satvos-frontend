"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

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
import { loginSchema, type LoginFormData } from "@/lib/utils/validation";
import { login } from "@/lib/api/auth";
import { getUser } from "@/lib/api/users";
import { useAuthStore } from "@/store/auth-store";
import { getErrorMessage, renewAuthCookie } from "@/lib/api/client";
import { decodeJwtPayload } from "@/types/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  const sessionExpired = searchParams.get("session_expired") === "true";
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loginToStore = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tenant_slug: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await login(data);

      // Store auth state with tokens first (enables authenticated API calls)
      // Login response may or may not include user data
      const partialUser = response.user ?? null;
      loginToStore(
        {
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          expires_at: response.expires_at,
        },
        partialUser as import("@/types/user").User,
        data.tenant_slug
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
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign in to DocFlow</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
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
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="tenant_slug">Organization</Label>
            <Input
              id="tenant_slug"
              placeholder="your-organization"
              {...register("tenant_slug")}
              disabled={isLoading}
            />
            {errors.tenant_slug && (
              <p className="text-sm text-destructive">
                {errors.tenant_slug.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              disabled={isLoading}
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
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
