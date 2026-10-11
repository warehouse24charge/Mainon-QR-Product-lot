import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Database, CheckCircle2, RefreshCw, AlertCircle, Package, ArrowDownToLine, Tag } from 'lucide-react';
import { fetchMasterMeta, fetchMasterSerials } from '../utils/cloudflareApi';

export function MasterDbSelector({ onSelectSerials, stickersPerPage = 117 }) {
  const [meta, setMeta] = useState({ products: [], lots: [], lotProducts: [] });
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [error, setError] = useState(null);

  // Simplified Cascading Filters
  const [selectedLot, setSelectedLot] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [limitCount, setLimitCount] = useState('all'); // 'all', '1sheet', '2sheets', '5sheets'

  // Query Results
  const [matchedSerials, setMatchedSerials] = useState([]);
  const [loadingSerials, setLoadingSerials] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState('');

  // 1. Fetch metadata on mount
  const loadMeta = useCallback(async () => {
    setLoadingMeta(true);
    setError(null);
    try {
      const data = await fetchMasterMeta();
      setMeta(data);
      // Auto-select first available lot if available and none selected
      if (data.lots?.length > 0 && !selectedLot) {
        setSelectedLot(data.lots[0].lot_no);
      }
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อ Cloudflare D1 Master Database ได้: ' + err.message);
    } finally {
      setLoadingMeta(false);
    }
  }, [selectedLot]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  // 2. Cascaded Products: If a Lot is selected, show only products in that Lot
  const availableProducts = useMemo(() => {
    if (selectedLot) {
      // Filter from lotProducts for the selected lot
      return (meta.lotProducts || []).filter(lp => lp.lot_no === selectedLot);
    }
    // If no lot selected (All Lots), show all distinct products
    return meta.products || [];
  }, [meta.lotProducts, meta.products, selectedLot]);

  // Total count in selected lot
  const currentLotTotal = useMemo(() => {
    if (!selectedLot) return 0;
    const foundLot = meta.lots?.find(l => l.lot_no === selectedLot);
    return foundLot ? foundLot.count : 0;
  }, [meta.lots, selectedLot]);

  // Handle lot change: reset selected product
  const handleLotChange = (e) => {
    setSelectedLot(e.target.value);
    setSelectedProduct(''); // Reset product when switching Lot
  };

  // 3. Query matching serials whenever filters change
  const querySerials = useCallback(async () => {
    setLoadingSerials(true);
    setError(null);
    try {
      let limit = 2000;
      if (limitCount === '1sheet') limit = stickersPerPage;
      else if (limitCount === '2sheets') limit = stickersPerPage * 2;
      else if (limitCount === '5sheets') limit = stickersPerPage * 5;
      else if (typeof limitCount === 'number') limit = limitCount;

      const res = await fetchMasterSerials({
        productId: selectedProduct || null,
        lotNo: selectedLot || null,
        status: selectedStatus || null,
        limit,
      });

      setMatchedSerials(res.serials || []);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล Serial: ' + err.message);
    } finally {
      setLoadingSerials(false);
    }
  }, [selectedProduct, selectedLot, selectedStatus, limitCount, stickersPerPage]);

  useEffect(() => {
    querySerials();
  }, [querySerials]);

  // 4. Apply Serials to Print
  const handleApply = () => {
    if (matchedSerials.length === 0) {
      alert('ไม่พบข้อมูล Serial Number ที่ตรงกับเงื่อนไข');
      return;
    }

    const prodObj = meta.products?.find(p => String(p.id) === String(selectedProduct))
      || availableProducts.find(p => String(p.product_id || p.id) === String(selectedProduct));

    const lotLabel = selectedLot ? `Lot ${selectedLot}` : 'ทุกล็อต';
    const prodLabel = prodObj ? `${prodObj.sku}` : (matchedSerials[0]?.sku || 'สินค้าทั้งหมด');
    const batchName = `${lotLabel} - ${prodLabel}`;

    onSelectSerials({
      serials: matchedSerials,
      batchName,
      lotNo: selectedLot,
      product: prodObj,
      count: matchedSerials.length,
    });

    setAppliedMessage(`✓ เติม Serial ${matchedSerials.length} รายการลงในตารางพิมพ์สำเร็จ!`);
    setTimeout(() => setAppliedMessage(''), 4000);
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-xs text-slate-800">
            ดึงข้อมูลจาก Master DB (24charge-db)
          </span>
        </div>
        <button
          type="button"
          onClick={loadMeta}
          disabled={loadingMeta}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          title="รีเฟรชข้อมูลตัวเลือก"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingMeta ? 'animate-spin' : ''}`} />
          รีเฟรช
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {appliedMessage && (
        <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-200 text-xs flex items-center gap-2 font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{appliedMessage}</span>
        </div>
      )}

      {/* Filter 1: Lot No. */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-blue-600" />
          เลือก Lot No. (Lot สินค้า):
        </label>
        <select
          value={selectedLot}
          onChange={handleLotChange}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- ทุกล็อต (All Lots) --</option>
          {meta.lots?.map((lot) => (
            <option key={lot.lot_no} value={lot.lot_no}>
              {lot.lot_no} ({lot.count} รายการ)
            </option>
          ))}
        </select>
      </div>

      {/* Filter 2: Cascaded Product / SKU */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            เลือกสินค้า / SKU:
          </span>
          {selectedLot && (
            <span className="text-[10px] text-blue-600 font-medium">
              (แสดงเฉพาะสินค้าใน Lot นี้)
            </span>
          )}
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {selectedLot ? (
            <>
              <option value="">
                -- สินค้าทั้งหมดใน Lot นี้ ({currentLotTotal} รายการ) --
              </option>
              {availableProducts.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  [{p.sku}] {p.name_th} ({p.count} รายการ)
                </option>
              ))}
            </>
          ) : (
            <>
              <option value="">
                -- สินค้าทั้งหมด ({availableProducts.length} รายการ) --
              </option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name_th}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      {/* Filter 3: Status & Limit */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-200">
        <div>
          <label className="block text-[11px] font-medium text-slate-600 mb-1">
            สถานะสินค้า:
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
          >
            <option value="">ทุกสถานะ</option>
            <option value="IN_STOCK">IN_STOCK (ในคลัง)</option>
            <option value="DISPATCHED">DISPATCHED (ส่งออกแล้ว)</option>
            <option value="DEPLOYED">DEPLOYED (ติดตั้งแล้ว)</option>
            <option value="RESERVED">RESERVED (จองแล้ว)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-600 mb-1">
            จำกัดจำนวนดึง:
          </label>
          <select
            value={limitCount}
            onChange={(e) => setLimitCount(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
          >
            <option value="all">ทั้งหมดที่พบ</option>
            <option value="1sheet">1 แผ่นพอดี ({stickersPerPage} ดวง)</option>
            <option value="2sheets">2 แผ่นพอดี ({stickersPerPage * 2} ดวง)</option>
            <option value="5sheets">5 แผ่นพอดี ({stickersPerPage * 5} ดวง)</option>
          </select>
        </div>
      </div>

      {/* Query Preview Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">ผลการค้นหาจากเงื่อนไข:</span>
          {loadingSerials ? (
            <span className="text-blue-600 flex items-center gap-1 font-medium">
              <RefreshCw className="w-3 h-3 animate-spin" /> กำลังค้นหา...
            </span>
          ) : (
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              พบ {matchedSerials.length} รายการ
            </span>
          )}
        </div>

        {/* Serials preview chips */}
        {matchedSerials.length > 0 ? (
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
              {matchedSerials.slice(0, 15).map((s) => (
                <span
                  key={s.id}
                  className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono border border-slate-200"
                >
                  {s.serial_no}
                </span>
              ))}
              {matchedSerials.length > 15 && (
                <span className="px-1.5 py-0.5 text-slate-400 text-[10px]">
                  +{matchedSerials.length - 15} รายการเพิ่มเติม...
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500">
              สินค้า: <strong>{matchedSerials[0]?.product_name || '-'}</strong> ({matchedSerials[0]?.sku || '-'})
            </div>
          </div>
        ) : (
          <div className="text-center py-3 text-xs text-slate-400">
            {loadingSerials ? 'กำลังตรวจสอบข้อมูล...' : 'ไม่พบ Serial Number ตามเงื่อนไขที่เลือก'}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={handleApply}
        disabled={matchedSerials.length === 0 || loadingSerials}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <ArrowDownToLine className="w-4 h-4" />
        <span>เติม Serial ({matchedSerials.length} ดวง) ลงในตารางพิมพ์</span>
      </button>
    </div>
  );
}
