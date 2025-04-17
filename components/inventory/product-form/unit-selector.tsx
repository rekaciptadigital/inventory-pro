import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useController, useFormContext } from "react-hook-form";
import type { FieldValues, Path } from "react-hook-form"; // Import Path
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { selectUnit } from "@/lib/store/slices/formInventoryProductSlice";

export function UnitSelector<T extends FieldValues>() {
  const selectedUnit = useSelector(selectUnit);
  const form = useFormContext<T>();
  const { field } = useController({
    name: "unit" as Path<T>, // Cast "unit" to Path<T>
    control: form.control,
  });

  // Sync field value with Redux state
  useEffect(() => {
    if (selectedUnit && selectedUnit !== field.value) {
      field.onChange(selectedUnit);
    }
  }, [selectedUnit, field]);

  return (
    <Select
      value={field.value}
      onValueChange={field.onChange}
      defaultValue={selectedUnit || "PC"}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select unit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="PC">PC</SelectItem>
        <SelectItem value="SET">SET</SelectItem>
        <SelectItem value="DOZEN">DOZEN</SelectItem>
        <SelectItem value="CM">CM</SelectItem>
        <SelectItem value="MM">MM</SelectItem>
        <SelectItem value="M">M</SelectItem>
      </SelectContent>
    </Select>
  );
}
