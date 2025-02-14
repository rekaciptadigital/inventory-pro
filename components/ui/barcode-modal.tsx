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
import { PAGE_SIZES, calculateBarcodeLayout, getBarcodeConfig, type BarcodeLayout } from '@/lib/utils/barcode';

interface BarcodeModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly skus: ReadonlyArray<{
    readonly sku: string;
    readonly name: string;
  }>;
}

export function BarcodeModal({ open, onOpenChange, skus }: BarcodeModalProps) {
  // Inisialisasi hooks
  const { toast } = useToast();
  const barcodeRefs = useRef<(SVGSVGElement | null)[]>([]);
  
  // Handler untuk menyimpan referensi SVG
  const setRef = (index: number) => (el: SVGSVGElement | null) => {
    barcodeRefs.current[index] = el;
  };

  // State untuk manajemen UI
  const [selectedPageSize, setSelectedPageSize] = useState<string>('label-medium');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [dimensions, setDimensions] = useState<BarcodeLayout>(() => 
    calculateBarcodeLayout(PAGE_SIZES['label-medium'])
  );

  // Update dimensi saat ukuran kertas berubah
  useEffect(() => {
    const newDimensions = calculateBarcodeLayout(PAGE_SIZES[selectedPageSize]);
    setDimensions(newDimensions);
  }, [selectedPageSize]);

  // Update barcode rendering when dimensions change
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const layout = calculateBarcodeLayout(PAGE_SIZES[selectedPageSize]);
        
        barcodeRefs.current.forEach((ref, index) => {
          if (ref) {
            try {
              const config = getBarcodeConfig(layout, true);
              JsBarcode(ref, skus[index].sku, config);
            } catch (error) {
              console.error(`Error generating barcode for SKU ${skus[index].sku}:`, error);
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to generate barcode preview",
              });
            }
          }
        });
      }, 100);
    }
  }, [open, skus, selectedPageSize, toast]);

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

      for (let index = 0; index < skus.length; index++) {
        const { sku, name } = skus[index];
        if (index > 0) doc.addPage();

        // Calculate vertical center position with tighter spacing
        const totalContentHeight = (
          layout.fontSize + // Height for product name
          layout.textSpacing + // Single spacing after name
          layout.barcodeHeight + // Height of barcode
          layout.textSpacing + // Single spacing after barcode
          layout.fontSize // Height for SKU text
        );
        
        // Start Y position to center content vertically
        let startY = (pageSize.height - totalContentHeight) / 2;
        const centerX = pageSize.width / 2;

        // Draw product name
        doc.setFontSize(layout.fontSize);
        const splitName = doc.splitTextToSize(name, pageSize.width - (layout.margins.left + layout.margins.right));
        doc.text(splitName, centerX, startY, { 
          align: 'center',
          baseline: 'top'
        });

        // Update Y position for barcode with tighter spacing
        startY += layout.fontSize + layout.textSpacing;

        // Generate and place barcode
        const tempSvg = document.createElement('svg');
        JsBarcode(tempSvg, sku, getBarcodeConfig(layout));
        await doc.svg(tempSvg, {
          x: centerX - (layout.barcodeWidth / 2),
          y: startY,
          width: layout.barcodeWidth,
          height: layout.barcodeHeight
        });

        // Update Y position for SKU with tighter spacing
        startY += layout.barcodeHeight + layout.textSpacing;
        
        // Draw SKU
        doc.text(sku, centerX, startY, {
          align: 'center',
          baseline: 'top'
        });
      }

      // Output PDF
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      URL.revokeObjectURL(pdfUrl);

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
                  style={{
                    height: '100px',
                    width: 'auto'
                  }}
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid meet"
                />
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