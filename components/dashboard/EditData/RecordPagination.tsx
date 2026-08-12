'use client';

interface RecordPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

export default function RecordPagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: RecordPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="bg-[#e2e2e2] dark:bg-[#2a2d2d] p-3 border-t-2 border-black flex justify-between items-center font-jetbrains text-xs">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        className="px-3 py-1 bg-white dark:bg-black border-2 border-black font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
      >
        &larr; Sebelumnya
      </button>

      <span className="font-bold">
        Halaman {currentPage} dari {totalPages}
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        className="px-3 py-1 bg-white dark:bg-black border-2 border-black font-bold uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
      >
        Selanjutnya &rarr;
      </button>
    </div>
  );
}
