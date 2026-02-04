"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ParsedInvoice, FieldWithConfidence } from "@/types/document";
import { ValidationResult, getFieldValidationStatus } from "@/types/validation";
import { formatCurrency, formatPercentage } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, HelpCircle } from "lucide-react";

interface ParsedDataViewerProps {
  data: ParsedInvoice;
  validationResults: ValidationResult[];
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "text-success";
  if (confidence >= 0.5) return "text-warning";
  return "text-error";
}

function FieldStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "valid":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case "invalid":
      return <XCircle className="h-4 w-4 text-error" />;
    default:
      return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

interface FieldDisplayProps {
  label: string;
  field: FieldWithConfidence<unknown> | undefined;
  fieldPath: string;
  validationResults: ValidationResult[];
  format?: "currency" | "percentage" | "text";
}

function FieldDisplay({
  label,
  field,
  fieldPath,
  validationResults,
  format = "text",
}: FieldDisplayProps) {
  if (!field) return null;

  const status = getFieldValidationStatus(validationResults, fieldPath);

  let displayValue = field.value;
  if (format === "currency" && typeof field.value === "number") {
    displayValue = formatCurrency(field.value);
  } else if (format === "percentage" && typeof field.value === "number") {
    displayValue = formatPercentage(field.value);
  }

  return (
    <div className="flex items-start justify-between py-2 border-b last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Tooltip>
            <TooltipTrigger>
              <FieldStatusIcon status={status.status} />
            </TooltipTrigger>
            <TooltipContent>
              {status.messages.length > 0
                ? status.messages.join(", ")
                : status.status === "valid"
                ? "All validations passed"
                : "No validation rules for this field"}
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="font-medium">{String(displayValue)}</p>
      </div>
      <div className="text-right">
        <Tooltip>
          <TooltipTrigger>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                getConfidenceColor(field.confidence)
              )}
            >
              {formatPercentage(field.confidence)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            Confidence score: {formatPercentage(field.confidence)}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export function ParsedDataViewer({
  data,
  validationResults,
}: ParsedDataViewerProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={["invoice", "seller", "buyer", "totals"]}
      className="space-y-4"
    >
      {/* Invoice Details */}
      <AccordionItem value="invoice" className="border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="font-semibold">Invoice Details</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <FieldDisplay
            label="Invoice Number"
            field={data.invoice?.invoice_number}
            fieldPath="invoice.invoice_number"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="Invoice Date"
            field={data.invoice?.invoice_date}
            fieldPath="invoice.invoice_date"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="Due Date"
            field={data.invoice?.due_date}
            fieldPath="invoice.due_date"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="Invoice Type"
            field={data.invoice?.invoice_type}
            fieldPath="invoice.invoice_type"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="Place of Supply"
            field={data.invoice?.place_of_supply}
            fieldPath="invoice.place_of_supply"
            validationResults={validationResults}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Seller Details */}
      <AccordionItem value="seller" className="border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="font-semibold">Seller Details</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <FieldDisplay
            label="Name"
            field={data.seller?.name}
            fieldPath="seller.name"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="GSTIN"
            field={data.seller?.gstin}
            fieldPath="seller.gstin"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="PAN"
            field={data.seller?.pan}
            fieldPath="seller.pan"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="Address"
            field={data.seller?.address}
            fieldPath="seller.address"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="City"
            field={data.seller?.city}
            fieldPath="seller.city"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="State"
            field={data.seller?.state}
            fieldPath="seller.state"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="State Code"
            field={data.seller?.state_code}
            fieldPath="seller.state_code"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="Pincode"
            field={data.seller?.pincode}
            fieldPath="seller.pincode"
            validationResults={validationResults}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Buyer Details */}
      <AccordionItem value="buyer" className="border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="font-semibold">Buyer Details</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <FieldDisplay
            label="Name"
            field={data.buyer?.name}
            fieldPath="buyer.name"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="GSTIN"
            field={data.buyer?.gstin}
            fieldPath="buyer.gstin"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="PAN"
            field={data.buyer?.pan}
            fieldPath="buyer.pan"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="Address"
            field={data.buyer?.address}
            fieldPath="buyer.address"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="City"
            field={data.buyer?.city}
            fieldPath="buyer.city"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="State"
            field={data.buyer?.state}
            fieldPath="buyer.state"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="State Code"
            field={data.buyer?.state_code}
            fieldPath="buyer.state_code"
            validationResults={validationResults}
          />
          <FieldDisplay
            label="Pincode"
            field={data.buyer?.pincode}
            fieldPath="buyer.pincode"
            validationResults={validationResults}
          />
        </AccordionContent>
      </AccordionItem>

      {/* Line Items */}
      {data.line_items && data.line_items.length > 0 && (
        <AccordionItem value="line-items" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="font-semibold">
              Line Items ({data.line_items.length})
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Description</TableHead>
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
                      (item.cgst_amount?.value || 0) +
                      (item.sgst_amount?.value || 0) +
                      (item.igst_amount?.value || 0);
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          {item.serial_number?.value || index + 1}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {item.description?.value || "-"}
                        </TableCell>
                        <TableCell>{item.hsn_sac?.value || "-"}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity?.value || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unit_price?.value
                            ? formatCurrency(item.unit_price.value)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.taxable_value?.value
                            ? formatCurrency(item.taxable_value.value)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {taxAmount > 0 ? formatCurrency(taxAmount) : "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.total?.value
                            ? formatCurrency(item.total.value)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Totals */}
      <AccordionItem value="totals" className="border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <span className="font-semibold">Totals</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <FieldDisplay
            label="Subtotal"
            field={data.totals?.subtotal}
            fieldPath="totals.subtotal"
            validationResults={validationResults}
            format="currency"
          />
          <FieldDisplay
            label="Total Discount"
            field={data.totals?.total_discount}
            fieldPath="totals.total_discount"
            validationResults={validationResults}
            format="currency"
          />
          <FieldDisplay
            label="Total Taxable Value"
            field={data.totals?.total_taxable_value}
            fieldPath="totals.total_taxable_value"
            validationResults={validationResults}
            format="currency"
          />
          <FieldDisplay
            label="CGST"
            field={data.totals?.total_cgst}
            fieldPath="totals.total_cgst"
            validationResults={validationResults}
            format="currency"
          />
          <FieldDisplay
            label="SGST"
            field={data.totals?.total_sgst}
            fieldPath="totals.total_sgst"
            validationResults={validationResults}
            format="currency"
          />
          <FieldDisplay
            label="IGST"
            field={data.totals?.total_igst}
            fieldPath="totals.total_igst"
            validationResults={validationResults}
            format="currency"
          />
          <FieldDisplay
            label="Total Tax"
            field={data.totals?.total_tax}
            fieldPath="totals.total_tax"
            validationResults={validationResults}
            format="currency"
          />
          <FieldDisplay
            label="Round Off"
            field={data.totals?.round_off}
            fieldPath="totals.round_off"
            validationResults={validationResults}
            format="currency"
          />
          <div className="mt-4 pt-4 border-t">
            <FieldDisplay
              label="Grand Total"
              field={data.totals?.grand_total}
              fieldPath="totals.grand_total"
              validationResults={validationResults}
              format="currency"
            />
          </div>
          {data.totals?.amount_in_words && (
            <div className="mt-2 text-sm text-muted-foreground">
              {data.totals.amount_in_words.value}
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Payment Details */}
      {data.payment && (
        <AccordionItem value="payment" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="font-semibold">Payment Details</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <FieldDisplay
              label="Bank Name"
              field={data.payment.bank_name}
              fieldPath="payment.bank_name"
              validationResults={validationResults}
            />
            <FieldDisplay
              label="Account Number"
              field={data.payment.account_number}
              fieldPath="payment.account_number"
              validationResults={validationResults}
            />
            <FieldDisplay
              label="IFSC Code"
              field={data.payment.ifsc_code}
              fieldPath="payment.ifsc_code"
              validationResults={validationResults}
            />
            <FieldDisplay
              label="Branch"
              field={data.payment.branch}
              fieldPath="payment.branch"
              validationResults={validationResults}
            />
            <FieldDisplay
              label="UPI ID"
              field={data.payment.upi_id}
              fieldPath="payment.upi_id"
              validationResults={validationResults}
            />
            <FieldDisplay
              label="Payment Terms"
              field={data.payment.payment_terms}
              fieldPath="payment.payment_terms"
              validationResults={validationResults}
            />
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
