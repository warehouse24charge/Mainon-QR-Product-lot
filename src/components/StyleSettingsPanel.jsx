import React from 'react';
import { Type, Square, QrCode, Palette } from 'lucide-react';

export function StyleSettingsPanel({ layout, onChange }) {
  const updateLayout = (fields) => {
    onChange({ ...layout, ...fields });
  };

  return (
    <div className="space-y-5 text-sm">
      {/* 1. Border & Cutting Line (กรอบและแนวตัด) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          กรอบและแนวตัดสติกเกอร์ (Border / Cut line)
        </label>
        
        <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-700 font-medium">แสดงเส้นกรอบรอบดวง</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={layout.showBorder}
                onChange={(e) => updateLayout({ showBorder: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {layout.showBorder && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  รูปแบบเส้น
                </label>
                <select
                  value={layout.borderStyle || 'solid'}
                  onChange={(e) => updateLayout({ borderStyle: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  <option value="solid">เส้นทึบบาง (Solid - เหมือนรูปแนบ)</option>
                  <option value="dashed">เส้นประ (Dashed)</option>
                  <option value="dotted">เส้นจุดไข่ปลา (Dotted)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  สีเส้นขอบ
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={layout.borderColor || '#cbd5e1'}
                    onChange={(e) => updateLayout({ borderColor: e.target.value })}
                    className="w-7 h-7 p-0 border border-slate-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={layout.borderColor || '#cbd5e1'}
                    onChange={(e) => updateLayout({ borderColor: e.target.value })}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Text & Font Settings (ตัวอักษร Serial Number) */}
      <div className="pt-2 border-t border-slate-200">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          ตัวอักษรและข้อความ (Text & Font)
        </label>

        <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-700 font-medium">แสดงเลข Serial ใต้/บน QR</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={layout.showSerialText}
                onChange={(e) => updateLayout({ showSerialText: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {layout.showSerialText && (
            <>
              {/* Font Size Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">ขนาดตัวอักษร (Font Size):</span>
                  <span className="font-mono font-bold text-blue-600">{layout.fontSizePt || 6.2} pt</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="14"
                  step="0.2"
                  value={layout.fontSizePt || 6.2}
                  onChange={(e) => updateLayout({ fontSizePt: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ฟอนต์ (Font Family)
                  </label>
                  <select
                    value={layout.fontFamily || 'monospace'}
                    onChange={(e) => updateLayout({ fontFamily: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="monospace">ตัวเลขสไตล์ Mono (ชัดเจน)</option>
                    <option value="sans">ตัวหนังสือ Sans-serif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ความหนาตัวอักษร
                  </label>
                  <select
                    value={layout.fontWeight || '600'}
                    onChange={(e) => updateLayout({ fontWeight: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="400">ปกติ (Normal)</option>
                    <option value="600">กึ่งหนา (Semi-Bold)</option>
                    <option value="700">หนา (Bold)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ตำแหน่งข้อความ Serial
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateLayout({ textPosition: 'below' })}
                    className={`py-1.5 px-2 text-xs rounded border transition ${
                      layout.textPosition !== 'above' ? 'bg-blue-50 border-blue-400 text-blue-900 font-medium' : 'bg-white text-slate-700'
                    }`}
                  >
                    อยู่ด้านล่าง (ตามตัวอย่าง)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateLayout({ textPosition: 'above' })}
                    className={`py-1.5 px-2 text-xs rounded border transition ${
                      layout.textPosition === 'above' ? 'bg-blue-50 border-blue-400 text-blue-900 font-medium' : 'bg-white text-slate-700'
                    }`}
                  >
                    อยู่ด้านบน
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Optional Header Text (e.g. Brand Name) */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ข้อความหัวสติกเกอร์เพิ่มเติม (ไม่บังคับ เช่น ชื่อแบรนด์ / บริษัท)
            </label>
            <input
              type="text"
              value={layout.headerText || ''}
              onChange={(e) => updateLayout({ headerText: e.target.value })}
              placeholder="เช่น MAINON หรือ LOT A"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. QR Code Style (ขนาดและความคมชัด) */}
      <div className="pt-2 border-t border-slate-200">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          การปรับแต่ง QR Code
        </label>

        <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-700 font-medium">สัดส่วนขนาด QR Code ในช่อง:</span>
              <span className="font-mono font-bold text-blue-600">{layout.qrSizePercent || 82}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={layout.qrSizePercent || 82}
              onChange={(e) => updateLayout({ qrSizePercent: parseInt(e.target.value, 10) })}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ระดับการทนรอยขีดข่วน (Error Correction)
              </label>
              <select
                value={layout.qrErrorCorrection || 'M'}
                onChange={(e) => updateLayout({ qrErrorCorrection: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="L">Low (7%) - จุดเล็กสุด คมชัดสแกนไว</option>
                <option value="M">Medium (15%) - ค่ามาตรฐาน แนะนำ</option>
                <option value="Q">Quartile (25%) - ทนรอยเปื้อนปานกลาง</option>
                <option value="H">High (30%) - ทนรอยเปื้อนสูงสุด</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                สี QR Code (Dark Color)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={layout.qrColorDark || '#000000'}
                  onChange={(e) => updateLayout({ qrColorDark: e.target.value })}
                  className="w-7 h-7 p-0 border border-slate-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={layout.qrColorDark || '#000000'}
                  onChange={(e) => updateLayout({ qrColorDark: e.target.value })}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
