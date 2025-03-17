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
  spacing: 0.5,    // Changed to fixed 0.5mm spacing
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
  fontSize: number;      // Now used for name
  skuFontSize: number;  // New property for SKU
  scale: number;
  centerX: number;
  centerY: number;
}

interface PaperConfig {
  nameFontScale: number;
  skuFontScale: number;
  barcodeHeightRatio: number;
  spacing: number;
}

type PaperSizeKey = 'label-small' | 'label-medium' | 'label-large';

// Konfigurasi ukuran kertas yang tersedia
const PAPER_CONFIGS: Record<PaperSizeKey, PaperConfig> = {
  // Ukuran label kecil (50x25mm)
  'label-small': {
    nameFontScale: 1.6,
    skuFontScale: 1.8,
    barcodeHeightRatio: 0.26, 
    spacing: 0.1,            // Further reduced from 0.2 - Minimal spacing
  },
  // Ukuran label sedang (100x30mm)
  'label-medium': {
    nameFontScale: 1.4,
    skuFontScale: 1.95,
    barcodeHeightRatio: 0.285, 
    spacing: 0.12,           // Further reduced from 0.25 - Minimal spacing
  },
  // Ukuran label besar (100x50mm)
  'label-large': {
    nameFontScale: 1.9,
    skuFontScale: 2.1,
    barcodeHeightRatio: 0.30, 
    spacing: 0.15,           // Further reduced from 0.3 - Minimal spacing
  }
};

// Konfigurasi khusus untuk preview di layar
const PREVIEW_CONFIGS: Record<PaperSizeKey, PaperConfig> = {
  // Ukuran label kecil (50x25mm)
  'label-small': {
    nameFontScale: 1.6,
    skuFontScale: 1.8,
    barcodeHeightRatio: 0.35, // Increased for better preview visibility
    spacing: 0.15,            // More spacing for preview
  },
  // Ukuran label sedang (100x30mm)
  'label-medium': {
    nameFontScale: 1.4,
    skuFontScale: 1.95,
    barcodeHeightRatio: 0.4,  // Increased for better preview visibility
    spacing: 0.17,            // More spacing for preview
  },
  // Ukuran label besar (100x50mm)
  'label-large': {
    nameFontScale: 1.9,
    skuFontScale: 2.1,
    barcodeHeightRatio: 0.45, // Increased for better preview visibility
    spacing: 0.2,             // More spacing for preview
  }
};

// Fungsi untuk menentukan jenis ukuran kertas berdasarkan dimensi
function getPaperSizeKey(pageSize: PageSize): PaperSizeKey {
  if (pageSize.width === 50) return 'label-small';
  if (pageSize.width === 100 && pageSize.height === 30) return 'label-medium';
  return 'label-large';
}

