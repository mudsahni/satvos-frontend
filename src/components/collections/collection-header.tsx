"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Upload, FileText, FolderOpen, Download, Loader2, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TallyExportDialog } from "@/components/collections/tally-export-dialog";
import { Collection, getCollectionDocumentCount } from "@/types/collection";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UserName } from "@/components/ui/user-name";

interface CollectionHeaderProps {
  collection: Collection | undefined;
  isLoading?: boolean;
  canUpload?: boolean;
  documentCount?: number;
  onExportCsv?: () => void;
  isExportingCsv?: boolean;
  onExportTally?: (companyName?: string) => void;
  isExportingTally?: boolean;
}

export function CollectionHeader({
  collection,
  isLoading,
  canUpload = false,
  documentCount,
  onExportCsv,
  isExportingCsv,
  onExportTally,
  isExportingTally,
}: CollectionHeaderProps) {
  const router = useRouter();
  const [tallyDialogOpen, setTallyDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-4 w-96 ml-12" />
      </div>
    );
  }

  if (!collection) return null;

  const isOwner = collection.user_permission === "owner";
  const hasExport = !!onExportCsv || !!onExportTally;
  const isExporting = isExportingCsv || isExportingTally;

  return (
    <div className="space-y-3">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 mt-0.5"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderOpen className="h-4.5 w-4.5" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight truncate">
                {collection.name}
              </h1>
            </div>
            {collection.description && (
              <p className="text-sm text-muted-foreground mt-1.5 ml-[46px]">
                {collection.description}
              </p>
            )}
            {/* Metadata row */}
            <div className="flex items-center gap-3 mt-2 ml-[46px] text-sm text-muted-foreground flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "capitalize text-xs",
                  collection.user_permission === "owner" && "border-transparent bg-primary/10 text-primary",
                  collection.user_permission === "editor" && "border-transparent bg-warning-bg text-warning"
                )}
              >
                {collection.user_permission || "viewer"}
              </Badge>
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                {documentCount ?? getCollectionDocumentCount(collection)} documents
              </span>
              {formatDate(collection.created_at) !== "-" && (
                <>
                  <span>|</span>
                  <span>Created <Tooltip><TooltipTrigger asChild><span className="cursor-default">{formatDate(collection.created_at)}</span></TooltipTrigger><TooltipContent>{formatDateTime(collection.created_at)}</TooltipContent></Tooltip> by <span className="text-foreground"><UserName id={collection.created_by} /></span></span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-12 sm:ml-0 shrink-0 justify-end sm:justify-start">
          {hasExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onExportCsv && (
                  <DropdownMenuItem
                    onClick={onExportCsv}
                    disabled={isExportingCsv}
                  >
                    Export CSV
                  </DropdownMenuItem>
                )}
                {onExportTally && (
                  <DropdownMenuItem
                    onClick={() => setTallyDialogOpen(true)}
                    disabled={isExportingTally}
                  >
                    Export Tally XML
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {canUpload && (
            <Button asChild>
              <Link href={`/upload?collection=${collection.id}`}>
                <Upload />
                <span className="hidden sm:inline">Upload</span>
              </Link>
            </Button>
          )}
          {isOwner && (
            <Button variant="outline" asChild>
              <Link href={`/collections/${collection.id}/settings`}>
                <Settings />
                <span className="hidden sm:inline">Settings</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tally export dialog */}
      {onExportTally && (
        <TallyExportDialog
          open={tallyDialogOpen}
          onOpenChange={setTallyDialogOpen}
          collectionName={collection.name}
          onExport={(companyName) => {
            onExportTally(companyName);
            setTallyDialogOpen(false);
          }}
          isExporting={isExportingTally}
        />
      )}
    </div>
  );
}
