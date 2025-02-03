'use client';

import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { jsPDF } from "jspdf";
// @ts-ignore
import "svg2pdf.js";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface BarcodeModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly skus: ReadonlyArray<{
    readonly sku: string;
    readonly name: string;
  }>;
}

const REFERENCE_SIZE = {
  width: 100,
  height: 30,
  fontSize: 8,
  spacing: 2,
  barcodeHeight: 20,
};

const calculateBarcodeLayout = (pageSize: PageSize) => {
  // Calculate scale factors
  const widthScale = pageSize.width / REFERENCE_SIZE.width;
  const heightScale = pageSize.height / REFERENCE_SIZE.height;
  const scale = Math.min(widthScale, heightScale);

  // Calculate scaled dimensions
  const fontSize = Math.min(Math.max(REFERENCE_SIZE.fontSize * scale, 6), 14);
  const spacing = REFERENCE_SIZE.spacing * scale;
  const margins = {
    top: spacing * 2,
    right: spacing * 2,
    bottom: spacing * 2,
    left: spacing * 2
  };

  // Calculate barcode size
  let barcodeHeight = REFERENCE_SIZE.barcodeHeight * scale;
  let barcodeWidth = barcodeHeight * 2.5;

  // Adjust if too wide
  const availableWidth = pageSize.width - (margins.left + margins.right);
  if (barcodeWidth > availableWidth) {
    const reductionRatio = availableWidth / barcodeWidth;
    barcodeWidth = availableWidth;
    barcodeHeight = barcodeHeight * reductionRatio;
  }

  return {
    fontSize,
    textSpacing: spacing,
    barcodeWidth,
    barcodeHeight,
    margins,
    scale
  };
};

interface LayoutDimensions {
  fontSize: number;
  textSpacing: number;
  barcodeWidth: number;
  barcodeHeight: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  scale: number;
}

export function BarcodeModal({ open, onOpenChange, skus }: BarcodeModalProps) {
  const { toast } = useToast();
  const barcodeRefs = useRef<(SVGSVGElement | null)[]>([]);
  
  const setRef = (index: number) => (el: SVGSVGElement | null) => {
    barcodeRefs.current[index] = el;
  };

  const [selectedPageSize, setSelectedPageSize] = useState<string>('label-medium');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [dimensions, setDimensions] = useState<LayoutDimensions>(() => 
    calculateBarcodeLayout(PAGE_SIZES['label-medium'])
  );

  // Update dimensions when page size changes
  useEffect(() => {
    const newDimensions = calculateBarcodeLayout(PAGE_SIZES[selectedPageSize]);
    setDimensions(newDimensions);
  }, [selectedPageSize]);

  // Update barcode rendering when dimensions change
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        barcodeRefs.current.forEach((ref, index) => {
          if (ref) {
            try {
              JsBarcode(ref, skus[index].sku, {
                format: 'CODE128',
                width: 2 * dimensions.scale, // Apply scale to preview
                height: 100,
                displayValue: false,
                margin: 0,
                background: '#FFFFFF',
                lineColor: '#000000'
              });
            } catch (error) {
              console.error(`Error generating barcode for SKU ${skus[index].sku}:`, error);
            }
          }
        });
      }, 100);
    }
  }, [open, skus, dimensions.scale]); // Update dependency to dimensions.scale

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pageSize = PAGE_SIZES[selectedPageSize];
      const layout = calculateBarcodeLayout(pageSize);
      
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pageSize.width, pageSize.height]
      });

      const centerX = pageSize.width / 2;

      for (let index = 0; index < skus.length; index++) {
        const { sku, name } = skus[index];
        
        if (index > 0) {
          doc.addPage();
        }

        let currentY = layout.margins.top;

        // Draw product name
        doc.setFontSize(layout.fontSize);
        const splitName = doc.splitTextToSize(name || '', pageSize.width - (layout.margins.left + layout.margins.right));
        doc.text(splitName, centerX, currentY, { 
          align: 'center',
          baseline: 'top'
        });

        // Update Y position for barcode
        currentY += layout.textSpacing;

        // Generate and draw barcode
        const tempSvg = document.createElement('svg');
        JsBarcode(tempSvg, sku, {
          format: 'CODE128',
          width: layout.barcodeWidth * 0.015,
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

        // Update Y position for SKU
        currentY += layout.barcodeHeight + layout.textSpacing;

        // Draw SKU
        doc.text(sku, centerX, currentY, {
          align: 'center',
          baseline: 'top'
        });
      }

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
          <DialogTitle>Product Barcodes</DialogTitle>
          <DialogDescription>
            View and print barcodes for selected products
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
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
          </div>
        </div>

        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          <div className="space-y-6">
            {skus.map(({ sku, name }, index) => (
              <div key={sku} className="flex flex-col items-center gap-1 p-4 border rounded-lg bg-white">
                <h3 className="font-medium text-base" style={{ fontSize: `${dimensions.fontSize}px` }}>
                  {name}
                </h3>
                <svg
                  ref={setRef(index)}
                  // Updated style to match the printed PDF canvas
                  style={{
                    height: '100px',
                    width: 'auto'
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid meet"
                />
                <span 
                  className="text-sm text-muted-foreground"
                  style={{ fontSize: `${dimensions.fontSize * 0.8}px` }}
                >
                  {sku}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end space-x-2 mt-4">
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
      </DialogContent>
    </Dialog>
  );
}