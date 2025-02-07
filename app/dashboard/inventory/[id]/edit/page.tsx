import { Suspense } from "react";
import { EditProductForm } from "./edit-product-form";
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
    ...generateSequentialRange(1n, 1000n, 1000),

    // Medium IDs (1001-100000) - medium sampling
    ...generateSequentialRange(1001n, 100000n, 500),

    // Large IDs (100001-9999999) - sparse sampling
    ...generateSequentialRange(100001n, 9999999n, 200),

    // Very large IDs (10M-1B) - very sparse sampling
    ...generateSequentialRange(10000000n, 1000000000n, 100),

    // Huge IDs (1B-1T) - extremely sparse sampling
    ...generateSequentialRange(1000000001n, 1000000000000n, 50),

    // Maximum range (1T-MAX_BIGINT) - minimal sampling
    ...generateSequentialRange(
      1000000000001n,
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
    ...new Set([...commonIds.map((x) => x.id), ...ranges.map((x) => x.id)]),
  ].map((id) => ({ id }));

  // Sort numerically for better organization
  return allIds.sort((a, b) => {
    const aBig = BigInt(a.id);
    const bBig = BigInt(b.id);
    return aBig < bBig ? -1 : aBig > bBig ? 1 : 0;
  });
}

// Keep this as false since we're pre-generating all paths
export const dynamicParams = false;

export default function EditProductPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EditProductForm />
    </Suspense>
  );
}
