import Link from "next/link";
import { FileStack } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <FileStack className="h-4.5 w-4.5" />
        </div>
        <span className="text-xl font-bold text-foreground">Satvos</span>
      </Link>
      {children}
    </div>
  );
}
