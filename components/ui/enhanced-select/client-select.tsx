"use client";

import dynamic from "next/dynamic";
import { EnhancedSelect, type SelectOption } from "./enhanced-select";
import { Controller } from "react-hook-form";

interface ClientSelectProps {
  name: string;
  control: any;
  loadOptions?: (
    inputValue: string,
    page?: number,
    prevOptions?: SelectOption[]
  ) => Promise<{
    options: SelectOption[];
    hasMore: boolean;
  }>;
  loadMoreOptions?: (
    inputValue: string,
    loadedOptions: SelectOption[]
  ) => Promise<{
    options: SelectOption[];
    hasMore: boolean;
  }>;
  isInfinite?: boolean;
  cachedOptions?: SelectOption[];
  // ... other props
}

const EnhancedSelect = dynamic(
  () => import("./enhanced-select").then((mod) => mod.EnhancedSelect),
  { ssr: false }
);

export function ClientSelect({
  name,
  control,
  loadOptions,
  loadMoreOptions,
  isInfinite,
  cachedOptions,
  ...props
}: ClientSelectProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <EnhancedSelect
          {...field}
          {...props}
          loadOptions={loadOptions}
          loadMoreOptions={loadMoreOptions}
          isInfinite={isInfinite}
          error={fieldState.error?.message}
          cachedOptions={cachedOptions}
        />
      )}
    />
  );
}
