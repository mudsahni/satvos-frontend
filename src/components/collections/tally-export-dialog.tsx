"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TallyExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionName: string;
  onExport: (companyName?: string) => void;
  isExporting?: boolean;
}

export function TallyExportDialog({
  open,
  onOpenChange,
  collectionName,
  onExport,
  isExporting,
}: TallyExportDialogProps) {
  const [companyName, setCompanyName] = useState("");

  const handleExport = () => {
    onExport(companyName.trim() || undefined);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setCompanyName("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Tally XML</DialogTitle>
          <DialogDescription>
            Download invoices in Tally Prime format.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name (optional)</Label>
          <Input
            id="company-name"
            placeholder={collectionName}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isExporting) handleExport();
            }}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting && <Loader2 className="animate-spin" />}
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
