"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Upload, FileText, FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collection, getCollectionDocumentCount } from "@/types/collection";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface CollectionHeaderProps {
  collection: Collection | undefined;
  isLoading?: boolean;
  canUpload?: boolean;
  documentCount?: number;
}

export function CollectionHeader({
  collection,
  isLoading,
  canUpload = false,
  documentCount,
}: CollectionHeaderProps) {
  const router = useRouter();

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
                  <span className="text-border">·</span>
                  <span>Created {formatDate(collection.created_at)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 ml-12 sm:ml-0 shrink-0">
          {canUpload && (
            <Button asChild>
              <Link href={`/upload?collection=${collection.id}`}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Link>
            </Button>
          )}
          {isOwner && (
            <Button variant="outline" asChild>
              <Link href={`/collections/${collection.id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
