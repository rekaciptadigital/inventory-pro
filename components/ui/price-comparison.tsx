'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils/format';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface PriceComparisonProps {
  originalPrice: number;
  roundedPrice: number;
  showTooltip?: boolean;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export function PriceComparison({
  originalPrice,
  roundedPrice,
  showTooltip = true,
  tooltipPosition = 'top'
}: Readonly<PriceComparisonProps>) {
  // Calculate difference and percentage
  const difference = roundedPrice - originalPrice;
  const differencePercentage = originalPrice !== 0 
    ? (difference / originalPrice) * 100 
    : 0;
    
  // Format percentage with appropriate sign and decimal places
  const formattedPercentage = differencePercentage.toFixed(2);
  const sign = difference >= 0 ? '+' : '';
  
  // Only show comparison if there's a difference
  const hasDifference = Math.abs(difference) > 0.01;
  
  if (!hasDifference) {
    return <span>{formatCurrency(roundedPrice)}</span>;
  }
  
  if (!showTooltip) {
    return (
      <div className="flex flex-col">
        <span className="font-medium">{formatCurrency(roundedPrice)}</span>
        <span className="text-xs text-muted-foreground">
          Original: {formatCurrency(originalPrice)}
        </span>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-default">
            <span>{formatCurrency(roundedPrice)}</span>
            <Info className="h-3 w-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent side={tooltipPosition} className="space-y-1 max-w-xs">
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Original:</span>
              <span>{formatCurrency(originalPrice)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Rounded:</span>
              <span>{formatCurrency(roundedPrice)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">Difference:</span>
              <span className={difference > 0 ? "text-emerald-500" : "text-red-500"}>
                {sign}{formatCurrency(difference)} ({sign}{formattedPercentage}%)
              </span>
            </div>
          </div>
          <p className="text-xs border-t pt-1">Applied rounding rules based on price magnitude</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
