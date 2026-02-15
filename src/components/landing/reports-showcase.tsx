"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  TrendingUp,
  PieChart,
  ArrowRight,
  Download,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Animated number counter (same pattern as logo-bar.tsx)             */
/* ------------------------------------------------------------------ */

function AnimatedNumber({
  target,
  suffix = "",
  prefix = "",
  decimals = 0,
  animate,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  animate: boolean;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!animate) return;

    const duration = 1500;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setCurrent(target * eased);
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
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Window chrome (same pattern as hero.tsx)                           */
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
/*  SVG chart data                                                    */
/* ------------------------------------------------------------------ */

const CHART_WIDTH = 480;
const CHART_HEIGHT = 160;
const CHART_PADDING = { top: 10, right: 10, bottom: 24, left: 10 };

const revenueData = [120, 155, 140, 185, 210, 245];
const taxData = [18, 24, 21, 29, 33, 38];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function toPath(data: number[], maxVal: number): string {
  const innerW =
    CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const innerH =
    CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  return data
    .map((v, i) => {
      const x =
        CHART_PADDING.left + (i / (data.length - 1)) * innerW;
      const y =
        CHART_PADDING.top + innerH - (v / maxVal) * innerH;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function toAreaPath(data: number[], maxVal: number): string {
  const innerW =
    CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const innerH =
    CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const bottom = CHART_PADDING.top + innerH;

  const points = data.map((v, i) => {
    const x =
      CHART_PADDING.left + (i / (data.length - 1)) * innerW;
    const y =
      CHART_PADDING.top + innerH - (v / maxVal) * innerH;
    return { x, y };
  });

  const linePart = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  const lastX = points[points.length - 1].x;
  const firstX = points[0].x;

  return `${linePart} L${lastX},${bottom} L${firstX},${bottom} Z`;
}

const maxVal = 260;
const revenuePath = toPath(revenueData, maxVal);
const revenueAreaPath = toAreaPath(revenueData, maxVal);
const taxPath = toPath(taxData, maxVal);
const taxAreaPath = toAreaPath(taxData, maxVal);

/* ------------------------------------------------------------------ */
/*  KPI cards config                                                  */
/* ------------------------------------------------------------------ */

const kpis = [
  { label: "Total Revenue", target: 24.5, suffix: "L", prefix: "₹", decimals: 1 },
  { label: "Total Tax", target: 3.8, suffix: "L", prefix: "₹", decimals: 1 },
  { label: "Invoices", target: 127, suffix: "", prefix: "", decimals: 0 },
  { label: "Avg Value", target: 19.3, suffix: "K", prefix: "₹", decimals: 1 },
];

/* ------------------------------------------------------------------ */
/*  Benefit bullets config                                            */
/* ------------------------------------------------------------------ */

const benefits = [
  {
    icon: TrendingUp,
    text: "Revenue & spending trends over any time period",
    color: "text-sky-500 dark:text-sky-400",
    bg: "bg-sky-500/10",
  },
  {
    icon: PieChart,
    text: "CGST, SGST & IGST breakdown at a glance",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: ArrowRight,
    text: "Click any seller or buyer for their full ledger",
    color: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Download,
    text: "One-click CSV export for GST filing",
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
];

/* ------------------------------------------------------------------ */
/*  Tabs for the mockup                                               */
/* ------------------------------------------------------------------ */

const tabs = ["Overview", "Sellers", "Buyers", "Tax", "Ledger"];

/* ------------------------------------------------------------------ */
/*  Reports Dashboard Mockup                                          */
/* ------------------------------------------------------------------ */

function ReportsDashboardMockup({ animate }: { animate: boolean }) {
  return (
    <WindowChrome
      url="app.satvos.com/reports"
      breadcrumb={
        <div className="flex items-center gap-1.5 text-[10px] text-white/30">
          <BarChart3 className="h-3 w-3" />
          <span>Reports</span>
          <span className="text-white/15">/</span>
          <span className="text-white/50">Overview</span>
        </div>
      }
    >
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-white/5">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`px-2.5 py-1 rounded-md text-[10px] font-medium ${
              tab === "Overview"
                ? "bg-white/10 text-white/80"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-2 px-3 pt-3 pb-2">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-2.5 py-2"
          >
            <p className="text-[9px] text-white/30 mb-0.5">{kpi.label}</p>
            <p className="text-sm font-semibold text-white/80 tabular-nums">
              <AnimatedNumber
                target={kpi.target}
                suffix={kpi.suffix}
                prefix={kpi.prefix}
                decimals={kpi.decimals}
                animate={animate}
              />
            </p>
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="px-3 pb-3">
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-2">
          <p className="text-[9px] text-white/30 mb-1">Revenue Trend</p>
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(99 102 241)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="rgb(99 102 241)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="taxFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(245 158 11)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="rgb(245 158 11)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((frac) => {
              const y =
                CHART_PADDING.top +
                (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom) *
                  (1 - frac);
              return (
                <line
                  key={frac}
                  x1={CHART_PADDING.left}
                  y1={y}
                  x2={CHART_WIDTH - CHART_PADDING.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* X-axis labels */}
            {months.map((m, i) => {
              const x =
                CHART_PADDING.left +
                (i / (months.length - 1)) *
                  (CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right);
              return (
                <text
                  key={m}
                  x={x}
                  y={CHART_HEIGHT - 4}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.2)"
                  fontSize="9"
                >
                  {m}
                </text>
              );
            })}

            {/* Tax area fill */}
            <motion.path
              d={taxAreaPath}
              fill="url(#taxFill)"
              initial={{ opacity: 0 }}
              animate={animate ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            />

            {/* Tax line */}
            <motion.path
              d={taxPath}
              fill="none"
              stroke="rgb(245 158 11)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={animate ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
            />

            {/* Revenue area fill */}
            <motion.path
              d={revenueAreaPath}
              fill="url(#revFill)"
              initial={{ opacity: 0 }}
              animate={animate ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            />

            {/* Revenue line */}
            <motion.path
              d={revenuePath}
              fill="none"
              stroke="rgb(99 102 241)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={animate ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            />
          </svg>
        </div>
      </div>
    </WindowChrome>
  );
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ------------------------------------------------------------------ */
/*  Main export                                                       */
/* ------------------------------------------------------------------ */

export function ReportsShowcase() {
  const mockupRef = useRef<HTMLDivElement>(null);
  const inView = useInView(mockupRef, { once: true, margin: "-100px" });

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column — copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.p
              variants={itemVariants}
              className="text-sm font-semibold text-primary uppercase tracking-wider mb-3"
            >
              Financial Reports
            </motion.p>

            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-foreground"
            >
              From processed invoices to actionable insights
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg text-muted-foreground"
            >
              Once your invoices are validated, Satvos automatically generates
              rich financial dashboards — revenue trends, tax breakdowns,
              seller and buyer ledgers — so your team spends less time in
              spreadsheets.
            </motion.p>

            {/* Benefit bullets */}
            <motion.ul
              variants={containerVariants}
              className="mt-8 space-y-4"
            >
              {benefits.map((b) => (
                <motion.li
                  key={b.text}
                  variants={itemVariants}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${b.bg}`}
                  >
                    <b.icon className={`h-4 w-4 ${b.color}`} />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed pt-1">
                    {b.text}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={itemVariants} className="mt-8">
              <Button asChild>
                <Link href="/register">
                  Explore Reports
                  <ArrowRight />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right column — animated mockup */}
          <motion.div
            ref={mockupRef}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <ReportsDashboardMockup animate={inView} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
