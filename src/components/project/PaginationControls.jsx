function PaginationControls({ page, totalPages, total, currentCount, onPageChange }) {
  if (currentCount === 0) return null

  return (
    <div className="flex justify-between items-center mt-6 flex-wrap gap-3">
      <p className="text-sm text-slate-600">
        Showing {currentCount} of {total} projects
      </p>
      <div className="flex items-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className={`px-4 py-2 border rounded-md text-sm ${
            page === 1 ? "text-slate-400 bg-slate-100" : "bg-white hover:bg-slate-50"
          }`}
        >
          Previous
        </button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`px-4 py-2 border rounded-md text-sm ${
            page === totalPages ? "text-slate-400 bg-slate-100" : "bg-white hover:bg-slate-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default PaginationControls;