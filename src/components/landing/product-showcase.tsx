"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = ["Extracted Data", "Validations", "History"] as const;
type Tab = (typeof tabs)[number];

function ExtractedDataContent() {
  return (
    <div className="space-y-3">
      {[
        { label: "Invoice Number", value: "INV-2847" },
        { label: "Invoice Date", value: "15 Jan 2026" },
        { label: "Seller Name", value: "Acme Corporation Pvt Ltd" },
        { label: "Seller GSTIN", value: "27AADCA1234F1ZQ" },
        { label: "Total Amount", value: "\u20B918,500.00" },
        { label: "IGST", value: "\u20B92,830.51" },
      ].map((field) => (
        <div key={field.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
          <span className="text-xs text-muted-foreground">{field.label}</span>
          <span className="text-xs font-medium text-foreground">{field.value}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-success-bg border border-success-border px-2 py-0.5 text-[10px] font-medium text-success">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          GSTIN Verified
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-success-bg border border-success-border px-2 py-0.5 text-[10px] font-medium text-success">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Totals Match
        </span>
      </div>
    </div>
  );
}

function ValidationsContent() {
  const rules = [
    { name: "GSTIN Format Check", status: "pass", detail: "Seller GSTIN matches valid 15-digit format" },
    { name: "Total Amount Verification", status: "pass", detail: "Line items sum matches invoice total" },
    { name: "Tax Rate Validation", status: "pass", detail: "IGST 18% correctly applied for inter-state supply" },
    { name: "Duplicate Invoice Check", status: "pass", detail: "No duplicate found in collection" },
    { name: "HSN Code Validation", status: "warning", detail: "HSN 9987 — verify service classification" },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3 mb-1">
        <span className="rounded-md bg-success-bg border border-success-border px-2 py-0.5 text-[10px] font-semibold text-success">4 Passed</span>
        <span className="rounded-md bg-warning-bg border border-warning-border px-2 py-0.5 text-[10px] font-semibold text-warning">1 Warning</span>
      </div>
      {rules.map((rule) => (
        <div key={rule.name} className={`rounded-md border px-3 py-2 ${rule.status === "pass" ? "border-success-border/50 bg-success-bg/50" : "border-warning-border/50 bg-warning-bg/50"}`}>
          <div className="flex items-center gap-2">
            {rule.status === "pass" ? (
              <svg className="h-3.5 w-3.5 text-success shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="h-3.5 w-3.5 text-warning shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            )}
            <span className="text-[11px] font-medium text-foreground">{rule.name}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 ml-5">{rule.detail}</p>
        </div>
      ))}
    </div>
  );
}

function HistoryContent() {
  const events = [
    { action: "Document approved", user: "Priya Sharma", time: "2 hours ago", icon: "approve" },
    { action: "Validation completed", user: "System", time: "3 hours ago", icon: "validate" },
    { action: "Data extraction completed", user: "System", time: "3 hours ago", icon: "extract" },
    { action: "Document uploaded", user: "Rajesh Patel", time: "3 hours ago", icon: "upload" },
    { action: "Collection created", user: "Rajesh Patel", time: "1 day ago", icon: "create" },
  ];

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.action} className="flex gap-3 relative">
            <div className={`relative z-10 mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
              event.icon === "approve" ? "bg-success-bg border border-success-border" :
              event.icon === "validate" ? "bg-primary/10 border border-primary/20" :
              "bg-muted border border-border"
            }`}>
              {event.icon === "approve" && (
                <svg className="h-2.5 w-2.5 text-success" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              )}
              {event.icon === "validate" && (
                <svg className="h-2.5 w-2.5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              )}
              {event.icon === "extract" && (
                <svg className="h-2.5 w-2.5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
              )}
              {(event.icon === "upload" || event.icon === "create") && (
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-foreground">{event.action}</p>
              <p className="text-[10px] text-muted-foreground">{event.user} &middot; {event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabContent({ tab }: { tab: Tab }) {
  switch (tab) {
    case "Extracted Data": return <ExtractedDataContent />;
    case "Validations": return <ValidationsContent />;
    case "History": return <HistoryContent />;
  }
}

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<Tab>("Extracted Data");

  const cycleTab = useCallback(() => {
    setActiveTab((current) => {
      const idx = tabs.indexOf(current);
      return tabs[(idx + 1) % tabs.length];
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(cycleTab, 4000);
    return () => clearInterval(interval);
  }, [cycleTab]);
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Product
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            See every detail at a glance
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Split-pane view lets you compare the original invoice with extracted data
            side by side. Edit fields inline, review validations, and approve — all on one screen.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          {/* Glow */}
          <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />

          {/* Mock document detail view */}
          <div className="relative rounded-xl border border-border bg-card shadow-xl overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Documents</span>
                  <span>/</span>
                  <span>Q4 Invoices</span>
                  <span>/</span>
                  <span className="text-foreground font-medium">INV-2847.pdf</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-success-border bg-success-bg px-2 py-0.5 text-[10px] font-semibold text-success">
                  Validated
                </span>
                <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Pending Review
                </span>
              </div>
            </div>

            {/* Split view */}
            <div className="grid md:grid-cols-2 divide-x divide-border">
              {/* Left: Invoice PDF */}
              <div className="p-6 bg-muted/20 min-h-[300px] flex items-center justify-center">
                <div className="w-full max-w-sm">
                  <div className="rounded-lg border border-border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                    {/* Invoice header */}
                    <div className="px-5 pt-5 pb-3 border-b border-border/60">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tax Invoice</p>
                          <p className="text-sm font-bold text-foreground mt-0.5">#INV-2847</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">Date: 15 Jan 2026</p>
                          <p className="text-[10px] text-muted-foreground">Due: 14 Feb 2026</p>
                        </div>
                      </div>
                    </div>

                    {/* From / To */}
                    <div className="grid grid-cols-2 gap-3 px-5 py-3 border-b border-border/60">
                      <div>
                        <p className="text-[9px] text-muted-foreground mb-0.5">From</p>
                        <p className="text-[11px] font-medium text-foreground">Acme Corporation Pvt Ltd</p>
                        <p className="text-[9px] text-muted-foreground leading-snug">GSTIN: 27AADCA1234F1ZQ</p>
                        <p className="text-[9px] text-muted-foreground leading-snug">Mumbai, Maharashtra</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground mb-0.5">Bill To</p>
                        <p className="text-[11px] font-medium text-foreground">TechParts India Ltd</p>
                        <p className="text-[9px] text-muted-foreground leading-snug">GSTIN: 29BBFPT5678K1ZP</p>
                        <p className="text-[9px] text-muted-foreground leading-snug">Bengaluru, Karnataka</p>
                      </div>
                    </div>

                    {/* Line items */}
                    <div className="px-5 py-3 border-b border-border/60">
                      <table className="w-full">
                        <thead>
                          <tr className="text-[8px] text-muted-foreground uppercase tracking-wider">
                            <th className="text-left font-medium pb-1.5">Item</th>
                            <th className="text-center font-medium pb-1.5">HSN</th>
                            <th className="text-center font-medium pb-1.5">Qty</th>
                            <th className="text-right font-medium pb-1.5">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="text-[10px]">
                          <tr className="border-t border-border/40">
                            <td className="py-1.5 text-foreground">Server Rack Unit</td>
                            <td className="py-1.5 text-center text-muted-foreground">8471</td>
                            <td className="py-1.5 text-center text-muted-foreground">2</td>
                            <td className="py-1.5 text-right font-medium text-foreground">&#8377;12,000.00</td>
                          </tr>
                          <tr className="border-t border-border/40">
                            <td className="py-1.5 text-foreground">Network Cabling</td>
                            <td className="py-1.5 text-center text-muted-foreground">8544</td>
                            <td className="py-1.5 text-center text-muted-foreground">5</td>
                            <td className="py-1.5 text-right font-medium text-foreground">&#8377;3,500.00</td>
                          </tr>
                          <tr className="border-t border-border/40">
                            <td className="py-1.5 text-foreground">Installation Service</td>
                            <td className="py-1.5 text-center text-muted-foreground">9987</td>
                            <td className="py-1.5 text-center text-muted-foreground">1</td>
                            <td className="py-1.5 text-right font-medium text-foreground">&#8377;3,000.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="px-5 py-3">
                      <div className="flex justify-end">
                        <div className="w-40 space-y-1 text-[10px]">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>&#8377;15,669.49</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>IGST (18%)</span>
                            <span>&#8377;2,830.51</span>
                          </div>
                          <div className="flex justify-between font-semibold text-foreground border-t border-border pt-1.5 mt-1.5 text-[11px]">
                            <span>Total</span>
                            <span>&#8377;18,500.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Tabbed data panel */}
              <div className="p-6">
                <div className="flex gap-1 mb-5">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                        activeTab === tab
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="h-[320px] overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <TabContent tab={activeTab} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
