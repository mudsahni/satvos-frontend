"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  Ban,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ErrorState } from "@/components/ui/error-state";
import {
  useServiceAccount,
  useServiceAccountPermissions,
  useRotateServiceAccountKey,
  useRevokeServiceAccount,
  useDeleteServiceAccount,
  useGrantServiceAccountPermission,
  useRemoveServiceAccountPermission,
} from "@/lib/hooks/use-service-accounts";
import { useCollections } from "@/lib/hooks/use-collections";
import { formatDate } from "@/lib/utils/format";
import { PermissionLevel } from "@/lib/constants";
import { ApiKeyRevealDialog } from "@/components/admin/api-key-reveal-dialog";
import { CollectionPicker } from "@/components/admin/collection-picker";

export default function ServiceAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data: sa,
    isLoading,
    isError,
    refetch,
  } = useServiceAccount(id);
  const { data: permissions, isLoading: permLoading } =
    useServiceAccountPermissions(id);
  const { data: collections } = useCollections({ limit: 100 });

  const rotateSA = useRotateServiceAccountKey();
  const revokeSA = useRevokeServiceAccount();
  const deleteSA = useDeleteServiceAccount();
  const grantPerm = useGrantServiceAccountPermission();
  const removePerm = useRemoveServiceAccountPermission();

  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [grantCollectionId, setGrantCollectionId] = useState("");
  const [grantPermission, setGrantPermission] =
    useState<PermissionLevel>("viewer");
  const [removingPermCollectionId, setRemovingPermCollectionId] = useState<
    string | null
  >(null);

  const collectionsMap = new Map(
    (collections?.items ?? []).map((c) => [c.id, c.name])
  );

  const grantedCollectionIds = (permissions ?? []).map((p) => p.collection_id);

  const handleRotate = async () => {
    const result = await rotateSA.mutateAsync(id);
    setShowRotateConfirm(false);
    setRevealedKey(result.api_key);
  };

  const handleRevoke = async () => {
    await revokeSA.mutateAsync(id);
    setShowRevokeConfirm(false);
  };

  const handleDelete = async () => {
    await deleteSA.mutateAsync(id);
    setShowDeleteConfirm(false);
  };

  const handleGrant = async () => {
    if (!grantCollectionId) return;
    await grantPerm.mutateAsync({
      id,
      data: { collection_id: grantCollectionId, permission: grantPermission },
    });
    setShowGrantDialog(false);
    setGrantCollectionId("");
    setGrantPermission("viewer");
  };

  const handleRemovePerm = async () => {
    if (!removingPermCollectionId) return;
    await removePerm.mutateAsync({
      id,
      collectionId: removingPermCollectionId,
    });
    setRemovingPermCollectionId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !sa) {
    return (
      <ErrorState
        title="Service account not found"
        message="The service account could not be loaded."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/service-accounts">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{sa.name}</h1>
          <p className="text-muted-foreground">{sa.description || "No description"}</p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Key Prefix</dt>
              <dd>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {sa.api_key_prefix}...
                </code>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge variant={sa.is_active ? "success" : "destructive"}>
                  {sa.is_active ? "Active" : "Revoked"}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Last Used</dt>
              <dd>{sa.last_used_at ? formatDate(sa.last_used_at) : "Never"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Expires</dt>
              <dd>{sa.expires_at ? formatDate(sa.expires_at) : "Never"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(sa.created_at)}</dd>
            </div>
          </dl>

          {sa.is_active && (
            <div className="flex gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRotateConfirm(true)}
              >
                <RotateCcw />
                Rotate Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-warning-border text-warning"
                onClick={() => setShowRevokeConfirm(true)}
              >
                <Ban />
                Revoke
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Collection Permissions</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrantDialog(true)}
          >
            <Plus />
            Add Collection
          </Button>
        </CardHeader>
        <CardContent>
          {permLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : !permissions || permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No collection access granted. Add a collection to enable API access.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm normal-case tracking-normal">Collection</TableHead>
                  <TableHead className="text-sm normal-case tracking-normal">Permission</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell className="font-medium">
                      {collectionsMap.get(perm.collection_id) ??
                        perm.collection_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {perm.permission}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() =>
                          setRemovingPermCollectionId(perm.collection_id)
                        }
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Grant Permission Dialog */}
      <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Collection Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Collection</label>
              <CollectionPicker
                value={grantCollectionId}
                onSelect={(c) => setGrantCollectionId(c.id)}
                excludeIds={grantedCollectionIds}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Permission</label>
              <Select
                value={grantPermission}
                onValueChange={(v) =>
                  setGrantPermission(v as PermissionLevel)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleGrant}
              disabled={!grantCollectionId || grantPerm.isPending}
            >
              {grantPerm.isPending && <Loader2 className="animate-spin" />}
              Grant Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Permission Confirmation */}
      <AlertDialog
        open={!!removingPermCollectionId}
        onOpenChange={() => setRemovingPermCollectionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Collection Access</AlertDialogTitle>
            <AlertDialogDescription>
              This service account will lose access to this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemovePerm}>
              {removePerm.isPending && <Loader2 className="animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Key Reveal, Rotate, Revoke, Delete Dialogs */}
      <ApiKeyRevealDialog
        open={!!revealedKey}
        onOpenChange={() => setRevealedKey(null)}
        apiKey={revealedKey ?? ""}
        title="API Key Rotated"
      />

      <AlertDialog
        open={showRotateConfirm}
        onOpenChange={setShowRotateConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate API Key</AlertDialogTitle>
            <AlertDialogDescription>
              The current key will stop working immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRotate}>
              {rotateSA.isPending && <Loader2 className="animate-spin" />}
              Rotate Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showRevokeConfirm}
        onOpenChange={setShowRevokeConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Service Account</AlertDialogTitle>
            <AlertDialogDescription>
              Any integrations using this key will break immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              className="border-warning-border bg-warning-bg text-warning hover:bg-warning-bg/80"
            >
              {revokeSA.isPending && <Loader2 className="animate-spin" />}
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Account</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete this service account? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSA.isPending && <Loader2 className="animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
