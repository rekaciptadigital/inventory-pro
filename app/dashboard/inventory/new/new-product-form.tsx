"use client";

import { useRouter } from "next/navigation";
import { SingleProductForm } from "@/components/inventory/product-form/single-product-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

export default function NewProductForm() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard/inventory");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SingleProductForm onSuccess={handleSuccess} />
    </QueryClientProvider>
  );
}
