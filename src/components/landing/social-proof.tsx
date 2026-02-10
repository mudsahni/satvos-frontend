"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "We used to spend 3 days every month reconciling GST invoices. With Satvos, it takes under an hour. The AI extraction is shockingly accurate even on messy scanned invoices.",
    name: "Priya Sharma",
    title: "Partner",
    company: "Sharma & Associates, CA",
    rating: 5,
    accent: "border-l-violet-500",
    avatarBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    quote:
      "The validation engine catches errors our team missed for years. Duplicate invoices, wrong GSTIN formats, mismatched totals — Satvos flags everything before filing.",
    name: "Rajesh Patel",
    title: "Finance Manager",
    company: "NexGen Manufacturing",
    rating: 5,
    accent: "border-l-sky-500",
    avatarBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  {
    quote:
      "We manage 40+ clients and process thousands of invoices monthly. Satvos lets us do it with half the team size. The bulk operations alone save us 20 hours a week.",
    name: "Ananya Gupta",
    title: "Founding Partner",
    company: "TaxEdge Advisory",
    rating: 5,
    accent: "border-l-emerald-500",
    avatarBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
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

export function SocialProof() {
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
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Loved by finance teams
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what accounting professionals and finance teams have to say.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={cardVariants}
              className={`rounded-xl border border-border border-l-[3px] ${testimonial.accent} bg-card p-6 flex flex-col`}
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sm text-foreground leading-relaxed flex-1">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${testimonial.avatarBg} text-xs font-bold`}>
                    {testimonial.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.title}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
