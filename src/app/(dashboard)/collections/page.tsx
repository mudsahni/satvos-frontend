"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, FolderOpen, Upload } from "lucide-react";

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
import { useCollections, useDeleteCollection } from "@/lib/hooks/use-collections";
import { useAuthStore } from "@/store/auth-store";
import { canCreateCollections } from "@/lib/constants";
import { Collection } from "@/types/collection";

export default function CollectionsPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useCollections({
    search: search || undefined,
    limit: 50,
  });

  const deleteCollection = useDeleteCollection();

  const collections = data?.items || [];

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCollection.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const canDelete = (collection: Collection) => {
    return collection.user_permission === "owner" || user?.role === "admin";
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
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Link>
          </Button>
          {user && canCreateCollections(user.role) && (
            <Button asChild>
              <Link href="/collections/new">
                <Plus className="mr-2 h-4 w-4" />
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
            onChange={(e) => setSearch(e.target.value)}
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
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 px-4">
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
                <Plus className="mr-2 h-4 w-4" />
                Create Collection
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              onDelete={setDeleteId}
              canDelete={canDelete(collection)}
            />
          ))}
        </div>
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
