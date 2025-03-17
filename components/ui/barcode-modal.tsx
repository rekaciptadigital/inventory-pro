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
import { 
  PAGE_SIZES, 
  calculateBarcodeLayout, 
  getBarcodeConfig, 
  getPreviewBarcodeConfig,
  getPreviewSize,
  type BarcodeLayout 
} from '@/lib/utils/barcode';

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
  const [previewDimensions, setPreviewDimensions] = useState<BarcodeLayout>(() =>
    calculateBarcodeLayout(PAGE_SIZES['label-medium'], true)
  );

  // Update dimensi saat ukuran kertas berubah
  useEffect(() => {
    const newPreviewDimensions = calculateBarcodeLayout(PAGE_SIZES[selectedPageSize], true);
    setPreviewDimensions(newPreviewDimensions);
  }, [selectedPageSize]);

  // Calculate preview size to match label proportions using utility function
  const [previewSize, setPreviewSize] = useState(() => getPreviewSize(selectedPageSize));
  
  // Update preview size when page size changes or window resizes
  useEffect(() => {
    setPreviewSize(getPreviewSize(selectedPageSize));
    
    const handleResize = () => setPreviewSize(getPreviewSize(selectedPageSize));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedPageSize]);

  // Update barcode rendering when dimensions change
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        barcodeRefs.current.forEach((ref, index) => {
          if (ref) {
            try {
              // Clear existing content
              ref.innerHTML = '';
              
              // Use the special preview config instead of the print config
              JsBarcode(ref, skus[index].sku, 
                getPreviewBarcodeConfig(previewDimensions, previewSize)
              );
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
  }, [open, skus, selectedPageSize, toast, previewSize, previewDimensions]);

  // Keep track of generated blob URLs to ensure they're not revoked too early
  const blobUrlRef = useRef<string | null>(null);

  // Clean up any existing blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Clean up any previous blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      const pageSize = PAGE_SIZES[selectedPageSize];
      // Use the print layout configuration (not the preview one)
      const layout = calculateBarcodeLayout(pageSize, false);
      
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
        
        // Apply vertical offset to move content lower than center
        const verticalOffset = pageSize.height * 0.08; // 8% of the label height
        
        // Start Y position - moved lower by offset amount
        let startY = (pageSize.height - totalContentHeight) / 2 + verticalOffset;
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

      // Output PDF - Back to opening in new tab but with improved URL handling
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Store the URL reference to prevent garbage collection
      blobUrlRef.current = pdfUrl;
      
      // Open in new tab (original flow)
      window.open(pdfUrl, '_blank');
      
      // Don't revoke the URL immediately - PDF needs to stay available
      // We'll clean it up when component unmounts or next PDF is generated

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
                {/* Label-sized container with proper proportions */}
                <div 
                  className="relative bg-white rounded border"
                  style={{
                    width: `${previewSize.width}px`,
                    height: `${previewSize.height}px`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '12px 0',
                    padding: '4px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Size indicator label */}
                  <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-bl">
                    {PAGE_SIZES[selectedPageSize].width} × {PAGE_SIZES[selectedPageSize].height} mm
                  </div>
                  
                  {/* Product name inside the canvas */}
                  <div style={{ 
                    width: '90%', // Slightly narrower for better readability
                    textAlign: 'center',
                    fontSize: `${previewDimensions.fontSize * previewSize.width / previewDimensions.paperWidth * 0.8 * 0.425}px`, // adjusted from 0.5 to 0.425
                    fontWeight: 500,
                    marginBottom: '4px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2, // Limit to 2 lines
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.3,
                    maxHeight: `${previewDimensions.fontSize * previewSize.width / previewDimensions.paperWidth * 0.8 * 0.425 * 2.8}px`, // adjusted max height to match new font size
                  }}>
                    {name}
                  </div>
                  
                  <svg
                    ref={setRef(index)}
                    style={{
                      width: `${previewSize.width * 0.8}px`,
                      height: `${previewSize.height * 0.6}px`,
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid meet"
                  />
                  
                  {/* SKU display removed from preview */}
                </div>
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