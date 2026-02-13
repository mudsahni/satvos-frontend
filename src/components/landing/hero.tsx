"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mail, MessageCircle, Upload } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

/* ------------------------------------------------------------------ */
/*  Shared chrome                                                     */
/* ------------------------------------------------------------------ */

function WindowChrome({
  url,
  breadcrumb,
  children,
}: {
  url: string;
  breadcrumb?: React.ReactNode;
  children: React.ReactNode;
}) {
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
      {breadcrumb && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 bg-white/[0.01]">
          {breadcrumb}
        </div>
      )}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated hero visual — email/WhatsApp → AI extraction → validated */
/* ------------------------------------------------------------------ */

const SOURCES = [
  { label: "via Email", icon: Mail, color: "text-sky-400", bg: "bg-sky-400/15" },
  { label: "via WhatsApp", icon: MessageCircle, color: "text-emerald-400", bg: "bg-emerald-400/15" },
  { label: "via Upload", icon: Upload, color: "text-violet-400", bg: "bg-violet-400/15" },
];

const EXTRACTED_FIELDS = [
  { label: "Invoice Number", value: "INV-2847" },
  { label: "Invoice Date", value: "15 Jan 2026" },
  { label: "Seller Name", value: "Acme Corporation Pvt Ltd" },
  { label: "Seller GSTIN", value: "27AADCA1234F1ZQ" },
  { label: "Total Amount", value: "\u20B918,500.00" },
  { label: "IGST (18%)", value: "\u20B92,830.51" },
];

const VALIDATIONS = [
  { label: "GSTIN Verified", color: "text-emerald-400", border: "border-emerald-400/20", bg: "bg-emerald-400/10" },
  { label: "Totals Match", color: "text-emerald-400", border: "border-emerald-400/20", bg: "bg-emerald-400/10" },
];

type AnimationPhase = "arriving" | "extracting" | "validated" | "paused";

