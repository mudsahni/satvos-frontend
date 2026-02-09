"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock, ShieldAlert } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "Manual Data Entry Errors",
    description:
      "Typing invoice data by hand leads to mismatched amounts, wrong GSTIN numbers, and ITC claim rejections. One digit off means compliance trouble.",
    stat: "23%",
    statLabel: "of GST notices stem from data entry mistakes",
    color: "text-indigo-500 dark:text-indigo-400",
    iconBg: "bg-indigo-500/10",
  },
  {
    icon: Clock,
    title: "Reconciliation Headaches",
    description:
      "Matching purchase invoices against GSTR-2A/2B across hundreds of vendors every month takes days of spreadsheet work nobody enjoys.",
    stat: "40hrs",
    statLabel: "average monthly time on manual reconciliation",
    color: "text-violet-500 dark:text-violet-400",
    iconBg: "bg-violet-500/10",
  },
  {
    icon: ShieldAlert,
    title: "Compliance Deadlines",
    description:
      "Late filings, missed mismatches, and unresolved discrepancies pile up. By the time the audit comes, it's too late to fix the paper trail.",
    stat: "3.2x",
    statLabel: "more audit queries without automated checks",
    color: "text-fuchsia-500 dark:text-fuchsia-400",
    iconBg: "bg-fuchsia-500/10",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function ProblemSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            The Problem
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Manual invoice processing is broken
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Finance teams waste hours on repetitive work that&apos;s error-prone by nature.
            Here&apos;s what we see every day.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {problems.map((problem) => (
            <motion.div
              key={problem.title}
              variants={cardVariants}
              className="group relative rounded-xl border border-border bg-card p-6 flex flex-col transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${problem.iconBg} mb-4`}>
                <problem.icon className={`h-5 w-5 ${problem.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{problem.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {problem.description}
              </p>
              <div className="border-t border-border pt-4 mt-6">
                <p className={`text-2xl font-bold ${problem.color}`}>{problem.stat}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{problem.statLabel}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
