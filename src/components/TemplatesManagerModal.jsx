import React, { useState, useRef } from 'react';
import { X, Save, Trash2, Download, Upload, Check, FolderHeart, Sparkles } from 'lucide-react';
import { exportAllDataAsJSON, importAllDataFromJSON } from '../utils/storage';

export function TemplatesManagerModal({
  isOpen,
  onClose,
  currentLayout,
  savedTemplates,
  onSaveTemplate,
  onDeleteTemplate,
  onSelectTemplate,
  onRefresh,
}) {
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!templateName.trim()) {
      alert('กรุณากรอกชื่อแม่แบบ');
      return;
    }

    const newTemplate = {
      ...currentLayout,
      id: `tpl-${Date.now()}`,
      name: templateName.trim(),
      description: templateDesc.trim() || `สร้างเมื่อ ${new Date().toLocaleDateString('th-TH')}`,
      isCustom: true,
    };

    onSaveTemplate(newTemplate);
    setStatusMessage('บันทึกแม่แบบสำเร็จแล้ว!');
    setTemplateName('');
    setTemplateDesc('');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = importAllDataFromJSON(evt.target.result);
      if (result.success) {
        alert(`นำเข้าข้อมูลและแม่แบบ ${result.countTemplates} รายการสำเร็จ!`);
        if (onRefresh) onRefresh();
      } else {
        alert('เกิดข้อผิดพลาดในการนำเข้า: ' + result.error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">
              จัดการแม่แบบสติกเกอร์ (Local Storage)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Status Message */}
          {statusMessage && (
            <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {statusMessage}
            </div>
          )}

          {/* Form: Save Current Layout */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Save className="w-4 h-4 text-blue-600" />
              บันทึกการตั้งค่าปัจจุบันเป็นแม่แบบใหม่
            </h4>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="เช่น สติกเกอร์กล่องสินค้า A (9x13)"
                  className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  placeholder="คำอธิบายเพิ่มเติม (ไม่บังคับ)"
                  className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs text-slate-600"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                บันทึกลงในเครื่อง (Local Storage)
              </button>
            </form>
          </div>

          {/* List of Custom Saved Templates */}
          <div>
            <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider mb-2">
              แม่แบบที่คุณบันทึกไว้ ({savedTemplates.length} รายการ)
            </h4>

            {savedTemplates.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                ยังไม่มีแม่แบบที่คุณบันทึกไว้ (สามารถบันทึกจากการตั้งค่าปัจจุบันด้านบน)
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {savedTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="font-semibold text-slate-800 text-xs truncate">
                        {tpl.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {tpl.columns} × {tpl.rows} ช่อง | ขอบ {tpl.marginTop}mm | {tpl.paper}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTemplate(tpl);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-md text-xs font-medium transition"
                      >
                        นำไปใช้
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`คุณต้องการลบแม่แบบ "${tpl.name}" ใช่หรือไม่?`)) {
                            onDeleteTemplate(tpl.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Backup & Restore (JSON) */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportAllDataAsJSON}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              สำรองข้อมูลออก (Backup JSON)
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              นำเข้าไฟล์สำรอง (Restore)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium text-xs transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
