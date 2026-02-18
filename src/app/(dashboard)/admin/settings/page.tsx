"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useTenant, useUpdateTenant } from "@/lib/hooks/use-tenant";
import {
  updateTenantSchema,
  type UpdateTenantFormData,
} from "@/lib/utils/validation";
import { formatDate } from "@/lib/utils/format";

export default function TenantSettingsPage() {
  const { data: tenant, isLoading, isError, refetch } = useTenant();
  const updateTenant = useUpdateTenant();
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UpdateTenantFormData>({
    resolver: zodResolver(updateTenantSchema),
    values: tenant
      ? { name: tenant.name, slug: tenant.slug, is_active: tenant.is_active }
      : undefined,
  });

  const isActive = watch("is_active");

  const handleFormSubmit = async (data: UpdateTenantFormData) => {
    await updateTenant.mutateAsync(data);
    setEditing(false);
  };

  const handleCancel = () => {
    reset();
    setEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !tenant) {
    return (
      <ErrorState
        title="Failed to load tenant settings"
        message="We couldn't load your organization settings. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Tenant Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your organization settings
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Organization Details</CardTitle>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editing ? (
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  {...register("name")}
                  disabled={updateTenant.isPending}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  {...register("slug")}
                  disabled={updateTenant.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers, and hyphens only
                </p>
                {errors.slug && (
                  <p className="text-sm text-destructive">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={(v) => setValue("is_active", v === true)}
                    disabled={updateTenant.isPending}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                {isActive === false && (
                  <div className="flex items-start gap-2 rounded-md border border-warning-border bg-warning-bg p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <p className="text-sm text-warning">
                      Deactivating prevents all users in this tenant from
                      logging in.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={updateTenant.isPending}>
                  {updateTenant.isPending && (
                    <Loader2 className="animate-spin" />
                  )}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateTenant.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Organization Name
                </dt>
                <dd className="mt-1 text-sm">{tenant.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Slug
                </dt>
                <dd className="mt-1 text-sm font-mono">{tenant.slug}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-1">
                  <Badge variant={tenant.is_active ? "success" : "secondary"}>
                    {tenant.is_active ? "Active" : "Inactive"}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Created
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {formatDate(tenant.created_at)}
                </dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
