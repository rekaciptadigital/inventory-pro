import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUnit } from "@/lib/store/slices/formInventoryProductSlice";

export function UnitSelector() {
  const selectedUnit = useSelector(selectUnit);
  const { field } = useControllerProps();

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
      {/* ...existing Select content... */}
    </Select>
  );
}
