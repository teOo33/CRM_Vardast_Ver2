// ModalManager.jsx
import React from 'react';
import { X, Wrench } from 'lucide-react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

export default function ModalManager({
  isModalOpen,
  modalType,
  formData,
  setFormData,
  handleSave,
  allUsers,
  closeModal,
  VoiceRecorder,
  UserSearchInput,
}) {
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm z-[60] p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-base text-gray-800">
            {modalType === 'onboarding' ? 'مدیریت آنبوردینگ' : 'ثبت/ویرایش اطلاعات'}
          </h3>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar"
        >
          {/* Onboarding Specific Fields */}
          {modalType === 'onboarding' ? (
            <div className="space-y-4">
              <UserSearchInput
                value={formData.username}
                onChange={(val) =>
                  setFormData((p) => ({ ...p, username: val }))
                }
                onSelect={(u) =>
                  setFormData((p) => ({
                    ...p,
                    username: u.username,
                    phone_number: u.phone_number || '',
                  }))
                }
                allUsers={allUsers}
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">
                  درصد پیشرفت ({formData.progress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.progress || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, progress: e.target.value })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <select
                value={formData.has_website || 'false'}
                onChange={(e) =>
                  setFormData({ ...formData, has_website: e.target.value })
                }
                className="border p-3 rounded-xl text-sm w-full"
              >
                <option value="false">وبسایت ندارد</option>
                <option value="true">وبسایت دارد</option>
              </select>

              {/* Section 1: Call */}
              <div className="bg-slate-50 p-3 rounded-xl space-y-2 border">
                <h4 className="font-bold text-gray-700 text-xs">
                  ۱. تماس اولیه
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={formData.initial_call_status || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initial_call_status: e.target.value,
                      })
                    }
                    className="border p-2 rounded-lg text-xs w-full"
                  >
                    <option value="">وضعیت...</option>
                    <option value="پاسخ داد">پاسخ داد</option>
                    <option value="پاسخ نداد">پاسخ نداد</option>
                    <option value="رد تماس">رد تماس</option>
                  </select>
                  <input
                    type="text"
                    placeholder="تاریخ (۱۴۰۳/...)"
                    value={formData.call_date || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, call_date: e.target.value })
                    }
                    className="border p-2 rounded-lg text-xs"
                  />
                </div>
                <div className="relative">
                  <textarea
                    placeholder="خلاصه مکالمه..."
                    rows="2"
                    value={formData.conversation_summary || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conversation_summary: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded-lg text-xs"
                  />
                  <div className="absolute left-1 bottom-1">
                    <VoiceRecorder
                      onTranscript={(text) =>
                        setFormData((p) => ({
                          ...p,
                          conversation_summary:
                            (p.conversation_summary || '') + ' ' + text,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Meeting */}
              <div className="bg-slate-50 p-3 rounded-xl space-y-2 border">
                <h4 className="font-bold text-gray-700 text-xs">
                  ۲. جلسه آنلاین
                </h4>
                <input
                  type="text"
                  placeholder="تاریخ جلسه"
                  value={formData.meeting_date || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, meeting_date: e.target.value })
                  }
                  className="border p-2 rounded-lg text-xs w-full"
                />
                <div className="relative">
                  <textarea
                    placeholder="توضیحات جلسه..."
                    rows="2"
                    value={formData.meeting_note || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meeting_note: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded-lg text-xs"
                  />
                  <div className="absolute left-1 bottom-1">
                    <VoiceRecorder
                      onTranscript={(text) =>
                        setFormData((p) => ({
                          ...p,
                          meeting_note: (p.meeting_note || '') + ' ' + text,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Followup */}
              <div className="bg-slate-50 p-3 rounded-xl space-y-2 border">
                <h4 className="font-bold text-gray-700 text-xs">
                  ۳. پیگیری بعدی
                </h4>
                <input
                  type="text"
                  placeholder="تاریخ فالوآپ"
                  value={formData.followup_date || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      followup_date: e.target.value,
                    })
                  }
                  className="border p-2 rounded-lg text-xs w-full"
                />
                <div className="relative">
                  <textarea
                    placeholder="توضیحات پیگیری..."
                    rows="2"
                    value={formData.followup_note || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        followup_note: e.target.value,
                      })
                    }
                    className="w-full border p-2 rounded-lg text-xs"
                  />
                  <div className="absolute left-1 bottom-1">
                    <VoiceRecorder
                      onTranscript={(text) =>
                        setFormData((p) => ({
                          ...p,
                          followup_note: (p.followup_note || '') + ' ' + text,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Default Fields for other types
            <>
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">
                  نام کاربری
                </label>
                <UserSearchInput
                  value={formData.username || ''}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, username: val }))
                  }
                  onSelect={(u) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: u.username,
                      phone_number: u.phone_number || prev.phone_number,
                      instagram_username:
                        u.instagram_username || prev.instagram_username,
                    }))
                  }
                  allUsers={allUsers}
                />
              </div>

              {/* Date field for reports (not profile, not onboarding) */}
              {modalType !== 'profile' && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-medium">
                    تاریخ ثبت
                  </label>
                  <div className="w-full">
                    <DatePicker
                      calendar={persian}
                      locale={persian_fa}
                      value={formData.date || new Date()}
                      onChange={(date) =>
                        setFormData({ ...formData, date: date })
                      }
                      inputClass="w-full border p-3 rounded-xl text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Common inputs */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="شماره تماس"
                  value={formData.phone_number || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone_number: e.target.value,
                    })
                  }
                  className="border p-3 rounded-xl text-sm w-full"
                />
                <input
                  placeholder="اینستاگرام"
                  value={formData.instagram_username || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instagram_username: e.target.value,
                    })
                  }
                  className="border p-3 rounded-xl text-sm w-full"
                />
              </div>

              {modalType === 'profile' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="آیدی تلگرام"
                      value={formData.telegram_id || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          telegram_id: e.target.value,
                        })
                      }
                      className="border p-3 rounded-xl text-sm w-full"
                    />
                    <input
                      placeholder="وبسایت"
                      value={formData.website || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          website: e.target.value,
                        })
                      }
                      className="border p-3 rounded-xl text-sm w-full"
                    />
                  </div>
                  <textarea
                    placeholder="بیوگرافی..."
                    rows="3"
                    value={formData.bio || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full border p-3 rounded-xl text-sm"
                  />
                </>
              )}

              {/* Issue Specific */}
              {modalType === 'issue' && (
                <>
                  <select
                    value={formData.status || 'باز'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="border p-3 rounded-xl text-sm w-full"
                  >
                    <option value="باز">باز</option>
                    <option value="در حال بررسی">در حال بررسی</option>
                    <option value="حل‌شده">حل‌شده</option>
                  </select>
                  <div className="relative">
                    <textarea
                      rows="3"
                      placeholder="شرح مشکل..."
                      value={formData.desc_text || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          desc_text: e.target.value,
                        })
                      }
                      className="w-full border p-3 rounded-xl text-sm"
                    />
                    <div className="absolute left-2 bottom-2">
                      <VoiceRecorder
                        onTranscript={(text) =>
                          setFormData((p) => ({
                            ...p,
                            desc_text: (p.desc_text || '') + ' ' + text,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="tech_review"
                      checked={formData.technical_review || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          technical_review: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor="tech_review"
                      className="text-sm text-gray-700 font-bold flex items-center gap-1"
                    >
                      <Wrench size={14} className="text-gray-500" />
                      بررسی توسط تیم فنی
                    </label>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 font-bold">
                    اولویت
                  </div>
                  <select
                    value={formData.flag || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, flag: e.target.value })
                    }
                    className="border p-3 rounded-xl text-sm w-full mt-1"
                  >
                    <option value="">عادی</option>
                    <option value="پیگیری مهم">پیگیری مهم</option>
                    <option value="پیگیری فوری">پیگیری فوری</option>
                  </select>
                </>
              )}

              {/* Feature Specific */}
              {modalType === 'feature' && (
                <>
                  <select
                    value={formData.status || 'بررسی نشده'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="border p-3 rounded-xl text-sm w-full"
                  >
                    <option value="بررسی نشده">بررسی نشده</option>
                    <option value="در تحلیل">در تحلیل</option>
                    <option value="در توسعه">در توسعه</option>
                    <option value="انجام شد">انجام شد</option>
                  </select>
                  <input
                    placeholder="عنوان فیچر"
                    value={formData.title || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="border p-3 rounded-xl text-sm w-full"
                  />
                  <div className="relative">
                    <textarea
                      rows="3"
                      placeholder="توضیحات..."
                      value={formData.desc_text || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          desc_text: e.target.value,
                        })
                      }
                      className="w-full border p-3 rounded-xl text-sm"
                    />
                    <div className="absolute left-2 bottom-2">
                      <VoiceRecorder
                        onTranscript={(text) =>
                          setFormData((p) => ({
                            ...p,
                            desc_text: (p.desc_text || '') + ' ' + text,
                          }))
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Frozen & Refund simple forms */}
              {(modalType === 'frozen' || modalType === 'refund') && (
                <div className="relative">
                  <textarea
                    rows="3"
                    placeholder="توضیحات..."
                    value={formData.desc_text || formData.reason || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [modalType === 'refund' ? 'reason' : 'desc_text']:
                          e.target.value,
                      })
                    }
                    className="w-full border p-3 rounded-xl text-sm"
                  />
                  <div className="absolute left-2 bottom-2">
                    <VoiceRecorder
                      onTranscript={(text) => {
                        const field = modalType === 'refund' ? 'reason' : 'desc_text';
                        setFormData((p) => ({
                          ...p,
                          [field]: (p[field] || '') + ' ' + text,
                        }));
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-l from-blue-600 to-blue-500 text-white p-3 rounded-xl font-bold hover:shadow-lg mt-4 text-sm"
          >
            ذخیره
          </button>
        </form>
      </div>
    </div>
  );
}
