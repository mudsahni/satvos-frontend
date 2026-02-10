"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

/* ------------------------------------------------------------------ */
/*  Shared chrome                                                     */
/* ------------------------------------------------------------------ */

function WindowChrome({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0d1424] shadow-2xl shadow-black/40 overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-white/5 bg-white/[0.02]">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <div className="w-2 h-2 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="h-[18px] rounded-md bg-white/[0.04] px-3 flex items-center">
            <span className="text-[9px] text-white/25 select-none">{url}</span>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  1. Dashboard — stats + needs-attention list                       */
/* ------------------------------------------------------------------ */

function DashboardMockup() {
  return (
    <WindowChrome url="app.satvos.com/dashboard">
      <div className="flex h-[280px]">
        {/* Sidebar */}
        <div className="w-9 border-r border-white/5 py-2.5 flex flex-col items-center gap-2">
          <div className="w-[18px] h-[18px] rounded bg-primary/50" />
          <div className="w-3.5 h-3.5 rounded bg-white/8" />
          <div className="w-3.5 h-3.5 rounded bg-white/8" />
          <div className="w-3.5 h-3.5 rounded bg-white/8" />
        </div>

        <div className="flex-1 p-3 space-y-2.5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { l: "Collections", v: "24", c: "text-primary" },
              { l: "Documents", v: "1,847", c: "text-emerald-400" },
              { l: "Need Review", v: "12", c: "text-amber-400" },
              { l: "Failed", v: "3", c: "text-red-400" },
            ].map((s) => (
              <div key={s.l} className="rounded-md border border-white/5 bg-white/[0.015] p-2">
                <p className="text-[7px] text-white/30 leading-none">{s.l}</p>
                <p className={`text-sm font-bold leading-tight mt-0.5 ${s.c}`}>{s.v}</p>
              </div>
            ))}
          </div>

          {/* Needs attention list */}
          <div>
            <p className="text-[8px] text-white/30 font-medium mb-1.5">Needs Attention</p>
            <div className="rounded-md border border-white/5 overflow-hidden">
              {[
                { name: "INV-2844-FastShip.pdf", tag: "Needs Review", tc: "text-amber-400 bg-amber-400/15" },
                { name: "INV-2839-Acme-Dec.pdf", tag: "Invalid", tc: "text-red-400 bg-red-400/15" },
                { name: "PO-9182-TechParts.pdf", tag: "Needs Review", tc: "text-amber-400 bg-amber-400/15" },
                { name: "INV-2831-GlobalSupply.pdf", tag: "Warning", tc: "text-amber-400 bg-amber-400/15" },
              ].map((d, i) => (
                <div key={d.name} className={`flex items-center justify-between px-2.5 py-1.5 text-[9px] ${i > 0 ? "border-t border-white/5" : ""}`}>
                  <span className="text-white/50 truncate mr-2">{d.name}</span>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[7px] font-medium ${d.tc}`}>{d.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

/* ------------------------------------------------------------------ */
/*  2. Collection — header + document table                           */
/* ------------------------------------------------------------------ */

function CollectionMockup() {
  return (
    <WindowChrome url="app.satvos.com/collections/q4-invoices">
      <div className="flex h-[280px]">
        {/* Sidebar */}
        <div className="w-9 border-r border-white/5 py-2.5 flex flex-col items-center gap-2">
          <div className="w-[18px] h-[18px] rounded bg-primary/30" />
          <div className="w-3.5 h-3.5 rounded bg-white/8" />
          <div className="w-3.5 h-3.5 rounded bg-primary/25" />
          <div className="w-3.5 h-3.5 rounded bg-white/8" />
        </div>

        <div className="flex-1 p-3 space-y-2.5 overflow-hidden">
          {/* Collection header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-white/70">Q4 Invoices 2025</p>
              <p className="text-[8px] text-white/30">18 documents</p>
            </div>
            <div className="flex gap-1.5">
              <div className="rounded-md bg-primary/20 px-2 py-0.5 text-[7px] font-semibold text-primary">Upload</div>
              <div className="rounded-md bg-white/5 px-2 py-0.5 text-[7px] font-medium text-white/40">Export CSV</div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border border-white/5 overflow-hidden">
            <div className="grid grid-cols-12 gap-1 px-2.5 py-1.5 bg-white/[0.02] text-[7px] uppercase tracking-wider text-white/25">
              <span className="col-span-4">Document</span>
              <span className="col-span-3">Vendor</span>
              <span className="col-span-2">Amount</span>
              <span className="col-span-3">Status</span>
            </div>
            {[
              { name: "INV-2847.pdf", vendor: "Acme Corp", amt: "\u20B918,500", ps: "Completed", vs: "Valid", psc: "bg-emerald-400/15 text-emerald-400", vsc: "bg-emerald-400/15 text-emerald-400" },
              { name: "INV-2846.pdf", vendor: "TechParts Ltd", amt: "\u20B942,100", ps: "Completed", vs: "Warning", psc: "bg-emerald-400/15 text-emerald-400", vsc: "bg-amber-400/15 text-amber-400" },
              { name: "INV-2845.pdf", vendor: "GlobalSupply", amt: "\u20B97,350", ps: "Completed", vs: "Valid", psc: "bg-emerald-400/15 text-emerald-400", vsc: "bg-emerald-400/15 text-emerald-400" },
              { name: "INV-2844.pdf", vendor: "FastShip Co", amt: "\u20B923,800", ps: "Processing", vs: "\u2014", psc: "bg-primary/15 text-primary", vsc: "bg-white/5 text-white/20" },
              { name: "INV-2843.pdf", vendor: "QuickBuild", amt: "\u20B911,200", ps: "Completed", vs: "Invalid", psc: "bg-emerald-400/15 text-emerald-400", vsc: "bg-red-400/15 text-red-400" },
            ].map((r, i) => (
              <div key={r.name} className={`grid grid-cols-12 gap-1 px-2.5 py-1.5 text-[9px] ${i > 0 ? "border-t border-white/5" : "border-t border-white/5"}`}>
                <span className="col-span-4 text-white/60 font-medium truncate">{r.name}</span>
                <span className="col-span-3 text-white/40 truncate">{r.vendor}</span>
                <span className="col-span-2 text-white/50 font-medium">{r.amt}</span>
                <div className="col-span-3 flex gap-1">
                  <span className={`rounded px-1 py-0.5 text-[7px] font-medium leading-none ${r.psc}`}>{r.ps}</span>
                  <span className={`rounded px-1 py-0.5 text-[7px] font-medium leading-none ${r.vsc}`}>{r.vs}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

/* ------------------------------------------------------------------ */
/*  3. Document detail — PDF + extracted data split                   */
/* ------------------------------------------------------------------ */

function DocumentMockup() {
  return (
    <WindowChrome url="app.satvos.com/documents/inv-2847">
      <div className="h-[280px]">
        {/* Breadcrumb + status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-1 text-[8px] text-white/25">
            <span>Documents</span><span>/</span><span>Q4 Invoices</span><span>/</span>
            <span className="text-white/50 font-medium">INV-2847.pdf</span>
          </div>
          <div className="flex gap-1.5">
            <span className="rounded bg-emerald-400/15 px-1.5 py-0.5 text-[7px] font-medium text-emerald-400">Validated</span>
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[7px] font-medium text-primary">Pending Review</span>
          </div>
        </div>

        {/* Split panels */}
        <div className="grid grid-cols-2 divide-x divide-white/5">
          {/* Left: PDF preview */}
          <div className="p-3">
            <div className="rounded border border-white/5 bg-white/[0.015] p-2.5 space-y-2">
              {/* Invoice header area */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="h-2.5 w-20 bg-white/10 rounded" />
                  <div className="h-1.5 w-24 bg-white/5 rounded" />
                  <div className="h-1.5 w-16 bg-white/5 rounded" />
                </div>
                <div className="text-right space-y-1">
                  <div className="h-2 w-16 bg-primary/15 rounded" />
                  <div className="h-1.5 w-14 bg-white/5 rounded" />
                </div>
              </div>
              {/* Line items */}
              <div className="border-t border-white/5 pt-2 space-y-1.5">
                <div className="grid grid-cols-4 gap-1">
                  <div className="col-span-2 h-1 bg-white/8 rounded" />
                  <div className="h-1 bg-white/5 rounded" />
                  <div className="h-1 bg-white/5 rounded" />
                </div>
                {[80, 65, 72].map((w, i) => (
                  <div key={i} className="grid grid-cols-4 gap-1">
                    <div className="col-span-2 h-1 bg-white/4 rounded" style={{ width: `${w}%` }} />
                    <div className="h-1 bg-white/4 rounded" />
                    <div className="h-1 bg-white/4 rounded" />
                  </div>
                ))}
              </div>
              {/* Total */}
              <div className="border-t border-white/5 pt-1.5 flex justify-end gap-3">
                <div className="h-1.5 w-8 bg-white/5 rounded" />
                <div className="h-2 w-12 bg-white/10 rounded" />
              </div>
            </div>
          </div>

          {/* Right: Extracted data */}
          <div className="p-3 space-y-1.5">
            <div className="flex gap-1 mb-2">
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[7px] font-semibold text-primary">Extracted Data</span>
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[7px] text-white/25">Validations</span>
              <span className="rounded bg-white/5 px-1.5 py-0.5 text-[7px] text-white/25">History</span>
            </div>
            {[
              { l: "Invoice Number", v: "INV-2847" },
              { l: "Invoice Date", v: "15 Jan 2026" },
              { l: "Seller Name", v: "Acme Corporation Pvt Ltd" },
              { l: "Seller GSTIN", v: "27AADCA1234F1ZQ" },
              { l: "Total Amount", v: "\u20B918,500.00" },
              { l: "IGST (18%)", v: "\u20B92,830.51" },
              { l: "Net Amount", v: "\u20B915,669.49" },
            ].map((f) => (
              <div key={f.l} className="flex items-center justify-between py-[3px] border-b border-white/5 last:border-0">
                <span className="text-[8px] text-white/30">{f.l}</span>
                <span className="text-[8px] text-white/65 font-medium">{f.v}</span>
              </div>
            ))}
            <div className="flex gap-1.5 pt-1">
              <span className="rounded bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 text-[7px] font-medium text-emerald-400">GSTIN Verified</span>
              <span className="rounded bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 text-[7px] font-medium text-emerald-400">Totals Match</span>
            </div>
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

/* ------------------------------------------------------------------ */
/*  4. Upload — drag zone + file progress list                        */
/* ------------------------------------------------------------------ */

function UploadMockup() {
  return (
    <WindowChrome url="app.satvos.com/upload">
      <div className="flex h-[280px]">
        {/* Sidebar */}
        <div className="w-9 border-r border-white/5 py-2.5 flex flex-col items-center gap-2">
          <div className="w-[18px] h-[18px] rounded bg-primary/30" />
          <div className="w-3.5 h-3.5 rounded bg-white/8" />
          <div className="w-3.5 h-3.5 rounded bg-white/8" />
          <div className="w-3.5 h-3.5 rounded bg-primary/25" />
        </div>

        <div className="flex-1 p-3 space-y-2.5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-white/70">Upload Documents</p>
            <div className="rounded-md bg-white/5 px-2 py-0.5 text-[7px] text-white/30">Q4 Invoices 2025</div>
          </div>

          {/* Drop zone */}
          <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] px-3 py-3 text-center">
            <div className="flex justify-center mb-1">
              <div className="w-5 h-5 rounded-lg bg-primary/15 flex items-center justify-center">
                <span className="text-[10px] text-primary">&uarr;</span>
              </div>
            </div>
            <p className="text-[8px] text-white/40">Drop files here or <span className="text-primary">browse</span></p>
            <p className="text-[7px] text-white/20 mt-0.5">PDF, JPG, PNG up to 25 MB</p>
          </div>

          {/* File list with progress */}
          <div className="space-y-1.5">
            {[
              { name: "acme-inv-2847.pdf", size: "2.4 MB", pct: 100, status: "Parsed", sc: "text-emerald-400" },
              { name: "techparts-po-446.pdf", size: "1.8 MB", pct: 100, status: "Validating", sc: "text-primary" },
              { name: "globalsupp-dec.pdf", size: "3.1 MB", pct: 72, status: "Uploading", sc: "text-white/40" },
              { name: "fastship-receipt.pdf", size: "0.9 MB", pct: 35, status: "Uploading", sc: "text-white/40" },
              { name: "quickbuild-inv.pdf", size: "1.5 MB", pct: 0, status: "Queued", sc: "text-white/20" },
            ].map((f) => (
              <div key={f.name} className="rounded-md border border-white/5 bg-white/[0.01] px-2.5 py-1.5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[8px] text-white/50 truncate">{f.name}</span>
                    <span className="text-[7px] text-white/20 shrink-0">{f.size}</span>
                  </div>
                  <span className={`text-[7px] font-medium shrink-0 ml-2 ${f.sc}`}>{f.status}</span>
                </div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all"
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

/* ------------------------------------------------------------------ */
/*  Infinite marquee carousel                                         */
/* ------------------------------------------------------------------ */

const screens = [
  { label: "Dashboard", El: DashboardMockup },
  { label: "Collection", El: CollectionMockup },
  { label: "Document Review", El: DocumentMockup },
  { label: "Bulk Upload", El: UploadMockup },
];

function MarqueeShowcase() {
  // Render the set of 4 cards twice for seamless looping.
  // The CSS animation translates -50% (= one full set), then resets.
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="relative mt-14 lg:mt-20"
    >
      {/* Glow behind the track */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3/4 bg-primary/12 rounded-full blur-[120px] pointer-events-none" />

      {/* Scrolling track — edge fade via mask-image so it's truly transparent */}
      <div
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div
          className="flex gap-5 hover:[animation-play-state:paused] w-max"
          style={{
            animation: "marquee-scroll 40s linear infinite",
          }}
        >
          {/* Two identical sets for seamless loop */}
          {[0, 1].map((setIndex) =>
            screens.map((s) => (
              <div
                key={`${setIndex}-${s.label}`}
                className="shrink-0 w-[85vw] sm:w-[60vw] md:w-[46vw] lg:w-[38vw] xl:w-[560px] flex flex-col"
              >
                <s.El />
                <p className="mt-2.5 text-[11px] font-medium text-white/30 text-center select-none">
                  {s.label}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero section                                                      */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Twinkling crosses — matches the background grid plus-sign pattern  */
/* ------------------------------------------------------------------ */

const TWINKLE_CROSSES = [
  // x%, y%, size(px), duration(s), delay(s)
  { x: 5, y: 10, sz: 10, d: 5, dl: 0 },
  { x: 14, y: 28, sz: 8, d: 6.5, dl: 2.8 },
  { x: 8, y: 55, sz: 10, d: 5.8, dl: 4.1 },
  { x: 3, y: 78, sz: 8, d: 7, dl: 1.3 },
  { x: 22, y: 12, sz: 10, d: 6, dl: 3.5 },
  { x: 30, y: 72, sz: 8, d: 5.5, dl: 0.7 },
  { x: 42, y: 88, sz: 10, d: 6.8, dl: 2.2 },
  { x: 55, y: 8, sz: 8, d: 5.2, dl: 4.8 },
  { x: 60, y: 78, sz: 10, d: 7.2, dl: 1.6 },
  { x: 72, y: 15, sz: 8, d: 6.2, dl: 3.0 },
  { x: 78, y: 62, sz: 10, d: 5.6, dl: 0.4 },
  { x: 85, y: 85, sz: 8, d: 6.6, dl: 2.5 },
  { x: 90, y: 20, sz: 10, d: 5.3, dl: 4.4 },
  { x: 95, y: 48, sz: 8, d: 7.4, dl: 1.9 },
  { x: 48, y: 70, sz: 10, d: 6.1, dl: 3.8 },
  { x: 18, y: 90, sz: 8, d: 5.9, dl: 0.2 },
];

/* ------------------------------------------------------------------ */
/*  Hero section                                                      */
/* ------------------------------------------------------------------ */

export function Hero() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const loggedIn = isHydrated && isAuthenticated;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81]">
      {/* Marquee keyframe — defined once, scoped to this section */}
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.2; }
        }
        @keyframes text-glint {
          0%, 100% { background-position: 100% center; }
          50% { background-position: 0% center; }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, -20px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 15px); }
        }
      `}</style>

      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient orbs — slow drift */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"
        style={{ animation: "float-1 15s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"
        style={{ animation: "float-2 18s ease-in-out infinite" }}
      />

      {/* Twinkling crosses — some grid plus signs glow brighter then fade */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {TWINKLE_CROSSES.map((c, i) => (
          <svg
            key={i}
            className="absolute text-white"
            width={c.sz}
            height={c.sz}
            viewBox="0 0 10 10"
            fill="currentColor"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              animation: `twinkle ${c.d}s ease-in-out ${c.dl}s infinite`,
            }}
          >
            <path d="M4 0v4H0v2h4v4h2V6h4V4H6V0z" />
          </svg>
        ))}
      </div>

      <div className="relative pt-28 pb-20 lg:pb-28">
        {/* Centered headline block — constrained width */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-6"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-white/70">
                Now with AI-powered extraction
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight"
            >
              Invoice Processing{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(110deg, #a5b4fc, #6366f1 20%, #a78bfa 40%, #e0e7ff 50%, #a78bfa 60%, #6366f1 80%, #a5b4fc)",
                  backgroundSize: "300% 100%",
                  animation: "text-glint 14s ease-in-out infinite",
                }}
              >
                on Autopilot
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-6 text-lg text-white/60 max-w-xl mx-auto leading-relaxed"
            >
              Upload invoices, auto-extract data with AI, validate against GST rules,
              and reconcile with GSTR-2A/2B. From hours of manual work to minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link
                href={loggedIn ? "/dashboard" : "/register"}
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:bg-white/90"
              >
                {loggedIn ? "Go to Dashboard" : "Start Uploading"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-white/10 hover:border-white/20"
              >
                See How It Works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-white/40"
            >
              {["Free 14-day trial", "No credit card", "GST-ready"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Full-bleed marquee carousel — breaks out of max-w container */}
        <MarqueeShowcase />
      </div>

{/* No bottom fade — clean edge between dark hero and content */}
    </section>
  );
}
