"use client";

import { motion } from "framer-motion";
import { Upload, Sparkles, FileCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Invoices",
    description:
      "Drag and drop PDFs, scanned images, or photos. Upload individually or in bulk — hundreds at a time. We accept any format your vendors send.",
    color: "text-sky-500",
    bg: "bg-sky-500/10 border-sky-500/20",
    badge: "bg-sky-500",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Auto-Parse & Validate",
    description:
      "AI extracts every field: seller info, line items, amounts, GSTIN, HSN codes. Then validation rules catch errors, duplicates, and mismatches automatically.",
    color: "text-violet-500",
    bg: "bg-violet-500/10 border-violet-500/20",
    badge: "bg-violet-500",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Reconcile & Export",
    description:
      "Match parsed invoices against GSTR-2A/2B data. Review flagged items, approve in bulk, and export clean CSV files ready for your accounting software.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    badge: "bg-emerald-500",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Three steps to automated invoicing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Go from a pile of invoices to validated, reconciled data in minutes.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative grid md:grid-cols-3 gap-8"
        >
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-sky-500/30 via-violet-500/30 to-emerald-500/30" />

          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={cardVariants}
              className="relative text-center"
            >
              {/* Number circle */}
              <div className="relative inline-flex mb-6">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${step.bg}`}>
                  <step.icon className={`h-6 w-6 ${step.color}`} />
                </div>
                <span className={`absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full ${step.badge} text-[10px] font-bold text-white`}>
                  {step.number}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
