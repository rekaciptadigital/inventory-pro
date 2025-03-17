'use client';

import { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/inventory';

interface PriceHistoryDetailedProps {
  product: InventoryProduct;
}

// Sample data structure for price history
interface PriceChange {
  id: string;
  date: string;
  user: string;
  summary: string;
  badgeType: 'up' | 'down' | 'major' | 'minor';
  badgeText: string;
  sections: PriceChangeSection[];
}

interface PriceChangeSection {
  id: string;
  title: string;
  badge: { type: 'up' | 'down'; text: string };
  toggleLabel?: string;
  items: PriceChangeItem[];
  expandableItems?: PriceChangeItem[];
}

interface PriceChangeItem {
  key: string;
  percentChange: { value: string; type: 'up' | 'down' };
  oldValue: string;
  newValue: string;
}

interface VariantChange {
  name: string;
  id: string; // Add an id field for proper key usage
  changes: Array<{ 
    type: 'up' | 'down'; 
    text: string;
    id: string; // Add an id field for proper key usage
  }>;
}

export function PriceHistoryDetailed({ product }: Readonly<PriceHistoryDetailedProps>) {
  const [period, setPeriod] = useState('30days');
  const [changeType, setChangeType] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [expandedEntries, setExpandedEntries] = useState<string[]>(['entry-1']);
  const [expandedDetails, setExpandedDetails] = useState<string[]>([]);

  // Sample price history data - would come from API
  const priceHistory: PriceChange[] = [
    {
      id: 'entry-1',
      date: '11 Maret 2025, 08:09',
      user: 'Admin',
      summary: 'Kenaikan harga dasar USD 95 → 100',
      badgeType: 'up',
      badgeText: '↑ 5.26%',
      sections: [
        {
          id: 'base-price-1',
          title: 'Perubahan Harga Dasar',
          badge: { type: 'up', text: '↑ 5.26%' },
          items: [
            {
              key: 'USD Price',
              percentChange: { value: '+5.26%', type: 'up' },
              oldValue: '95',
              newValue: '100'
            },
            {
              key: 'HB Real (Base Price)',
              percentChange: { value: '+5.26%', type: 'up' },
              oldValue: 'Rp 1.425.000',
              newValue: 'Rp 1.500.000'
            }
          ]
        },
        {
          id: 'customer-categories-1',
          title: 'Harga Kategori Customer',
          badge: { type: 'up', text: '↑ 5.26%' },
          toggleLabel: '(3 kategori berubah)',
          items: [
            {
              key: 'Bronze (Tax-Inclusive)',
              percentChange: { value: '+5.26%', type: 'up' },
              oldValue: 'Rp 1.826.921',
              newValue: 'Rp 1.923.075'
            }
          ],
          expandableItems: [
            {
              key: 'Gold (Tax-Inclusive)',
              percentChange: { value: '+5.26%', type: 'up' },
              oldValue: 'Rp 1.913.918',
              newValue: 'Rp 2.014.650'
            },
            {
              key: 'Silver (Tax-Inclusive)',
              percentChange: { value: '+5.26%', type: 'up' },
              oldValue: 'Rp 2.000.914',
              newValue: 'Rp 2.106.225'
            }
          ]
        }
      ]
    },
    {
      id: 'entry-2',
      date: '10 Maret 2025, 08:09',
      user: 'Manager',
      summary: 'Kenaikan harga dasar USD 90 → 95',
      badgeType: 'up',
      badgeText: '↑ 5.56%',
      sections: []
    },
    {
      id: 'entry-3',
      date: '9 Maret 2025, 11:23',
      user: 'Admin',
      summary: 'Perubahan markup marketplace',
      badgeType: 'up',
      badgeText: '↑ Shopee',
      sections: []
    }
  ];

  // Sample variant changes
  const variantChanges: VariantChange[] = [
    {
      id: 'variant-red',
      name: 'ARCHON Bow Scutter Red (ARPB0001-001)',
      changes: [
        { id: 'red-change-1', type: 'up', text: 'Bronze ↑5.26%' },
        { id: 'red-change-2', type: 'up', text: 'Shopee ↑5.26%' }
      ]
    },
    {
      id: 'variant-silver',
      name: 'ARCHON Bow Scutter Silver (ARPB0001-002)',
      changes: [
        { id: 'silver-change-1', type: 'up', text: 'Bronze ↑5.26%' },
        { id: 'silver-change-2', type: 'up', text: 'TikTok ↑5.26%' }
      ]
    }
  ];

  // Sample additional variants for expandable section
  const additionalVariants: VariantChange[] = Array(8).fill(null).map((_, i) => {
    const colorName = ['Blue', 'Green', 'Black', 'White', 'Gold', 'Bronze', 'Premium', 'Ultra'][i];
    return {
      id: `variant-${colorName.toLowerCase()}`,
      name: `ARCHON Bow Scutter ${colorName} (ARPB0001-00${i+3})`,
      changes: [
        { 
          id: `${colorName.toLowerCase()}-change-1`,
          type: 'up', 
          text: 'Semua channel ↑5.26%' 
        }
      ]
    };
  });

  const toggleEntry = (entryId: string) => {
    setExpandedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId) 
        : [...prev, entryId]
    );
  };

  const toggleDetails = (detailId: string) => {
    setExpandedDetails(prev => 
      prev.includes(detailId) 
        ? prev.filter(id => id !== detailId) 
        : [...prev, detailId]
    );
  };

  // Helper function to determine badge style based on type
  const getBadgeStyle = (badgeType: 'up' | 'down' | 'major' | 'minor') => {
    switch (badgeType) {
      case 'up':
        return 'bg-green-100 text-green-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      case 'major':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Filter Section */}
      <div className="p-4 border-b flex flex-wrap gap-4 items-center bg-white">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Periode:</span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Hari Terakhir</SelectItem>
              <SelectItem value="30days">30 Hari Terakhir</SelectItem>
              <SelectItem value="90days">90 Hari Terakhir</SelectItem>
              <SelectItem value="custom">Pilih Tanggal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Jenis Perubahan:</span>
          <Select value={changeType} onValueChange={setChangeType}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Select change type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Perubahan</SelectItem>
              <SelectItem value="base">Harga Dasar</SelectItem>
              <SelectItem value="category">Kategori Customer</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
              <SelectItem value="variant">Varian</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">User:</span>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* History Entries */}
      <div>
        {priceHistory.map((entry) => (
          <div key={entry.id} className="border-b">
            <button 
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/20 w-full text-left"
              onClick={() => toggleEntry(entry.id)}
              aria-expanded={expandedEntries.includes(entry.id)}
              aria-controls={`${entry.id}-content`}
              type="button"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <div className="font-medium">{entry.date}</div>
                <div className="text-muted-foreground">{entry.user}</div>
                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                  <span 
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      getBadgeStyle(entry.badgeType)
                    )}
                  >
                    {entry.badgeText}
                  </span>
                  <span>{entry.summary}</span>
                </div>
              </div>
              <ChevronDown 
                className={cn(
                  "h-5 w-5 transition-transform", 
                  expandedEntries.includes(entry.id) ? "transform rotate-180" : ""
                )} 
                aria-hidden="true"
              />
            </button>
            
            {expandedEntries.includes(entry.id) && (
              <div 
                className="p-4 bg-muted/20 space-y-4"
                id={`${entry.id}-content`}
              >
                {entry.sections.map(section => (
                  <div key={section.id} className="border rounded-lg overflow-hidden">
                    <div className="p-3 bg-muted/30 flex justify-between items-center">
                      <div>
                        {section.title} 
                        {section.toggleLabel && (
                          <span className="text-xs text-muted-foreground ml-1">{section.toggleLabel}</span>
                        )}
                      </div>
                      <span 
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          section.badge.type === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        )}
                      >
                        {section.badge.text}
                      </span>
                    </div>
                    <div className="p-4">
                      {section.items.map((item, idx) => (
                        <div key={`${section.id}-item-${idx}`} className="flex justify-between py-2 border-b last:border-0">
                          <div className="font-medium">{item.key}</div>
                          <div className="flex items-center gap-3">
                            <div 
                              className={cn(
                                "font-medium",
                                item.percentChange.type === 'up' ? 'text-green-600' : 'text-red-600'
                              )}
                            >
                              {item.percentChange.value}
                            </div>
                            <div className="font-mono text-sm">
                              <span className="line-through text-muted-foreground">{item.oldValue}</span>
                              <span className="mx-1">→</span>
                              <span>{item.newValue}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {section.expandableItems && section.expandableItems.length > 0 && (
                        <>
                          <button 
                            className="text-primary text-sm mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDetails(section.id);
                            }}
                            aria-expanded={expandedDetails.includes(section.id)}
                            aria-controls={`${section.id}-expandable-content`}
                            type="button"
                          >
                            {expandedDetails.includes(section.id) 
                              ? `Sembunyikan ${section.expandableItems.length} kategori lainnya` 
                              : `Lihat ${section.expandableItems.length} kategori lainnya`}
                          </button>
                          
                          {expandedDetails.includes(section.id) && (
                            <div 
                              className="mt-3 pt-2 border-t"
                              id={`${section.id}-expandable-content`}
                            >
                              {section.expandableItems.map((item, idx) => (
                                <div key={`${section.id}-exp-${idx}`} className="flex justify-between py-2 border-b last:border-0">
                                  <div className="font-medium">{item.key}</div>
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className={cn(
                                        "font-medium",
                                        item.percentChange.type === 'up' ? 'text-green-600' : 'text-red-600'
                                      )}
                                    >
                                      {item.percentChange.value}
                                    </div>
                                    <div className="font-mono text-sm">
                                      <span className="line-through text-muted-foreground">{item.oldValue}</span>
                                      <span className="mx-1">→</span>
                                      <span>{item.newValue}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Variant Changes Section */}
                {entry.id === 'entry-1' && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-3 bg-muted/30 flex justify-between items-center">
                      <div>
                        Harga Varian <span className="text-xs text-muted-foreground">(10 varian berubah)</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                        ↑ 5.26%
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      {variantChanges.map((variant) => (
                        <div key={variant.id} className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                          <div className="font-medium">{variant.name}</div>
                          <div className="flex gap-2">
                            {variant.changes.map((change) => (
                              <span 
                                key={change.id}
                                className={cn(
                                  "text-xs font-medium px-2 py-0.5 rounded-full",
                                  change.type === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                )}
                              >
                                {change.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      <button 
                        className="text-primary text-sm mt-2 block"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDetails('variants');
                        }}
                        aria-expanded={expandedDetails.includes('variants')}
                        aria-controls="variants-expandable-content"
                        type="button"
                      >
                        {expandedDetails.includes('variants') 
                          ? 'Sembunyikan 8 varian lainnya' 
                          : 'Lihat 8 varian lainnya'}
                      </button>
                      
                      {expandedDetails.includes('variants') && (
                        <div 
                          className="mt-3 pt-4 space-y-2"
                          id="variants-expandable-content"
                        >
                          {additionalVariants.map((variant) => (
                            <div key={variant.id} className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                              <div className="font-medium">{variant.name}</div>
                              <div className="flex gap-2">
                                {variant.changes.map((change) => (
                                  <span 
                                    key={change.id}
                                    className={cn(
                                      "text-xs font-medium px-2 py-0.5 rounded-full",
                                      change.type === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    )}
                                  >
                                    {change.text}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
