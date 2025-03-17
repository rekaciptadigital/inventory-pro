'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PriceHistoryDetailed } from '@/components/price-management/price-history-detailed';
import { useInventory } from '@/lib/hooks/inventory/use-inventory';

export function PriceManagementDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { products } = useInventory();
  const product = products.find(p => p.id.toString() === id);

  if (!product) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Product not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Riwayat Perubahan Harga</h1>
          <p className="text-sm text-muted-foreground">
            {product.full_product_name}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Kembali ke Daftar
        </Button>
      </div>

      {/* Product Information Card */}
      <div className="bg-muted/40 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Produk</p>
            <p className="text-sm font-medium">{product.full_product_name} ({product.sku})</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Harga Dasar Saat Ini</p>
            <p className="text-sm font-medium">Rp {product.price?.toLocaleString() ?? '0'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Jumlah Varian</p>
            <p className="text-sm font-medium">{product.variants?.length || 0} varian</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Update Terakhir</p>
            <p className="text-sm font-medium">{new Date().toLocaleDateString('id-ID', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
      </div>

      {/* Detailed Price History Component */}
      <PriceHistoryDetailed product={product} />
    </div>
  );
}