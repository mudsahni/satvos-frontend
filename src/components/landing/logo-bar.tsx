"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const metrics = [
  { value: 10000, suffix: "+", label: "Invoices Processed" },
  { value: 98.5, suffix: "%", label: "Extraction Accuracy", decimals: 1 },
  { value: 40, suffix: "+ hrs", label: "Saved per Firm Monthly" },
];

function AnimatedNumber({
  target,
  suffix,
  decimals = 0,
  animate,
}: {
  target: number;
  suffix: string;
  decimals?: number;
  animate: boolean;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!animate) return;

    const start = 0;
    const duration = 1500;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const value = start + (target - start) * eased;
      setCurrent(value);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [animate, target]);

  const formatted =
    decimals > 0
      ? current.toFixed(decimals)
      : current >= 1000
        ? Math.round(current).toLocaleString()
        : Math.round(current).toString();

  return (
    <span>
      {formatted}
      {suffix}
    </span>
  );
}

export function LogoBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section className="py-16 border-b border-border/50" ref={ref}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16"
        >
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-foreground">
                <AnimatedNumber
                  target={m.value}
                  suffix={m.suffix}
                  decimals={m.decimals}
                  animate={inView}
                />
              </p>
              <p className="text-sm text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
