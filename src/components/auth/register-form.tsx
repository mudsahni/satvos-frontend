"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import axios from "axios";

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
import { registerSchema, type RegisterFormData } from "@/lib/utils/validation";
import { register } from "@/lib/api/auth";
import { getUser } from "@/lib/api/users";
import { useAuthStore } from "@/store/auth-store";
import { getErrorMessage, renewAuthCookie } from "@/lib/api/client";
import { decodeJwtPayload } from "@/types/auth";

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loginToStore = useAuthStore((state) => state.login);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await register({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });

      // Clear any stale cache from a previous user session
      queryClient.clear();

      // Extract tokens — handle both flat and nested formats
      const accessToken =
        response.access_token ?? response.tokens?.access_token;
      const refreshToken =
        response.refresh_token ?? response.tokens?.refresh_token;
      const expiresAt =
        response.expires_at ?? response.tokens?.expires_at;

      if (!accessToken || !refreshToken) {
        setError("Registration succeeded but no tokens received. Please log in.");
        return;
      }

      // Store auth state with tokens (enables authenticated API calls)
      const partialUser = response.user ?? null;
      loginToStore(
        {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: expiresAt,
        },
        partialUser as import("@/types/user").User,
        "satvos"
      );

      // Store personal collection ID for free users
      if (response.collection?.id) {
        localStorage.setItem("satvos_personal_collection_id", response.collection.id);
      }

      // Fetch full user profile (same pattern as login-form)
      let userId: string | undefined = response.user?.id;
      if (!userId) {
        const payload = decodeJwtPayload(accessToken);
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

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError("An account with this email already exists.");
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
        <CardDescription>
          Start processing invoices for free — no credit card required
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}{" "}
                {error.includes("already exists") && (
                  <Link href="/login" className="underline font-medium">
                    Log in instead
                  </Link>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              {...registerField("full_name")}
              disabled={isLoading}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...registerField("email")}
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
              placeholder="At least 8 characters"
              {...registerField("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <Input
              id="confirm_password"
              type="password"
              {...registerField("confirm_password")}
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
            Create Account
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
