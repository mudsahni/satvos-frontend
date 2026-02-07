"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Building2,
  User,
  FileText,
  Receipt,
  CreditCard,
  Package,
  StickyNote,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  StructuredInvoiceData,
  ConfidenceScores,
} from "@/types/document";
import { ValidationResult } from "@/types/validation";

interface StructuredDataViewerProps {
  data: StructuredInvoiceData;
  confidenceScores?: ConfidenceScores;
  validationResults?: ValidationResult[];
  isEditing?: boolean;
  editedValues?: Record<string, string>;
  onFieldChange?: (fieldPath: string, value: string) => void;
}

// Helper to format currency
function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

// Helper to get confidence badge color
function getConfidenceVariant(confidence: number): "success" | "warning" | "error" | "secondary" {
  if (confidence >= 0.9) return "success";
  if (confidence >= 0.7) return "warning";
  if (confidence > 0) return "error";
  return "secondary";
}

// Helper to get field validation status
function getFieldValidationStatus(
  validationResults: ValidationResult[] | undefined,
  fieldPath: string
): { status: "valid" | "warning" | "error" | "none"; messages: string[] } {
  if (!validationResults) return { status: "none", messages: [] };

  const fieldResults = validationResults.filter((r) =>
    r.field_path?.includes(fieldPath)
  );

  if (fieldResults.length === 0) return { status: "none", messages: [] };

  const failed = fieldResults.filter((r) => !r.passed);
  if (failed.length === 0) return { status: "valid", messages: [] };

  const hasError = failed.some((r) => r.reconciliation_critical);
  return {
    status: hasError ? "error" : "warning",
    messages: failed.map((r) => r.message),
  };
}

// Field display component
function DataField({
  label,
  value,
  confidence,
  fieldPath,
  validationResults,
  format = "text",
  isEditing,
  editedValues,
  onFieldChange,
}: {
  label: string;
  value: string | number | boolean | undefined | null;
  confidence?: number;
  fieldPath?: string;
  validationResults?: ValidationResult[];
  format?: "text" | "currency" | "date" | "boolean";
  isEditing?: boolean;
  editedValues?: Record<string, string>;
  onFieldChange?: (fieldPath: string, value: string) => void;
}) {
  // In read mode, hide empty fields
  if (!isEditing && (value === undefined || value === null || value === "")) {
    return null;
  }

  const validationStatus = fieldPath
    ? getFieldValidationStatus(validationResults, fieldPath)
    : { status: "none" as const, messages: [] };

  // Determine the display/edit value
  const editValue = fieldPath && editedValues?.[fieldPath] !== undefined
    ? editedValues[fieldPath]
    : String(value ?? "");

  let displayValue: string;
  if (format === "currency" && typeof value === "number") {
    displayValue = formatCurrency(value);
  } else if (format === "boolean") {
    displayValue = value ? "Yes" : "No";
  } else {
    displayValue = String(value ?? "");
  }

  if (isEditing && fieldPath && onFieldChange) {
    // Edit mode rendering
    if (format === "boolean") {
      const currentBoolValue = editedValues?.[fieldPath] !== undefined
        ? editedValues[fieldPath]
        : String(value ?? "false");

      return (
        <div className="py-2.5 border-b border-border/50 last:border-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
          <Select
            value={currentBoolValue}
            onValueChange={(val) => onFieldChange(fieldPath, val)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    const inputType = format === "currency" ? "number" : "text";
    const step = format === "currency" ? "0.01" : undefined;

    return (
      <div className="py-2.5 border-b border-border/50 last:border-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          {validationStatus.status !== "none" && (
            <span title={validationStatus.messages.join("; ")}>
              {validationStatus.status === "valid" && (
                <CheckCircle className="h-3.5 w-3.5 text-success" />
              )}
              {validationStatus.status === "warning" && (
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              )}
              {validationStatus.status === "error" && (
                <XCircle className="h-3.5 w-3.5 text-error" />
              )}
            </span>
          )}
        </div>
        <Input
          type={inputType}
          step={step}
          value={editValue}
          onChange={(e) => onFieldChange(fieldPath, e.target.value)}
          className="h-8 text-sm"
          placeholder={label}
        />
      </div>
    );
  }

  // Read mode rendering
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          {validationStatus.status !== "none" && (
            <span title={validationStatus.messages.join("; ")}>
              {validationStatus.status === "valid" && (
                <CheckCircle className="h-3.5 w-3.5 text-success" />
              )}
              {validationStatus.status === "warning" && (
                <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              )}
              {validationStatus.status === "error" && (
                <XCircle className="h-3.5 w-3.5 text-error" />
              )}
            </span>
          )}
        </div>
        <p className="font-medium text-foreground mt-0.5 break-words">{displayValue}</p>
      </div>
      {confidence !== undefined && confidence > 0 && (
        <Badge
          variant={getConfidenceVariant(confidence)}
          className="ml-2 shrink-0 text-xs"
        >
          {Math.round(confidence * 100)}%
        </Badge>
      )}
    </div>
  );
}

