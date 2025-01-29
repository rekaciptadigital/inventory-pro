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
  'a4': { name: 'A4', width: 210, height: 297, unit: 'mm' },
  'letter': { name: 'Letter', width: 216, height: 279, unit: 'mm' },
  'label-small': { name: '50 x 25mm Label', width: 50, height: 25, unit: 'mm' },
  'label-medium': { name: '100 x 30mm Label', width: 100, height: 30, unit: 'mm' },
  'label-large': { name: '100 x 50mm Label', width: 100, height: 50, unit: 'mm' },
};

interface BarcodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skus: Array<{
    sku: string;
    name: string;
  }>;
}

export function BarcodeModal({ open, onOpenChange, skus }: BarcodeModalProps) {
  const barcodeRefs = useRef<(SVGSVGElement | null)[]>([]);
  const [selectedPageSize, setSelectedPageSize] = useState<string>('a4');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        barcodeRefs.current.forEach((ref, index) => {
          if (ref) {
            try {
              JsBarcode(ref, skus[index].sku, {
                format: 'CODE128',
                width: 2,
                height: 100,
                displayValue: true,
                fontSize: 14,
                margin: 10,
                background: '#ffffff',
              });
            } catch (error) {
              console.error(`Error generating barcode for SKU ${skus[index].sku}:`, error);
            }
          }
        });
      }, 100);
    }
  }, [open, skus]);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Create PDF document with selected page size
      const pageSize = PAGE_SIZES[selectedPageSize];
      const doc = new jsPDF({
        orientation: pageSize.height > pageSize.width ? 'portrait' : 'landscape',
        unit: pageSize.unit,
        format: [pageSize.width, pageSize.height],
        compress: true
      });

      // Calculate dimensions for centered barcode
      const margin = 10; // mm
      const barcodeWidth = Math.min(pageSize.width - (margin * 4), 80); // mm
      const barcodeHeight = 40; // mm
      const nameHeight = 10; // mm for product name
      const skuHeight = 8; // mm for SKU text

      // Center positions
      const centerX = pageSize.width / 2;
      const startY = (pageSize.height - (barcodeHeight + nameHeight + skuHeight)) / 2;

      for (let index = 0; index < skus.length; index++) {
        const sku = skus[index];
        
        // Add new page for each barcode except first
        if (index > 0) {
          doc.addPage();
        }

        // Add product name with word wrap
        doc.setFontSize(10);
        const maxWidth = pageSize.width - (margin * 4);
        const splitName = doc.splitTextToSize(sku.name || '', maxWidth);
        doc.text(splitName, centerX, startY, { 
          align: 'center',
          baseline: 'top'
        });

        // Generate barcode as SVG
        const tempSvg = document.createElement('svg');
        JsBarcode(tempSvg, sku.sku, {
          format: 'CODE128',
          width: 2,
          height: 40,
          displayValue: true,
          fontSize: 12,
          margin: 5,
          background: '#FFFFFF',
          lineColor: '#000000'
        });

        try {
          // Convert SVG to PDF
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
        
        // Add SKU number
        doc.setFontSize(10);
        const skuText = sku.sku || '';
        doc.text(skuText, centerX, startY + nameHeight + barcodeHeight + 15, {
          align: 'center',
          baseline: 'top'
        });
      }

      // Save and open PDF
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      try {
        // Download PDF
        const link = document.createElement('a');
        link.href = pdfUrl;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `barcodes-${timestamp}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Open in new tab
        window.open(pdfUrl, '_blank');
      } finally {
        URL.revokeObjectURL(pdfUrl);
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
      // Show error to user
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
                <h3 className="font-medium">{name}</h3>
                <svg
                  ref={el => barcodeRefs.current[index] = el}
                  className="w-full"
                  xmlns="http://www.w3.org/2000/svg"
                />
                <span className="text-sm text-muted-foreground">{sku}</span>
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