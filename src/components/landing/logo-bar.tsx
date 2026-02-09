"use client";

import { motion } from "framer-motion";

const logos = [
  { name: "Meridian", initials: "M" },
  { name: "Zenith Audit", initials: "ZA" },
  { name: "PrimeBooks", initials: "PB" },
  { name: "TaxEdge", initials: "TE" },
  { name: "Compliance360", initials: "C3" },
];

export function LogoBar() {
  return (
    <section className="py-16 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm font-medium text-muted-foreground mb-8"
        >
          Trusted by 500+ accounting firms and finance teams across India
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
        >
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center gap-2 text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-current/20 text-xs font-bold">
                {logo.initials}
              </div>
              <span className="text-sm font-semibold tracking-wide">{logo.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
