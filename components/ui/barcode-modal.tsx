import { useEffect, useRef, useLayoutEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  useLayoutEffect(() => {
    if (open) {
      // Small delay to ensure DOM is ready
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const style = `
      @page { size: auto; margin: 0mm; }
      @media print {
        body { margin: 10mm; }
        .barcode-container { 
          page-break-inside: avoid;
          margin-bottom: 10mm;
        }
        .product-name {
          font-size: 14px;
          margin-bottom: 5mm;
        }
      }
    `;

    const barcodeHtml = skus.map(({ sku, name }) => `
      <div class="barcode-container" style="text-align: center; margin: 20px;">
        <h3 class="product-name">${name}</h3>
        <svg class="barcode" jsbarcode-format="CODE128" jsbarcode-value="${sku}" jsbarcode-width="2" jsbarcode-height="100" jsbarcode-fontSize="14"></svg>
        <div style="margin-top: 5px; font-size: 12px;">${sku}</div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcodes</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
          <style>${style}</style>
        </head>
        <body>
          ${barcodeHtml}
          <script>
            window.onload = () => {
              JsBarcode('.barcode').init();
              setTimeout(() => window.print(), 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
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
          <Button onClick={handlePrint}>
            Print Barcodes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}