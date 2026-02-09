"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What invoice formats does Satvos support?",
    answer:
      "Satvos accepts PDF files, scanned images (JPEG, PNG), and photographs of invoices. Our AI model handles various layouts including printed invoices, handwritten bills, and computer-generated PDFs. If a human can read it, Satvos can extract it.",
  },
  {
    question: "How accurate is the AI extraction?",
    answer:
      "Our extraction accuracy typically exceeds 95% for structured fields like invoice numbers, dates, GSTINs, and totals. For complex line items and handwritten notes, accuracy is around 90%. Every extraction includes confidence scores so you can prioritize manual review where needed.",
  },
  {
    question: "Does Satvos support GSTR-2A and GSTR-2B reconciliation?",
    answer:
      "Yes. You can upload your GSTR-2A/2B data and Satvos will automatically match it against your parsed purchase invoices. It identifies missing invoices, amount mismatches, GSTIN discrepancies, and ITC differences — all in a single view.",
  },
  {
    question: "Can I use Satvos for multiple clients?",
    answer:
      "Absolutely. Satvos supports multi-tenant workspaces. Accounting firms can create separate collections for each client, assign team members with granular permissions, and manage everything from a single dashboard.",
  },
  {
    question: "Is my data secure?",
    answer:
      "All data is encrypted at rest and in transit. We use AES-256 encryption for stored documents and TLS 1.3 for all API communications. Your invoices and financial data never leave your tenant's isolated environment. We also support on-premise deployment for Enterprise customers.",
  },
  {
    question: "What happens when an invoice fails validation?",
    answer:
      "Failed validations are flagged in the Needs Attention queue with detailed error descriptions. You can review the original invoice alongside the extracted data, make corrections inline, and re-validate with one click. The full history of changes is preserved for audit purposes.",
  },
  {
    question: "Can I integrate Satvos with my accounting software?",
    answer:
      "Pro and Enterprise plans include API access for custom integrations. You can also export validated data as CSV files compatible with Tally, Zoho Books, QuickBooks, and other popular accounting tools. We're building native integrations for top platforms.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes, all paid plans come with a 14-day free trial. No credit card required to start. You'll have access to all features during the trial period so you can evaluate Satvos with your actual workflow.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-semibold text-foreground pr-4">{question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            FAQ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about Satvos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl border border-border bg-card px-6"
        >
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
