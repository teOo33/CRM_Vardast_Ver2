// src/components/tabs/SimpleTableTab.jsx
import React, { useMemo } from "react";
import { Plus, Edit } from "lucide-react";

const TAB_META = {
  frozen: {
    title: "اکانت فریز",
    addLabel: "ثبت فریز",
    modalType: "frozen",
    empty: "هیچ مورد فریزی ثبت نشده است."
  },
  refunds: {
    title: "بازگشت وجه",
    addLabel: "ثبت بازگشت وجه",
    modalType: "refund",
    empty: "هیچ درخواست بازگشت وجهی ثبت نشده است."
  }
};

export default function SimpleTableTab({ activeTab, rows, openModal, navigateToProfile }) {
  const meta = TAB_META[activeTab] || {
    title: "لیست",
    addLabel: "ثبت",
    modalType: activeTab,
    empty: "داده‌ای برای نمایش وجود ندارد."
  };

  const safeRows = Array.isArray(rows) ? rows : [];

  const columns = useMemo(() => {
    if (activeTab === "frozen") {
      return [
        { key: "username", label: "کاربر" },
        { key: "desc_text", label: "شرح" },
        { key: "module", label: "ماژول" },
        { key: "cause", label: "علت" },
        { key: "status", label: "وضعیت" },
        { key: "subscription_status", label: "اشتراک" }
      ];
    }
    if (activeTab === "refunds") {
      return [
        { key: "username", label: "کاربر" },
        { key: "reason", label: "دلیل" },
        { key: "duration", label: "مدت" },
        { key: "category", label: "دسته" },
        { key: "action", label: "اقدام" },
        { key: "sales_source", label: "منبع فروش" }
      ];
    }
    // fallback
    return [
      { key: "username", label: "کاربر" },
      { key: "desc_text", label: "شرح" },
      { key: "status", label: "وضعیت" }
    ];
  }, [activeTab]);

  const getCell = (row, key) => {
    const v = row?.[key];
    if (v === null || v === undefined || v === "") return "-";
    if (typeof v === "boolean") return v ? "بله" : "خیر";
    return String(v);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm border border-white">
        <div className="flex items-center gap-2">
          <div className="font-bold text-gray-800">{meta.title}</div>
          <span className="text-xs text-gray-400">({safeRows.length})</span>
        </div>

        <button
          onClick={() => openModal(meta.modalType)}
          className={`text-white px-4 py-2 rounded-xl text-sm flex gap-2 items-center shadow-lg font-bold transition ${
            activeTab === "frozen"
              ? "bg-sky-600 hover:bg-sky-700 shadow-sky-200"
              : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
          }`}
        >
          <Plus size={16} /> {meta.addLabel}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/70 backdrop-blur rounded-3xl border border-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-gray-600">
              <tr className="text-xs">
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 text-right font-bold">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-bold">عملیات</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {safeRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    {meta.empty}
                  </td>
                </tr>
              ) : (
                safeRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 text-gray-700">
                        {c.key === "username" ? (
                          <button
                            className="font-bold text-gray-800 hover:text-blue-600 transition"
                            onClick={() => navigateToProfile(row.username)}
                          >
                            {getCell(row, c.key)}
                          </button>
                        ) : (
                          <span className={c.key === "desc_text" ? "line-clamp-2 block max-w-[520px]" : ""}>
                            {getCell(row, c.key)}
                          </span>
                        )}
                      </td>
                    ))}

                    <td className="px-4 py-3">
                      <button
                        onClick={() => openModal(meta.modalType, row)}
                        className="text-xs font-bold px-3 py-2 rounded-xl border bg-white hover:bg-slate-900 hover:text-white transition flex items-center gap-1"
                      >
                        <Edit size={14} /> ویرایش
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
