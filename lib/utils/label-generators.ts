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
    productFontSize: 12,
    skuFontSize: 7,
    spacing: 0.3,
    barcodeScale: 2.2
  },
  'label-medium': {
    name: '100x30mm',
    productFontSize: 8,
    skuFontSize: 9,
    spacing: 0.5,
    barcodeScale: 0.25
  },
  'label-large': {
    name: '100x50mm',
    productFontSize: 10,
    skuFontSize: 11,
    spacing: 0.8,
    barcodeScale: 0.3
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
  
  let startY = (layout.paperHeight - contentHeight) / 2;

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