function HeroVisual() {
  const [sourceIndex, setSourceIndex] = useState(0);
  const [phase, setPhase] = useState<AnimationPhase>("arriving");
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const advanceCycle = useCallback(() => {
    clearTimeouts();
    setPhase("arriving");
    timeoutsRef.current.push(setTimeout(() => setPhase("extracting"), 2000));
    timeoutsRef.current.push(setTimeout(() => setPhase("validated"), 5000));
    timeoutsRef.current.push(
      setTimeout(() => {
        setPhase("paused");
        setSourceIndex((prev) => (prev + 1) % SOURCES.length);
      }, 8000)
    );
  }, [clearTimeouts]);

  useEffect(() => {
    advanceCycle();
    const interval = setInterval(advanceCycle, 10000);
    return () => {
      clearInterval(interval);
      clearTimeouts();
    };
  }, [advanceCycle, clearTimeouts]);

  const source = SOURCES[sourceIndex];
  const SourceIcon = source.icon;
  const showFields = phase === "extracting" || phase === "validated" || phase === "paused";
  const showValidation = phase === "validated" || phase === "paused";

  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3/4 bg-primary/12 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full">
        <WindowChrome
          url="app.satvos.com/documents/inv-2847"
          breadcrumb={
            <>
              <div className="flex items-center gap-1 text-[8px] text-white/25">
                <span>Documents</span>
                <span>/</span>
                <span>Q4 Invoices</span>
                <span>/</span>
                <span className="text-white/50 font-medium">INV-2847.pdf</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={source.label}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[7px] font-medium ${source.bg} ${source.color}`}
                >
                  <SourceIcon className="h-2.5 w-2.5" />
                  {source.label}
                </motion.div>
              </AnimatePresence>
            </>
          }
        >
          {/* Split panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/5 min-h-[260px] sm:min-h-[280px]">
            {/* Left: Invoice preview */}
            <div className="relative p-3">
              <div className="rounded border border-white/5 bg-white/[0.02] p-2.5 space-y-0">
                {/* Invoice header */}
                <div className="flex justify-between items-start pb-1.5 border-b border-white/5">
                  <span className="text-[8px] uppercase tracking-wider text-white/25 font-semibold">Tax Invoice</span>
                  <div className="text-right">
                    <span className="text-[9px] font-semibold text-white/60">#INV-2847</span>
                    <p className="text-[7px] text-white/25 mt-0.5">15 Jan 2026</p>
                  </div>
                </div>

                {/* From / To */}
                <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-white/5">
                  <div>
                    <p className="text-[7px] uppercase tracking-wider text-white/20">From</p>
                    <p className="text-[8px] text-white/50 font-medium mt-0.5">Acme Corp Pvt Ltd</p>
                    <p className="text-[7px] text-white/20 mt-0.5">GSTIN: 27AADCA1234F1ZQ</p>
                  </div>
                  <div>
                    <p className="text-[7px] uppercase tracking-wider text-white/20">To</p>
                    <p className="text-[8px] text-white/50 font-medium mt-0.5">TechParts India Ltd</p>
                    <p className="text-[7px] text-white/20 mt-0.5">GSTIN: 29BBFPT5678K1ZP</p>
                  </div>
                </div>

                {/* Line items table */}
                <div className="py-1.5 border-b border-white/5">
                  <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 mb-1">
                    <span className="text-[7px] uppercase tracking-wider text-white/20">Item</span>
                    <span className="text-[7px] uppercase tracking-wider text-white/20 text-right">Qty</span>
                    <span className="text-[7px] uppercase tracking-wider text-white/20 text-right">Amount</span>
                  </div>
                  {[
                    { item: "Server Rack", qty: "2", amount: "₹12,000.00" },
                    { item: "Network Cable", qty: "5", amount: "₹3,500.00" },
                    { item: "Installation", qty: "1", amount: "₹3,000.00" },
                  ].map((row) => (
                    <div key={row.item} className="grid grid-cols-[1fr_auto_auto] gap-x-3 py-[2px]">
                      <span className="text-[8px] text-white/40">{row.item}</span>
                      <span className="text-[8px] text-white/30 text-right">{row.qty}</span>
                      <span className="text-[8px] text-white/50 font-medium text-right">{row.amount}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="pt-1.5 space-y-[2px]">
                  <div className="flex justify-end gap-4">
                    <span className="text-[7px] text-white/25">Subtotal</span>
                    <span className="text-[8px] text-white/50 font-medium w-16 text-right">₹15,669.49</span>
                  </div>
                  <div className="flex justify-end gap-4">
                    <span className="text-[7px] text-white/25">IGST 18%</span>
                    <span className="text-[8px] text-white/50 font-medium w-16 text-right">₹2,830.51</span>
                  </div>
                  <div className="flex justify-end gap-4 pt-1 border-t border-white/5">
                    <span className="text-[8px] text-white/40 font-medium">Total</span>
                    <span className="text-[9px] text-white/60 font-semibold w-16 text-right">₹18,500.00</span>
                  </div>
                </div>
              </div>

              {/* Scan line animation */}
              <AnimatePresence>
                {phase === "extracting" && (
                  <motion.div
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2.5, ease: "linear" }}
                    className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Right: Extracted data */}
            <div className="p-3 space-y-1.5">
              <div className="flex gap-1 mb-2">
                <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[7px] font-semibold text-primary">Extracted Data</span>
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[7px] text-white/25">Validations</span>
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[7px] text-white/25">History</span>
              </div>

              {EXTRACTED_FIELDS.map((field, i) => (
                <motion.div
                  key={field.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: showFields ? 1 : 0, x: showFields ? 0 : 10 }}
                  transition={{ duration: 0.3, delay: showFields ? i * 0.15 : 0 }}
                  className="flex items-center justify-between py-[3px] border-b border-white/5 last:border-0"
                >
                  <span className="text-[8px] text-white/30">{field.label}</span>
                  <span className="text-[8px] text-white/65 font-medium">{field.value}</span>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: showValidation ? 1 : 0, y: showValidation ? 0 : 8 }}
                transition={{ duration: 0.4, delay: showValidation ? 0.2 : 0 }}
                className="flex flex-wrap gap-1.5 pt-1"
              >
                {VALIDATIONS.map((v) => (
                  <span
                    key={v.label}
                    className={`rounded border px-1.5 py-0.5 text-[7px] font-medium ${v.bg} ${v.border} ${v.color}`}
                  >
                    {v.label}
                  </span>
                ))}
                <span className="rounded border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-[7px] font-medium text-emerald-400">
                  Status: Validated ✓
                </span>
              </motion.div>
            </div>
          </div>
        </WindowChrome>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Collection dashboard visual — the "after" state                   */
/* ------------------------------------------------------------------ */

const COLLECTION_DOCS = [
  { name: "INV-2847-Acme.pdf", source: "Email", sourceColor: "text-sky-400", sourceBg: "bg-sky-400/15", status: "Validated", statusColor: "text-emerald-400", statusBg: "bg-emerald-400/10", statusBorder: "border-emerald-400/20", amount: "₹18,500" },
  { name: "INV-3021-TechParts.pdf", source: "WhatsApp", sourceColor: "text-emerald-400", sourceBg: "bg-emerald-400/15", status: "Validated", statusColor: "text-emerald-400", statusBg: "bg-emerald-400/10", statusBorder: "border-emerald-400/20", amount: "₹24,200" },
  { name: "INV-3045-GlobalTrade.pdf", source: "Upload", sourceColor: "text-violet-400", sourceBg: "bg-violet-400/15", status: "Needs Review", statusColor: "text-amber-400", statusBg: "bg-amber-400/10", statusBorder: "border-amber-400/20", amount: "₹9,750" },
  { name: "INV-3102-Meridian.pdf", source: "Email", sourceColor: "text-sky-400", sourceBg: "bg-sky-400/15", status: "Validated", statusColor: "text-emerald-400", statusBg: "bg-emerald-400/10", statusBorder: "border-emerald-400/20", amount: "₹31,000" },
  { name: "INV-3118-PrimeParts.pdf", source: "WhatsApp", sourceColor: "text-emerald-400", sourceBg: "bg-emerald-400/15", status: "Processing", statusColor: "text-primary", statusBg: "bg-primary/10", statusBorder: "border-primary/20", amount: "₹12,800" },
];

const COLLECTION_STATS = [
  { label: "Total", value: "12", color: "text-white/50", bg: "bg-white/5" },
  { label: "Validated", value: "8", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { label: "Review", value: "2", color: "text-amber-400", bg: "bg-amber-400/10" },
  { label: "Processing", value: "2", color: "text-primary", bg: "bg-primary/10" },
];

function CollectionDashboardVisual() {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3/4 bg-primary/12 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full">
        <WindowChrome
          url="app.satvos.com/collections/q4-invoices"
          breadcrumb={
            <div className="flex items-center gap-1 text-[8px] text-white/25">
              <span>Collections</span>
              <span>/</span>
              <span className="text-white/50 font-medium">Q4 Invoices 2025</span>
            </div>
          }
        >
          <div className="min-h-[260px] sm:min-h-[280px]">
            {/* Stats bar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5">
              {COLLECTION_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className={`flex items-center gap-1.5 rounded px-2 py-1 ${stat.bg}`}
                >
                  <span className={`text-[9px] font-bold ${stat.color}`}>{stat.value}</span>
                  <span className="text-[8px] text-white/30">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-3 py-1.5 border-b border-white/5">
              <span className="text-[7px] uppercase tracking-wider text-white/20">Document</span>
              <span className="text-[7px] uppercase tracking-wider text-white/20">Source</span>
              <span className="text-[7px] uppercase tracking-wider text-white/20">Status</span>
              <span className="text-[7px] uppercase tracking-wider text-white/20 text-right">Amount</span>
            </div>

            {/* Table rows */}
            {COLLECTION_DOCS.map((doc, i) => (
              <motion.div
                key={doc.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.12 }}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center px-3 py-2 border-b border-white/5 last:border-0"
              >
                <span className="text-[8px] text-white/50 font-medium truncate">{doc.name}</span>
                <span className={`rounded px-1.5 py-0.5 text-[7px] font-medium ${doc.sourceBg} ${doc.sourceColor}`}>
                  {doc.source}
                </span>
                <span className={`rounded border px-1.5 py-0.5 text-[7px] font-medium ${doc.statusBg} ${doc.statusBorder} ${doc.statusColor}`}>
                  {doc.status}
                </span>
                <span className="text-[8px] text-white/50 font-medium text-right">{doc.amount}</span>
              </motion.div>
            ))}
          </div>
        </WindowChrome>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero carousel — cycles between extraction and collection views    */
/* ------------------------------------------------------------------ */

const HERO_SLIDES = [HeroVisual, CollectionDashboardVisual] as const;

function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      {/* Grid stacking: both slides always mounted, tallest defines height */}
      <div className="grid">
        {HERO_SLIDES.map((SlideComponent, i) => (
          <motion.div
            key={i}
            className="col-start-1 row-start-1"
            animate={{
              opacity: i === activeSlide ? 1 : 0,
              x: i === activeSlide ? 0 : 20,
            }}
            transition={{ duration: 0.35 }}
            style={{ pointerEvents: i === activeSlide ? "auto" : "none" }}
          >
            <SlideComponent />
          </motion.div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setActiveSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeSlide
                ? "w-6 bg-white/60"
                : "w-1.5 bg-white/20 hover:bg-white/30"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Twinkling crosses — matches the background grid plus-sign pattern  */
/* ------------------------------------------------------------------ */

const TWINKLE_CROSSES = [
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
      <style>{`
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

      {/* Gradient orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"
        style={{ animation: "float-1 15s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"
        style={{ animation: "float-2 18s ease-in-out infinite" }}
      />

      {/* Twinkling crosses */}
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left column: text */}
            <div className="text-center lg:text-left max-w-xl lg:max-w-none mx-auto lg:mx-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-6"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-white/70">
                  NEW: Submit invoices via Email or WhatsApp
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
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
                <span className="block mt-3 text-lg sm:text-xl font-normal tracking-wide text-indigo-300/50">
                  From invoice chaos to clean books in minutes
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-6 text-lg text-white/60 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                Forward invoices by email, snap a photo on WhatsApp, or upload in the
                dashboard. AI extracts every field, validates against GST rules, and
                reconciles with GSTR-2A/2B — you just review and approve.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <Link
                  href={loggedIn ? "/dashboard" : "/register"}
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:bg-white/90"
                >
                  {loggedIn ? "Go to Dashboard" : "Start for Free"}
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
                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-sm text-white/40"
              >
                {[
                  "Free to start",
                  "No credit card",
                  "GST & GSTR-2A/2B ready",
                  "Works via Email & WhatsApp",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right column: visual */}
            <HeroCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
