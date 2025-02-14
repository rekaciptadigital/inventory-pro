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
    nameFontScale: 0.65,     // Skala font untuk nama produk (lebih kecil)
    skuFontScale: 0.8,       // Skala font untuk SKU (sedikit lebih besar)
    barcodeHeightRatio: 0.55,// Rasio tinggi barcode terhadap tinggi kertas
    spacing: 0.4,            // Jarak antar elemen (dalam mm)
  },
  // Ukuran label sedang (100x30mm)
  'label-medium': {
    nameFontScale: 0.7,      // Ukuran font nama standar
    skuFontScale: 0.9,       // Ukuran font SKU standar
    barcodeHeightRatio: 0.6, // 60% dari tinggi yang tersedia
    spacing: 0.5,            // Jarak standar
  },
  // Ukuran label besar (100x50mm)
  'label-large': {
    nameFontScale: 0.75,     // Font nama lebih besar
    skuFontScale: 0.95,      // Font SKU lebih besar
    barcodeHeightRatio: 0.65,// Lebih banyak ruang untuk barcode
    spacing: 0.6,            // Jarak lebih longgar
  }
};

// Fungsi untuk menentukan jenis ukuran kertas berdasarkan dimensi
function getPaperSizeKey(pageSize: PageSize): PaperSizeKey {
  if (pageSize.width === 50) return 'label-small';
  if (pageSize.width === 100 && pageSize.height === 30) return 'label-medium';
  return 'label-large';
}

export function calculateBarcodeLayout(pageSize: PageSize): BarcodeLayout {
  // Mendapatkan konfigurasi berdasarkan ukuran kertas
  const sizeKey = getPaperSizeKey(pageSize);
  const sizeConfig = PAPER_CONFIGS[sizeKey];
  
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
  const barcodeHeight = Math.min(maxBarcodeHeight, barcodeWidth * 0.25); // Menjaga rasio aspek barcode

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

export function getBarcodeConfig(layout: BarcodeLayout, displayValue: boolean = false) {
  // Menghitung lebar bar barcode
  // Barcode CODE128 biasanya memiliki 67-70 bar, kita gunakan 67 untuk lebar maksimal
  const barWidth = (layout.barcodeWidth * 0.013) * (layout.scale * 0.8);
  
  // Konfigurasi untuk generate barcode
  return {
    format: 'CODE128',
    width: barWidth,         // Lebar setiap bar
    height: layout.barcodeHeight, // Tinggi barcode
    displayValue,            // Tampilkan teks di bawah barcode atau tidak
    fontSize: layout.fontSize, // Ukuran font untuk teks
    margin: 0,               // Tanpa margin tambahan
    background: '#FFFFFF',    // Latar belakang putih
    lineColor: '#000000',    // Warna bar hitam
    textAlign: 'center',     // Teks di tengah
    textPosition: 'bottom',  // Posisi teks di bawah
    textMargin: layout.textSpacing, // Jarak teks dari barcode
    font: 'monospace',       // Font monospace untuk keterbacaan
  };
}
