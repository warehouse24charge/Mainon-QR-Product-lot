/**
 * Generates an array of serial items based on the configuration
 */
export function generateSerialList(dataConfig) {
  const {
    mode,
    // Sequential
    startNumber = '0673304866',
    count = 117,
    prefix = '',
    suffix = '',
    digits = 10,
    step = 1,
    // Manual
    manualList = '',
    // Random
    randomCount = 117,
    randomLength = 10,
    randomType = 'numeric',
    randomPrefix = '',
    // Excel
    excelData = [],
    excelColumn = '',
    // QR formatting
    qrContentType = 'serial',
    qrUrlTemplate = 'https://mainon.com/verify?sn={SERIAL}',
    qrCustomTemplate = 'SN:{SERIAL}',
  } = dataConfig;

  let rawSerials = [];

  if (mode === 'sequential') {
    // Parse numeric portion
    const cleanStart = String(startNumber).trim();
    // Check if numeric or has trailing numbers
    const numMatch = cleanStart.match(/(\d+)$/);
    
    if (numMatch) {
      const baseNumStr = numMatch[1];
      const leadingPart = cleanStart.slice(0, -baseNumStr.length);
      const startBig = BigInt(baseNumStr);
      const targetPadding = digits || baseNumStr.length;

      const safeCount = Math.min(Math.max(1, parseInt(count, 10) || 1), 5000); // cap at 5000 per batch for performance
      const safeStep = BigInt(Math.max(1, parseInt(step, 10) || 1));

      for (let i = 0; i < safeCount; i++) {
        const currentNum = startBig + BigInt(i) * safeStep;
        let numStr = currentNum.toString();
        if (numStr.length < targetPadding) {
          numStr = numStr.padStart(targetPadding, '0');
        }
        const fullSerial = `${prefix}${leadingPart}${numStr}${suffix}`;
        rawSerials.push({
          serial: fullSerial,
          displayNumber: numStr,
        });
      }
    } else {
      // Fallback if not pure numbers
      const safeCount = Math.min(Math.max(1, parseInt(count, 10) || 1), 5000);
      for (let i = 0; i < safeCount; i++) {
        const fullSerial = `${prefix}${cleanStart}-${i + 1}${suffix}`;
        rawSerials.push({
          serial: fullSerial,
          displayNumber: String(i + 1),
        });
      }
    }
  } else if (mode === 'manual') {
    const lines = manualList
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    rawSerials = lines.map((line, idx) => ({
      serial: line,
      displayNumber: line,
      index: idx,
    }));
  } else if (mode === 'excel') {
    if (Array.isArray(excelData) && excelData.length > 0 && excelColumn) {
      rawSerials = excelData
        .map((row, idx) => {
          const val = row[excelColumn] !== undefined ? String(row[excelColumn]).trim() : '';
          return val ? { serial: val, displayNumber: val, originalRow: row, index: idx } : null;
        })
        .filter(Boolean);
    }
  } else if (mode === 'random') {
    const safeCount = Math.min(Math.max(1, parseInt(randomCount, 10) || 1), 5000);
    const chars = randomType === 'numeric'
      ? '0123456789'
      : randomType === 'uppercase'
      ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      : '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < safeCount; i++) {
      let rand = '';
      for (let j = 0; j < randomLength; j++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const fullSerial = `${randomPrefix}${rand}`;
      rawSerials.push({
        serial: fullSerial,
        displayNumber: rand,
      });
    }
  }

  // Format QR content for each item
  return rawSerials.map((item, idx) => {
    let qrValue = item.serial;
    if (qrContentType === 'url' && qrUrlTemplate) {
      qrValue = qrUrlTemplate.replace(/\{SERIAL\}/g, item.serial);
    } else if (qrContentType === 'custom' && qrCustomTemplate) {
      qrValue = qrCustomTemplate.replace(/\{SERIAL\}/g, item.serial);
    }

    return {
      id: `item-${idx}-${item.serial}`,
      index: idx,
      serial: item.serial,
      qrValue: qrValue,
      originalRow: item.originalRow || null,
    };
  });
}
