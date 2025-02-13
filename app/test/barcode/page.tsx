'use client';

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Button } from '@/components/ui/button';

const TEST_BARCODE = {
  sku: 'TEST-123',
  name: 'Test Product'
};

export default function TestBarcode() {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, TEST_BARCODE.sku, {
        format: 'CODE128',
        width: 1.5,
        height: 15,
        displayValue: false,
        margin: 0,
        background: '#FFFFFF',
        lineColor: '#000000'
      });
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8">
      <Button onClick={handlePrint} className="mb-8">
        Print Label (50x25mm)
      </Button>

      <div 
        ref={containerRef}
        className="label-container"
        style={{
          width: '50mm',
          height: '25mm',
          border: '1px solid red'
        }}
      >
        <div className="label-content">
          <div className="label-name">{TEST_BARCODE.name}</div>
          <svg
            ref={barcodeRef}
            className="barcode"
          />
          <div className="label-sku">{TEST_BARCODE.sku}</div>
        </div>
      </div>
    </div>
  );
}
