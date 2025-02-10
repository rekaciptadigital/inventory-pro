import { Suspense } from "react";
import { EditPriceForm } from "./edit-price-form";
import Loading from "./loading";

export async function generateStaticParams() {
  // Generate ranges to cover all possible product IDs
  const generateSequentialRange = (
    start: bigint,
    end: bigint,
    count: number
  ) => {
    const diff = end - start;
    const step = diff / BigInt(count - 1);
    return Array.from({ length: count }, (_, i) => ({
      id: (start + step * BigInt(i)).toString(),
    }));
  };

  // Generate ranges with different densities based on magnitude
  const ranges = [
    // Small IDs (1-1000) - dense sampling
    ...generateSequentialRange(BigInt(1), BigInt(1000), 1000),

    // Medium IDs (1001-100000) - medium sampling
    ...generateSequentialRange(BigInt(1001), BigInt(100000), 500),

    // Large IDs (100001-9999999) - sparse sampling
    ...generateSequentialRange(BigInt(100001), BigInt(9999999), 200),

    // Very large IDs (10M-1B) - very sparse sampling
    ...generateSequentialRange(BigInt(10000000), BigInt(1000000000), 100),

    // Huge IDs (1B-1T) - extremely sparse sampling
    ...generateSequentialRange(BigInt(1000000001), BigInt(1000000000000), 50),

    // Maximum range (1T-MAX_BIGINT) - minimal sampling
    ...generateSequentialRange(
      BigInt(1000000000001),
      BigInt("9223372036854775807"),
      25
    ),
  ];

  // Add commonly accessed IDs and edge cases
  const commonIds = [
    "20",
    "21",
    "22",
    "23",
    "24",
    "25", // Common small IDs
    "999999",
    "1000000", // Common medium IDs
    "9999999999", // Common large IDs
    "9223372036854775807", // Max BigInt
  ].map((id) => ({ id }));

  // Combine all ranges and remove duplicates
  const allIds = [
    ...Array.from(new Set([...commonIds.map((x) => x.id), ...ranges.map((x) => x.id)])),
  ].map((id) => ({ id }));

  // Sort numerically for better organization
  return allIds.sort((a, b) => {
    const aBig = BigInt(a.id);
    const bBig = BigInt(b.id);
    if (aBig < bBig) {
      return -1;
    }
    if (aBig > bBig) {
      return 1;
    }
    return 0;
  });
}

export const dynamicParams = false;

export default function EditProductPricePage() {
  return (
    <Suspense fallback={<Loading />}>
      <EditPriceForm />
    </Suspense>
  );
}
