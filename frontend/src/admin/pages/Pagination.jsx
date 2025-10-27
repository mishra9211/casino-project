import React from "react";
import "./Pagination.css";

const Pagination = ({
  totalEntries,
  currentPage,
  setCurrentPage,
  entriesPerPage,
  setEntriesPerPage,
}) => {
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  // ✅ हमेशा Pagination दिखाएँ
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const handleSelectChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageClick = (page) => {
    if (page === "...") return;
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="pagination-container">
      {/* ===== Left Side: Pagination ===== */}
      <div className="pagination">
        <button
          className="page-btn"
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          &lt;
        </button>

        {getVisiblePages().map((num, i) => (
          <button
            key={i}
            className={`page-btn ${num === currentPage ? "active" : ""}`}
            onClick={() => handlePageClick(num)}
            disabled={num === "..."}
          >
            {num}
          </button>
        ))}

        <button
          className="page-btn"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>

      {/* ===== Right Side: Entries per page ===== */}
      <div className="entries-control">
        <span className="label">Show</span>
        <select value={entriesPerPage} onChange={handleSelectChange}>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span className="label">Entries</span>
      </div>
    </div>
  );
};

export default Pagination;
