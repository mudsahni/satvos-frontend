"use client";

import { motion } from "framer-motion";
import { Mail, MessageCircle, Upload, Paperclip, Check } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Channel card mini-mockups                                         */
/* ------------------------------------------------------------------ */

function EmailMockup() {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2 text-left">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="h-5 w-5 rounded-full bg-sky-500/10 flex items-center justify-center">
          <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400">A</span>
        </div>
        <span className="font-medium text-foreground">Acme Corp</span>
        <span className="text-muted-foreground/60 ml-auto text-[10px]">2m ago</span>
      </div>
      <p className="text-xs font-medium text-foreground leading-tight">
        Fwd: Invoice #2847 - Acme Corp
      </p>
      <p className="text-[11px] text-muted-foreground leading-snug">
        Hi, please find attached the invoice for December...
      </p>
      <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1.5">
        <Paperclip className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">INV-2847-Acme.pdf</span>
        <span className="text-[9px] text-muted-foreground/50 ml-auto">2.4 MB</span>
      </div>
    </div>
  );
}

function WhatsAppMockup() {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2 text-left">
      {/* Chat bubbles */}
      <div className="space-y-1.5">
        {/* User message */}
        <div className="flex justify-end">
          <div className="rounded-lg rounded-br-sm bg-[#dcf8c6] dark:bg-emerald-900/40 px-2.5 py-1.5 max-w-[80%]">
            <div className="rounded border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 p-1.5 mb-1">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-5 bg-muted rounded-sm flex items-center justify-center">
                  <span className="text-[6px] text-muted-foreground">PDF</span>
                </div>
                <div>
                  <p className="text-[9px] font-medium text-foreground leading-tight">invoice-dec.pdf</p>
                  <p className="text-[8px] text-muted-foreground">1.8 MB</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-foreground dark:text-emerald-100">December invoice from TechParts</p>
            <p className="text-[8px] text-muted-foreground text-right mt-0.5">10:42 AM</p>
          </div>
        </div>
        {/* Bot reply */}
        <div className="flex justify-start">
          <div className="rounded-lg rounded-bl-sm bg-muted/60 dark:bg-white/5 px-2.5 py-1.5 max-w-[80%]">
            <p className="text-[11px] text-foreground">
              <Check className="inline h-2.5 w-2.5 text-emerald-500 mr-0.5" />
              Invoice received! Processing now...
            </p>
            <p className="text-[8px] text-muted-foreground text-right mt-0.5">10:42 AM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadMockup() {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2 text-left">
      {/* Drop zone */}
      <div className="rounded-lg border border-dashed border-border px-3 py-3 text-center">
        <div className="flex justify-center mb-1">
          <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Upload className="h-3 w-3 text-primary" />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Drop files here or <span className="text-primary font-medium">browse</span>
        </p>
      </div>
      {/* File progress */}
      <div className="space-y-1.5">
        {[
          { name: "acme-inv-2847.pdf", pct: 100, status: "Done", sc: "text-emerald-500" },
          { name: "techparts-446.pdf", pct: 65, status: "Uploading", sc: "text-primary" },
        ].map((f) => (
          <div key={f.name} className="rounded-md border border-border px-2 py-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground truncate">{f.name}</span>
              <span className={`text-[9px] font-medium ${f.sc}`}>{f.status}</span>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${f.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Channel data                                                      */
/* ------------------------------------------------------------------ */

const channels = [
  {
    icon: Mail,
    title: "Email",
    accent: "text-sky-500",
    accentBg: "bg-sky-500/10 group-hover:bg-sky-500/15",
    accentBorder: "border-sky-500/20",
    caption: "Forward vendor invoices straight from your inbox",
    detail: "Get a dedicated address like invoices@yourfirm.satvos.com",
    Mockup: EmailMockup,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    accent: "text-[#25D366]",
    accentBg: "bg-[#25D366]/10 group-hover:bg-[#25D366]/15",
    accentBorder: "border-[#25D366]/20",
    caption: "Snap a photo and send via WhatsApp",
    detail: "Field staff and vendors can submit directly",
    Mockup: WhatsAppMockup,
  },
  {
    icon: Upload,
    title: "Dashboard",
    accent: "text-primary",
    accentBg: "bg-primary/10 group-hover:bg-primary/15",
    accentBorder: "border-primary/20",
    caption: "Or drag-and-drop in the dashboard",
    detail: "Bulk upload hundreds of invoices at once",
    Mockup: UploadMockup,
  },
];

/* ------------------------------------------------------------------ */
/*  Convergence funnel (CSS gradient between cards and result)        */
/* ------------------------------------------------------------------ */

function ConvergenceFunnel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="hidden md:block relative h-16 max-w-4xl mx-auto my-2"
    >
      {/* Soft gradient that narrows from cards-width toward result-width */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          background: "linear-gradient(to bottom, currentColor, transparent)",
          clipPath: "polygon(10% 0%, 90% 0%, 65% 100%, 35% 100%)",
        }}
      />
      {/* Three small channel-colored dots at the top edge, aligned with card centers */}
      <div className="absolute top-0 left-[16.67%] h-1.5 w-1.5 rounded-full bg-sky-400/40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-[#25D366]/40" />
      <div className="absolute top-0 right-[16.67%] h-1.5 w-1.5 rounded-full bg-primary/40" />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Convergence result table with directional row animations          */
/* ------------------------------------------------------------------ */

const resultRows = [
  { name: "INV-2847-Acme.pdf", source: "via Email", sc: "text-sky-500 bg-sky-500/10", x: -30, y: 0, delay: 0.5 },
  { name: "invoice-dec.pdf", source: "via WhatsApp", sc: "text-[#25D366] bg-[#25D366]/10", x: 0, y: 10, delay: 0.7 },
  { name: "acme-inv-2847.pdf", source: "via Upload", sc: "text-primary bg-primary/10", x: 30, y: 0, delay: 0.9 },
];

function ConvergenceResult() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="px-3 py-2 border-b border-border bg-muted/30"
      >
        <p className="text-xs font-semibold text-foreground">Q4 Invoices 2025</p>
        <p className="text-[10px] text-muted-foreground">All channels &rarr; one collection</p>
      </motion.div>
      <div className="divide-y divide-border">
        {resultRows.map((row) => (
          <motion.div
            key={row.name}
            initial={{ opacity: 0, x: row.x, y: row.y }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: row.delay }}
            className="flex items-center justify-between px-3 py-2"
          >
            <span className="text-xs text-muted-foreground">{row.name}</span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${row.sc}`}>{row.source}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main section                                                      */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function SubmitChannels() {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Multi-Channel Intake
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Submit Invoices from Anywhere
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No login required. Every invoice lands in your dashboard, extracted and
            validated — no matter how it arrived.
          </p>
        </motion.div>

        {/* Three channel cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {channels.map((ch) => (
            <motion.div
              key={ch.title}
              variants={cardVariants}
              className="group rounded-xl border border-border bg-card p-5 space-y-4 transition-all duration-300 hover:shadow-lg hover:shadow-black/5"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${ch.accentBg} ${ch.accentBorder}`}>
                  <ch.icon className={`h-5 w-5 ${ch.accent}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{ch.title}</h3>
              </div>

              <ch.Mockup />

              <div>
                <p className="text-sm font-medium text-foreground">{ch.caption}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ch.detail}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Gradient funnel between cards and result */}
        <ConvergenceFunnel />

        {/* Convergence result table */}
        <ConvergenceResult />
      </div>
    </section>
  );
}
