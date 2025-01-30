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
  'a4': { name: 'A4', width: 297, height: 210, unit: 'mm' }, // Swapped width and height for landscape
  'letter': { name: 'Letter', width: 279, height: 216, unit: 'mm' }, // Swapped width and height for landscape
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

const calculateBarcodeSize = (pageSize: PageSize) => {
  const scaleFactor = pageSize.width < 100 ? 1 : 0.5; // Scale down for larger formats
  const maxWidth = pageSize.width * scaleFactor;
  const maxHeight = pageSize.height * scaleFactor;
  
  // Keep aspect ratio similar to the paper size
  const aspectRatio = pageSize.width / pageSize.height;
  const width = Math.min(maxWidth, maxHeight * aspectRatio);
  
  return {
    width,
    height: width / aspectRatio,
    barcodeWidth: 2,
    barcodeHeight: width / 3,
    fontSize: Math.max(Math.min(width * 0.05, 14), 8),
  };
};

export function BarcodeModal({ open, onOpenChange, skus }: BarcodeModalProps) {
  const { toast } = useToast();
  const barcodeRefs = useRef<(SVGSVGElement | null)[]>([]);
  
  // Callback untuk menangani ref
  const setRef = (index: number) => (el: SVGSVGElement | null) => {
    barcodeRefs.current[index] = el;
  };

  const [selectedPageSize, setSelectedPageSize] = useState<string>('a4');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [dimensions, setDimensions] = useState(() => 
    calculateBarcodeSize(PAGE_SIZES['a4'])
  );

  // Update dimensions when page size changes
  useEffect(() => {
    const newDimensions = calculateBarcodeSize(PAGE_SIZES[selectedPageSize]);
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
                width: dimensions.barcodeWidth,
                height: dimensions.barcodeHeight,
                displayValue: true,
                fontSize: dimensions.fontSize,
                margin: dimensions.fontSize,
                background: '#ffffff',
              });
            } catch (error) {
              console.error(`Error generating barcode for SKU ${skus[index].sku}:`, error);
            }
          }
        });
      }, 100);
    }
  }, [open, skus, dimensions]);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pageSize = PAGE_SIZES[selectedPageSize];
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: pageSize.unit,
        format: [pageSize.width, pageSize.height],
        compress: true
      });

      // Page layout calculations
      const marginRatio = 0.1; // 10% margin
      const horizontalMargin = pageSize.width * marginRatio;
      const verticalMargin = pageSize.height * marginRatio;
      
      // Available space calculations
      const availableWidth = pageSize.width - (horizontalMargin * 2);
      const availableHeight = pageSize.height - (verticalMargin * 2);
      
      // Barcode dimensions (80% of available height)
      const barcodeHeight = availableHeight * 0.8;
      const barcodeWidth = Math.min(availableWidth * 0.8, barcodeHeight * 1.5); // maintain aspect ratio
      
      // Text spacing calculations
      const textAreaHeight = availableHeight * 0.2; // 20% for text
      const fontSize = Math.max(Math.min(availableHeight * 0.05, 12), 8); // Dynamic font size with limits
      
      // Center positions
      const centerX = pageSize.width / 2;
      const startY = verticalMargin;

      for (let index = 0; index < skus.length; index++) {
        const sku = skus[index];
        
        if (index > 0) {
          doc.addPage();
        }

        // Product name
        doc.setFontSize(fontSize);
        const maxTextWidth = availableWidth;
        const splitName = doc.splitTextToSize(sku.name || '', maxTextWidth);
        doc.text(splitName, centerX, startY + (textAreaHeight * 0.3), { 
          align: 'center',
          baseline: 'middle'
        });

        // Generate barcode
        const tempSvg = document.createElement('svg');
        JsBarcode(tempSvg, sku.sku, {
          format: 'CODE128',
          width: 2,
          height: 100, // Base height, will be scaled in PDF
          displayValue: false, // We'll add SKU text separately
          margin: 0,
          background: '#FFFFFF',
          lineColor: '#000000'
        });

        try {
          // Convert SVG to PDF with calculated dimensions
          const barcodeX = centerX - (barcodeWidth / 2);
          const barcodeY = startY + textAreaHeight;
          await doc.svg(tempSvg, {
            x: barcodeX,
            y: barcodeY,
            width: barcodeWidth,
            height: barcodeHeight
          });
        } catch (svgError) {
          console.error('Error adding SVG to PDF:', svgError);
          throw new Error('Failed to add barcode to PDF');
        }
        
        // SKU text
        doc.setFontSize(fontSize * 1.2); // Slightly larger font for SKU
        const skuText = sku.sku || '';
        doc.text(skuText, centerX, startY + textAreaHeight + barcodeHeight + (fontSize * 0.8), {
          align: 'center',
          baseline: 'middle'
        });
      }

      // Save and open PDF
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
                <SelectItem value="a4">A4 (210 x 297 mm)</SelectItem>
                <SelectItem value="letter">Letter (216 x 279 mm)</SelectItem>
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
              <div key={sku} className="flex flex-col items-center space-y-2 p-4 border rounded-lg bg-white">
                <h3 className="font-medium text-base" style={{ fontSize: `${dimensions.fontSize}px` }}>
                  {name}
                </h3>
                <svg
                  ref={setRef(index)}
                  className="w-full"
                  style={{
                    maxWidth: `${dimensions.width}px`,
                    height: `${dimensions.height}px`,
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