// Section component with collapsible
function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
  badge,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border bg-card">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <span className="font-semibold">{title}</span>
            {badge}
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t px-4 pt-3 pb-4">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function StructuredDataViewer({
  data,
  confidenceScores,
  validationResults,
  isEditing = false,
  editedValues = {},
  onFieldChange,
}: StructuredDataViewerProps) {
  const getConfidence = (section: string, field: string): number | undefined => {
    if (!confidenceScores) return undefined;
    const sectionScores = confidenceScores[section as keyof ConfidenceScores];
    if (!sectionScores || typeof sectionScores !== "object") return undefined;
    return (sectionScores as Record<string, number>)[field];
  };

  const getLineItemConfidence = (index: number, field: string): number | undefined => {
    if (!confidenceScores?.line_items?.[index]) return undefined;
    return confidenceScores.line_items[index][field];
  };

  const editProps = {
    isEditing,
    editedValues,
    onFieldChange,
  };

  return (
    <div className="space-y-5">
      {/* Invoice Details */}
      <Section title="Invoice Details" icon={FileText}>
        <div className="grid gap-x-6 sm:grid-cols-2">
          <DataField
            label="Invoice Number"
            value={data.invoice.invoice_number}
            confidence={getConfidence("invoice", "invoice_number")}
            fieldPath="invoice.invoice_number"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="Invoice Date"
            value={data.invoice.invoice_date}
            confidence={getConfidence("invoice", "invoice_date")}
            fieldPath="invoice.invoice_date"
            format="date"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="Due Date"
            value={data.invoice.due_date}
            confidence={getConfidence("invoice", "due_date")}
            fieldPath="invoice.due_date"
            format="date"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="Invoice Type"
            value={data.invoice.invoice_type}
            confidence={getConfidence("invoice", "invoice_type")}
            fieldPath="invoice.invoice_type"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="Currency"
            value={data.invoice.currency}
            confidence={getConfidence("invoice", "currency")}
            fieldPath="invoice.currency"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="Place of Supply"
            value={data.invoice.place_of_supply}
            confidence={getConfidence("invoice", "place_of_supply")}
            fieldPath="invoice.place_of_supply"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="Reverse Charge"
            value={data.invoice.reverse_charge}
            confidence={getConfidence("invoice", "reverse_charge")}
            fieldPath="invoice.reverse_charge"
            format="boolean"
            validationResults={validationResults}
            {...editProps}
          />
        </div>
      </Section>

      {/* Seller Details */}
      <Section title="Seller Details" icon={Building2}>
        <div className="grid gap-x-6 sm:grid-cols-2">
          <DataField
            label="Name"
            value={data.seller.name}
            confidence={getConfidence("seller", "name")}
            fieldPath="seller.name"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="GSTIN"
            value={data.seller.gstin}
            confidence={getConfidence("seller", "gstin")}
            fieldPath="seller.gstin"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="PAN"
            value={data.seller.pan}
            confidence={getConfidence("seller", "pan")}
            fieldPath="seller.pan"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="State"
            value={data.seller.state}
            confidence={getConfidence("seller", "state")}
            fieldPath="seller.state"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="State Code"
            value={data.seller.state_code}
            confidence={getConfidence("seller", "state_code")}
            fieldPath="seller.state_code"
            validationResults={validationResults}
            {...editProps}
          />
          <div className="sm:col-span-2">
            <DataField
              label="Address"
              value={data.seller.address}
              confidence={getConfidence("seller", "address")}
              fieldPath="seller.address"
              validationResults={validationResults}
              {...editProps}
            />
          </div>
        </div>
      </Section>

      {/* Buyer Details */}
      <Section title="Buyer Details" icon={User}>
        <div className="grid gap-x-6 sm:grid-cols-2">
          <DataField
            label="Name"
            value={data.buyer.name}
            confidence={getConfidence("buyer", "name")}
            fieldPath="buyer.name"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="GSTIN"
            value={data.buyer.gstin}
            confidence={getConfidence("buyer", "gstin")}
            fieldPath="buyer.gstin"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="PAN"
            value={data.buyer.pan}
            confidence={getConfidence("buyer", "pan")}
            fieldPath="buyer.pan"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="State"
            value={data.buyer.state}
            confidence={getConfidence("buyer", "state")}
            fieldPath="buyer.state"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="State Code"
            value={data.buyer.state_code}
            confidence={getConfidence("buyer", "state_code")}
            fieldPath="buyer.state_code"
            validationResults={validationResults}
            {...editProps}
          />
          <div className="sm:col-span-2">
            <DataField
              label="Address"
              value={data.buyer.address}
              confidence={getConfidence("buyer", "address")}
              fieldPath="buyer.address"
              validationResults={validationResults}
              {...editProps}
            />
          </div>
        </div>
      </Section>

      {/* Line Items */}
      {(data.line_items && data.line_items.length > 0) && (
        <Section
          title="Line Items"
          icon={Package}
          badge={
            <Badge variant="secondary" className="ml-2">
              {data.line_items.length} item{data.line_items.length !== 1 ? "s" : ""}
            </Badge>
          }
        >
          <div className="overflow-x-auto -mx-4 px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Description</TableHead>
                  <TableHead>HSN/SAC</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Taxable</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.line_items.map((item, index) => {
                  const taxAmount =
                    (item.cgst_amount || 0) +
                    (item.sgst_amount || 0) +
                    (item.igst_amount || 0);

                  const taxRates = [
                    item.cgst_rate && `CGST ${item.cgst_rate}%`,
                    item.sgst_rate && `SGST ${item.sgst_rate}%`,
                    item.igst_rate && `IGST ${item.igst_rate}%`,
                  ].filter(Boolean).join(", ");

                  if (isEditing && onFieldChange) {
                    const getVal = (field: string, original: string | number | undefined) => {
                      const path = `line_items.${index}.${field}`;
                      return editedValues[path] !== undefined
                        ? editedValues[path]
                        : String(original ?? "");
                    };

                    const handleChange = (field: string, val: string) => {
                      onFieldChange(`line_items.${index}.${field}`, val);
                    };

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            type="text"
                            value={getVal("description", item.description)}
                            onChange={(e) => handleChange("description", e.target.value)}
                            className="h-7 text-sm min-w-[180px]"
                            placeholder="Description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={getVal("hsn_sac_code", item.hsn_sac_code)}
                            onChange={(e) => handleChange("hsn_sac_code", e.target.value)}
                            className="h-7 text-sm w-24"
                            placeholder="HSN"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            value={getVal("quantity", item.quantity)}
                            onChange={(e) => handleChange("quantity", e.target.value)}
                            className="h-7 text-sm w-20 text-right"
                            placeholder="Qty"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            value={getVal("unit_price", item.unit_price)}
                            onChange={(e) => handleChange("unit_price", e.target.value)}
                            className="h-7 text-sm w-24 text-right"
                            placeholder="Rate"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            value={getVal("taxable_amount", item.taxable_amount)}
                            onChange={(e) => handleChange("taxable_amount", e.target.value)}
                            className="h-7 text-sm w-24 text-right"
                            placeholder="Taxable"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            value={getVal("igst_amount", item.igst_amount)}
                            onChange={(e) => handleChange("igst_amount", e.target.value)}
                            className="h-7 text-sm w-24 text-right"
                            placeholder="Tax"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="0.01"
                            value={getVal("total", item.total)}
                            onChange={(e) => handleChange("total", e.target.value)}
                            className="h-7 text-sm w-24 text-right"
                            placeholder="Total"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <span className="font-medium">{item.description || "-"}</span>
                          {getLineItemConfidence(index, "description") !== undefined && (
                            <Badge
                              variant={getConfidenceVariant(getLineItemConfidence(index, "description") || 0)}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {Math.round((getLineItemConfidence(index, "description") || 0) * 100)}%
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.hsn_sac_code || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity !== undefined ? (
                          <span>
                            {item.quantity}
                            {item.unit && <span className="text-muted-foreground text-xs ml-1">{item.unit}</span>}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.unit_price !== undefined ? formatCurrency(item.unit_price) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.taxable_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          {taxAmount > 0 ? formatCurrency(taxAmount) : "-"}
                          {taxRates && (
                            <div className="text-xs text-muted-foreground">{taxRates}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Section>
      )}

      {/* Totals */}
      <Section title="Totals" icon={Receipt}>
        <div className="grid gap-x-6 sm:grid-cols-2">
          <DataField
            label="Subtotal"
            value={data.totals.subtotal}
            confidence={getConfidence("totals", "subtotal")}
            fieldPath="totals.subtotal"
            format="currency"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="Total Discount"
            value={data.totals.total_discount}
            confidence={getConfidence("totals", "total_discount")}
            fieldPath="totals.total_discount"
            format="currency"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="Taxable Amount"
            value={data.totals.taxable_amount}
            confidence={getConfidence("totals", "taxable_amount")}
            fieldPath="totals.taxable_amount"
            format="currency"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="CGST"
            value={data.totals.cgst}
            confidence={getConfidence("totals", "cgst")}
            fieldPath="totals.cgst"
            format="currency"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="SGST"
            value={data.totals.sgst}
            confidence={getConfidence("totals", "sgst")}
            fieldPath="totals.sgst"
            format="currency"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="IGST"
            value={data.totals.igst}
            confidence={getConfidence("totals", "igst")}
            fieldPath="totals.igst"
            format="currency"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="CESS"
            value={data.totals.cess}
            confidence={getConfidence("totals", "cess")}
            fieldPath="totals.cess"
            format="currency"
            validationResults={validationResults}
            {...editProps}
          />
          <DataField
            label="Round Off"
            value={data.totals.round_off}
            confidence={getConfidence("totals", "round_off")}
            fieldPath="totals.round_off"
            format="currency"
            validationResults={validationResults}
            {...editProps}
          />
        </div>
        <div className="mt-4 pt-4 border-t">
          {isEditing && onFieldChange ? (
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Grand Total</span>
                <Input
                  type="number"
                  step="0.01"
                  value={
                    editedValues["totals.total"] !== undefined
                      ? editedValues["totals.total"]
                      : String(data.totals.total ?? "")
                  }
                  onChange={(e) => onFieldChange("totals.total", e.target.value)}
                  className="h-9 text-lg font-bold mt-1"
                  placeholder="Grand Total"
                />
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Amount in Words</span>
                <Input
                  type="text"
                  value={
                    editedValues["totals.amount_in_words"] !== undefined
                      ? editedValues["totals.amount_in_words"]
                      : String(data.totals.amount_in_words ?? "")
                  }
                  onChange={(e) => onFieldChange("totals.amount_in_words", e.target.value)}
                  className="h-8 text-sm mt-1"
                  placeholder="Amount in words"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold">Grand Total</span>
                {data.totals.amount_in_words && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {data.totals.amount_in_words}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(data.totals.total)}
                </span>
                {getConfidence("totals", "total") !== undefined && (
                  <Badge
                    variant={getConfidenceVariant(getConfidence("totals", "total") || 0)}
                    className="ml-2"
                  >
                    {Math.round((getConfidence("totals", "total") || 0) * 100)}%
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Payment Details */}
      {(data.payment || isEditing) && (
        <Section title="Payment Details" icon={CreditCard} defaultOpen={isEditing || !!data.payment}>
          <div className="grid gap-x-6 sm:grid-cols-2">
            <DataField
              label="Bank Name"
              value={data.payment?.bank_name}
              confidence={getConfidence("payment", "bank_name")}
              fieldPath="payment.bank_name"
              validationResults={validationResults}
              {...editProps}
            />
            <DataField
              label="Account Number"
              value={data.payment?.account_number}
              confidence={getConfidence("payment", "account_number")}
              fieldPath="payment.account_number"
              validationResults={validationResults}
              {...editProps}
            />
            <DataField
              label="IFSC Code"
              value={data.payment?.ifsc_code}
              confidence={getConfidence("payment", "ifsc_code")}
              fieldPath="payment.ifsc_code"
              validationResults={validationResults}
              {...editProps}
            />
            <DataField
              label="Branch"
              value={data.payment?.branch}
              confidence={getConfidence("payment", "branch")}
              fieldPath="payment.branch"
              validationResults={validationResults}
              {...editProps}
            />
            <div className="sm:col-span-2">
              <DataField
                label="Payment Terms"
                value={data.payment?.payment_terms}
                confidence={getConfidence("payment", "payment_terms")}
                fieldPath="payment.payment_terms"
                validationResults={validationResults}
                {...editProps}
              />
            </div>
          </div>
        </Section>
      )}

      {/* Notes */}
      {(data.notes || isEditing) && (
        <Section title="Notes" icon={StickyNote} defaultOpen={isEditing || !!data.notes}>
          {isEditing && onFieldChange ? (
            <Textarea
              value={
                editedValues["notes"] !== undefined
                  ? editedValues["notes"]
                  : String(data.notes ?? "")
              }
              onChange={(e) => onFieldChange("notes", e.target.value)}
              className="text-sm min-h-[80px] mt-2"
              placeholder="Add notes..."
            />
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap py-2">
              {data.notes}
            </p>
          )}
        </Section>
      )}
    </div>
  );
}
