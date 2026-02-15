"use client";

import { useState, useMemo } from "react";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import Link from "next/link";
import { Plus, Search, FolderOpen, Upload, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CollectionCard,
  CollectionCardSkeleton,
} from "@/components/collections/collection-card";
import { useCollections, useDeleteCollection, useExportCollectionCsv } from "@/lib/hooks/use-collections";
import { useAuthStore } from "@/store/auth-store";
import { canCreateCollections } from "@/lib/constants";
import { Collection } from "@/types/collection";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";

const DEFAULT_PAGE_SIZE = 20;

export default function CollectionsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const debouncedSearch = useDebouncedValue(search);

  // API doesn't support search — fetch all when searching, paginated otherwise
  const hasSearch = !!debouncedSearch;
  const { data, isLoading, isError, refetch } = useCollections({
    limit: hasSearch ? 1000 : pageSize,
    offset: hasSearch ? 0 : (page - 1) * pageSize,
  });

  // Client-side search filtering
  const filtered = useMemo(() => {
    const items = data?.items || [];
    if (!debouncedSearch) return items;
    const q = debouncedSearch.toLowerCase();
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [data, debouncedSearch]);

  // Client-side pagination when searching
  const total = hasSearch ? filtered.length : (data?.total ?? 0);
  const totalPages = hasSearch ? Math.max(1, Math.ceil(total / pageSize)) : (data?.total_pages ?? 1);
  const collections = hasSearch
    ? filtered.slice((page - 1) * pageSize, page * pageSize)
    : filtered;

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const deleteCollection = useDeleteCollection();
  const exportCsv = useExportCollectionCsv();

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCollection.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const canDelete = (collection: Collection) => {
    return collection.user_permission === "owner";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">
            Organize and manage your document collections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/upload">
              <Upload />
              Upload
            </Link>
          </Button>
          {user && canCreateCollections(user.role) && (
            <Button asChild>
              <Link href="/collections/new">
                <Plus />
                New Collection
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Collections grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load collections"
          message="We couldn't load your collections. Please try again."
          onRetry={() => refetch()}
        />
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 px-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No collections</h3>
          <p className="mt-1 text-center text-sm text-muted-foreground max-w-sm">
            {search
              ? "No collections match your search. Try a different search term."
              : "Get started by creating your first collection to organize your documents."}
          </p>
          {!search && user && canCreateCollections(user.role) && (
            <Button asChild className="mt-4">
              <Link href="/collections/new">
                <Plus />
                Create Collection
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onDelete={setDeleteId}
                onExportCsv={(id, name) => exportCsv.mutate({ id, name })}
                isExportingCsv={exportCsv.isPending}
                canDelete={canDelete(collection)}
              />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this collection? This action cannot
              be undone and will also delete all files and documents in this
              collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteCollection.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCollection.isPending && <Loader2 className="animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
