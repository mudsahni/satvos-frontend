import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function EnterpriseLoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
