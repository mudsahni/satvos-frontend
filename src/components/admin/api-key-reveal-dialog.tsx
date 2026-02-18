"use client";

import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ApiKeyRevealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  title?: string;
  description?: string;
}

export function ApiKeyRevealDialog({
  open,
  onOpenChange,
  apiKey,
  title = "API Key Created",
  description = "Your new API key has been generated.",
}: ApiKeyRevealDialogProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
    }
  }

  function handleClose() {
    if (!confirmed) return;
    setCopied(false);
    setConfirmed(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-warning-border bg-warning-bg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <p className="text-sm text-warning">
                Save this API key now. It will not be shown again.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md border bg-muted px-3 py-2 font-mono text-sm break-all select-all">
              {apiKey}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              aria-label="Copy API key"
            >
              {copied ? <Check className="text-success" /> : <Copy />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="key-saved"
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(v === true)}
            />
            <Label htmlFor="key-saved" className="text-sm">
              I&apos;ve saved this key in a secure location
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} disabled={!confirmed}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
