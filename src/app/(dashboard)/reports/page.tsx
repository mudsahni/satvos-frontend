"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  Users,
  Receipt,
  BookOpen,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { ReportFilterBar } from "@/components/reports/report-filter-bar";
import { OverviewTab } from "@/components/reports/overview-tab";
import { SellersTab } from "@/components/reports/sellers-tab";
import { BuyersTab } from "@/components/reports/buyers-tab";
import { TaxAnalysisTab } from "@/components/reports/tax-analysis-tab";
import { PartyLedgerTab } from "@/components/reports/party-ledger-tab";
import type { Granularity, ReportTab, ReportBaseParams, ReportTimeSeriesParams } from "@/types/report";

const TABS = [
  { value: "overview" as const, label: "Overview", icon: BarChart3 },
  { value: "sellers" as const, label: "Sellers", icon: Building2 },
  { value: "buyers" as const, label: "Buyers", icon: Users },
  { value: "tax" as const, label: "Tax Analysis", icon: Receipt },
  { value: "ledger" as const, label: "Party Ledger", icon: BookOpen },
];

function ReportsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMobile = useIsMobile();

  const initialTab = (searchParams.get("tab") as ReportTab) || "overview";

  const [activeTab, setActiveTab] = useState<ReportTab>(initialTab);
  const [from, setFrom] = useState<string | undefined>(searchParams.get("from") ?? undefined);
  const [to, setTo] = useState<string | undefined>(searchParams.get("to") ?? undefined);
  const [collectionId, setCollectionId] = useState<string | undefined>(
    searchParams.get("collection_id") ?? undefined
  );
  const [granularity, setGranularity] = useState<Granularity>("monthly");
  const [ledgerGstin, setLedgerGstin] = useState(searchParams.get("gstin") ?? "");

  const updateUrl = useCallback(
    (tab: ReportTab, gstin?: string) => {
      const params = new URLSearchParams();
      params.set("tab", tab);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (collectionId) params.set("collection_id", collectionId);
      if (gstin) params.set("gstin", gstin);
      router.replace(`/reports?${params.toString()}`, { scroll: false });
    },
    [from, to, collectionId, router]
  );

  const handleTabChange = useCallback(
    (tab: string) => {
      const reportTab = tab as ReportTab;
      setActiveTab(reportTab);
      updateUrl(reportTab, reportTab === "ledger" ? ledgerGstin : undefined);
    },
    [updateUrl, ledgerGstin]
  );

  const handleDateChange = useCallback((newFrom: string | undefined, newTo: string | undefined) => {
    setFrom(newFrom);
    setTo(newTo);
  }, []);

  const handleCollectionChange = useCallback((id: string | undefined) => {
    setCollectionId(id);
  }, []);

  const handleDrillDown = useCallback(
    (gstin: string) => {
      setLedgerGstin(gstin);
      setActiveTab("ledger");
      updateUrl("ledger", gstin);
    },
    [updateUrl]
  );

  const handleLedgerGstinChange = useCallback(
    (gstin: string) => {
      setLedgerGstin(gstin);
      updateUrl("ledger", gstin);
    },
    [updateUrl]
  );

  const baseParams: ReportBaseParams = useMemo(
    () => ({
      from,
      to,
      collection_id: collectionId,
    }),
    [from, to, collectionId]
  );

  const timeSeriesParams: ReportTimeSeriesParams = useMemo(
    () => ({
      ...baseParams,
      granularity,
    }),
    [baseParams, granularity]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Financial analytics and insights across your invoices
        </p>
      </div>

      {/* Filter Bar */}
      <ReportFilterBar
        from={from}
        to={to}
        onDateChange={handleDateChange}
        collectionId={collectionId}
        onCollectionChange={handleCollectionChange}
        granularity={granularity}
        onGranularityChange={setGranularity}
        showGranularity
        activeTab={activeTab}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Mobile: Select dropdown */}
        {isMobile ? (
          <Select value={activeTab} onValueChange={handleTabChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABS.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  <span className="flex items-center gap-2">
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        )}

        <TabsContent value="overview">
          <OverviewTab
            timeSeriesParams={timeSeriesParams}
            baseParams={baseParams}
          />
        </TabsContent>

        <TabsContent value="sellers">
          <SellersTab
            baseParams={baseParams}
            onDrillDown={handleDrillDown}
          />
        </TabsContent>

        <TabsContent value="buyers">
          <BuyersTab
            baseParams={baseParams}
            onDrillDown={handleDrillDown}
          />
        </TabsContent>

        <TabsContent value="tax">
          <TaxAnalysisTab
            timeSeriesParams={timeSeriesParams}
            baseParams={baseParams}
          />
        </TabsContent>

        <TabsContent value="ledger">
          <PartyLedgerTab
            gstin={ledgerGstin}
            onGstinChange={handleLedgerGstinChange}
            baseParams={baseParams}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense>
      <ReportsContent />
    </Suspense>
  );
}
