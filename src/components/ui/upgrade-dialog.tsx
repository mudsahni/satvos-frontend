"use client";

import Link from "next/link";
import { Check, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  used?: number;
  limit?: number;
}

export function UpgradeDialog({ open, onOpenChange, used = 5, limit = 5 }: UpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Monthly Limit Reached</DialogTitle>
          <DialogDescription>
            You&apos;ve used all {used} of your {limit} free document parses this month.
            Upgrade to Pro for more capacity.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4">
          {/* Free tier */}
          <div className="rounded-lg border border-border p-3 space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Free</p>
            <p className="text-lg font-bold">5 docs/mo</p>
            <ul className="space-y-1">
              {["Basic extraction", "1 collection", "CSV export"].map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-muted-foreground/60" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-muted-foreground font-medium pt-1">Current plan</p>
          </div>

          {/* Pro tier */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
            <p className="text-sm font-semibold text-primary">Pro</p>
            <p className="text-lg font-bold">5,000 docs/mo</p>
            <ul className="space-y-1">
              {["Advanced AI", "Custom rules", "Team access", "API access"].map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-foreground">
                  <Check className="h-3 w-3 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:flex-1">
            Close
          </Button>
          <Button asChild className="sm:flex-1">
            <Link href="/#pricing">
              <Zap />
              View Pricing
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
