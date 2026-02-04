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
}

export function CollectionHeader({
  collection,
  isLoading,
  canUpload = false,
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
    <div className="space-y-4">
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
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FolderOpen className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                {collection.name}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  collection.user_permission === "owner" && "border-primary/30 text-primary",
                  collection.user_permission === "editor" && "border-warning/30 text-warning"
                )}
              >
                {collection.user_permission || "viewer"}
              </Badge>
            </div>
            {collection.description && (
              <p className="text-muted-foreground mt-1 ml-12">
                {collection.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1 ml-12">
              Created {formatDate(collection.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 ml-12 sm:ml-0">
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

      {/* Stats row */}
      <div className="flex items-center gap-6 ml-12 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{getCollectionDocumentCount(collection)} documents</span>
        </div>
      </div>
    </div>
  );
}
