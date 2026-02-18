"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Key,
  MoreHorizontal,
  Trash2,
  RotateCcw,
  Ban,
  ExternalLink,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import {
  useServiceAccounts,
  useCreateServiceAccount,
  useRotateServiceAccountKey,
  useRevokeServiceAccount,
  useDeleteServiceAccount,
} from "@/lib/hooks/use-service-accounts";
import {
  createServiceAccountSchema,
  type CreateServiceAccountFormData,
} from "@/lib/utils/validation";
import { formatDate } from "@/lib/utils/format";
import { ServiceAccount } from "@/types/service-account";
import { ApiKeyRevealDialog } from "@/components/admin/api-key-reveal-dialog";
import { ServiceAccountRestrictions } from "@/components/admin/service-account-restrictions";

export default function ServiceAccountsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [revealTitle, setRevealTitle] = useState("API Key Created");
  const [rotateTarget, setRotateTarget] = useState<ServiceAccount | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<ServiceAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceAccount | null>(null);

  const { data, isLoading, isError, refetch } = useServiceAccounts({
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const createSA = useCreateServiceAccount();
  const rotateSA = useRotateServiceAccountKey();
  const revokeSA = useRevokeServiceAccount();
  const deleteSA = useDeleteServiceAccount();

  const accounts = data?.items || [];

  const handleCreate = async (formData: CreateServiceAccountFormData) => {
    const result = await createSA.mutateAsync({
      name: formData.name,
      description: formData.description,
      expires_at: formData.expires_at || undefined,
    });
    setShowCreateDialog(false);
    setRevealTitle("API Key Created");
    setRevealedKey(result.api_key);
  };

  const handleRotate = async () => {
    if (!rotateTarget) return;
    const result = await rotateSA.mutateAsync(rotateTarget.id);
    setRotateTarget(null);
    setRevealTitle("API Key Rotated");
    setRevealedKey(result.api_key);
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    await revokeSA.mutateAsync(revokeTarget.id);
    setRevokeTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteSA.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Service Accounts
          </h1>
          <p className="text-muted-foreground">
            Manage API keys for programmatic access
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus />
          Create Service Account
        </Button>
      </div>

      <ServiceAccountRestrictions />

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Failed to load service accounts"
              message="We couldn't load the service account list. Please try again."
              onRetry={() => refetch()}
            />
          ) : accounts.length === 0 ? (
            <div className="text-center py-12">
              <Key className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No service accounts
              </h3>
              <p className="text-muted-foreground">
                Create a service account for ERP integrations or automation.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm normal-case tracking-normal">Name</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal hidden md:table-cell">
                        Description
                      </TableHead>
                      <TableHead className="text-sm normal-case tracking-normal">Key Prefix</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal">Status</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal hidden lg:table-cell">
                        Last Used
                      </TableHead>
                      <TableHead className="text-sm normal-case tracking-normal hidden lg:table-cell">
                        Expires
                      </TableHead>
                      <TableHead className="text-sm normal-case tracking-normal hidden lg:table-cell">
                        Created
                      </TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((sa) => (
                      <TableRow key={sa.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/service-accounts/${sa.id}`}
                            className="hover:underline"
                          >
                            {sa.name}
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                          {sa.description || "—"}
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                            {sa.api_key_prefix}...
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={sa.is_active ? "success" : "destructive"}
                          >
                            {sa.is_active ? "Active" : "Revoked"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {sa.last_used_at
                            ? formatDate(sa.last_used_at)
                            : "Never"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {sa.expires_at
                            ? formatDate(sa.expires_at)
                            : "Never"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {formatDate(sa.created_at)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Service account actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/admin/service-accounts/${sa.id}`}
                                >
                                  <ExternalLink />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {sa.is_active && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => setRotateTarget(sa)}
                                  >
                                    <RotateCcw />
                                    Rotate Key
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-warning"
                                    onClick={() => setRevokeTarget(sa)}
                                  >
                                    <Ban />
                                    Revoke
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteTarget(sa)}
                              >
                                <Trash2 />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                page={page}
                totalPages={data?.total_pages ?? 1}
                total={data?.total ?? 0}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setPage(1);
                }}
                className="mt-4"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CreateServiceAccountDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreate}
        isSubmitting={createSA.isPending}
      />

      {/* API Key Reveal */}
      <ApiKeyRevealDialog
        open={!!revealedKey}
        onOpenChange={() => setRevealedKey(null)}
        apiKey={revealedKey ?? ""}
        title={revealTitle}
      />

      {/* Rotate Confirmation */}
      <AlertDialog
        open={!!rotateTarget}
        onOpenChange={() => setRotateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate API Key</AlertDialogTitle>
            <AlertDialogDescription>
              The current key for{" "}
              <span className="font-medium">{rotateTarget?.name}</span> will
              stop working immediately. A new key will be generated.
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

      {/* Revoke Confirmation */}
      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={() => setRevokeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Service Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate{" "}
              <span className="font-medium">{revokeTarget?.name}</span>. Any
              integrations using this key will break immediately.
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

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-medium">{deleteTarget?.name}</span>? This
              action cannot be undone.
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

function CreateServiceAccountDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateServiceAccountFormData) => Promise<void>;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateServiceAccountFormData>({
    resolver: zodResolver(createServiceAccountSchema),
    defaultValues: { name: "", description: "", expires_at: "" },
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Service Account</DialogTitle>
          <DialogDescription>
            Create a new API key for programmatic access
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (data) => {
            await onSubmit(data);
            reset();
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="sa-name">Name</Label>
            <Input
              id="sa-name"
              placeholder="e.g. ERP Integration"
              {...register("name")}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sa-description">Description (optional)</Label>
            <Input
              id="sa-description"
              placeholder="e.g. Uploads invoices from Tally ERP"
              {...register("description")}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sa-expires">Expiry Date (optional)</Label>
            <Input
              id="sa-expires"
              type="date"
              {...register("expires_at")}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for no expiry
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
