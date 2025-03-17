import { jsPDF } from "jspdf";
import type { BarcodeLayout } from "./barcode";

interface LabelConfig {
  name: string;
  productFontSize: number;
  skuFontSize: number;
  spacing: number;
  barcodeScale: number;
}

const LABEL_CONFIGS: Record<string, LabelConfig> = {
  'label-small': {
    name: '50x25mm',
    productFontSize: 17,
    skuFontSize: 18,
    spacing: 0.07,           // Reduced from 0.15 - Minimal spacing
    barcodeScale: 1.1
  },
  'label-medium': {
    name: '100x30mm',
    productFontSize: 14,
    skuFontSize: 21,
    spacing: 0.1,            // Reduced from 0.25 - Minimal spacing
    barcodeScale: 0.125
  },
  'label-large': {
    name: '100x50mm',
    productFontSize: 22,
    skuFontSize: 24,
    spacing: 0.2,            // Reduced from 0.4 - Minimal spacing
    barcodeScale: 0.15
  }
};

export async function generateLabel(
  doc: jsPDF,
  layout: BarcodeLayout,
  labelSize: string,
  { name, sku, tempSvg }: { name: string; sku: string; tempSvg: SVGElement }
) {
  const config = LABEL_CONFIGS[labelSize];
  const centerX = layout.centerX;
  
  // Calculate content heights based on label size
  const contentHeight = (
    config.productFontSize +
    config.spacing +
    layout.barcodeHeight +
    config.spacing +
    config.skuFontSize
  );
  
  // Apply vertical offset to move content lower than center
  const verticalOffset = layout.paperHeight * 0.08; // 8% of the label height
  
  // Start with lower position than center
  let startY = (layout.paperHeight - contentHeight) / 2 + verticalOffset;

  // Draw product name
  doc.setFontSize(config.productFontSize);
  const maxWidth = layout.paperWidth - (layout.margins.left + layout.margins.right);
  let displayName = name;
  if (doc.getTextWidth(name) > maxWidth) {
    while (doc.getTextWidth(displayName + '...') > maxWidth && displayName.length > 0) {
      displayName = displayName.slice(0, -1);
    }
    displayName += '...';
  }
  doc.text(displayName, centerX, startY, { align: 'center', baseline: 'top' });

  // Position and draw barcode
  startY += config.productFontSize + config.spacing;
  await doc.svg(tempSvg, {
    x: centerX - (layout.barcodeWidth / 2),
    y: startY,
    width: layout.barcodeWidth,
    height: layout.barcodeHeight
  });

  // Draw SKU
  startY += layout.barcodeHeight + config.spacing;
  doc.setFontSize(config.skuFontSize);
  doc.text(sku, centerX, startY, { align: 'center', baseline: 'top' });
}
