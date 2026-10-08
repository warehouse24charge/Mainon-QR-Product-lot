import React, { useEffect, useState } from 'react';
import { generateQrSvg } from '../utils/qrUtils';

export const LabelItem = React.memo(function LabelItem({
  item,
  layout,
  cellWidthMm,
  cellHeightMm,
  isSeamlessGrid = false,
}) {
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    let isMounted = true;
    generateQrSvg(item.qrValue, {
      errorCorrectionLevel: layout.qrErrorCorrection || 'M',
      colorDark: layout.qrColorDark || '#000000',
      colorLight: layout.qrColorLight || '#ffffff',
      margin: 0,
    }).then(svg => {
      if (isMounted) setSvgContent(svg);
    });
    return () => { isMounted = false; };
  }, [item.qrValue, layout.qrErrorCorrection, layout.qrColorDark, layout.qrColorLight]);

  // Border style
  const hasBorder = layout.showBorder && layout.borderStyle !== 'none';
  const borderStroke = hasBorder
    ? `${layout.borderWidth || 0.5}px ${layout.borderStyle || 'solid'} ${layout.borderColor || '#cbd5e1'}`
    : 'none';

  const borderStyles = isSeamlessGrid && hasBorder
    ? {
        borderRight: borderStroke,
        borderBottom: borderStroke,
        borderTop: 'none',
        borderLeft: 'none',
      }
    : {
        border: borderStroke,
      };

  return (
    <div
      className="label-item flex flex-col items-center justify-center overflow-hidden transition-all select-none"
      style={{
        width: isSeamlessGrid ? '100%' : `${cellWidthMm}mm`,
        height: isSeamlessGrid ? '100%' : `${cellHeightMm}mm`,
        ...borderStyles,
        borderRadius: isSeamlessGrid ? 0 : `${layout.borderRadius || 0}px`,
        padding: '0.8mm',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Optional Top Header text */}
      {layout.headerText && (
        <div
          className="text-center font-semibold leading-tight truncate w-full text-slate-700"
          style={{
            fontSize: `${layout.headerFontSizePt || 5}pt`,
            marginBottom: '0.3mm',
          }}
        >
          {layout.headerText}
        </div>
      )}

      {/* Text above QR if configured */}
      {layout.showSerialText && layout.textPosition === 'above' && (
        <div
          className="text-center truncate w-full text-slate-900 tracking-tight"
          style={{
            fontSize: `${layout.fontSizePt || 6.2}pt`,
            fontWeight: layout.fontWeight || '600',
            fontFamily: layout.fontFamily === 'monospace' ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' : 'inherit',
            marginBottom: `${layout.textMarginTop || 0.8}mm`,
            lineHeight: 1.1,
          }}
        >
          {item.serial}
        </div>
      )}

      {/* QR Code SVG container */}
      <div
        className="flex items-center justify-center flex-1 w-full min-h-0"
        style={{
          maxHeight: `${layout.qrSizePercent || 82}%`,
          maxWidth: `${layout.qrSizePercent || 82}%`,
        }}
      >
        {svgContent ? (
          <div
            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 animate-pulse rounded" />
        )}
      </div>

      {/* Serial text below QR (Default as in PDF sample) */}
      {layout.showSerialText && layout.textPosition !== 'above' && (
        <div
          className="text-center truncate w-full text-slate-900 tracking-tight"
          style={{
            fontSize: `${layout.fontSizePt || 6.2}pt`,
            fontWeight: layout.fontWeight || '600',
            fontFamily: layout.fontFamily === 'monospace' ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' : 'inherit',
            marginTop: `${layout.textMarginTop || 0.8}mm`,
            lineHeight: 1.1,
          }}
        >
          {item.serial}
        </div>
      )}
    </div>
  );
});
