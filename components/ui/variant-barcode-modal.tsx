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
import { 
  PAGE_SIZES, 
  calculateBarcodeLayout, 
  getPreviewBarcodeConfig,
  getPreviewSize,
} from '@/lib/utils/barcode';

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

export function VariantBarcodeModal({ open, onOpenChange, sku, name }: VariantBarcodeModalProps) {
  const { toast } = useToast();
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const [selectedPageSize, setSelectedPageSize] = useState<string>('label-medium');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Calculate preview size using utility function
  const [previewSize, setPreviewSize] = useState(() => 
    getPreviewSize(selectedPageSize, 400) // 400px max width for variant modal
  );
  
  // Update preview size when page size changes or window resizes
  useEffect(() => {
    setPreviewSize(getPreviewSize(selectedPageSize, 400));
    
    const handleResize = () => setPreviewSize(getPreviewSize(selectedPageSize, 400));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedPageSize]);

  useEffect(() => {
    if (open) {
      // Tunggu DOM selesai render dengan setTimeout
      setTimeout(() => {
        if (barcodeRef.current) {
          try {
            // Clear existing content
            barcodeRef.current.innerHTML = '';
            
            // Get layout for selected size with preview settings
            const previewLayout = calculateBarcodeLayout(PAGE_SIZES[selectedPageSize], true);
            
            // Use the special preview config function
            JsBarcode(barcodeRef.current, sku, 
              getPreviewBarcodeConfig(previewLayout, previewSize)
            );
          } catch (error) {
            console.error(`Error generating barcode for SKU ${sku}:`, error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to generate barcode preview",
            });
          }
        }
      }, 100);
    }
  }, [open, sku, toast, selectedPageSize, previewSize]);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pageSize = PAGE_SIZES[selectedPageSize];
      // Use print layout configuration (not preview)
      const layout = calculateBarcodeLayout(pageSize, false);
      
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
      doc.setFontSize(layout.fontSize * 0.8); // Reduced SKU font size
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
          <div className="p-4 border rounded-lg bg-white w-full shadow-sm">
            <div className="flex flex-col items-center gap-1">
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
                  fontSize: `${calculateBarcodeLayout(PAGE_SIZES[selectedPageSize], true).fontSize * previewSize.width / PAGE_SIZES[selectedPageSize].width * 0.8 * 0.425}px`, // adjusted from 0.5 to 0.425
                  fontWeight: 500,
                  marginBottom: '4px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2, // Limit to 2 lines
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.3,
                  maxHeight: `${calculateBarcodeLayout(PAGE_SIZES[selectedPageSize], true).fontSize * previewSize.width / PAGE_SIZES[selectedPageSize].width * 0.8 * 0.425 * 2.8}px`, // adjusted max height to match new font size
                }}>
                  {name}
                </div>
                
                <svg
                  ref={barcodeRef}
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ 
                    width: `${previewSize.width * 0.8}px`,
                    height: `${previewSize.height * 0.6}px`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                  preserveAspectRatio="xMidYMid meet"
                />
                
                {/* SKU display removed from preview */}
              </div>
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