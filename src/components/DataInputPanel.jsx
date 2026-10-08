import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { Hash, ListOrdered, FileSpreadsheet, Shuffle, Link2, Sparkles, AlertCircle } from 'lucide-react';

export function DataInputPanel({ dataConfig, onChange, layout }) {
  const fileInputRef = useRef(null);

  const updateConfig = (fields) => {
    onChange({ ...dataConfig, ...fields });
  };

  const stickersPerPage = (parseInt(layout.columns, 10) || 9) * (parseInt(layout.rows, 10) || 13);

  // Handle Excel upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length > 0) {
          const columns = Object.keys(jsonData[0]);
          // Pick the first column as default serial
          updateConfig({
            excelData: jsonData,
            excelColumns: columns,
            excelColumn: columns[0],
            count: jsonData.length,
          });
        }
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel/CSV: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-5 text-sm">
      {/* Batch Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          ชื่อชุด / Lot สินค้า (Batch Name)
        </label>
        <input
          type="text"
          value={dataConfig.batchName || ''}
          onChange={(e) => updateConfig({ batchName: e.target.value })}
          placeholder="เช่น Lot 2026-10-08 สติกเกอร์สินค้า A"
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>

      {/* Mode Selector Tabs */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          วิธีการสร้าง Serial Number
        </label>
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => updateConfig({ mode: 'sequential' })}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition ${
              dataConfig.mode === 'sequential'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            เลขรันอัตโนมัติ
          </button>
          <button
            type="button"
            onClick={() => updateConfig({ mode: 'manual' })}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition ${
              dataConfig.mode === 'manual'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hash className="w-4 h-4" />
            กรอกรายการเอง
          </button>
          <button
            type="button"
            onClick={() => updateConfig({ mode: 'excel' })}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition ${
              dataConfig.mode === 'excel'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            นำเข้า Excel / CSV
          </button>
          <button
            type="button"
            onClick={() => updateConfig({ mode: 'random' })}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-medium transition ${
              dataConfig.mode === 'random'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shuffle className="w-4 h-4" />
            สุ่มรหัสกันปลอม
          </button>
        </div>
      </div>

      {/* Mode Specific Inputs */}

      {/* MODE 1: Sequential */}
      {dataConfig.mode === 'sequential' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                เลขเริ่มต้น (Start No.)
              </label>
              <input
                type="text"
                value={dataConfig.startNumber || ''}
                onChange={(e) => updateConfig({ startNumber: e.target.value })}
                placeholder="เช่น 0673304866"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                จำนวนที่ต้องการ (ดวง)
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                value={dataConfig.count || 117}
                onChange={(e) => updateConfig({ count: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick count presets */}
          <div>
            <span className="text-[11px] text-slate-500 mb-1 block">กดเพิ่มจำนวนตามจำนวนแผ่นพอดี:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => updateConfig({ count: stickersPerPage })}
                className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 text-xs rounded-md font-mono transition"
              >
                1 แผ่น ({stickersPerPage} ดวง)
              </button>
              <button
                type="button"
                onClick={() => updateConfig({ count: stickersPerPage * 2 })}
                className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 text-xs rounded-md font-mono transition"
              >
                2 แผ่น ({stickersPerPage * 2} ดวง)
              </button>
              <button
                type="button"
                onClick={() => updateConfig({ count: stickersPerPage * 5 })}
                className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 text-xs rounded-md font-mono transition"
              >
                5 แผ่น ({stickersPerPage * 5} ดวง)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                คำนำหน้า (Prefix - ไม่บังคับ)
              </label>
              <input
                type="text"
                value={dataConfig.prefix || ''}
                onChange={(e) => updateConfig({ prefix: e.target.value })}
                placeholder="เช่น SN- หรือ LOT-"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                คำต่อท้าย (Suffix - ไม่บังคับ)
              </label>
              <input
                type="text"
                value={dataConfig.suffix || ''}
                onChange={(e) => updateConfig({ suffix: e.target.value })}
                placeholder="เช่น -2026"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                จำนวนหลักเลข 0 (Padding)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={dataConfig.digits || 10}
                onChange={(e) => updateConfig({ digits: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs text-slate-800"
              />
              <span className="text-[10px] text-slate-500">เช่น 10 หลัก (0673304866)</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                เพิ่มขึ้นทีละ (Step)
              </label>
              <input
                type="number"
                min="1"
                value={dataConfig.step || 1}
                onChange={(e) => updateConfig({ step: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Manual */}
      {dataConfig.mode === 'manual' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-700">
              วางรายการ Serial Number (1 บรรทัด = 1 ดวง)
            </label>
            <span className="text-xs font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {dataConfig.manualList.split('\n').filter(l => l.trim().length > 0).length} รายการ
            </span>
          </div>
          <textarea
            rows={8}
            value={dataConfig.manualList || ''}
            onChange={(e) => updateConfig({ manualList: e.target.value })}
            placeholder="0673304866&#10;0673304874&#10;0673304884..."
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* MODE 3: Excel / CSV */}
      {dataConfig.mode === 'excel' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer bg-white transition hover:bg-blue-50/50"
          >
            <FileSpreadsheet className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="font-medium text-xs text-slate-800">
              คลิกเพื่ออัปโหลดไฟล์ Excel (.xlsx, .xls) หรือ CSV
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              รองรับไฟล์ตารางสินค้าจาก ERP / POS / Warehouse
            </p>
          </div>

          {dataConfig.excelData && dataConfig.excelData.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>อ่านได้ทั้งหมด <strong>{dataConfig.excelData.length}</strong> แถว</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:underline"
                >
                  เปลี่ยนไฟล์
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  เลือกคอลัมน์ที่เป็น Serial Number:
                </label>
                <select
                  value={dataConfig.excelColumn || ''}
                  onChange={(e) => updateConfig({ excelColumn: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                >
                  {dataConfig.excelColumns?.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 4: Random */}
      {dataConfig.mode === 'random' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                จำนวนที่ต้องการสุ่ม (ดวง)
              </label>
              <input
                type="number"
                min="1"
                max="5000"
                value={dataConfig.randomCount || 117}
                onChange={(e) => updateConfig({ randomCount: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ความยาวตัวอักษร
              </label>
              <input
                type="number"
                min="4"
                max="32"
                value={dataConfig.randomLength || 10}
                onChange={(e) => updateConfig({ randomLength: Math.max(4, parseInt(e.target.value, 10) || 10) })}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ประเภทการสุ่ม
            </label>
            <select
              value={dataConfig.randomType || 'numeric'}
              onChange={(e) => updateConfig({ randomType: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            >
              <option value="numeric">ตัวเลขอย่างเดียว (0-9)</option>
              <option value="uppercase">ตัวเลข + ตัวพิมพ์ใหญ่ (0-9, A-Z)</option>
              <option value="alphanumeric">ผสมตัวพิมพ์เล็ก/ใหญ่ (0-9, a-z, A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* QR Code Content Formatting (URL / Text) */}
      <div className="pt-3 border-t border-slate-200 space-y-3">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          รูปแบบข้อมูลใน QR Code (เมื่อสแกน)
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer text-xs transition ${
            dataConfig.qrContentType === 'serial' ? 'bg-blue-50 border-blue-400 text-blue-900' : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <input
              type="radio"
              name="qrContentType"
              value="serial"
              checked={dataConfig.qrContentType === 'serial'}
              onChange={() => updateConfig({ qrContentType: 'serial' })}
              className="mt-0.5 text-blue-600"
            />
            <div>
              <span className="font-semibold block">รหัสข้อความล้วน</span>
              <span className="text-[10px] text-slate-500">สแกนแล้วเจอแค่ Serial (ตรงตามรูปแนบ)</span>
            </div>
          </label>

          <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer text-xs transition ${
            dataConfig.qrContentType === 'url' ? 'bg-blue-50 border-blue-400 text-blue-900' : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <input
              type="radio"
              name="qrContentType"
              value="url"
              checked={dataConfig.qrContentType === 'url'}
              onChange={() => updateConfig({ qrContentType: 'url' })}
              className="mt-0.5 text-blue-600"
            />
            <div>
              <span className="font-semibold block">ลิงก์ URL เว็บไซต์</span>
              <span className="text-[10px] text-slate-500">สำหรับเช็กของแท้ / ดูข้อมูล Lot</span>
            </div>
          </label>
        </div>

        {dataConfig.qrContentType === 'url' && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-blue-900">
              <Link2 className="w-3.5 h-3.5 text-blue-600" />
              กำหนด URL Template:
            </div>
            <input
              type="text"
              value={dataConfig.qrUrlTemplate || ''}
              onChange={(e) => updateConfig({ qrUrlTemplate: e.target.value })}
              placeholder="https://mainon.com/verify?sn={SERIAL}"
              className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded font-mono text-xs text-blue-900"
            />
            <p className="text-[11px] text-blue-700">
              💡 ระบบจะแทนที่คำว่า <code>{'{SERIAL}'}</code> ด้วยรหัสของแต่ละดวงโดยอัตโนมัติ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
