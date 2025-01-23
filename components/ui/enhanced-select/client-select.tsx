"use client";

import { useId } from "react";
import dynamic from "next/dynamic";
import type { SelectOption } from "./types";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import { components, OptionProps, SingleValueProps } from "react-select";

const AsyncPaginate = dynamic(
  () => import("react-select-async-paginate").then((mod) => mod.AsyncPaginate),
  { ssr: false }
);

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

// Update interface to support multi-select
interface ClientSelectProps {
  value: SelectOption | SelectOption[] | null;
  onChange: (selected: SelectOption | SelectOption[] | null) => void;
  loadOptions: any;
  defaultOptions?: boolean | readonly SelectOption[];
  placeholder?: string;
  isDisabled?: boolean;
  isClearable?: boolean;
  error?: string;
  className?: string;
  isMulti?: boolean;
}

export function ClientSelect({
  value,
  onChange,
  loadOptions,
  defaultOptions = true,
  placeholder,
  isDisabled = false,
  isClearable = true,
  error,
  className,
  isMulti = false, // Add isMulti prop with default false
  ...props
}: ClientSelectProps) {
  const selectId = useId();

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

  return (
    <div className="relative">
      <AsyncPaginate
        {...props}
        instanceId={selectId}
        value={value}
        onChange={onChange}
        loadOptions={loadOptions}
        defaultOptions={defaultOptions}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isClearable={isClearable}
        isMulti={isMulti}
        additional={{
          page: 1,
        }}
        className={cn("w-full", className)}
        styles={customStyles}
        components={{
          Option: CustomOption,
          SingleValue: CustomSingleValue,
          LoadingIndicator,
          IndicatorSeparator: () => null,
        }}
        menuPortalTarget={null} // Remove dynamic document check
        blurInputOnSelect={!isMulti}
      />
      {error && (
        <p className="text-sm font-medium text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
