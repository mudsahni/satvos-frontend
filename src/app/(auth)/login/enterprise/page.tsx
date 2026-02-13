import { LoginForm } from "@/components/auth/login-form";

export default async function EnterpriseLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string; session_expired?: string }>;
}) {
  const params = await searchParams;
  return (
    <LoginForm
      returnUrl={params.returnUrl}
      sessionExpired={params.session_expired === "true"}
    />
  );
}
