import React from 'react';
import { X, History, Trash2, RotateCcw, Calendar, CheckCircle2 } from 'lucide-react';

export function HistoryModal({
  isOpen,
  onClose,
  historyLogs,
  onClearHistory,
  onDeleteLog,
  onReloadBatch,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">
              ประวัติการสร้างและพิมพ์ (Lot / Batch History)
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
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>บันทึกประวัติไว้ในเครื่อง (Local Storage) รวม {historyLogs.length} รายการ</span>
            {historyLogs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('คุณต้องการล้างประวัติทั้งหมดใช่หรือไม่?')) {
                    onClearHistory();
                  }
                }}
                className="text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ล้างประวัติทั้งหมด
              </button>
            )}
          </div>

          {historyLogs.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
              ยังไม่มีประวัติการพิมพ์ (ระบบจะบันทึกอัตโนมัติเมื่อกดสั่งพิมพ์หรือส่งออก)
            </div>
          ) : (
            <div className="space-y-3">
              {historyLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        {log.batchName || 'ไม่มีชื่อ Lot'}
                        <span className="text-[10px] font-normal text-slate-400">
                          ({new Date(log.timestamp).toLocaleString('th-TH')})
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-mono mt-0.5">
                        ช่วงรหัส: <strong className="text-blue-700">{log.startSerial}</strong> ถึง <strong className="text-blue-700">{log.endSerial}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onReloadBatch(log);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-md text-xs font-medium transition flex items-center gap-1"
                        title="โหลดรหัสชุดนี้มาสร้างใหม่"
                      >
                        <RotateCcw className="w-3 h-3" />
                        โหลดชุดนี้
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteLog(log.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-md"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>จำนวน: <strong className="text-slate-700">{log.count}</strong> ดวง</span>
                    <span>•</span>
                    <span>แม่แบบ: {log.layoutName || 'ค่าเริ่มต้น'}</span>
                    <span>•</span>
                    <span>ชนิดข้อมูล: {log.mode}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
