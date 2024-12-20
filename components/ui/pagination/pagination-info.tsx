interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export function PaginationInfo({
  currentPage,
  pageSize,
  totalItems,
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="text-sm text-muted-foreground">
      Showing {startItem}-{endItem} of {totalItems} items
    </div>
  );
}