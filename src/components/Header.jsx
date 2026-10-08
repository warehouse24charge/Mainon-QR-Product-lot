import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Printer, FolderHeart, History, Download, HardDrive, FileSpreadsheet, Archive, ChevronDown } from 'lucide-react';
import { exportQrZip, exportToExcel, exportToCsv } from '../utils/exportUtils';

export function Header({
  items,
  layout,
  dataConfig,
  isCloudConnected = false,
  onOpenTemplates,
  onOpenHistory,
  onOpenPrint,
}) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportZip = async () => {
    setIsExportOpen(false);
    setExportProgress(1);
    try {
      await exportQrZip(items, {
        batchName: dataConfig.batchName,
        qrErrorCorrection: layout.qrErrorCorrection,
        qrColorDark: layout.qrColorDark,
        qrColorLight: layout.qrColorLight,
      }, (percent) => {
        setExportProgress(percent);
      });
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด ZIP: ' + err.message);
    } finally {
      setTimeout(() => setExportProgress(null), 1000);
    }
  };

  const handleExportExcel = () => {
    setIsExportOpen(false);
    exportToExcel(items, dataConfig.batchName);
  };

  const handleExportCsv = () => {
    setIsExportOpen(false);
    exportToCsv(items, dataConfig.batchName);
  };

  return (
    <header className="no-print bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs sticky top-0 z-30">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <QrCode className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
              Mainon QR-Product-Lot
            </h1>
            {isCloudConnected ? (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cloudflare D1 (24charge-db)
              </span>
            ) : (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                <HardDrive className="w-3 h-3" />
                Localhost Storage
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
            เว็บสร้างและจัดหน้าสติกเกอร์ QR Code Serial No. พิมพ์ลงกระดาษ A4 ไดคัท
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Templates Button */}
        <button
          type="button"
          onClick={onOpenTemplates}
          className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5"
          title="จัดการแม่แบบที่บันทึกไว้ในเครื่อง"
        >
          <FolderHeart className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">แม่แบบ</span>
        </button>

        {/* History Button */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5"
          title="ดูประวัติการสร้าง Lot ที่ผ่านมา"
        >
          <History className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline">ประวัติ Lot</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsExportOpen(prev => !prev)}
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5"
            disabled={items.length === 0 || exportProgress !== null}
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">
              {exportProgress !== null ? `กำลังโหลด ${exportProgress}%` : 'ส่งออกไฟล์'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs">
              <button
                type="button"
                onClick={handleExportZip}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
              >
                <Archive className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-semibold">ดาวน์โหลด ZIP (ภาพ PNG)</div>
                  <div className="text-[10px] text-slate-400">ภาพ QR แยกดวงความละเอียดสูง</div>
                </div>
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold">ส่งออกรายการ Excel (.xlsx)</div>
                  <div className="text-[10px] text-slate-400">เก็บประวัติชุดข้อมูล Serial</div>
                </div>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="w-full px-3.5 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-semibold">ส่งออกรายการ CSV (.csv)</div>
                  <div className="text-[10px] text-slate-400">ไฟล์ข้อความตารางมาตรฐาน</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Primary Print Button */}
        <button
          type="button"
          onClick={onOpenPrint}
          disabled={items.length === 0}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Printer className="w-4 h-4" />
          <span>สั่งพิมพ์ / บันทึก PDF</span>
        </button>
      </div>
    </header>
  );
}
