"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Search,
  Users,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useResendInvitation,
} from "@/lib/hooks/use-users";
import { useAuthStore } from "@/store/auth-store";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
} from "@/lib/utils/validation";
import { formatDate } from "@/lib/utils/format";
import { Role } from "@/lib/constants";
import { User } from "@/types/user";
import { RoleBadge } from "@/components/admin/role-badge";
import { RoleInfoPanel } from "@/components/admin/role-info-panel";

function isPendingInvitation(user: User): boolean {
  return !user.email_verified && user.role !== "free";
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError, refetch } = useUsers({
    search: debouncedSearch || undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const resendInvitation = useResendInvitation();

  let users = data?.items || [];
  if (roleFilter !== "all") {
    users = users.filter((u) => u.role === roleFilter);
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteUser.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage users in your organization
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus />
          Invite User
        </Button>
      </div>

      <RoleInfoPanel />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Failed to load users"
              message="We couldn't load the user list. Please try again."
              onRetry={() => refetch()}
            />
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No users found</h3>
              <p className="text-muted-foreground">
                {search || roleFilter !== "all"
                  ? "No users match your filters."
                  : "Add users to your organization."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm normal-case tracking-normal">Name</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal">Email</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal">Role</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal">Status</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal hidden md:table-cell">
                        Verified
                      </TableHead>
                      <TableHead className="text-sm normal-case tracking-normal hidden md:table-cell">
                        Provider
                      </TableHead>
                      <TableHead className="text-sm normal-case tracking-normal hidden lg:table-cell">
                        Usage
                      </TableHead>
                      <TableHead className="text-sm normal-case tracking-normal hidden lg:table-cell">
                        Created
                      </TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.is_active ? "success" : "secondary"
                            }
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.email_verified ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : isPendingInvitation(user) ? (
                            <Badge variant="warning">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className="capitalize">
                            {user.auth_provider ?? "email"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {user.role === "free"
                            ? `${user.documents_used_this_period ?? 0} / ${user.monthly_document_limit ?? 0}`
                            : "Unlimited"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="User actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setEditingUser(user)}
                              >
                                <Edit />
                                Edit
                              </DropdownMenuItem>
                              {isPendingInvitation(user) && (
                                <DropdownMenuItem
                                  onClick={() => resendInvitation.mutate(user.id)}
                                >
                                  <Send />
                                  Resend Invitation
                                </DropdownMenuItem>
                              )}
                              {user.id !== currentUser?.id && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setDeleteTarget(user)}
                                  >
                                    <Trash2 />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
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
                onPageSizeChange={handlePageSizeChange}
                className="mt-4"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={async (data) => {
          await createUser.mutateAsync(data);
          setShowCreateDialog(false);
        }}
        isSubmitting={createUser.isPending}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        user={editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSubmit={async (data) => {
          if (editingUser) {
            await updateUser.mutateAsync({ id: editingUser.id, data });
            setEditingUser(null);
          }
        }}
        isSubmitting={updateUser.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">{deleteTarget?.full_name}</span> (
              {deleteTarget?.email})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUser.isPending && <Loader2 className="animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      full_name: "",
      role: "member",
    },
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Invite a new user to your organization. They will receive an email
            to set their password.
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
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              {...register("full_name")}
              disabled={isSubmitting}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={watch("role")}
              onValueChange={(v) => setValue("role", v as Role)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">
                {errors.role.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  user,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateUserFormData) => Promise<void>;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    values: user
      ? {
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          is_active: user.is_active,
        }
      : undefined,
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const watchedRole = watch("role");
  const watchedActive = watch("is_active");

  return (
    <Dialog open={!!user} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (data) => {
            await onSubmit(data);
            reset();
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-full_name">Full Name</Label>
            <Input
              id="edit-full_name"
              {...register("full_name")}
              disabled={isSubmitting}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              {...register("email")}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={watchedRole}
              onValueChange={(v) => setValue("role", v as Role)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            {watchedRole !== user?.role && (
              <div className="flex items-start gap-2 rounded-md border border-warning-border bg-warning-bg p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <p className="text-sm text-warning">
                  Changing role affects this user&apos;s access to all
                  collections.
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-is_active"
                checked={watchedActive}
                onCheckedChange={(v) => setValue("is_active", v === true)}
                disabled={isSubmitting}
              />
              <Label htmlFor="edit-is_active">Active</Label>
            </div>
            {watchedActive === false && (
              <div className="flex items-start gap-2 rounded-md border border-warning-border bg-warning-bg p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <p className="text-sm text-warning">
                  Deactivating prevents this user from logging in.
                </p>
              </div>
            )}
          </div>

          {/* Read-only info */}
          {user && (
            <div className="space-y-2 border-t pt-4 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Email Verified</span>
                <span>
                  {user.email_verified
                    ? "Yes"
                    : isPendingInvitation(user)
                      ? "Pending Invitation"
                      : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Auth Provider</span>
                <span className="capitalize">
                  {user.auth_provider ?? "email"}
                </span>
              </div>
              {user.role === "free" && (
                <div className="flex justify-between">
                  <span>Document Usage</span>
                  <span>
                    {user.documents_used_this_period ?? 0} /{" "}
                    {user.monthly_document_limit ?? 0}
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
