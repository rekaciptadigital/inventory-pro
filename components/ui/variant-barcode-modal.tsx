'use client';

import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { jsPDF } from "jspdf";
// @ts-ignore
import "svg2pdf.js";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface PageSize {
  name: string;
  width: number;
  height: number;
  unit: 'mm';
}

const PAGE_SIZES: Record<string, PageSize> = {
  'label-small': { name: '50 x 25mm Label', width: 50, height: 25, unit: 'mm' },
  'label-medium': { name: '100 x 30mm Label', width: 100, height: 30, unit: 'mm' },
  'label-large': { name: '100 x 50mm Label', width: 100, height: 50, unit: 'mm' },
};

const BARCODE_CONFIG = {
  format: 'CODE128',
  width: 2,
  height: 100,
  displayValue: true,
  fontSize: 14,
  margin: 10,
  background: '#ffffff',
  lineColor: '#000000',
  textAlign: 'center',
  textPosition: 'bottom',
  textMargin: 2,
  font: 'monospace',
};

interface VariantBarcodeModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly sku: string;
  readonly name: string;
}

interface BarcodeLayout {
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
}

// Add reference size constants
const REFERENCE_SIZE = {
  width: 100, // Reference width (100mm - size of medium label)
  height: 30, // Reference height (30mm - size of medium label)
  fontSize: 8,
  spacing: 2,
  barcodeHeight: 20,
};

function calculateBarcodeLayout(pageSize: PageSize): BarcodeLayout {
  // Calculate scale factors based on both dimensions
  const widthScale = pageSize.width / REFERENCE_SIZE.width;
  const heightScale = pageSize.height / REFERENCE_SIZE.height;
  
  // Use the smaller scale to ensure everything fits
  const scale = Math.min(widthScale, heightScale);

  // Calculate scaled dimensions
  const fontSize = REFERENCE_SIZE.fontSize * scale;
  const spacing = REFERENCE_SIZE.spacing * scale;
  const margins = {
    top: spacing * 2,
    right: spacing * 2,
    bottom: spacing * 2,
    left: spacing * 2
  };

  // Calculate available width for barcode
  const availableWidth = pageSize.width - (margins.left + margins.right);

  // Calculate barcode size proportionally
  let barcodeHeight = REFERENCE_SIZE.barcodeHeight * scale;
  let barcodeWidth = barcodeHeight * 2.5; // Maintain aspect ratio

  // If barcode is too wide, scale it down while maintaining aspect ratio
  if (barcodeWidth > availableWidth) {
    const reductionRatio = availableWidth / barcodeWidth;
    barcodeWidth = availableWidth;
    barcodeHeight = barcodeHeight * reductionRatio;
  }

  // Ensure minimum readable sizes
  const minFontSize = 6;
  const maxFontSize = 14;
  
  return {
    paperWidth: pageSize.width,
    paperHeight: pageSize.height,
    margins,
    textSpacing: spacing,
    barcodeWidth,
    barcodeHeight,
    fontSize: Math.min(Math.max(fontSize, minFontSize), maxFontSize),
    scale
  };
}

export function VariantBarcodeModal({ open, onOpenChange, sku, name }: VariantBarcodeModalProps) {
  const { toast } = useToast();
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const [selectedPageSize, setSelectedPageSize] = useState<string>('label-medium');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (open) {
      // Tunggu DOM selesai render dengan setTimeout
      setTimeout(() => {
        if (barcodeRef.current) {
          try {
            // Clear existing content
            barcodeRef.current.innerHTML = '';
            
            // Generate barcode dengan konfigurasi yang sama dengan main product
            JsBarcode(barcodeRef.current, sku, {
              format: 'CODE128',
              width: 2,
              height: 100,
              displayValue: true,
              fontSize: 14,
              margin: 10,
              background: '#ffffff',
            });
          } catch (error) {
            console.error(`Error generating barcode for SKU ${sku}:`, error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to generate barcode preview",
            });
          }
        }
      }, 100); // Delay 100ms sama seperti main product
    }
  }, [open, sku, toast]);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pageSize = PAGE_SIZES[selectedPageSize];
      const layout = calculateBarcodeLayout(pageSize);
      
      const doc = new jsPDF({
        orientation: pageSize.height > pageSize.width ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pageSize.width, pageSize.height]
      });

      const centerX = pageSize.width / 2;
      let currentY = layout.margins.top;

      // Draw product name with scaled font
      doc.setFontSize(layout.fontSize);
      const splitName = doc.splitTextToSize(name || '', pageSize.width - (layout.margins.left + layout.margins.right));
      doc.text(splitName, centerX, currentY, { 
        align: 'center',
        baseline: 'top'
      });

      // Position barcode with scaled spacing
      currentY += layout.textSpacing * 2;

      // Generate scaled barcode
      const tempSvg = document.createElement('svg');
      JsBarcode(tempSvg, sku, {
        format: 'CODE128',
        width: layout.barcodeWidth * 0.015 * layout.scale, // Scale bar width
        height: layout.barcodeHeight,
        displayValue: false,
        margin: 0,
        background: '#FFFFFF',
        lineColor: '#000000'
      });

      await doc.svg(tempSvg, {
        x: centerX - (layout.barcodeWidth / 2),
        y: currentY,
        width: layout.barcodeWidth,
        height: layout.barcodeHeight
      });

      // Position SKU with scaled spacing
      currentY += layout.barcodeHeight + (layout.textSpacing * 2);
      doc.text(sku, centerX, currentY, {
        align: 'center',
        baseline: 'top'
      });

      // Output PDF
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      try {
        window.open(pdfUrl, '_blank');
      } finally {
        URL.revokeObjectURL(pdfUrl);
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Variant Barcode</DialogTitle>
          <DialogDescription>
            View and print barcode for variant SKU
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6">
          <div className="p-8 border rounded-lg bg-white w-full shadow-sm">
            <div className="flex flex-col items-center gap-1"> {/* Changed from space-y-4 to gap-1 */}
              <h3 className="text-lg font-medium text-center">{name}</h3>
              <div className="w-full flex justify-center">
                <svg
                  ref={barcodeRef}
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ 
                    height: '100px',
                    width: 'auto'
                  }}
                />
              </div>
              <span className="text-sm font-mono text-muted-foreground">{sku}</span>
            </div>
          </div>

          <div className="w-full space-y-4">
            <Select
              value={selectedPageSize}
              onValueChange={setSelectedPageSize}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="label-small">Label (50 x 25 mm)</SelectItem>
                <SelectItem value="label-medium">Label (100 x 30 mm)</SelectItem>
                <SelectItem value="label-large">Label (100 x 50 mm)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button 
                onClick={generatePDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? 'Generating PDF...' : 'Generate PDF'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}