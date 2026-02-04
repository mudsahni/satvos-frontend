"use client";

import {
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  ShieldCheck,
  User,
  Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Document } from "@/types/document";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface HistoryTabProps {
  document: Document;
}

interface TimelineEvent {
  id: string;
  type: "created" | "parsed" | "validated" | "reviewed";
  status: "success" | "warning" | "error" | "pending" | "info";
  title: string;
  description?: string;
  timestamp?: string;
  user?: string;
}

export function HistoryTab({ document }: HistoryTabProps) {
  // Build timeline from document status
  const events: TimelineEvent[] = [];

  // Created event
  events.push({
    id: "created",
    type: "created",
    status: "info",
    title: "Document Created",
    description: `Document "${document.name}" was uploaded`,
    timestamp: document.created_at,
    user: document.created_by,
  });

  // Parsing event
  if (document.parsing_status === "completed") {
    events.push({
      id: "parsed",
      type: "parsed",
      status: "success",
      title: "Parsing Completed",
      description: "Document was successfully parsed and data extracted",
      timestamp: document.parsed_at,
    });
  } else if (document.parsing_status === "failed") {
    events.push({
      id: "parsed",
      type: "parsed",
      status: "error",
      title: "Parsing Failed",
      description: "Failed to extract data from document",
      timestamp: document.parsed_at,
    });
  } else if (document.parsing_status === "processing") {
    events.push({
      id: "parsed",
      type: "parsed",
      status: "pending",
      title: "Parsing in Progress",
      description: "Document is being processed",
    });
  }

  // Validation event
  if (document.parsing_status === "completed") {
    if (document.validation_status === "valid") {
      events.push({
        id: "validated",
        type: "validated",
        status: "success",
        title: "Validation Passed",
        description: "All validation rules passed",
        timestamp: document.validated_at,
      });
    } else if (document.validation_status === "invalid") {
      events.push({
        id: "validated",
        type: "validated",
        status: "error",
        title: "Validation Failed",
        description: "Document has validation errors",
        timestamp: document.validated_at,
      });
    } else if (document.validation_status === "warning") {
      events.push({
        id: "validated",
        type: "validated",
        status: "warning",
        title: "Validation Warnings",
        description: "Document has validation warnings",
        timestamp: document.validated_at,
      });
    }
  }

  // Review event
  if (document.review_status === "approved") {
    events.push({
      id: "reviewed",
      type: "reviewed",
      status: "success",
      title: "Document Approved",
      description: document.reviewer_notes || "Document was approved for processing",
      timestamp: document.reviewed_at,
      user: document.reviewed_by ?? undefined,
    });
  } else if (document.review_status === "rejected") {
    events.push({
      id: "reviewed",
      type: "reviewed",
      status: "error",
      title: "Document Rejected",
      description: document.reviewer_notes || "Document was rejected",
      timestamp: document.reviewed_at,
      user: document.reviewed_by ?? undefined,
    });
  }

  // Sort by timestamp (most recent first)
  const sortedEvents = events
    .filter((e) => e.timestamp)
    .sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  // Add pending events at the end
  const pendingEvents = events.filter((e) => !e.timestamp);
  const allEvents = [...sortedEvents, ...pendingEvents];

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case "created":
        return <Upload className="h-4 w-4" />;
      case "parsed":
        return <FileText className="h-4 w-4" />;
      case "validated":
        return <ShieldCheck className="h-4 w-4" />;
      case "reviewed":
        return event.status === "success" ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        );
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: TimelineEvent["status"]) => {
    switch (status) {
      case "success":
        return "bg-success/10 text-success border-success/30";
      case "warning":
        return "bg-warning/10 text-warning border-warning/30";
      case "error":
        return "bg-error/10 text-error border-error/30";
      case "pending":
        return "bg-primary/10 text-primary border-primary/30 animate-pulse";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (allEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No history</h3>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Document history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Document Timeline</h3>
      <div className="relative">
        {/* Timeline line — centered on 40px icon circles (left edge 0 + 20px center) */}
        <div className="absolute left-5 top-5 bottom-5 w-px bg-border" />

        {/* Events */}
        <div className="space-y-6">
          {allEvents.map((event) => (
            <div key={event.id} className="relative flex gap-4">
              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                  getStatusColor(event.status)
                )}
              >
                {getEventIcon(event)}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{event.title}</span>
                  {event.status === "pending" && (
                    <Badge variant="secondary" className="text-xs">
                      In Progress
                    </Badge>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {event.timestamp && (
                    <span title={formatDate(event.timestamp)}>
                      {formatRelativeTime(event.timestamp)}
                    </span>
                  )}
                  {event.user && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {event.user}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
