'use client';

import * as React from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/lib/utils/clipboard';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CopyToClipboardProps {
  value: string;
  displayValue?: string;
  className?: string;
  iconClassName?: string;
  showIcon?: boolean;
  tooltipText?: string;
  successText?: string;
  onCopy?: () => void;
}

export function CopyToClipboard({
  value,
  displayValue,
  className,
  iconClassName,
  showIcon = true,
  tooltipText = 'Copy to clipboard',
  successText = 'Copied!',
  onCopy,
}: CopyToClipboardProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const success = await copyToClipboard(value);
    
    if (success) {
      setIsCopied(true);
      if (onCopy) onCopy();
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <div 
          className={cn(
            'group inline-flex items-center gap-1 cursor-pointer hover:text-primary transition-colors',
            className
          )}
          onClick={handleCopy}
        >
          {displayValue || value}
          
          {showIcon && (
            <TooltipTrigger asChild>
              <span className={cn('inline-flex', iconClassName)}>
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                )}
              </span>
            </TooltipTrigger>
          )}
          
          <TooltipContent side="top">
            <p>{isCopied ? successText : tooltipText}</p>
          </TooltipContent>
        </div>
      </Tooltip>
    </TooltipProvider>
  );
}