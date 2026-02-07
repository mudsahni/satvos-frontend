"use client";

import Link from "next/link";
import {
  FolderOpen,
  FileText,
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import { useCollections } from "@/lib/hooks/use-collections";
import { useDocuments } from "@/lib/hooks/use-documents";
import { canCreateCollections } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils/format";
import { StatusBadge } from "@/components/documents/status-badge";
import { CollectionCard, CollectionCardSkeleton } from "@/components/collections/collection-card";
import { cn } from "@/lib/utils";
import { GreetingBanner } from "@/components/dashboard/greeting-banner";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  loading?: boolean;
}

function StatCard({ title, value, icon, href, loading }: StatCardProps) {
  const content = (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200",
      href && "hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-7 w-12 mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-muted/40">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: collectionsData, isLoading: collectionsLoading } =
    useCollections({ limit: 6 });
  const { data: documentsData, isLoading: documentsLoading } = useDocuments({
    limit: 500,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const collections = collectionsData?.items || [];
  const documents = documentsData?.items || [];
  const totalCollections = collectionsData?.total || 0;
  const totalDocuments = documentsData?.total || 0;

  // Documents needing attention (validation warnings/errors or pending review)
  const documentsNeedingAttention = documents.filter(
    (d) =>
      d.validation_status === "invalid" ||
      d.validation_status === "warning" ||
      (d.parsing_status === "completed" && d.review_status === "pending")
  );

  // Stats — client-side counts from full document set
  const pendingValidation = documents.filter(
    (d) => d.validation_status === "warning" || d.validation_status === "invalid"
  ).length;

  const pendingReview = documents.filter(
    (d) => d.parsing_status === "completed" && d.review_status === "pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <GreetingBanner
        pendingReview={pendingReview}
        needsValidation={pendingValidation}
      />

      {/* Quick Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Collections"
          value={totalCollections}
          icon={<FolderOpen className="h-5 w-5 text-primary" />}
          href="/collections"
          loading={collectionsLoading}
        />
        <StatCard
          title="Documents"
          value={totalDocuments}
          icon={<FileText className="h-5 w-5 text-muted-foreground" />}
          href="/documents"
          loading={documentsLoading}
        />
        <StatCard
          title="Need Validation"
          value={pendingValidation}
          icon={<AlertTriangle className="h-5 w-5 text-warning" />}
          href="/exceptions"
          loading={documentsLoading}
        />
        <StatCard
          title="Pending Review"
          value={pendingReview}
          icon={<Clock className="h-5 w-5 text-primary" />}
          href="/exceptions"
          loading={documentsLoading}
        />
      </div>

      {/* Collections Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Your Collections</h2>
          </div>
          <div className="flex items-center gap-2">
            {user && canCreateCollections(user.role) && (
              <Button size="sm" asChild>
                <Link href="/collections/new">
                  <Plus className="h-4 w-4" />
                  New
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/collections" className="flex items-center">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {collectionsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <CollectionCardSkeleton key={i} />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">No collections yet</h3>
              <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
                Create your first collection to start organizing documents.
              </p>
              {user && canCreateCollections(user.role) && (
                <Button asChild className="mt-4">
                  <Link href="/collections/new">
                    <Plus />
                    Create Collection
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.slice(0, 6).map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </div>

      {/* Documents Needing Attention */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Needs Attention</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/exceptions" className="flex items-center">
              View all exceptions
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {documentsLoading ? (
          <Card>
            <CardContent className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : documentsNeedingAttention.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="mt-4 font-semibold">All caught up!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No documents need your attention right now.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 divide-y">
              {documentsNeedingAttention.slice(0, 5).map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      doc.validation_status === "invalid" && "bg-error/10",
                      doc.validation_status === "warning" && "bg-warning/10",
                      doc.validation_status !== "invalid" && doc.validation_status !== "warning" && "bg-primary/10"
                    )}>
                      {doc.validation_status === "invalid" ? (
                        <XCircle className="h-4 w-4 text-error" />
                      ) : doc.validation_status === "warning" ? (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      ) : (
                        <Clock className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeTime(doc.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge
                      status={doc.validation_status}
                      type="validation"
                      showIcon={false}
                    />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
