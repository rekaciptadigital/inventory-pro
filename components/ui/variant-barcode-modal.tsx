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
  'a4': { name: 'A4', width: 210, height: 297, unit: 'mm' },
  'letter': { name: 'Letter', width: 216, height: 279, unit: 'mm' },
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

export function VariantBarcodeModal({ 
  open, 
  onOpenChange, 
  sku, 
  name 
}: VariantBarcodeModalProps) {
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
      const doc = new jsPDF({
        orientation: pageSize.height > pageSize.width ? 'portrait' : 'landscape',
        unit: pageSize.unit,
        format: [pageSize.width, pageSize.height],
        compress: true
      });

      // Calculate dimensions
      const margin = 10;
      const barcodeWidth = Math.min(pageSize.width - (margin * 4), 80);
      const barcodeHeight = 40;
      const nameHeight = 10;
      const skuHeight = 8;

      // Calculate center positions
      const centerX = pageSize.width / 2;
      const startY = (pageSize.height - (barcodeHeight + nameHeight + skuHeight)) / 2;

      // Add product name
      doc.setFontSize(10);
      const maxWidth = pageSize.width - (margin * 4);
      const splitName = doc.splitTextToSize(name || '', maxWidth);
      doc.text(splitName, centerX, startY, { 
        align: 'center',
        baseline: 'top'
      });

      // Generate barcode SVG
      const tempSvg = document.createElement('svg');
      JsBarcode(tempSvg, sku, {
        ...BARCODE_CONFIG,
        height: 40,
        fontSize: 12,
        margin: 5,
      });

      try {
        // Add barcode to PDF
        const barcodeX = centerX - (barcodeWidth / 2);
        const barcodeY = startY + nameHeight + 5;
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

      // Add SKU text
      doc.setFontSize(10);
      doc.text(sku, centerX, startY + nameHeight + barcodeHeight + 15, {
        align: 'center',
        baseline: 'top'
      });

      // Open PDF in new tab
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
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-medium text-center">{name}</h3>
              <div className="w-full flex justify-center"> {/* Wrap SVG in centered container */}
                <svg
                  ref={barcodeRef}
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ 
                    minHeight: '120px',
                    maxWidth: '400px', // Constrain maximum width
                    width: '100%'
                  }}
                />
              </div>
              <span className="text-sm font-mono text-muted-foreground mt-2">{sku}</span>
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
                <SelectItem value="a4">A4 (210 x 297 mm)</SelectItem>
                <SelectItem value="letter">Letter (216 x 279 mm)</SelectItem>
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