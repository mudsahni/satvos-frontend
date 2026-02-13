import { FreeLoginForm } from "@/components/auth/free-login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string; session_expired?: string }>;
}) {
  const params = await searchParams;
  return (
    <FreeLoginForm
      returnUrl={params.returnUrl}
      sessionExpired={params.session_expired === "true"}
    />
  );
}
