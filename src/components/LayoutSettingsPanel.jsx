import React from 'react';
import { PAPER_SIZES } from '../utils/constants';
import { Sliders, Grid3X3, Maximize, AlertCircle } from 'lucide-react';

export function LayoutSettingsPanel({ layout, onChange, presets, onSelectPreset }) {
  const updateLayout = (fields) => {
    onChange({ ...layout, ...fields });
  };

  const handlePaperChange = (paperKey) => {
    const paper = PAPER_SIZES[paperKey];
    if (paper) {
      updateLayout({
        paper: paperKey,
        paperWidth: paper.width,
        paperHeight: paper.height,
      });
    }
  };

  // Cell size calculation preview
  const colGapVal = layout.colGap !== undefined && layout.colGap !== null && layout.colGap !== '' ? Number(layout.colGap) : 0;
  const rowGapVal = layout.rowGap !== undefined && layout.rowGap !== null && layout.rowGap !== '' ? Number(layout.rowGap) : 0;
  const printableWidth = Math.max(0, (layout.paperWidth || 210) - (layout.marginLeft || 8) - (layout.marginRight || 8) - ((layout.columns || 9) - 1) * colGapVal);
  const cellWidthMm = (printableWidth / (layout.columns || 9)).toFixed(2);

  const printableHeight = Math.max(0, (layout.paperHeight || 297) - (layout.marginTop || 10) - (layout.marginBottom || 10) - ((layout.rows || 13) - 1) * rowGapVal);
  const cellHeightMm = (printableHeight / (layout.rows || 13)).toFixed(2);

  return (
    <div className="space-y-5 text-sm">
      {/* Preset Selector */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          เลือกแม่แบบสติกเกอร์ (Preset)
        </label>
        <select
          value={layout.id || ''}
          onChange={(e) => onSelectPreset(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500"
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.isCustom ? '⭐ (บันทึกเอง)' : ''}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-slate-500 mt-1">
          {layout.description || 'แม่แบบจัดหน้าสติกเกอร์'}
        </p>
      </div>

      {/* Paper Size */}
      <div className="pt-2 border-t border-slate-200">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          ขนาดหน้ากระดาษ (Paper Size)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PAPER_SIZES).map(([key, p]) => (
            <button
              key={key}
              type="button"
              onClick={() => handlePaperChange(key)}
              className={`p-2 rounded-lg border text-xs text-left transition ${
                layout.paper === key
                  ? 'bg-blue-50 border-blue-500 text-blue-900 font-medium'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-semibold">{key}</div>
              <div className="text-[10px] text-slate-500">{p.width} × {p.height} mm</div>
            </button>
          ))}
        </div>

        {layout.paper === 'CUSTOM' && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <span className="text-[11px] text-slate-600 block mb-0.5">กว้าง (mm):</span>
              <input
                type="number"
                value={layout.paperWidth}
                onChange={(e) => updateLayout({ paperWidth: parseFloat(e.target.value) || 210 })}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-600 block mb-0.5">ยาว (mm):</span>
              <input
                type="number"
                value={layout.paperHeight}
                onChange={(e) => updateLayout({ paperHeight: parseFloat(e.target.value) || 297 })}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Grid: Columns and Rows */}
      <div className="pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            จำนวนแถวและคอลัมน์ (Grid)
          </label>
          <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {layout.columns * layout.rows} ช่อง/แผ่น
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              จำนวนคอลัมน์ (แนวนอน)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={layout.columns || 9}
              onChange={(e) => updateLayout({ columns: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs text-slate-800"
            />
            <span className="text-[10px] text-slate-500">ตัวอย่างในรูป = 9 คอลัมน์</span>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              จำนวนแถว (แนวตั้ง)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={layout.rows || 13}
              onChange={(e) => updateLayout({ rows: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs text-slate-800"
            />
            <span className="text-[10px] text-slate-500">ตัวอย่างในรูป = 13 แถว</span>
          </div>
        </div>
      </div>

      {/* Margins */}
      <div className="pt-2 border-t border-slate-200">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          ระยะขอบกระดาษ (Margins - mm)
        </label>
        <div className="grid grid-cols-4 gap-2">
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">ขอบบน (Top)</span>
            <input
              type="number"
              step="0.5"
              value={layout.marginTop}
              onChange={(e) => updateLayout({ marginTop: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">ขอบล่าง (Bottom)</span>
            <input
              type="number"
              step="0.5"
              value={layout.marginBottom}
              onChange={(e) => updateLayout({ marginBottom: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">ขอบซ้าย (Left)</span>
            <input
              type="number"
              step="0.5"
              value={layout.marginLeft}
              onChange={(e) => updateLayout({ marginLeft: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block mb-0.5">ขอบขวา (Right)</span>
            <input
              type="number"
              step="0.5"
              value={layout.marginRight}
              onChange={(e) => updateLayout({ marginRight: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Spacing / Gap */}
      <div className="pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            ระยะห่างระหว่างดวง (Gaps - mm)
          </label>
          <button
            type="button"
            onClick={() => updateLayout({ colGap: 0, rowGap: 0 })}
            className={`text-[11px] px-2 py-0.5 rounded font-medium transition cursor-pointer ${
              Number(layout.colGap) === 0 && Number(layout.rowGap) === 0
                ? 'bg-blue-100 text-blue-700 font-semibold border border-blue-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            ✓ ชิดกันเป็นเส้นเดียว (0 mm)
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[11px] text-slate-600 block mb-0.5">ช่องว่างแนวนอน (Col Gap):</span>
            <input
              type="number"
              step="0.1"
              value={layout.colGap}
              onChange={(e) => updateLayout({ colGap: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
          <div>
            <span className="text-[11px] text-slate-600 block mb-0.5">ช่องว่างแนวตั้ง (Row Gap):</span>
            <input
              type="number"
              step="0.1"
              value={layout.rowGap}
              onChange={(e) => updateLayout({ rowGap: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Calculated dimension display badge */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold block">ขนาดต่อ 1 ดวง (คำนวณอัตโนมัติ):</span>
          <span className="text-[11px] text-emerald-700">คำนวณจากขนาดกระดาษ - ขอบ / จำนวนช่อง</span>
        </div>
        <div className="text-right">
          <div className="text-base font-bold font-mono">{cellWidthMm} × {cellHeightMm} mm</div>
          <div className="text-[10px] text-emerald-700">กว้าง × สูง</div>
        </div>
      </div>
    </div>
  );
}
