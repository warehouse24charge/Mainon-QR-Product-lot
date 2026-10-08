import QRCode from 'qrcode';

// In-memory cache for generated QR codes to make rendering instant
const svgCache = new Map();

/**
 * Generate QR code as pure vector SVG string
 */
export async function generateQrSvg(text, options = {}) {
  const {
    errorCorrectionLevel = 'M',
    colorDark = '#000000',
    colorLight = '#ffffff',
    margin = 1,
  } = options;

  const cacheKey = `${text}_${errorCorrectionLevel}_${colorDark}_${colorLight}_${margin}`;
  if (svgCache.has(cacheKey)) {
    return svgCache.get(cacheKey);
  }

  try {
    const svg = await QRCode.toString(text, {
      type: 'svg',
      margin: margin,
      errorCorrectionLevel: errorCorrectionLevel,
      color: {
        dark: colorDark,
        light: colorLight,
      },
      width: 256,
    });
    svgCache.set(cacheKey, svg);
    return svg;
  } catch (err) {
    console.error('Error generating QR SVG for:', text, err);
    return '';
  }
}

/**
 * Generate QR code as PNG Data URL for download / ZIP export
 */
export async function generateQrPngDataUrl(text, options = {}) {
  const {
    errorCorrectionLevel = 'M',
    colorDark = '#000000',
    colorLight = '#ffffff',
    width = 500,
    margin = 2,
  } = options;

  try {
    return await QRCode.toDataURL(text, {
      width: width,
      margin: margin,
      errorCorrectionLevel: errorCorrectionLevel,
      color: {
        dark: colorDark,
        light: colorLight,
      },
    });
  } catch (err) {
    console.error('Error generating QR PNG for:', text, err);
    return null;
  }
}
