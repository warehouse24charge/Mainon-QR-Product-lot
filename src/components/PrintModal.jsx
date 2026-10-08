import React from 'react';
import { X, Printer, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export function PrintModal({
  isOpen,
  onClose,
  onConfirmPrint,
  itemCount,
  totalPages,
  layout,
}) {
  if (!isOpen) return null;

  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      onConfirmPrint();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-blue-50/60">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">
              เตรียมสั่งพิมพ์สติกเกอร์ (Print Calibration)
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
        <div className="p-5 space-y-4 text-sm text-slate-700">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">จำนวนทั้งหมด:</span>
              <strong className="text-slate-800 text-sm">{itemCount} ดวง ({totalPages} แผ่น A4)</strong>
            </div>
            <div>
              <span className="text-slate-500 block">ตารางต่อหน้า:</span>
              <strong className="text-blue-700 text-sm">{layout.columns} × {layout.rows} ดวง</strong>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              ข้อสำคัญ: เพื่อให้ตำแหน่งและขนาดตรงช่องสติกเกอร์เป๊ะ
            </div>
            <p className="text-amber-700 leading-relaxed">
              ในหน้าต่างสั่งพิมพ์ของเบราว์เซอร์ (Chrome / Edge / Firefox) กรุณาตรวจสอบการตั้งค่าดังนี้:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-amber-900 pl-1">
              <li>
                <strong>ระยะขอบ (Margins):</strong> เลือกเป็น <u>"ไม่มี (None)"</u>
              </li>
              <li>
                <strong>มาตราส่วน (Scale):</strong> เลือก <u>"100% (ค่าเริ่มต้น)"</u> (ห้ามเลือก Fit to page)
              </li>
              <li>
                <strong>ตัวเลือกเพิ่มเติม:</strong> ติ๊กถูกที่ <u>"กราฟิกพื้นหลัง (Background graphics)"</u>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium text-xs transition"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-xs transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            เปิดหน้าต่างพิมพ์ (Print Now)
          </button>
        </div>
      </div>
    </div>
  );
}
