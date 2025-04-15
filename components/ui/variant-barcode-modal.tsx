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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { 
  PAGE_SIZES, 
  calculateBarcodeLayout, 
  getBarcodeConfig,
  getPreviewBarcodeConfig,
  getPreviewSize,
  type BarcodeLayout
} from '@/lib/utils/barcode';

interface VariantBarcodeModalProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly sku: string;
  readonly name: string;
}

export function VariantBarcodeModal({ open, onOpenChange, sku, name }: VariantBarcodeModalProps) {
  const { toast } = useToast();
  const barcodeRef = useRef<SVGSVGElement | null>(null);
  const [selectedPageSize, setSelectedPageSize] = useState<string>('label-small');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [previewDimensions, setPreviewDimensions] = useState<BarcodeLayout>(() =>
    calculateBarcodeLayout(PAGE_SIZES['label-small'], true)
  );
  
  // Update dimensi saat ukuran kertas berubah
  useEffect(() => {
    const newPreviewDimensions = calculateBarcodeLayout(PAGE_SIZES[selectedPageSize], true);
    setPreviewDimensions(newPreviewDimensions);
  }, [selectedPageSize]);
  
  // Calculate preview size using utility function
  const [previewSize, setPreviewSize] = useState(() => getPreviewSize(selectedPageSize));
  
  // Update preview size when page size changes or window resizes
  useEffect(() => {
    setPreviewSize(getPreviewSize(selectedPageSize));
    
    const handleResize = () => setPreviewSize(getPreviewSize(selectedPageSize));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedPageSize]);

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

  // Improve the preview rendering to handle degree symbols
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (barcodeRef.current) {
          try {
            // Clear existing content
            barcodeRef.current.innerHTML = '';
            
            // Use the special preview config instead of the print config
            JsBarcode(barcodeRef.current, sku, 
              getPreviewBarcodeConfig(previewDimensions, previewSize)
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
  }, [open, sku, toast, selectedPageSize, previewSize, previewDimensions]);

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

      // Draw product name - modified to handle special characters
      doc.setFontSize(layout.fontSize);
      doc.setFont('helvetica', 'normal'); // Ensure we're using a font that supports special chars
      
      // Enhanced replacement to handle various degree symbol representations
      const processedName = name
        .replace(/⁰/g, '°')                 // Convert superscript zero to degree symbol
        .replace(/(\d+)\s*[pP°º]/g, '$1°')  // Enhanced pattern to catch more degree variations
        .replace(/(\d+)\s*deg/gi, '$1°');   // Also catch "deg" text representation
      
      const splitName = doc.splitTextToSize(processedName, pageSize.width - (layout.margins.left + layout.margins.right));
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

      // Output PDF with improved URL handling
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Store the URL reference to prevent garbage collection
      blobUrlRef.current = pdfUrl;
      
      // Open in new tab
      window.open(pdfUrl, '_blank');
      
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
                <SelectItem value="label-medium-small">Label (55 x 30 mm)</SelectItem>
                <SelectItem value="label-medium">Label (100 x 30 mm)</SelectItem>
                <SelectItem value="label-large">Label (100 x 50 mm)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-1 p-4 border rounded-lg bg-white">
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
                  {PAGE_SIZES[selectedPageSize]?.width ?? '55'} × {PAGE_SIZES[selectedPageSize]?.height ?? '30'} mm
                </div>
                
                {/* Product name inside the canvas */}
                <div style={{ 
                  width: '90%',
                  textAlign: 'center',
                  fontSize: `${previewDimensions.fontSize * previewSize.width / previewDimensions.paperWidth * 0.8 * 0.425}px`,
                  fontWeight: 500,
                  marginBottom: '4px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.3,
                  maxHeight: `${previewDimensions.fontSize * previewSize.width / previewDimensions.paperWidth * 0.8 * 0.425 * 2.8}px`,
                }}>
                  {name
                    .replace(/⁰/g, '°')
                    .replace(/(\d+)\s*[pP°º]/g, '$1°')
                    .replace(/(\d+)\s*deg/gi, '$1°')}
                </div>
                
                <svg
                  ref={barcodeRef}
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