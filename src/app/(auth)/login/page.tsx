import { Suspense } from "react";
import { FreeLoginForm } from "@/components/auth/free-login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FreeLoginForm />
    </Suspense>
  );
}
