import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { generateQrPngDataUrl } from './qrUtils';

/**
 * Export generated items to a ZIP file containing individual PNG QR codes
 */
export async function exportQrZip(items, options = {}, onProgress = null) {
  const zip = new JSZip();
  const folder = zip.folder('qr-codes');
  const total = items.length;

  for (let i = 0; i < total; i++) {
    const item = items[i];
    const dataUrl = await generateQrPngDataUrl(item.qrValue, {
      errorCorrectionLevel: options.qrErrorCorrection || 'M',
      colorDark: options.qrColorDark || '#000000',
      colorLight: options.qrColorLight || '#ffffff',
      width: 600,
    });

    if (dataUrl) {
      // Remove base64 header
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const sanitizedName = String(item.serial).replace(/[/\\?%*:|"<>]/g, '_');
      folder.file(`${sanitizedName}.png`, base64Data, { base64: true });
    }

    if (onProgress && i % 10 === 0) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
  }

  if (onProgress) onProgress(100);

  const content = await zip.generateAsync({ type: 'blob' });
  const filename = `Mainon-QR-${options.batchName || 'lot'}-${new Date().toISOString().slice(0, 10)}.zip`;
  saveAs(content, filename);
}

/**
 * Export serial number list to Excel (.xlsx) file
 */
export function exportToExcel(items, batchName = 'Lot') {
  const rows = items.map((item, idx) => ({
    'ลำดับ (No)': idx + 1,
    'Serial Number': item.serial,
    'QR Code Data': item.qrValue,
    'วันที่บันทึก (Date)': new Date().toLocaleDateString('th-TH'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Serials');

  // Auto-width columns
  const colWidths = [
    { wch: 12 },
    { wch: 25 },
    { wch: 40 },
    { wch: 18 },
  ];
  worksheet['!cols'] = colWidths;

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Mainon-Serials-${batchName}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export serial list to CSV file
 */
export function exportToCsv(items, batchName = 'Lot') {
  const header = 'No,SerialNumber,QRData,Date\n';
  const csvRows = items.map((item, idx) => {
    return `${idx + 1},"${item.serial}","${item.qrValue}","${new Date().toISOString().slice(0, 10)}"`;
  }).join('\n');

  const blob = new Blob(['\uFEFF' + header + csvRows], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `Mainon-Serials-${batchName}-${new Date().toISOString().slice(0, 10)}.csv`);
}
