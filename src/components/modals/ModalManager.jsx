// src/components/modals/ModalManager.jsx
import React, { useMemo } from "react";
import { X, Save, Sparkles } from "lucide-react";

export default function ModalManager({
  isModalOpen,
  setIsModalOpen,
  modalType,
  formData,
  setFormData,
  handleSave,
  allUsers,
  UserSearchInput,
  VoiceRecorder
}) {
  const isOpen = !!isModalOpen;

  const title = useMemo(() => {
    switch (modalType) {
      case "issue":
        return "ثبت/ویرایش مشکل فنی";
      case "frozen":
        return "ثبت/ویرایش فریز";
      case "feature":
        return "ثبت/ویرایش فیچر";
      case "refund":
        return "ثبت/ویرایش بازگشت وجه";
      case "profile":
        return "ثبت/ویرایش پروفایل";
      case "onboarding":
        return "ثبت/ویرایش آنبوردینگ";
      default:
        return "فرم";
    }
  }, [modalType]);

  const close = () => setIsModalOpen(false);

  const setField = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  if (!isOpen) return null;

  const Input = ({
    label,
    k,
    placeholder,
    type = "text",
    textarea = false,
    rows = 3
  }) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-600">{label}</label>
      {textarea ? (
        <textarea
          value={formData?.[k] ?? ""}
          onChange={(e) => setField(k, e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full border rounded-2xl px-3 py-2.5 text-sm bg-slate-50/50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      ) : (
        <input
          type={type}
          value={formData?.[k] ?? ""}
          onChange={(e) => setField(k, e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded-2xl px-3 py-2.5 text-sm bg-slate-50/50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      )}
    </div>
  );

  const Select = ({ label, k, options = [], placeholder = "انتخاب کنید" }) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-600">{label}</label>
      <select
        value={formData?.[k] ?? ""}
        onChange={(e) => setField(k, e.target.value)}
        className="w-full border rounded-2xl px-3 py-2.5 text-sm bg-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );

  const Checkbox = ({ label, k }) => (
    <label className="flex items-center gap-2 text-sm text-gray-700 bg-slate-50/60 border rounded-2xl px-3 py-2.5">
      <input
        type="checkbox"
        checked={!!formData?.[k]}
        onChange={(e) => setField(k, e.target.checked)}
      />
      <span className="font-bold text-xs">{label}</span>
    </label>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-black text-gray-800">{title}</div>
            <span className="text-[10px] text-gray-400">
              {modalType ? `(${modalType})` : ""}
            </span>
          </div>

          <button
            onClick={close}
            className="p-2 rounded-full hover:bg-white border border-transparent hover:border-slate-200 text-gray-500"
            title="بستن"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* User picker for all report-like modals */}
          {modalType !== "profile" && modalType !== "onboarding" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-600">انتخاب کاربر</label>
              <UserSearchInput
                value={formData?.username || ""}
                onChange={(v) => setField("username", v)}
                onSelect={(u) => {
                  if (!u) return;
                  setFormData((p) => ({
                    ...p,
                    username: u.username || p.username,
                    phone_number: u.phone_number || p.phone_number,
                    instagram_username: u.instagram_username || p.instagram_username,
                    telegram_id: u.telegram_id || p.telegram_id,
                    website: u.website || p.website,
                    bio: u.bio || p.bio
                  }));
                }}
                allUsers={allUsers || []}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="شماره تماس" k="phone_number" placeholder="مثلاً 09..." />
                <Input label="اینستاگرام" k="instagram_username" placeholder="مثلاً mantoo_sepid" />
              </div>
            </div>
          )}

          {/* Common fields */}
          {modalType === "issue" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="ماژول"
                  k="module"
                  options={[
                    "اتصال اینستاگرام",
                    "اتصال تلگرام",
                    "اتوماسیون",
                    "پرومپت",
                    "پرداخت",
                    "محصولات",
                    "داشبورد",
                    "سایر"
                  ]}
                />
                <Select
                  label="نوع مشکل"
                  k="type"
                  options={[
                    "باگ",
                    "کندی",
                    "عدم پاسخگویی",
                    "API",
                    "UI/UX",
                    "اکانت",
                    "سایر"
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="وضعیت"
                  k="status"
                  options={["باز", "بررسی نشده", "در حال پیگیری", "حل‌شده"]}
                />
                <Select
                  label="وضعیت اشتراک"
                  k="subscription_status"
                  options={["Active-Paid", "Paused-Paid", "Trial", "Expired", "Unknown"]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="پرچم پیگیری"
                  k="flag"
                  options={["پیگیری فوری", "پیگیری مهم"]}
                  placeholder="اختیاری"
                />
                <Input
                  label="Resolved At"
                  k="resolved_at"
                  placeholder="اختیاری"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-600">شرح مشکل</label>
                  <VoiceRecorder
                    onTranscript={(t) =>
                      setField("desc_text", `${formData?.desc_text || ""}${formData?.desc_text ? "\n" : ""}${t}`)
                    }
                  />
                </div>
                <textarea
                  value={formData?.desc_text ?? ""}
                  onChange={(e) => setField("desc_text", e.target.value)}
                  rows={4}
                  placeholder="شرح مشکل..."
                  className="w-full border rounded-2xl px-3 py-2.5 text-sm bg-slate-50/50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <Input
                label="یادداشت فنی"
                k="technical_note"
                placeholder="اختیاری"
                textarea
                rows={3}
              />

              <Checkbox label="نیاز به بررسی فنی" k="technical_review" />
            </div>
          )}

          {modalType === "frozen" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="ماژول"
                  k="module"
                  options={["اینستاگرام", "تلگرام", "اتوماسیون", "پرومپت", "سایر"]}
                />
                <Select
                  label="وضعیت"
                  k="status"
                  options={["فریز", "رفع شد", "در حال پیگیری"]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="علت" k="cause" placeholder="مثلاً محدودیت API / مشکل توکن..." />
                <Input label="تعداد دفعات" k="freeze_count" placeholder="مثلاً 2" type="number" />
              </div>

              <Input label="شرح" k="desc_text" placeholder="شرح وضعیت..." textarea rows={4} />
              <Input label="یادداشت" k="note" placeholder="اختیاری" textarea rows={3} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="اولین فریز" k="first_frozen_at" placeholder="اختیاری" />
                <Input label="آخرین فریز" k="last_frozen_at" placeholder="اختیاری" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Resolve Status" k="resolve_status" placeholder="اختیاری" />
                <Select
                  label="وضعیت اشتراک"
                  k="subscription_status"
                  options={["Active-Paid", "Paused-Paid", "Trial", "Expired", "Unknown"]}
                />
              </div>

              <Select
                label="پرچم پیگیری"
                k="flag"
                options={["پیگیری فوری", "پیگیری مهم"]}
                placeholder="اختیاری"
              />
            </div>
          )}

          {modalType === "feature" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="عنوان" k="title" placeholder="مثلاً دکمه توقف چت در استوری" />
                <Input label="دسته‌بندی" k="category" placeholder="مثلاً Smart Automation" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="وضعیت"
                  k="status"
                  options={["بررسی نشده", "در حال بررسی", "در حال توسعه", "انجام شد"]}
                />
                <Input label="تکرار" k="repeat_count" type="number" placeholder="مثلاً 3" />
                <Input label="اهمیت" k="importance" type="number" placeholder="مثلاً 5" />
              </div>

              <Input label="شرح" k="desc_text" placeholder="شرح فیچر..." textarea rows={4} />
              <Input label="یادداشت داخلی" k="internal_note" placeholder="اختیاری" textarea rows={3} />

              <Select
                label="پرچم پیگیری"
                k="flag"
                options={["پیگیری فوری", "پیگیری مهم"]}
                placeholder="اختیاری"
              />
            </div>
          )}

          {modalType === "refund" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="دلیل" k="reason" placeholder="مثلاً عدم نتیجه / مشکل فنی..." />
                <Input label="مدت همکاری" k="duration" placeholder="مثلاً 2 هفته" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="دسته‌بندی" k="category" placeholder="مثلاً نارضایتی" />
                <Input label="منبع فروش" k="sales_source" placeholder="مثلاً اینستاگرام / معرفی" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="اقدام" k="action" placeholder="مثلاً در حال بررسی" />
                <Input label="امکان بازگشت وجه" k="can_return" placeholder="مثلاً بله/خیر" />
              </div>

              <Input label="پیشنهاد" k="suggestion" placeholder="اختیاری" textarea rows={3} />
              <Input label="یادداشت اپس" k="ops_note" placeholder="اختیاری" textarea rows={3} />

              <Select
                label="پرچم پیگیری"
                k="flag"
                options={["پیگیری فوری", "پیگیری مهم"]}
                placeholder="اختیاری"
              />
            </div>
          )}

          {modalType === "profile" && (
            <div className="space-y-4">
              <Input label="نام کاربری" k="username" placeholder="مثلاً customer_1" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="شماره تماس" k="phone_number" placeholder="09..." />
                <Input label="اینستاگرام" k="instagram_username" placeholder="@..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="تلگرام" k="telegram_id" placeholder="مثلاً @id" />
                <Input label="وب‌سایت" k="website" placeholder="example.com" />
              </div>
              <Input label="Bio" k="bio" placeholder="توضیحات کوتاه..." textarea rows={4} />
            </div>
          )}

          {modalType === "onboarding" && (
            <div className="space-y-4">
              <Input label="نام کاربری" k="username" placeholder="مثلاً customer_1" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="شماره تماس" k="phone_number" placeholder="09..." />
                <Input label="اینستاگرام" k="instagram_username" placeholder="@..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="تلگرام" k="telegram_id" placeholder="مثلاً @id" />
                <Select label="وب‌سایت دارد؟" k="has_website" options={["true", "false"]} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="درصد پیشرفت" k="progress" type="number" placeholder="0 تا 100" />
                <Select
                  label="وضعیت تماس اولیه"
                  k="initial_call_status"
                  options={["پاسخ داد", "پاسخ نداد", "در انتظار", "نامشخص"]}
                />
              </div>

              <Input
                label="خلاصه مکالمه"
                k="conversation_summary"
                placeholder="خلاصه..."
                textarea
                rows={3}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="تاریخ تماس" k="call_date" placeholder="اختیاری" />
                <Input label="تاریخ جلسه" k="meeting_date" placeholder="اختیاری" />
              </div>

              <Input label="یادداشت جلسه" k="meeting_note" placeholder="اختیاری" textarea rows={3} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="تاریخ پیگیری" k="followup_date" placeholder="اختیاری" />
                <Input label="یادداشت پیگیری" k="followup_note" placeholder="اختیاری" textarea rows={3} />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50 text-gray-600 font-bold text-sm transition"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            <Save size={16} />
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
}
