import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const restrictions = [
  "Cannot log into the UI (API key auth only)",
  "Cannot review documents (approve/reject)",
  "Cannot be assigned documents for review",
  "Cannot create collections",
  "Cannot manage users or tenants",
  "Can only access collections with explicit permission grants",
  "File listing filtered to files uploaded by this service account",
];

export function ServiceAccountRestrictions({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-warning-border bg-warning-bg p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div>
          <p className="text-sm font-medium text-warning">
            Service Account Restrictions
          </p>
          <ul className="mt-2 space-y-1 text-sm text-warning/80">
            {restrictions.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning/60" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
