export interface PageSize {
  name: string;
  width: number;
  height: number;
  unit: 'mm';
}

export const PAGE_SIZES: Record<string, PageSize> = {
  'label-small': { name: '50 x 25mm Label', width: 50, height: 25, unit: 'mm' },
  'label-medium': { name: '100 x 30mm Label', width: 100, height: 30, unit: 'mm' },
  'label-large': { name: '100 x 50mm Label', width: 100, height: 50, unit: 'mm' },
};

export const REFERENCE_SIZE = {
  width: 100,
  height: 30,
  fontSize: 8,
  spacing: 2,
  barcodeHeight: 20,
};

export interface BarcodeLayout {
  paperWidth: number;
  paperHeight: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  textSpacing: number;
  barcodeWidth: number;
  barcodeHeight: number;
  fontSize: number;
  scale: number;
  centerX: number;
  centerY: number;
}

export function calculateBarcodeLayout(pageSize: PageSize): BarcodeLayout {
  // Calculate base spacing and margins
  const spacing = REFERENCE_SIZE.spacing * (pageSize.width / REFERENCE_SIZE.width);
  const margins = {
    top: spacing,
    right: spacing,
    bottom: spacing,
    left: spacing
  };

  // Calculate available space
  const availableWidth = pageSize.width - (margins.left + margins.right);
  const availableHeight = pageSize.height - (margins.top + margins.bottom);

  // Calculate content heights
  const fontSize = Math.min(Math.max(REFERENCE_SIZE.fontSize * (availableWidth / REFERENCE_SIZE.width), 6), 12);
  const textHeight = fontSize * 2; // Approximate height for name and SKU text
  const totalSpacing = spacing * 3; // Spacing between elements

  // Calculate barcode height as 80% of remaining space
  const maxBarcodeHeight = availableHeight * 0.8;
  const barcodeWidth = availableWidth;
  const barcodeHeight = Math.min(maxBarcodeHeight, barcodeWidth * 0.3);

  // Calculate total content height
  const totalContentHeight = textHeight + barcodeHeight + totalSpacing;

  // Center everything vertically by adjusting top margin
  margins.top = (pageSize.height - totalContentHeight) / 2;
  margins.bottom = margins.top;

  // Calculate center points
  const centerX = pageSize.width / 2;
  const centerY = pageSize.height / 2;

  return {
    paperWidth: pageSize.width,
    paperHeight: pageSize.height,
    margins,
    textSpacing: spacing,
    barcodeWidth,
    barcodeHeight,
    fontSize,
    scale: barcodeWidth / REFERENCE_SIZE.width,
    centerX,
    centerY
  };
}

export function getBarcodeConfig(layout: BarcodeLayout, displayValue: boolean = false) {
  // Calculate bar width based on total width
  // Typical barcode has about 67-70 bars, we'll use 67 for maximum width
  const barWidth = (layout.barcodeWidth * 0.013) * (layout.scale * 0.8);
  
  return {
    format: 'CODE128',
    width: barWidth,
    height: layout.barcodeHeight,
    displayValue,
    fontSize: layout.fontSize,
    margin: 0,
    background: '#FFFFFF',
    lineColor: '#000000',
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: layout.textSpacing,
    font: 'monospace',
  };
}
