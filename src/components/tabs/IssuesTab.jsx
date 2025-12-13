// src/components/tabs/IssuesTab.jsx
import React, { useMemo } from "react";
import { Plus, Columns, List } from "lucide-react";

export default function IssuesTab({
  filteredIssues,
  issueViewMode,
  setIssueViewMode,
  flagFilter,
  setFlagFilter,
  openModal,
  handleStatusChange,
  navigateToProfile,
  KanbanBoard,
  FlagFilter,
  formatDate
}) {
  const columns = useMemo(
    () => ({
      "باز": "باز",
      "بررسی نشده": "بررسی نشده",
      "در حال پیگیری": "در حال پیگیری",
      "حل‌شده": "حل‌شده"
    }),
    []
  );

  const safeIssues = Array.isArray(filteredIssues) ? filteredIssues : [];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-white">
        <div className="flex items-center gap-2">
          <div className="font-bold text-gray-800">مشکلات فنی</div>
          <span className="text-xs text-gray-400">({safeIssues.length})</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode */}
          <div className="flex items-center bg-white border rounded-xl p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setIssueViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                issueViewMode === "table"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              title="نمایش جدولی"
            >
              <List size={14} /> جدول
            </button>
            <button
              type="button"
              onClick={() => setIssueViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                issueViewMode === "kanban"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              title="نمایش کانبان"
            >
              <Columns size={14} /> کانبان
            </button>
          </div>

          {/* Flag Filter */}
          <FlagFilter selectedFlags={flagFilter} onChange={setFlagFilter} />

          {/* Add */}
          <button
            onClick={() => openModal("issue")}
            className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm flex gap-2 items-center hover:bg-amber-600 shadow-lg shadow-amber-200 font-bold"
          >
            <Plus size={16} /> ثبت مشکل
          </button>
        </div>
      </div>

      {/* Content */}
      {issueViewMode === "kanban" ? (
        <div className="bg-white/60 backdrop-blur p-4 rounded-3xl border border-white shadow-sm">
          <KanbanBoard
            items={safeIssues}
            onStatusChange={(id, newStatus) => handleStatusChange(id, newStatus, "issues")}
            columns={columns}
            navigateToProfile={navigateToProfile}
            openModal={openModal}
            type="issue"
          />
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur rounded-3xl border border-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-gray-600">
                <tr className="text-xs">
                  <th className="px-4 py-3 text-right font-bold">کاربر</th>
                  <th className="px-4 py-3 text-right font-bold">شرح</th>
                  <th className="px-4 py-3 text-right font-bold">ماژول</th>
                  <th className="px-4 py-3 text-right font-bold">نوع</th>
                  <th className="px-4 py-3 text-right font-bold">وضعیت</th>
                  <th className="px-4 py-3 text-right font-bold">اولویت</th>
                  <th className="px-4 py-3 text-right font-bold">تاریخ</th>
                  <th className="px-4 py-3 text-right font-bold">عملیات</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {safeIssues.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                      داده‌ای برای نمایش وجود ندارد.
                    </td>
                  </tr>
                ) : (
                  safeIssues.map((i) => (
                    <tr key={i.id} className="hover:bg-blue-50/30 transition">
                      <td className="px-4 py-3">
                        <button
                          className="font-bold text-gray-800 hover:text-blue-600 transition"
                          onClick={() => navigateToProfile(i.username)}
                        >
                          {i.username || "-"}
                        </button>
                        {i.phone_number && (
                          <div className="text-[10px] text-gray-400 mt-1">{i.phone_number}</div>
                        )}
                      </td>

                      <td className="px-4 py-3 max-w-[460px]">
                        <div className="text-gray-700 line-clamp-2">
                          {i.desc_text || "-"}
                        </div>
                        {i.technical_review && (
                          <div className="mt-1 inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-100">
                            بررسی فنی
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-600">{i.module || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{i.type || "-"}</td>

                      <td className="px-4 py-3">
                        <select
                          value={i.status || "باز"}
                          onChange={(e) =>
                            handleStatusChange(String(i.id), e.target.value, "issues")
                          }
                          className="text-xs font-bold border rounded-xl px-2 py-2 bg-white hover:bg-gray-50 outline-none"
                        >
                          {Object.keys(columns).map((s) => (
                            <option key={s} value={s}>
                              {columns[s]}
                            </option>
                          ))}
                          {/* اگر وضعیت‌های دیگری هم داشتی، همینجا دستی اضافه کن */}
                        </select>

                        {i.last_updated_by && (
                          <div className="text-[10px] text-gray-400 mt-1">
                            آپدیت: {i.last_updated_by} ({formatDate(i.last_updated_at)})
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {i.flag ? (
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                              i.flag === "پیگیری فوری"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : "bg-amber-100 text-amber-700 border-amber-200"
                            }`}
                          >
                            {i.flag}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {formatDate(i.created_at)}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => openModal("issue", i)}
                          className="text-xs font-bold px-3 py-2 rounded-xl border bg-white hover:bg-blue-600 hover:text-white transition"
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
