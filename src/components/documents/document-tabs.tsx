"use client";

import { useState, useEffect } from "react";
import { FileText, ShieldCheck, History, Loader2, Code, Pencil, CheckCircle, AlertCircle, RefreshCw, X, Tag, Plus } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { StructuredDataViewer } from "@/components/documents/structured-data-viewer";
import { ValidationTab } from "@/components/documents/validation-tab";
import { HistoryTab } from "@/components/documents/history-tab";
import { Document, DocumentTag, StructuredInvoiceData } from "@/types/document";
import { ValidationResult } from "@/types/validation";
import { cn } from "@/lib/utils";
import { applyEditsToStructuredData } from "@/lib/utils/structured-data";

interface DocumentTabsProps {
  document: Document;
  validationResults: ValidationResult[];
  parsingStatus: string;
  onRevalidate?: () => void;
  isRevalidating?: boolean;
  onSaveEdits?: (data: StructuredInvoiceData) => Promise<void>;
  isSaving?: boolean;
  tags?: DocumentTag[];
  onAddTag?: (key: string, value: string) => Promise<void>;
  isAddingTag?: boolean;
  onDeleteTag?: (tagId: string) => Promise<void>;
  onReparse?: () => void;
  isReparsing?: boolean;
}

export function DocumentTabs({
  document,
  validationResults,
  parsingStatus,
  onRevalidate,
  isRevalidating,
  onSaveEdits,
  isSaving,
  tags,
  onAddTag,
  isAddingTag,
  onDeleteTag,
  onReparse,
  isReparsing,
}: DocumentTabsProps) {
  const [activeTab, setActiveTab] = useState("data");
  const [showRawData, setShowRawData] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [pendingTabSwitch, setPendingTabSwitch] = useState<string | null>(null);
  const [showAddTagDialog, setShowAddTagDialog] = useState(false);
  const [newTagKey, setNewTagKey] = useState("");
  const [newTagValue, setNewTagValue] = useState("");

  // Use structured_data from the API response
  const structuredData = document.structured_data;
  const confidenceScores = document.confidence_scores;

  // Calculate validation counts for tab badges
  const errorCount = validationResults.filter(
    (r) => !r.passed && r.reconciliation_critical
  ).length;
  const warningCount = validationResults.filter(
    (r) => !r.passed && !r.reconciliation_critical
  ).length;

  const hasData = structuredData && Object.keys(structuredData).length > 0;
  const hasUnsavedChanges = isEditing && Object.keys(editedValues).length > 0;
  const canEdit = hasData && parsingStatus === "completed";

  // Warn before closing tab/navigating away with unsaved edits
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const handleFieldChange = (fieldPath: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [fieldPath]: value }));
  };

  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const savingInProgress = isSaving || isSavingLocal;

  const handleSave = async () => {
    if (!structuredData || !onSaveEdits) return;
    setIsSavingLocal(true);
    try {
      const updated = applyEditsToStructuredData(structuredData, editedValues);
      await onSaveEdits(updated);
      setIsEditing(false);
      setEditedValues({});
    } finally {
      setIsSavingLocal(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowDiscardDialog(true);
    } else {
      setIsEditing(false);
      setEditedValues({});
    }
  };

  const handleConfirmDiscard = () => {
    setIsEditing(false);
    setEditedValues({});
    setShowDiscardDialog(false);
    if (pendingTabSwitch) {
      setActiveTab(pendingTabSwitch);
      setPendingTabSwitch(null);
    }
  };

  const handleAddTagSubmit = async () => {
    if (!newTagKey.trim() || !newTagValue.trim() || !onAddTag) return;
    await onAddTag(newTagKey.trim(), newTagValue.trim());
    setNewTagKey("");
    setNewTagValue("");
    setShowAddTagDialog(false);
  };

  const handleTabChange = (tab: string) => {
    if (hasUnsavedChanges && tab !== "data") {
      setPendingTabSwitch(tab);
      setShowDiscardDialog(true);
      return;
    }
    setActiveTab(tab);
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
        <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-x-auto">
          <TabsList className="w-full justify-start h-12 bg-transparent p-0 rounded-none">
            <TabsTrigger
              value="data"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-3 md:px-4"
            >
              <FileText className="mr-1.5 md:mr-2 h-4 w-4" />
              Extracted Data
              {parsingStatus === "processing" && (
                <Loader2 className="ml-1.5 md:ml-2 h-3.5 w-3.5 animate-spin text-primary" />
              )}
              {parsingStatus === "completed" && hasData && (
                <CheckCircle className="ml-1.5 md:ml-2 h-3.5 w-3.5 text-success" />
              )}
              {parsingStatus === "failed" && (
                <AlertCircle className="ml-1.5 md:ml-2 h-3.5 w-3.5 text-error" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="validation"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-3 md:px-4"
            >
              <ShieldCheck className="mr-1.5 md:mr-2 h-4 w-4" />
              Validations
              {(errorCount > 0 || warningCount > 0) && (
                <span
                  className={cn(
                    "ml-1.5 md:ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium rounded-full",
                    errorCount > 0
                      ? "bg-error-bg text-error"
                      : "bg-warning-bg text-warning"
                  )}
                >
                  {errorCount > 0 ? errorCount : warningCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-3 md:px-4"
            >
              <History className="mr-1.5 md:mr-2 h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="data" className="flex-1 m-0 overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden">
            {/* Inline tag pills */}
            {(tags && tags.length > 0 || onAddTag) && (
              <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-3 border-b border-border/50">
                <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {tags && tags.length > 0 ? (
                  tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs"
                    >
                      <span className="font-medium">{tag.key}:</span>
                      <span className="text-muted-foreground">{tag.value}</span>
                      {tag.source === "user" && onDeleteTag && (
                        <button
                          onClick={() => onDeleteTag(tag.id)}
                          className="ml-0.5 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label={`Delete tag ${tag.key}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No tags</span>
                )}
                {onAddTag && (
                  <Dialog open={showAddTagDialog} onOpenChange={setShowAddTagDialog}>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                        <Plus className="h-3 w-3" />
                        Add
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Tag</DialogTitle>
                        <DialogDescription>
                          Add a custom tag to this document for organization.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="tag-key">Key</Label>
                          <Input
                            id="tag-key"
                            placeholder="e.g., vendor, project"
                            value={newTagKey}
                            onChange={(e) => setNewTagKey(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tag-value">Value</Label>
                          <Input
                            id="tag-value"
                            placeholder="e.g., Acme Corp, Q4 2024"
                            value={newTagValue}
                            onChange={(e) => setNewTagValue(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleAddTagSubmit}
                          disabled={
                            !newTagKey.trim() ||
                            !newTagValue.trim() ||
                            isAddingTag
                          }
                        >
                          {isAddingTag && (
                            <Loader2 className="animate-spin" />
                          )}
                          Add Tag
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}

            <div className="p-4">
              {hasData ? (
                <>
                  <div className="flex justify-end gap-2 mb-5">
                    {isEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancel}
                          disabled={savingInProgress}
                        >
                          <X className="mt-0.5 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={savingInProgress || Object.keys(editedValues).length === 0}
                        >
                          {savingInProgress ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <CheckCircle />
                          )}
                          {savingInProgress ? "Saving..." : "Save Changes"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRawData(!showRawData)}
                        >

                          <Code className="h-4 w-4 shrink-0 align-middle mt-0.5" />
                          {showRawData ? "Structured View" : "Raw JSON"}
                        </Button>
                        {canEdit && onSaveEdits && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowRawData(false);
                              setIsEditing(true);
                            }}
                          >
                            <Pencil className="h-4 w-5" />
                            Edit
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  {showRawData && !isEditing ? (
                    <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs max-h-[70vh]">
                      {JSON.stringify({ structured_data: structuredData, confidence_scores: confidenceScores }, null, 2)}
                    </pre>
                  ) : (
                    <StructuredDataViewer
                      data={structuredData}
                      confidenceScores={confidenceScores}
                      validationResults={validationResults}
                      isEditing={isEditing}
                      editedValues={editedValues}
                      onFieldChange={handleFieldChange}
                    />
                  )}
                </>
              ) : parsingStatus === "processing" ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Processing Document</h3>
                  <p className="mt-1 text-center text-sm text-muted-foreground max-w-sm">
                    The document is being analyzed and extracted. This may take a moment.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full",
                    parsingStatus === "failed" ? "bg-error/10" : "bg-muted"
                  )}>
                    {parsingStatus === "failed" ? (
                      <AlertCircle className="h-8 w-8 text-error" />
                    ) : (
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    {parsingStatus === "failed" ? "Parsing failed" : "No parsed data"}
                  </h3>
                  <p className="mt-1 text-center text-sm text-muted-foreground max-w-sm">
                    {parsingStatus === "failed"
                      ? "Something went wrong while parsing this document."
                      : parsingStatus === "completed"
                      ? "Parsing completed but no data was extracted."
                      : "Document has not been parsed yet."}
                  </p>
                  {parsingStatus === "failed" && onReparse && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={onReparse}
                      disabled={isReparsing}
                    >
                      {isReparsing ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <RefreshCw />
                      )}
                      {isReparsing ? "Re-Parsing..." : "Retry Parsing"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="validation" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 overflow-x-hidden">
              <ValidationTab
                validationResults={validationResults}
                onRevalidate={onRevalidate}
                isRevalidating={isRevalidating}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              <HistoryTab documentId={document.id} />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Unsaved changes confirmation dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits. If you leave now, your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTabSwitch(null)}>
              Keep Editing
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
