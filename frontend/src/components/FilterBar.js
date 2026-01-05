// frontend/src/components/FilterBar.js
import React from 'react';

function FilterBar({ filters, onFilterChange }) {
  const { minRating, maxDistance, isOpen } = filters;

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Đánh giá tối thiểu:</label>
        <select
          className="filter-select"
          value={minRating || ''}
          onChange={(e) => onFilterChange({ ...filters, minRating: e.target.value || null })}
        >
          <option value="">Tất cả</option>
          <option value="3.0">⭐ 3.0+</option>
          <option value="3.5">⭐ 3.5+</option>
          <option value="4.0">⭐ 4.0+</option>
          <option value="4.5">⭐ 4.5+</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Khoảng cách tối đa:</label>
        <select
          className="filter-select"
          value={maxDistance || ''}
          onChange={(e) => onFilterChange({ ...filters, maxDistance: e.target.value || null })}
        >
          <option value="">Tất cả</option>
          <option value="0.5">Dưới 500m</option>
          <option value="1">Dưới 1km</option>
          <option value="2">Dưới 2km</option>
          <option value="5">Dưới 5km</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Trạng thái:</label>
        <select
          className="filter-select"
          value={isOpen !== null ? (isOpen ? 'open' : 'closed') : ''}
          onChange={(e) => {
            const value = e.target.value;
            onFilterChange({
              ...filters,
              isOpen: value === '' ? null : value === 'open'
            });
          }}
        >
          <option value="">Tất cả</option>
          <option value="open">Đang mở cửa</option>
          <option value="closed">Đã đóng cửa</option>
        </select>
      </div>

      {(minRating || maxDistance || isOpen !== null) && (
        <button
          type="button"
          className="filter-clear-btn"
          onClick={() => onFilterChange({ minRating: null, maxDistance: null, isOpen: null })}
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}

export default FilterBar;




