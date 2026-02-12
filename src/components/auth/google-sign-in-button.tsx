"use client";

import { useRef, useEffect, useState } from "react";
import Script from "next/script";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              width?: number;
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onCredentialResponse: (idToken: string) => void;
  disabled?: boolean;
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function GoogleSignInButton({
  onCredentialResponse,
  disabled = false,
  text = "signin_with",
}: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const { resolvedTheme } = useTheme();

  // Handle script already loaded from a previous page visit (client-side navigation)
  useEffect(() => {
    if (window.google?.accounts) {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready || !buttonRef.current || !GOOGLE_CLIENT_ID || !resolvedTheme)
      return;

    window.google?.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        onCredentialResponse(response.credential);
      },
    });

    window.google?.accounts.id.renderButton(buttonRef.current, {
      theme: resolvedTheme === "dark" ? "filled_black" : "outline",
      size: "large",
      width: buttonRef.current.offsetWidth || 400,
      text,
      shape: "rectangular",
      logo_alignment: "left",
    });
  }, [ready, onCredentialResponse, text, resolvedTheme]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <>
      <div className="relative my-4">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          Or
        </span>
      </div>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div
        ref={buttonRef}
        data-testid="google-signin-button"
        className={disabled ? "pointer-events-none opacity-50" : ""}
      />
    </>
  );
}
