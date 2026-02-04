"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EnhancedField } from "./enhanced-field";
import { ParsedInvoice } from "@/types/document";
import { ValidationResult, getValidationSummary } from "@/types/validation";
import { formatCurrency } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  FileText,
  Building2,
  Users,
  ShoppingCart,
  Calculator,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface InlineParsedDataProps {
  data: ParsedInvoice;
  validationResults: ValidationResult[];
  className?: string;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}

function Section({
  title,
  icon,
  children,
  defaultOpen = true,
  badge,
}: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-card/95 backdrop-blur-sm border-b border-border/50 hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">{icon}</span>
            <span className="font-semibold text-sm">{title}</span>
            {badge}
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 py-4 space-y-3 animate-accordion-down">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function InlineParsedData({
  data,
  validationResults,
  className,
}: InlineParsedDataProps) {
  const summary = getValidationSummary(validationResults);

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="divide-y divide-border/50">
        {/* Validation Summary Banner */}
        {validationResults.length > 0 && (
          <div className="px-4 py-3 bg-card/50 border-b border-border/50">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-success font-medium">{summary.passed}</span>
                <span className="text-muted-foreground">passed</span>
              </div>
              {summary.warnings > 0 && (
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-warning font-medium">{summary.warnings}</span>
                  <span className="text-muted-foreground">warnings</span>
                </div>
              )}
              {summary.errors > 0 && (
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-error" />
                  <span className="text-error font-medium">{summary.errors}</span>
                  <span className="text-muted-foreground">errors</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invoice Details */}
        <Section
          title="Invoice Details"
          icon={<FileText className="h-4 w-4" />}
        >
          <EnhancedField
            label="Invoice Number"
            field={data.invoice?.invoice_number}
            fieldPath="invoice.invoice_number"
            validationResults={validationResults}
          />
          <EnhancedField
            label="Invoice Date"
            field={data.invoice?.invoice_date}
            fieldPath="invoice.invoice_date"
            validationResults={validationResults}
          />
          <EnhancedField
            label="Due Date"
            field={data.invoice?.due_date}
            fieldPath="invoice.due_date"
            validationResults={validationResults}
          />
          <EnhancedField
            label="Invoice Type"
            field={data.invoice?.invoice_type}
            fieldPath="invoice.invoice_type"
            validationResults={validationResults}
          />
          <EnhancedField
            label="Place of Supply"
            field={data.invoice?.place_of_supply}
            fieldPath="invoice.place_of_supply"
            validationResults={validationResults}
          />
        </Section>

        {/* Seller Details */}
        <Section
          title="Seller Details"
          icon={<Building2 className="h-4 w-4" />}
        >
          <EnhancedField
            label="Name"
            field={data.seller?.name}
            fieldPath="seller.name"
            validationResults={validationResults}
          />
          <EnhancedField
            label="GSTIN"
            field={data.seller?.gstin}
            fieldPath="seller.gstin"
            validationResults={validationResults}
          />
          <EnhancedField
            label="PAN"
            field={data.seller?.pan}
            fieldPath="seller.pan"
            validationResults={validationResults}
          />
          <EnhancedField
            label="Address"
            field={data.seller?.address}
            fieldPath="seller.address"
            validationResults={validationResults}
          />
          <div className="grid grid-cols-2 gap-3">
            <EnhancedField
              label="City"
              field={data.seller?.city}
              fieldPath="seller.city"
              validationResults={validationResults}
            />
            <EnhancedField
              label="State"
              field={data.seller?.state}
              fieldPath="seller.state"
              validationResults={validationResults}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <EnhancedField
              label="State Code"
              field={data.seller?.state_code}
              fieldPath="seller.state_code"
              validationResults={validationResults}
            />
            <EnhancedField
              label="Pincode"
              field={data.seller?.pincode}
              fieldPath="seller.pincode"
              validationResults={validationResults}
            />
          </div>
        </Section>

        {/* Buyer Details */}
        <Section
          title="Buyer Details"
          icon={<Users className="h-4 w-4" />}
        >
          <EnhancedField
            label="Name"
            field={data.buyer?.name}
            fieldPath="buyer.name"
            validationResults={validationResults}
          />
          <EnhancedField
            label="GSTIN"
            field={data.buyer?.gstin}
            fieldPath="buyer.gstin"
            validationResults={validationResults}
          />
          <EnhancedField
            label="PAN"
            field={data.buyer?.pan}
            fieldPath="buyer.pan"
            validationResults={validationResults}
          />
          <EnhancedField
            label="Address"
            field={data.buyer?.address}
            fieldPath="buyer.address"
            validationResults={validationResults}
          />
          <div className="grid grid-cols-2 gap-3">
            <EnhancedField
              label="City"
              field={data.buyer?.city}
              fieldPath="buyer.city"
              validationResults={validationResults}
            />
            <EnhancedField
              label="State"
              field={data.buyer?.state}
              fieldPath="buyer.state"
              validationResults={validationResults}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <EnhancedField
              label="State Code"
              field={data.buyer?.state_code}
              fieldPath="buyer.state_code"
              validationResults={validationResults}
            />
            <EnhancedField
              label="Pincode"
              field={data.buyer?.pincode}
              fieldPath="buyer.pincode"
              validationResults={validationResults}
            />
          </div>
        </Section>

        {/* Line Items */}
        {data.line_items && data.line_items.length > 0 && (
          <Section
            title="Line Items"
            icon={<ShoppingCart className="h-4 w-4" />}
            badge={
              <Badge variant="secondary" className="text-xs">
                {data.line_items.length}
              </Badge>
            }
            defaultOpen={false}
          >
            <div className="overflow-x-auto -mx-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-20">HSN/SAC</TableHead>
                    <TableHead className="text-right w-16">Qty</TableHead>
                    <TableHead className="text-right w-24">Rate</TableHead>
                    <TableHead className="text-right w-24">Taxable</TableHead>
                    <TableHead className="text-right w-20">Tax</TableHead>
                    <TableHead className="text-right w-24">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.line_items.map((item, index) => {
                    const taxAmount =
                      (item.cgst_amount?.value || 0) +
                      (item.sgst_amount?.value || 0) +
                      (item.igst_amount?.value || 0);
                    return (
                      <TableRow key={index} className="text-sm">
                        <TableCell className="text-muted-foreground">
                          {item.serial_number?.value || index + 1}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate font-medium">
                          {item.description?.value || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.hsn_sac?.value || "-"}
                        </TableCell>
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
                        <TableCell className="text-right text-muted-foreground">
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
          </Section>
        )}

        {/* Totals */}
        <Section
          title="Totals"
          icon={<Calculator className="h-4 w-4" />}
        >
          <div className="grid grid-cols-2 gap-3">
            <EnhancedField
              label="Subtotal"
              field={data.totals?.subtotal}
              fieldPath="totals.subtotal"
              validationResults={validationResults}
              format="currency"
            />
            <EnhancedField
              label="Total Discount"
              field={data.totals?.total_discount}
              fieldPath="totals.total_discount"
              validationResults={validationResults}
              format="currency"
            />
          </div>
          <EnhancedField
            label="Total Taxable Value"
            field={data.totals?.total_taxable_value}
            fieldPath="totals.total_taxable_value"
            validationResults={validationResults}
            format="currency"
          />
          <div className="grid grid-cols-3 gap-3">
            <EnhancedField
              label="CGST"
              field={data.totals?.total_cgst}
              fieldPath="totals.total_cgst"
              validationResults={validationResults}
              format="currency"
            />
            <EnhancedField
              label="SGST"
              field={data.totals?.total_sgst}
              fieldPath="totals.total_sgst"
              validationResults={validationResults}
              format="currency"
            />
            <EnhancedField
              label="IGST"
              field={data.totals?.total_igst}
              fieldPath="totals.total_igst"
              validationResults={validationResults}
              format="currency"
            />
          </div>
          <EnhancedField
            label="Total Tax"
            field={data.totals?.total_tax}
            fieldPath="totals.total_tax"
            validationResults={validationResults}
            format="currency"
          />
          <EnhancedField
            label="Round Off"
            field={data.totals?.round_off}
            fieldPath="totals.round_off"
            validationResults={validationResults}
            format="currency"
          />

          {/* Grand Total - Highlighted */}
          <div className="mt-4 pt-4 border-t border-border">
            <EnhancedField
              label="Grand Total"
              field={data.totals?.grand_total}
              fieldPath="totals.grand_total"
              validationResults={validationResults}
              format="currency"
              className="bg-primary/5 border-primary/30"
            />
          </div>

          {data.totals?.amount_in_words && (
            <p className="text-sm text-muted-foreground italic mt-2">
              {data.totals.amount_in_words.value}
            </p>
          )}
        </Section>

        {/* Payment Details */}
        {data.payment && (
          <Section
            title="Payment Details"
            icon={<CreditCard className="h-4 w-4" />}
            defaultOpen={false}
          >
            <EnhancedField
              label="Bank Name"
              field={data.payment.bank_name}
              fieldPath="payment.bank_name"
              validationResults={validationResults}
            />
            <EnhancedField
              label="Account Number"
              field={data.payment.account_number}
              fieldPath="payment.account_number"
              validationResults={validationResults}
            />
            <div className="grid grid-cols-2 gap-3">
              <EnhancedField
                label="IFSC Code"
                field={data.payment.ifsc_code}
                fieldPath="payment.ifsc_code"
                validationResults={validationResults}
              />
              <EnhancedField
                label="Branch"
                field={data.payment.branch}
                fieldPath="payment.branch"
                validationResults={validationResults}
              />
            </div>
            <EnhancedField
              label="UPI ID"
              field={data.payment.upi_id}
              fieldPath="payment.upi_id"
              validationResults={validationResults}
            />
            <EnhancedField
              label="Payment Terms"
              field={data.payment.payment_terms}
              fieldPath="payment.payment_terms"
              validationResults={validationResults}
            />
          </Section>
        )}
      </div>
    </ScrollArea>
  );
}
