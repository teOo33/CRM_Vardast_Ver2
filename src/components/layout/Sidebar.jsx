// src/components/layout/Sidebar.jsx
import React from "react";
import { Menu, X } from "lucide-react";

export default function Sidebar({
  isSidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  navItems = []
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 right-0 z-40
          w-64 bg-white border-l shadow-xl
          transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b bg-slate-50">
          <div className="font-black text-gray-800 text-sm">
            داشبورد پشتیبانی
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "text-gray-600 hover:bg-slate-100"
                  }
                `}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Desktop toggle button (optional UX) */}
      <button
        onClick={() => setSidebarOpen((p) => !p)}
        className="hidden md:flex fixed bottom-6 right-6 z-20 p-3 rounded-full bg-white border shadow-lg hover:bg-slate-50"
        title="باز/بستن منو"
      >
        <Menu size={18} />
      </button>
    </>
  );
}