export function calculateBarcodeLayout(pageSize: PageSize, isPreview = false): BarcodeLayout {
  // Mendapatkan konfigurasi berdasarkan ukuran kertas
  const sizeKey = getPaperSizeKey(pageSize);
  
  // Pilih konfigurasi berdasarkan apakah untuk preview atau print
  const sizeConfig = isPreview ? PREVIEW_CONFIGS[sizeKey] : PAPER_CONFIGS[sizeKey];
  
  // Menghitung margin berdasarkan spacing yang ditentukan
  const baseSpacing = sizeConfig.spacing;
  const margins = {
    top: baseSpacing,
    right: baseSpacing,
    bottom: baseSpacing,
    left: baseSpacing
  };

  // Menghitung lebar dan tinggi yang tersedia setelah margin
  const availableWidth = pageSize.width - (margins.left + margins.right);
  const availableHeight = pageSize.height - (margins.top + margins.bottom);

  // Menghitung ukuran font berdasarkan skala yang ditentukan
  const baseFontSize = Math.min(Math.max(REFERENCE_SIZE.fontSize * (availableWidth / REFERENCE_SIZE.width), 5), 10);
  const nameFontSize = baseFontSize * sizeConfig.nameFontScale;  // Ukuran font untuk nama
  const skuFontSize = baseFontSize * sizeConfig.skuFontScale;    // Ukuran font untuk SKU
  
  // Menghitung tinggi teks dan jarak
  const nameHeight = nameFontSize;    
  const skuHeight = skuFontSize;
  const elementSpacing = baseSpacing;

  // Menghitung dimensi barcode
  const maxBarcodeHeight = availableHeight * sizeConfig.barcodeHeightRatio; // Tinggi maksimal barcode
  const barcodeWidth = availableWidth;
  const barcodeHeight = Math.min(maxBarcodeHeight, barcodeWidth * 0.125); // Halved from 0.25 - Menjaga rasio aspek barcode

  // Menghitung total tinggi konten untuk penempatan vertikal
  const totalContentHeight = nameHeight + elementSpacing + barcodeHeight + elementSpacing + skuHeight;

  // Mengatur margin atas dan bawah agar konten berada di tengah
  margins.top = (pageSize.height - totalContentHeight) / 2;
  margins.bottom = margins.top;

  return {
    paperWidth: pageSize.width,
    paperHeight: pageSize.height,
    margins,
    textSpacing: elementSpacing,
    barcodeWidth,
    barcodeHeight,
    fontSize: nameFontSize,
    skuFontSize,
    scale: barcodeWidth / REFERENCE_SIZE.width,
    centerX: pageSize.width / 2,
    centerY: pageSize.height / 2
  };
}

export function getBarcodeConfig(layout: BarcodeLayout, displayValue: boolean = false, isPreview = false) {
  // Menghitung lebar bar barcode
  // Barcode CODE128 biasanya memiliki 67-70 bar, kita gunakan 67 untuk lebar maksimal
  const barWidth = (layout.barcodeWidth * 0.013) * (layout.scale * (isPreview ? 1 : 0.8));
  
  // Konfigurasi untuk generate barcode
  return {
    format: 'CODE128',
    width: barWidth,         // Lebar setiap bar
    height: layout.barcodeHeight, // Tinggi barcode
    displayValue,            // Tampilkan teks di bawah barcode atau tidak
    fontSize: isPreview ? layout.fontSize * 1.2 : layout.fontSize, // Ukuran font lebih besar untuk preview
    margin: 0,               // Tanpa margin tambahan
    background: '#FFFFFF',   // Latar belakang putih
    lineColor: '#000000',    // Warna bar hitam
    textAlign: 'center',     // Teks di tengah
    textPosition: 'bottom',  // Posisi teks di bawah
    textMargin: layout.textSpacing, // Jarak teks dari barcode
    font: 'monospace',       // Font monospace untuk keterbacaan
  };
}

// New function specifically for preview configuration
export function getPreviewBarcodeConfig(layout: BarcodeLayout, previewSize: { width: number, height: number }) {
  const previewScale = previewSize.width / layout.paperWidth;
  const contentScale = 0.85; // Scale content to 85% of container to leave margins
  
  return {
    format: 'CODE128',
    width: (layout.barcodeWidth * 0.013) * layout.scale * previewScale * contentScale,
    height: layout.barcodeHeight * previewScale * contentScale,
    displayValue: true,
    fontSize: layout.fontSize * previewScale * contentScale * 0.7 * 0.8, // Reduced by 20% (multiplied by 0.8)
    margin: 0,
    background: '#FFFFFF',
    lineColor: '#000000',
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: layout.textSpacing * previewScale * contentScale,
    font: 'monospace',
  };
}

// Utility function to get preview dimensions
export function getPreviewSize(selectedPageSize: string, maxWidth = 320) {
  const pageSize = PAGE_SIZES[selectedPageSize];
  const containerWidth = window.innerWidth > 768 ? maxWidth : window.innerWidth * 0.7;
  const previewWidth = Math.min(maxWidth, containerWidth);
  const aspectRatio = pageSize.height / pageSize.width;
  const previewHeight = previewWidth * aspectRatio;
  
  return { width: previewWidth, height: previewHeight };
}
