import { useState } from 'react';

interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationProps = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return {
    currentPage,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  };
}