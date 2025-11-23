import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [keyword, setKeyword] = useState('');
  const [radiusKm, setRadiusKm] = useState(3); // bán kính mặc định 3km

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ keyword, radiusKm });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Nhập tên quán..."
        style={{ padding: 8, width: 200, marginRight: 8 }}
      />
      <input
        type="number"
        value={radiusKm}
        onChange={(e) => setRadiusKm(e.target.value)}
        style={{ padding: 8, width: 80, marginRight: 8 }}
        min={1}
      />
      <span>km</span>
      <button type="submit" style={{ marginLeft: 8 }}>
        Tìm kiếm
      </button>
    </form>
  );
}

export default SearchBar;
