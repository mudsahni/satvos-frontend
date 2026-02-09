"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  ArrowLeftRight,
  Layers,
  Users,
  History,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Extraction",
    description:
      "Upload any invoice format — PDF, scan, or photo. Our AI extracts seller details, line items, amounts, GSTIN, and tax breakdowns automatically.",
    color: "text-violet-500",
    bg: "bg-violet-500/10 group-hover:bg-violet-500/15",
  },
  {
    icon: ShieldCheck,
    title: "Validation Rules Engine",
    description:
      "Define custom validation rules or use built-in GST checks. Flag mismatched totals, invalid GSTINs, duplicate invoices, and more before they become problems.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 group-hover:bg-emerald-500/15",
  },
  {
    icon: ArrowLeftRight,
    title: "GST Reconciliation",
    description:
      "Match your purchase register against GSTR-2A/2B data automatically. Identify mismatches, missing invoices, and ITC discrepancies in seconds.",
    color: "text-sky-500",
    bg: "bg-sky-500/10 group-hover:bg-sky-500/15",
  },
  {
    icon: Layers,
    title: "Bulk Operations",
    description:
      "Process hundreds of invoices at once. Bulk upload, approve, reject, or export entire collections with a few clicks instead of one-by-one.",
    color: "text-amber-500",
    bg: "bg-amber-500/10 group-hover:bg-amber-500/15",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Assign collections to team members, set granular permissions, and track who reviewed what. Built for accounting firms with multiple clients.",
    color: "text-rose-500",
    bg: "bg-rose-500/10 group-hover:bg-rose-500/15",
  },
  {
    icon: History,
    title: "Complete Audit Trail",
    description:
      "Every action is logged. Parse results, edits, reviews, and status changes are timestamped with the user who made them. Audit-ready from day one.",
    color: "text-teal-500",
    bg: "bg-teal-500/10 group-hover:bg-teal-500/15",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything you need for invoice processing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From upload to reconciliation, Satvos handles the entire lifecycle so
            your team can focus on what matters.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/5"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg mb-4 transition-colors ${feature.bg}`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
