import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useController, useFormContext } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
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
    name: "unit",
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
      </SelectContent>
    </Select>
  );
}
