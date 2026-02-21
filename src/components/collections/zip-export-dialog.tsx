"use client";

import { useState, useRef, useCallback } from "react";
import { Loader2, CheckCircle2, AlertCircle, Archive } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { exportCollectionZip } from "@/lib/utils/zip-export";

interface ZipExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  collectionName: string;
}

type ExportState = "idle" | "exporting" | "done" | "error";

export function ZipExportDialog({
  open,
  onOpenChange,
  collectionId,
  collectionName,
}: ZipExportDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [includeCsv, setIncludeCsv] = useState(true);
  const [includeTally, setIncludeTally] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [state, setState] = useState<ExportState>("idle");
  const [phase, setPhase] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errorMessage, setErrorMessage] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const nothingSelected = !includeCsv && !includeTally && !includeDocuments;

  const reset = useCallback(() => {
    setState("idle");
    setPhase("");
    setProgress({ current: 0, total: 0 });
    setErrorMessage("");
    setCompanyName("");
    setIncludeCsv(true);
    setIncludeTally(true);
    setIncludeDocuments(true);
    abortRef.current = null;
  }, []);

  const handleClose = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        // Cancel in-flight export
        abortRef.current?.abort();
        reset();
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, reset]
  );

  const handleExport = useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setState("exporting");
    setErrorMessage("");

    try {
      await exportCollectionZip({
        collectionId,
        collectionName,
        companyName: companyName.trim() || undefined,
        includeCsv,
        includeTally,
        includeDocuments,
        signal: controller.signal,
        onProgress: (p, current, total) => {
          setPhase(p);
          setProgress({ current, total });
        },
      });

      if (!controller.signal.aborted) {
        setState("done");
        // Auto-close after a short delay
        setTimeout(() => {
          handleClose(false);
        }, 1500);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    }
  }, [collectionId, collectionName, companyName, includeCsv, includeTally, includeDocuments, handleClose]);

  const progressPercent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            Download All as ZIP
          </DialogTitle>
          <DialogDescription>
            Choose which content to include in the ZIP archive.
          </DialogDescription>
        </DialogHeader>

        {state === "idle" && (
          <>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Include in ZIP</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="zip-include-csv"
                      checked={includeCsv}
                      onCheckedChange={(v) => setIncludeCsv(!!v)}
                    />
                    <Label htmlFor="zip-include-csv" className="text-sm font-normal cursor-pointer">
                      CSV Export
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="zip-include-tally"
                      checked={includeTally}
                      onCheckedChange={(v) => setIncludeTally(!!v)}
                    />
                    <Label htmlFor="zip-include-tally" className="text-sm font-normal cursor-pointer">
                      Tally XML Export
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="zip-include-docs"
                      checked={includeDocuments}
                      onCheckedChange={(v) => setIncludeDocuments(!!v)}
                    />
                    <Label htmlFor="zip-include-docs" className="text-sm font-normal cursor-pointer">
                      All Document Files
                    </Label>
                  </div>
                </div>
              </div>

              {includeTally && (
                <div className="space-y-2">
                  <Label htmlFor="zip-company-name">
                    Company Name (optional, for Tally export)
                  </Label>
                  <Input
                    id="zip-company-name"
                    placeholder={collectionName}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !nothingSelected) handleExport();
                    }}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={nothingSelected}>
                <Archive />
                Download
              </Button>
            </DialogFooter>
          </>
        )}

        {state === "exporting" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{phase}</p>
                {progress.total > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {progress.current} of {progress.total}
                  </p>
                )}
              </div>
            </div>
            {progress.total > 0 && (
              <Progress value={progressPercent} className="h-2" />
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </div>
        )}

        {state === "done" && (
          <div className="flex items-center gap-3 py-4">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            <p className="text-sm font-medium">
              ZIP downloaded successfully!
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Export failed</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {errorMessage}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Close
              </Button>
              <Button onClick={handleExport}>Retry</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
