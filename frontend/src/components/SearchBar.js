// src/components/SearchBar.js
import React, { useState } from 'react';

function SearchBar({ onSearch, onChangeKeyword, loading, sort, onChangeSort }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const keyword = value.trim();
    onSearch(keyword);
  };

  const handleChange = (e) => {
    const v = e.target.value;
    setValue(v);
    onChangeKeyword && onChangeKeyword(v);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        aria-label="search-input"
        className="search-input"
        type="text"
        placeholder="Tìm quán theo tên hoặc địa chỉ…"
        value={value}
        onChange={handleChange}
      />
      <select
        className="search-select"
        value={sort}
        onChange={(e) => onChangeSort && onChangeSort(e.target.value)}
      >
        <option value="rating">⭐ Đánh giá cao</option>
        <option value="name">A–Z theo tên</option>
        <option value="distance">📍 Gần tôi</option>
      </select>
      <button className="search-button" type="submit" disabled={loading}>
        {loading ? 'Đang tìm…' : 'Tìm kiếm'}
      </button>
    </form>
  );
}

export default SearchBar;
