// src/components/tabs/FeaturesTab.jsx
import React, { useMemo } from "react";
import { Plus, Columns, List, ArrowRight } from "lucide-react";

export default function FeaturesTab({
  filteredFeatures,
  featureViewMode,
  setFeatureViewMode,
  openModal,
  setActiveTab,
  handleStatusChange,
  navigateToProfile,
  KanbanBoard
}) {
  const columns = useMemo(
    () => ({
      "بررسی نشده": "بررسی نشده",
      "در حال بررسی": "در حال بررسی",
      "در حال توسعه": "در حال توسعه",
      "انجام شد": "انجام شد"
    }),
    []
  );

  const safeFeatures = Array.isArray(filteredFeatures) ? filteredFeatures : [];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-white">
        <div className="flex items-center gap-2">
          <div className="font-bold text-gray-800">درخواست فیچر</div>
          <span className="text-xs text-gray-400">({safeFeatures.length})</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode */}
          <div className="flex items-center bg-white border rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setFeatureViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                featureViewMode === "table"
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              title="نمایش جدولی"
            >
              <List size={14} /> جدول
            </button>
            <button
              type="button"
              onClick={() => setFeatureViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                featureViewMode === "kanban"
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              title="نمایش کانبان"
            >
              <Columns size={14} /> کانبان
            </button>
          </div>

          {/* Quick nav to AI Analysis (اختیاری/ساده) */}
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab("ai-analysis")}
            className="px-3 py-2 rounded-xl text-xs font-bold border bg-white hover:bg-slate-50 text-gray-600 flex items-center gap-1 transition"
            title="رفتن به تحلیل هوشمند"
          >
            <ArrowRight size={14} /> تحلیل
          </button>

          {/* Add */}
          <button
            onClick={() => openModal("feature")}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm flex gap-2 items-center hover:bg-purple-700 shadow-lg shadow-purple-200 font-bold"
          >
            <Plus size={16} /> ثبت فیچر
          </button>
        </div>
      </div>

      {/* Content */}
      {featureViewMode === "kanban" ? (
        <div className="bg-white/60 backdrop-blur p-4 rounded-3xl border border-white shadow-sm">
          <KanbanBoard
            items={safeFeatures}
            onStatusChange={(id, newStatus) => handleStatusChange(id, newStatus, "features")}
            columns={columns}
            navigateToProfile={navigateToProfile}
            openModal={openModal}
            type="feature"
          />
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur rounded-3xl border border-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-gray-600">
                <tr className="text-xs">
                  <th className="px-4 py-3 text-right font-bold">کاربر</th>
                  <th className="px-4 py-3 text-right font-bold">عنوان</th>
                  <th className="px-4 py-3 text-right font-bold">شرح</th>
                  <th className="px-4 py-3 text-right font-bold">دسته‌بندی</th>
                  <th className="px-4 py-3 text-right font-bold">اولویت</th>
                  <th className="px-4 py-3 text-right font-bold">تکرار</th>
                  <th className="px-4 py-3 text-right font-bold">وضعیت</th>
                  <th className="px-4 py-3 text-right font-bold">عملیات</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {safeFeatures.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                      داده‌ای برای نمایش وجود ندارد.
                    </td>
                  </tr>
                ) : (
                  safeFeatures.map((f) => (
                    <tr key={f.id} className="hover:bg-purple-50/30 transition">
                      <td className="px-4 py-3">
                        <button
                          className="font-bold text-gray-800 hover:text-blue-600 transition"
                          onClick={() => navigateToProfile(f.username)}
                        >
                          {f.username || "-"}
                        </button>
                        {f.phone_number && (
                          <div className="text-[10px] text-gray-400 mt-1">{f.phone_number}</div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-800">
                          {f.title || "-"}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-[520px]">
                        <div className="text-gray-700 line-clamp-2">
                          {f.desc_text || "-"}
                        </div>
                        {f.internal_note && (
                          <div className="mt-1 text-[10px] text-gray-400">
                            یادداشت داخلی: {f.internal_note}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-600">{f.category || "-"}</td>

                      <td className="px-4 py-3">
                        {typeof f.importance === "number" ? (
                          <span className="text-xs font-bold px-2 py-1 rounded-lg border bg-amber-50 text-amber-700 border-amber-100">
                            {f.importance}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {typeof f.repeat_count === "number" ? (
                          <span className="text-xs font-bold px-2 py-1 rounded-lg border bg-slate-50 text-slate-700 border-slate-200">
                            {f.repeat_count}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={f.status || "بررسی نشده"}
                          onChange={(e) =>
                            handleStatusChange(String(f.id), e.target.value, "features")
                          }
                          className="text-xs font-bold border rounded-xl px-2 py-2 bg-white hover:bg-gray-50 outline-none"
                        >
                          {Object.keys(columns).map((s) => (
                            <option key={s} value={s}>
                              {columns[s]}
                            </option>
                          ))}
                        </select>

                        {f.last_updated_by && (
                          <div className="text-[10px] text-gray-400 mt-1">
                            آپدیت: {f.last_updated_by}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => openModal("feature", f)}
                          className="text-xs font-bold px-3 py-2 rounded-xl border bg-white hover:bg-purple-600 hover:text-white transition"
                        >
                          ویرایش
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
