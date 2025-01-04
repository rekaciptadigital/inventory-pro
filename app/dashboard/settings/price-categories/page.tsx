"use client";

import { useEffect, useState } from "react";
import { getPriceCategories } from "@/lib/api/price-categories";
import type { GroupedPriceCategories } from "@/lib/api/price-categories";

export default function PriceCategoriesPage() {
  const [groupedCategories, setGroupedCategories] = useState<
    GroupedPriceCategories[]
  >([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getPriceCategories();
        setGroupedCategories(response.data);
      } catch (error) {
        console.error("Error fetching price categories:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      {groupedCategories.map((group) => (
        <div key={group.type} className="space-y-4">
          <h2 className="text-2xl font-bold capitalize">{group.type}</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {group.categories.map((category) => (
              <div
                key={category.id}
                className="p-4 border rounded-lg shadow-sm"
              >
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.formula}</p>
                <p className="text-sm">Markup: {category.percentage}%</p>
                <p className="text-sm">
                  Status: {category.status ? "Active" : "Inactive"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
