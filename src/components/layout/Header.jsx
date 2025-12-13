// src/components/layout/Header.jsx
import React from "react";
import { Menu } from "lucide-react";

export default function Header({
  activeTab,
  setSidebarOpen,
  TimeFilter,
  globalTimeFilter,
  setGlobalTimeFilter,
  globalCustomRange,
  setGlobalCustomRange,
  tabTimeFilter,
  setTabTimeFilter,
  tabCustomRange,
  setTabCustomRange
}) {
  const isDashboardLike =
    activeTab === "dashboard" || activeTab === "ai-analysis";

  return (
    <header className="mb-6">
      <div className="flex flex-col gap-4">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="md:hidden p-2 rounded-xl hover:bg-white border bg-white shadow-sm"
              title="باز کردن منو"
            >
              <Menu size={18} />
            </button>

            <h1 className="text-xl font-black text-gray-800">
              {activeTab === "dashboard" && "داشبورد"}
              {activeTab === "issues" && "مشکلات فنی"}
              {activeTab === "frozen" && "اکانت‌های فریز"}
              {activeTab === "features" && "درخواست‌های فیچر"}
              {activeTab === "refunds" && "بازگشت وجه"}
              {activeTab === "onboarding" && "ورود کاربران"}
              {activeTab === "profile" && "پروفایل کاربر"}
              {activeTab === "ai-analysis" && "تحلیل هوشمند"}
            </h1>
          </div>

          {/* Right: filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Global time filter */}
            {isDashboardLike && TimeFilter && (
              <TimeFilter
                value={globalTimeFilter}
                onChange={setGlobalTimeFilter}
                customRange={globalCustomRange}
                onCustomChange={setGlobalCustomRange}
              />
            )}

            {/* Tab time filter */}
            {!isDashboardLike && TimeFilter && (
              <TimeFilter
                value={tabTimeFilter}
                onChange={setTabTimeFilter}
                customRange={tabCustomRange}
                onCustomChange={setTabCustomRange}
              />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200/70" />
      </div>
    </header>
  );
}
