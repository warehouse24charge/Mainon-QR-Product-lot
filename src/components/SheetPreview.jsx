import React, { useState, useMemo } from 'react';
import { LabelItem } from './LabelItem';
import { ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, Layers, FileText, CheckCircle2 } from 'lucide-react';

export function SheetPreview({ items, layout }) {
  const [zoom, setZoom] = useState(85); // zoom percent
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'all'

  // Dimensions calculation in mm
  const paperWidth = Number(layout.paperWidth) || 210;
  const paperHeight = Number(layout.paperHeight) || 297;
  const cols = Math.max(1, parseInt(layout.columns, 10) || 9);
  const rows = Math.max(1, parseInt(layout.rows, 10) || 13);
  const marginTop = Number(layout.marginTop) || 10;
  const marginBottom = Number(layout.marginBottom) || 10;
  const marginLeft = Number(layout.marginLeft) || 8;
  const marginRight = Number(layout.marginRight) || 8;
  const colGap = Number(layout.colGap) || 1.2;
  const rowGap = Number(layout.rowGap) || 1.2;

  // Exact mm cell size
  const printableWidth = Math.max(10, paperWidth - marginLeft - marginRight - (cols - 1) * colGap);
  const cellWidthMm = Number((printableWidth / cols).toFixed(2));

  const printableHeight = Math.max(10, paperHeight - marginTop - marginBottom - (rows - 1) * rowGap);
  const cellHeightMm = Number((printableHeight / rows).toFixed(2));

  const stickersPerPage = cols * rows;
  const totalPages = Math.max(1, Math.ceil(items.length / stickersPerPage));

  // Partition items into pages
  const pages = useMemo(() => {
    const p = [];
    for (let i = 0; i < totalPages; i++) {
      const start = i * stickersPerPage;
      const end = Math.min(start + stickersPerPage, items.length);
      p.push(items.slice(start, end));
    }
    return p;
  }, [items, stickersPerPage, totalPages]);

  const activePageItems = pages[Math.min(currentPage - 1, totalPages - 1)] || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Top Toolbar for Preview */}
      <div className="no-print bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Info stats */}
        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700">
          <span className="inline-flex items-center gap-1.5 font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
            <FileText className="w-3.5 h-3.5" />
            {layout.paper || 'A4'} ({paperWidth} × {paperHeight} mm)
          </span>
          <span className="hidden sm:inline-block text-slate-400">|</span>
          <span className="text-slate-600">
            ตาราง: <strong className="text-slate-800">{cols} × {rows}</strong> ({stickersPerPage} ดวง/แผ่น)
          </span>
          <span className="hidden sm:inline-block text-slate-400">|</span>
          <span className="text-slate-600">
            ขนาดดวง: <strong className="text-emerald-700 font-mono">{cellWidthMm} × {cellHeightMm} mm</strong>
          </span>
          <span className="hidden sm:inline-block text-slate-400">|</span>
          <span className="font-medium text-slate-700">
            รวมทั้งหมด: <strong className="text-blue-700">{items.length}</strong> ดวง ({totalPages} แผ่น)
          </span>
        </div>

        {/* View Mode & Zoom & Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || viewMode === 'all'}
                className="p-1 hover:bg-white rounded disabled:opacity-40 disabled:hover:bg-transparent"
                title="หน้าก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700">
                {viewMode === 'all' ? `ทั้งหมด (${totalPages} แผ่น)` : `แผ่น ${currentPage} / ${totalPages}`}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || viewMode === 'all'}
                className="p-1 hover:bg-white rounded disabled:opacity-40 disabled:hover:bg-transparent"
                title="หน้าถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Toggle View Mode */}
          {totalPages > 1 && (
            <button
              type="button"
              onClick={() => setViewMode(prev => prev === 'single' ? 'all' : 'single')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition ${
                viewMode === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="สลับมุมมอง"
            >
              <Layers className="w-3.5 h-3.5" />
              {viewMode === 'all' ? 'มุมมองแผ่นเดียว' : 'ดูทุกแผ่น'}
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(30, prev - 10))}
              className="p-1 hover:bg-white rounded text-slate-600"
              title="ย่อ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-slate-700 w-11 text-center font-medium">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(150, prev + 10))}
              className="p-1 hover:bg-white rounded text-slate-600"
              title="ขยาย"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(85)}
              className="p-1 hover:bg-white rounded text-slate-600 border-l border-slate-200 ml-0.5"
              title="ขนาดพอดีจอ"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sheet Display Viewport */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex flex-col items-center justify-start print-container">
        {/* Render for normal preview and printing */}
        <div
          className="preview-scale-wrapper transition-transform origin-top flex flex-col items-center gap-8"
          style={{
            transform: `scale(${zoom / 100})`,
            marginBottom: `${(zoom / 100) * 100}px`,
          }}
        >
          {viewMode === 'all' ? (
            pages.map((pageItems, pageIdx) => (
              <SingleSheet
                key={pageIdx}
                pageNumber={pageIdx + 1}
                totalPages={totalPages}
                items={pageItems}
                layout={layout}
                cols={cols}
                rows={rows}
                paperWidth={paperWidth}
                paperHeight={paperHeight}
                marginTop={marginTop}
                marginBottom={marginBottom}
                marginLeft={marginLeft}
                marginRight={marginRight}
                colGap={colGap}
                rowGap={rowGap}
                cellWidthMm={cellWidthMm}
                cellHeightMm={cellHeightMm}
              />
            ))
          ) : (
            <SingleSheet
              pageNumber={currentPage}
              totalPages={totalPages}
              items={activePageItems}
              layout={layout}
              cols={cols}
              rows={rows}
              paperWidth={paperWidth}
              paperHeight={paperHeight}
              marginTop={marginTop}
              marginBottom={marginBottom}
              marginLeft={marginLeft}
              marginRight={marginRight}
              colGap={colGap}
              rowGap={rowGap}
              cellWidthMm={cellWidthMm}
              cellHeightMm={cellHeightMm}
            />
          )}
        </div>

        {/* Hidden full pages strictly rendered for browser printing */}
        <div className="hidden print:block w-full">
          {pages.map((pageItems, pageIdx) => (
            <SingleSheet
              key={`print-${pageIdx}`}
              isPrintTarget={true}
              pageNumber={pageIdx + 1}
              totalPages={totalPages}
              items={pageItems}
              layout={layout}
              cols={cols}
              rows={rows}
              paperWidth={paperWidth}
              paperHeight={paperHeight}
              marginTop={marginTop}
              marginBottom={marginBottom}
              marginLeft={marginLeft}
              marginRight={marginRight}
              colGap={colGap}
              rowGap={rowGap}
              cellWidthMm={cellWidthMm}
              cellHeightMm={cellHeightMm}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Single Sheet component representing exact millimeter paper
function SingleSheet({
  isPrintTarget = false,
  pageNumber,
  totalPages,
  items,
  layout,
  cols,
  rows,
  paperWidth,
  paperHeight,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  colGap,
  rowGap,
  cellWidthMm,
  cellHeightMm,
}) {
  return (
    <div
      className={`print-page relative bg-white shadow-xl rounded-xs print:rounded-none select-none transition-shadow ${
        isPrintTarget ? 'print-only' : 'print:hidden'
      }`}
      style={{
        width: `${paperWidth}mm`,
        minWidth: `${paperWidth}mm`,
        maxWidth: `${paperWidth}mm`,
        height: `${paperHeight}mm`,
        minHeight: `${paperHeight}mm`,
        maxHeight: `${paperHeight}mm`,
        paddingTop: `${marginTop}mm`,
        paddingBottom: `${marginBottom}mm`,
        paddingLeft: `${marginLeft}mm`,
        paddingRight: `${marginRight}mm`,
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Grid container */}
      <div
        className="w-full h-full grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellWidthMm}mm)`,
          gridTemplateRows: `repeat(${rows}, ${cellHeightMm}mm)`,
          columnGap: `${colGap}mm`,
          rowGap: `${rowGap}mm`,
        }}
      >
        {items.map((item) => (
          <LabelItem
            key={item.id}
            item={item}
            layout={layout}
            cellWidthMm={cellWidthMm}
            cellHeightMm={cellHeightMm}
          />
        ))}

        {/* Empty placeholder cells if sheet is not completely full */}
        {Array.from({ length: Math.max(0, cols * rows - items.length) }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="border border-dashed border-slate-200/60 rounded-xs flex items-center justify-center"
            style={{
              width: `${cellWidthMm}mm`,
              height: `${cellHeightMm}mm`,
            }}
          />
        ))}
      </div>

      {/* Screen helper indicator at bottom corner (not printed) */}
      {!isPrintTarget && (
        <div className="no-print absolute bottom-1 right-2 text-[10px] text-slate-400 font-mono pointer-events-none">
          แผ่นที่ {pageNumber} / {totalPages}
        </div>
      )}
    </div>
  );
}
