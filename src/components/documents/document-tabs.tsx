"use client";

import { useState } from "react";
import { FileText, ShieldCheck, History, Loader2, Code, Pencil, CheckCircle, X } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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
import { Document, StructuredInvoiceData } from "@/types/document";
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
}

export function DocumentTabs({
  document,
  validationResults,
  parsingStatus,
  onRevalidate,
  isRevalidating,
  onSaveEdits,
  isSaving,
}: DocumentTabsProps) {
  const [activeTab, setActiveTab] = useState("data");
  const [showRawData, setShowRawData] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [pendingTabSwitch, setPendingTabSwitch] = useState<string | null>(null);

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

  const handleFieldChange = (fieldPath: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [fieldPath]: value }));
  };

  const handleSave = async () => {
    if (!structuredData || !onSaveEdits) return;
    const updated = applyEditsToStructuredData(structuredData, editedValues);
    await onSaveEdits(updated);
    setIsEditing(false);
    setEditedValues({});
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
        <div className="shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <TabsList className="w-full justify-start h-12 bg-transparent p-0 rounded-none">
            <TabsTrigger
              value="data"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4"
            >
              <FileText className="mr-2 h-4 w-4" />
              Extracted Data
            </TabsTrigger>
            <TabsTrigger
              value="validation"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Validations
              {(errorCount > 0 || warningCount > 0) && (
                <span
                  className={cn(
                    "ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-medium rounded-full",
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
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-4"
            >
              <History className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="data" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {hasData ? (
                <>
                  <div className="flex justify-end gap-2 mb-4">
                    {isEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          <X className="mt-0.5 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving || Object.keys(editedValues).length === 0}
                        >
                          {isSaving ? (
                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-1.5 h-4 w-4" />
                          )}
                          {isSaving ? "Saving..." : "Save Changes"}
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
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No parsed data</h3>
                  <p className="mt-1 text-center text-sm text-muted-foreground max-w-sm">
                    {parsingStatus === "failed"
                      ? "Parsing failed. Try re-parsing the document."
                      : parsingStatus === "completed"
                      ? "Parsing completed but no data was extracted."
                      : "Document has not been parsed yet."}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="validation" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
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
              <HistoryTab document={document} />
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
