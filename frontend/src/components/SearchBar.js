// src/components/SearchBar.js
import React, { useState } from 'react';

function SearchBar({ onSearch, onChangeKeyword, loading }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const keyword = value.trim();
    // vẫn cho phép gửi keyword rỗng, Home sẽ quyết định load lại full list
    onSearch(keyword);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);

    // báo cho Home biết keyword mới
    if (onChangeKeyword) {
      onChangeKeyword(newValue);
    }
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
      <button className="search-button" type="submit" disabled={loading}>
        {loading ? 'Đang tìm…' : 'Tìm kiếm'}
      </button>
    </form>
  );
}

export default SearchBar;
