import React, { useState, useCallback, useId, useEffect } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import Select, {
  components,
  OptionProps,
  SingleValueProps,
  GroupBase,
  Props,
} from "react-select";
import { Loader2, Check } from "lucide-react";
import { useTheme } from "next-themes";
import debounce from "lodash/debounce";
import { cn } from "@/lib/utils";

export interface SelectOption {
  label: string;
  value: string;
  subLabel?: string;
  data?: any;
}

interface Additional {
  page: number;
  hasMore: boolean;
}

interface EnhancedSelectProps {
  error?: string;
  className?: string;
  loadOptions: (
    search: string,
    loadedOptions: SelectOption[],
    additional: Additional
  ) => Promise<{
    options: SelectOption[];
    hasMore: boolean;
    additional: Additional;
  }>;
  value?: SelectOption | null;
  onChange?: (newValue: SelectOption | null) => void;
  isMulti?: boolean;
  placeholder?: string;
  isClearable?: boolean;
  isSearchable?: boolean;
  defaultOptions?: boolean | readonly SelectOption[];
  components?: any;
}

const CustomOption = ({ children, ...props }: OptionProps<SelectOption>) => {
  const option = props.data;

  return (
    <components.Option {...props}>
      <div className="flex items-center justify-between py-1">
        <div className="flex flex-col">
          <div className="font-medium">{option.label}</div>
          {option.subLabel && (
            <div className="text-xs text-muted-foreground">
              {option.subLabel}
            </div>
          )}
        </div>
        {props.isSelected && <Check className="h-4 w-4 text-primary" />}
      </div>
    </components.Option>
  );
};

const CustomSingleValue = (props: SingleValueProps<SelectOption>) => {
  const option = props.data;

  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        <span className="font-medium">{option.label}</span>
        {option.subLabel && (
          <span className="text-sm text-muted-foreground">
            ({option.subLabel})
          </span>
        )}
      </div>
    </components.SingleValue>
  );
};

const LoadingIndicator = () => {
  return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
};

export function EnhancedSelect({
  error,
  className,
  loadOptions,
  ...props
}: EnhancedSelectProps) {
  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "40px",
      backgroundColor: "hsl(var(--background))",
      border: error
        ? "1px solid hsl(var(--destructive))"
        : "1px solid hsl(var(--input))",
      borderRadius: "var(--radius)",
      boxShadow: state.isFocused ? "0 0 0 2px hsl(var(--ring))" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "hsl(var(--ring))" : "hsl(var(--input))",
      },
      transition: "all 150ms",
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "hsl(var(--popover))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "var(--radius)",
      boxShadow: "var(--shadow)",
      overflow: "hidden",
      zIndex: 50,
    }),
    menuList: (base: any) => ({
      ...base,
      padding: "4px",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "hsl(var(--primary))"
        : state.isFocused
        ? "hsl(var(--accent))"
        : "transparent",
      color: state.isSelected
        ? "hsl(var(--primary-foreground))"
        : "hsl(var(--foreground))",
      cursor: "pointer",
      borderRadius: "var(--radius)",
      "&:active": {
        backgroundColor: "hsl(var(--accent))",
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "hsl(var(--foreground))",
    }),
    input: (base: any) => ({
      ...base,
      color: "hsl(var(--foreground))",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base: any, state: any) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
      transition: "transform 150ms",
      transform: state.selectProps.menuIsOpen ? "rotate(180deg)" : undefined,
    }),
    clearIndicator: (base: any) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
      padding: "4px",
    }),
  };

  const initialAdditional = {
    page: 1,
    hasMore: true,
  };

  return (
    <div className="relative">
      <AsyncPaginate
        {...props}
        additional={initialAdditional}
        loadOptions={loadOptions}
        className={cn("w-full", className)}
        styles={customStyles}
        components={{
          Option: CustomOption,
          SingleValue: CustomSingleValue,
          LoadingIndicator,
          ...props.components,
        }}
        debounceTimeout={300}
        cacheUniqs={[props.value]} // Reset cache when value changes
      />
      {error && (
        <p className="text-sm font-medium text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
