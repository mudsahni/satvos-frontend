import Link from "next/link";
import { ArrowLeft, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Invoice card */}
        <div className="relative bg-card border-2 border-dashed border-border rounded-xl shadow-lg overflow-hidden">
          {/* VOID watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-destructive/10 text-[8rem] font-black tracking-widest -rotate-12 leading-none">
              VOID
            </span>
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-border/60">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                      <FileWarning className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Invoice
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-foreground">#INV-0404</h1>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-md border border-error-border bg-error-bg px-2 py-0.5 text-xs font-semibold text-error">
                    NOT FOUND
                  </span>
                  <p className="text-xs text-muted-foreground mt-1.5">{today}</p>
                </div>
              </div>
            </div>

            {/* From / To */}
            <div className="grid grid-cols-2 gap-4 px-6 py-4 border-b border-border/60 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">From</p>
                <p className="font-medium text-foreground">The Internet</p>
                <p className="text-xs text-muted-foreground">World Wide Web, Port 443</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Bill To</p>
                <p className="font-medium text-foreground">Lost Visitor</p>
                <p className="text-xs text-muted-foreground">Somewhere in cyberspace</p>
              </div>
            </div>

            {/* Line items table */}
            <div className="px-6 py-4 border-b border-border/60">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground">
                    <th className="text-left font-medium pb-2">Description</th>
                    <th className="text-center font-medium pb-2">Qty</th>
                    <th className="text-right font-medium pb-2">Rate</th>
                    <th className="text-right font-medium pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border/40">
                    <td className="py-2.5 font-medium text-foreground">
                      Page Not Found
                      <span className="block text-xs text-muted-foreground font-normal">
                        The page you requested does not exist
                      </span>
                    </td>
                    <td className="py-2.5 text-center text-muted-foreground">1</td>
                    <td className="py-2.5 text-right text-muted-foreground">₹0.00</td>
                    <td className="py-2.5 text-right font-medium text-foreground">₹0.00</td>
                  </tr>
                  <tr className="border-t border-border/40">
                    <td className="py-2.5 font-medium text-foreground">
                      Confusion Tax
                      <span className="block text-xs text-muted-foreground font-normal">
                        Applied at standard rate of bewilderment
                      </span>
                    </td>
                    <td className="py-2.5 text-center text-muted-foreground">1</td>
                    <td className="py-2.5 text-right text-muted-foreground">₹0.00</td>
                    <td className="py-2.5 text-right font-medium text-foreground">₹0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-6 py-4 border-b border-border/60">
              <div className="flex justify-end">
                <div className="w-48 space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (18%)</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground border-t border-border pt-2 mt-2">
                    <span>Grand Total</span>
                    <span>₹0.00</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic">
                Amount in words: Zero Rupees Only
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 space-y-4">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                If you believe this is a mistake, please contact our navigation
                department. Response times may vary depending on internet traffic.
              </p>

              <div className="flex justify-center">
                <Button asChild>
                  <Link href="/">
                    <ArrowLeft />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom attribution */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Satvos Document Processing &mdash; Even our 404s are billable
        </p>
      </div>
    </div>
  );
}
