"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ExternalLink, FolderOpen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Pagination } from "@/components/ui/pagination";
import { ErrorState } from "@/components/ui/error-state";
import { useCollections } from "@/lib/hooks/use-collections";
import { getCollectionDocumentCount } from "@/types/collection";

const DEFAULT_PAGE_SIZE = 20;

export default function PermissionsOverviewPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading, isError, refetch } = useCollections({
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const collections = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Permissions Overview
        </h1>
        <p className="text-muted-foreground">
          View and manage collection access across your organization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            All Collections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Failed to load collections"
              message="We couldn't load the collections. Please try again."
              onRetry={() => refetch()}
            />
          ) : collections.length === 0 && page === 1 ? (
            <div className="text-center py-12">
              <FolderOpen className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No collections</h3>
              <p className="text-muted-foreground">
                No collections exist in this tenant yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm normal-case tracking-normal">Collection</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal">Documents</TableHead>
                      <TableHead className="text-sm normal-case tracking-normal hidden md:table-cell">
                        Your Permission
                      </TableHead>
                      <TableHead className="w-[120px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collections.map((col) => (
                      <TableRow key={col.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/collections/${col.id}`}
                            className="hover:underline"
                          >
                            {col.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {getCollectionDocumentCount(col)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {col.user_permission ? (
                            <Badge variant="outline" className="capitalize">
                              {col.user_permission}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/collections/${col.id}/settings`}>
                              <ExternalLink />
                              Manage
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
