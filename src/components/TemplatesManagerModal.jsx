import React, { useState, useRef } from 'react';
import { X, Save, Trash2, Download, Upload, Check, FolderHeart, Cloud, CloudCheck, CloudUpload, HardDrive, RefreshCw } from 'lucide-react';
import { exportAllDataAsJSON, importAllDataFromJSON } from '../utils/storage';

export function TemplatesManagerModal({
  isOpen,
  onClose,
  currentLayout,
  currentDataConfig,
  currentItems,
  savedTemplates,
  cloudTemplates,
  isCloudConnected,
  isCloudLoading,
  onSaveTemplate,
  onDeleteTemplate,
  onSelectTemplate,
  onRefreshCloud,
}) {
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [includePrintData, setIncludePrintData] = useState(true);
  const [saveTarget, setSaveTarget] = useState('cloud'); // 'cloud' or 'local'
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!templateName.trim()) {
      alert('กรุณากรอกชื่อแม่แบบ');
      return;
    }

    setIsSaving(true);
    try {
      const newTemplate = {
        id: `tpl-${Date.now()}`,
        name: templateName.trim(),
        description: templateDesc.trim() || `สร้างเมื่อ ${new Date().toLocaleDateString('th-TH')}`,
        layout: { ...currentLayout },
        dataConfig: { ...currentDataConfig },
        items: includePrintData ? currentItems : [],
        itemCount: includePrintData ? currentItems.length : 0,
        startSerial: currentItems?.[0]?.serial || currentDataConfig?.startNumber || '',
        endSerial: currentItems?.[currentItems.length - 1]?.serial || '',
        isCloud: saveTarget === 'cloud' && isCloudConnected,
      };

      await onSaveTemplate(newTemplate, saveTarget === 'cloud');
      setStatusMessage(
        saveTarget === 'cloud' && isCloudConnected
          ? '✓ บันทึกแม่แบบและชุดข้อมูลลง Cloudflare D1 สำเร็จ!'
          : '✓ บันทึกแม่แบบลงเครื่อง (Local Storage) สำเร็จ!'
      );
      setTemplateName('');
      setTemplateDesc('');
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err) {
      alert('บันทึกล้มเหลว: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = importAllDataFromJSON(evt.target.result);
      if (result.success) {
        alert(`นำเข้าข้อมูลและแม่แบบ ${result.countTemplates} รายการสำเร็จ!`);
        if (onRefreshCloud) onRefreshCloud();
      } else {
        alert('เกิดข้อผิดพลาดในการนำเข้า: ' + result.error);
      }
    };
    reader.readAsText(file);
  };

  // Combine cloud & local templates for display
  const combinedTemplates = [
    ...(cloudTemplates || []).map(t => ({ ...t, isCloud: true })),
    ...(savedTemplates || []).filter(st => !(cloudTemplates || []).some(ct => ct.id === st.id)),
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">
                จัดการแม่แบบและชุดข้อมูลพิมพ์ (Templates & Data)
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  isCloudConnected
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <Cloud className="w-3 h-3" />
                  {isCloudConnected ? 'Cloudflare D1 (24charge-db) เชื่อมต่อแล้ว' : 'โหมด Localhost (ออฟไลน์)'}
                </span>
              </div>
            </div>
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
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-sm">
          {/* Status Message */}
          {statusMessage && (
            <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200 text-xs flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              {statusMessage}
            </div>
          )}

          {/* Form: Save Current Layout & Data */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CloudUpload className="w-4 h-4 text-blue-600" />
                บันทึกการตั้งค่าพร้อมชุดข้อมูลพิมพ์ (Save as Template)
              </h4>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="เช่น สติกเกอร์ Lot 2026-10-08 เครื่องชาร์จ 8 ช่อง (9x13)"
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  placeholder="คำอธิบายเพิ่มเติม เช่น ใช้ติดมุมกล่องสินค้า (ไม่บังคับ)"
                  className="w-full px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs text-slate-600"
                />
              </div>

              {/* Include Print Data Option */}
              <div className="bg-white/80 border border-blue-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">
                    บันทึกข้อมูล Serial ({currentItems?.length || 0} ดวง) พ่วงกับแม่แบบนี้
                  </span>
                  <span className="text-[11px] text-slate-500">
                    เมื่อโหลดแม่แบบ จะดึงทั้งการจัดหน้าและข้อมูล Serial ทั้งหมดมาพร้อมพิมพ์ทันที
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-3">
                  <input
                    type="checkbox"
                    checked={includePrintData}
                    onChange={(e) => setIncludePrintData(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Target: Cloudflare D1 vs Local */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="saveTarget"
                      value="cloud"
                      checked={saveTarget === 'cloud'}
                      onChange={() => setSaveTarget('cloud')}
                      disabled={!isCloudConnected}
                      className="text-blue-600"
                    />
                    <span className={`font-medium ${isCloudConnected ? 'text-slate-700' : 'text-slate-400'}`}>
                      ☁️ บันทึกลง Cloudflare D1
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="saveTarget"
                      value="local"
                      checked={saveTarget === 'local'}
                      onChange={() => setSaveTarget('local')}
                      className="text-blue-600"
                    />
                    <span className="font-medium text-slate-700">
                      💾 บันทึกในเครื่อง (Local)
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกแม่แบบ'}
                </button>
              </div>
            </form>
          </div>

          {/* List of Saved Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-700 text-xs uppercase tracking-wider">
                แม่แบบและชุดข้อมูลที่บันทึกไว้ ({combinedTemplates.length} รายการ)
              </h4>
              {isCloudConnected && (
                <button
                  type="button"
                  onClick={onRefreshCloud}
                  disabled={isCloudLoading}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isCloudLoading ? 'animate-spin' : ''}`} />
                  รีเฟรช Cloud
                </button>
              )}
            </div>

            {combinedTemplates.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                ยังไม่มีแม่แบบที่บันทึกไว้ (สามารถบันทึกจากการตั้งค่าปัจจุบันด้านบน)
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {combinedTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 text-xs truncate">
                            {tpl.name}
                          </span>
                          {tpl.isCloud ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                              <Cloud className="w-2.5 h-2.5" /> D1
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded">
                              <HardDrive className="w-2.5 h-2.5" /> Local
                            </span>
                          )}
                        </div>
                        {tpl.description && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {tpl.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTemplate(tpl);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-md text-xs font-semibold shadow-2xs transition"
                        >
                          โหลดใช้งาน
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`คุณต้องการลบแม่แบบ "${tpl.name}" ใช่หรือไม่?`)) {
                              onDeleteTemplate(tpl.id, ttplIsCloud => ttplIsCloud || tpl.isCloud);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60 font-mono">
                      <span>{tpl.layout?.columns || 9} × {tpl.layout?.rows || 13} ช่อง</span>
                      <span>•</span>
                      <span>
                        {tpl.items && tpl.items.length > 0
                          ? `Serial: ${tpl.items.length} ดวง (${tpl.startSerial || tpl.items[0]?.serial})`
                          : 'ไม่มีชุดข้อมูลพ่วง'}
                      </span>
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
