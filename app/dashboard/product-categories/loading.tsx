import { Skeleton } from "@/components/ui/skeleton";

// Komponen loading state untuk halaman kategori
// Menampilkan skeleton loader saat data sedang dimuat
// Menggunakan struktur yang mirip dengan halaman utama

// Helper function untuk generate ID unik untuk skeleton items
const generateLoadingId = () => {
  return `loading_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

export default function Loading() {
  const mainItems = Array.from({ length: 5 }, () => generateLoadingId());
  const subItems = Array.from({ length: 2 }, () => generateLoadingId());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-4 w-[400px] mt-2" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="border rounded-lg p-4">
        {mainItems.map((id) => (
          <div key={id} className="space-y-4 py-4 border-b last:border-0">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            <div className="pl-8">
              {subItems.map((subId) => (
                <div key={subId} className="flex items-center justify-between py-2">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-[180px]" />
                    <Skeleton className="h-4 w-[250px]" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}