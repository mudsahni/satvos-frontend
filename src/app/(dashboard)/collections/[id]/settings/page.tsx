"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  useCollection,
  useUpdateCollection,
  useDeleteCollection,
  useCollectionPermissions,
  useAddCollectionPermission,
  useDeleteCollectionPermission,
} from "@/lib/hooks/use-collections";
import { useSearchUsers } from "@/lib/hooks/use-users";
import {
  updateCollectionSchema,
  type UpdateCollectionFormData,
} from "@/lib/utils/validation";
import { PermissionLevel } from "@/lib/constants";

interface CollectionSettingsPageProps {
  params: Promise<{ id: string }>;
}

export default function CollectionSettingsPage({
  params,
}: CollectionSettingsPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const { data: collection, isLoading: collectionLoading } = useCollection(id);
  const { data: permissions, isLoading: permissionsLoading } =
    useCollectionPermissions(id);
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();
  const addPermission = useAddCollectionPermission();
  const deletePermission = useDeleteCollectionPermission();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddPermissionDialog, setShowAddPermissionDialog] = useState(false);
  const [deletePermissionId, setDeletePermissionId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedPermissionLevel, setSelectedPermissionLevel] =
    useState<PermissionLevel>("viewer");

  const { data: searchResults } = useSearchUsers(searchQuery);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateCollectionFormData>({
    resolver: zodResolver(updateCollectionSchema),
    defaultValues: {
      name: collection?.name || "",
      description: collection?.description || "",
    },
    values: collection
      ? { name: collection.name, description: collection.description }
      : undefined,
  });

  const onSubmit = async (data: UpdateCollectionFormData) => {
    await updateCollection.mutateAsync({ id, data });
  };

  const handleDelete = async () => {
    await deleteCollection.mutateAsync(id);
    router.push("/collections");
  };

  const handleAddPermission = async () => {
    if (!selectedUserId) return;

    await addPermission.mutateAsync({
      collectionId: id,
      data: {
        user_id: selectedUserId,
        permission_level: selectedPermissionLevel,
      },
    });

    setShowAddPermissionDialog(false);
    setSearchQuery("");
    setSelectedUserId("");
    setSelectedPermissionLevel("viewer");
  };

  const handleDeletePermission = async () => {
    if (!deletePermissionId) return;

    await deletePermission.mutateAsync({
      collectionId: id,
      permissionId: deletePermissionId,
    });

    setDeletePermissionId(null);
  };

  if (collectionLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Collection not found</h3>
        <Button asChild className="mt-4">
          <Link href="/collections">Back to Collections</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Collection Settings
          </h1>
          <p className="text-muted-foreground">{collection.name}</p>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Update the collection name and description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...register("description")} />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Manage who has access to this collection
              </CardDescription>
            </div>
            <Dialog
              open={showAddPermissionDialog}
              onOpenChange={setShowAddPermissionDialog}
            >
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Permission</DialogTitle>
                  <DialogDescription>
                    Search for a user and assign them a permission level
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Search User</Label>
                    <Input
                      placeholder="Search by email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchResults && searchResults.length > 0 && (
                      <div className="border rounded-md max-h-40 overflow-auto">
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            className={`w-full px-3 py-2 text-left hover:bg-muted ${
                              selectedUserId === user.id ? "bg-muted" : ""
                            }`}
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setSearchQuery(user.email);
                            }}
                          >
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Permission Level</Label>
                    <Select
                      value={selectedPermissionLevel}
                      onValueChange={(v) =>
                        setSelectedPermissionLevel(v as PermissionLevel)
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
                    onClick={handleAddPermission}
                    disabled={!selectedUserId || addPermission.isPending}
                  >
                    {addPermission.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Permission
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {permissionsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !permissions || permissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No permissions configured
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Permission</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {permission.user?.full_name || "Unknown User"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {permission.user?.email || permission.user_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {permission.permission_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletePermissionId(permission.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete this collection</p>
              <p className="text-sm text-muted-foreground">
                Once deleted, all files and documents in this collection will be
                permanently removed.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              Delete Collection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Collection Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{collection.name}&quot;? This action
              cannot be undone and will permanently delete all files and
              documents in this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCollection.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Permission Dialog */}
      <AlertDialog
        open={!!deletePermissionId}
        onOpenChange={() => setDeletePermissionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this user&apos;s access to this
              collection?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePermission}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePermission.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
