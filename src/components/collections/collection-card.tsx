"use client";

import Link from "next/link";
import { FolderOpen, FileText, MoreHorizontal, Settings, Trash2, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collection, getCollectionDocumentCount } from "@/types/collection";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface CollectionCardProps {
  collection: Collection;
  onDelete?: (id: string) => void;
  onExportCsv?: (id: string, name: string) => void;
  isExportingCsv?: boolean;
  canDelete?: boolean;
}

export function CollectionCard({
  collection,
  onDelete,
  onExportCsv,
  isExportingCsv,
  canDelete = false,
}: CollectionCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/collections/${collection.id}`}
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {collection.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {collection.description || "No description"}
              </p>
            </div>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Collection actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/collections/${collection.id}`}>
                  View Details
                </Link>
              </DropdownMenuItem>
              {collection.user_permission === "owner" && (
                <DropdownMenuItem asChild>
                  <Link href={`/collections/${collection.id}/settings`}>
                    <Settings />
                    Settings
                  </Link>
                </DropdownMenuItem>
              )}
              {onExportCsv && (
                <DropdownMenuItem
                  onClick={() => onExportCsv(collection.id, collection.name)}
                  disabled={isExportingCsv}
                >
                  <Download />
                  Export CSV
                </DropdownMenuItem>
              )}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete?.(collection.id)}
                  >
                    <Trash2 />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-2 mt-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>{getCollectionDocumentCount(collection)} docs</span>
            </div>
            <span className="text-border">|</span>
            <span>{formatDate(collection.created_at)}</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "capitalize text-xs",
              collection.user_permission === "owner" && "border-transparent bg-primary/10 text-primary",
              collection.user_permission === "editor" && "border-transparent bg-warning-bg text-warning",
              collection.user_permission === "viewer" && "border-transparent bg-muted"
            )}
          >
            {collection.user_permission || "viewer"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function CollectionCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mt-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
