import React from 'react';

function CafeList({ cafes, selectedId, onSelect }) {
  return (
    <div style={{ maxHeight: 400, overflowY: 'auto' }}>
      {cafes.map((cafe) => (
        <div
          key={cafe.id}
          onClick={() => onSelect(cafe)}
          style={{
            padding: 8,
            marginBottom: 4,
            cursor: 'pointer',
            background: cafe.id === selectedId ? '#e3f2fd' : '#fff',
            border: '1px solid #ddd',
          }}
        >
          <strong>{cafe.name}</strong>
          <div>{cafe.address}</div>
          {cafe.distance != null && (
            <div style={{ fontSize: 12, color: '#555' }}>
              ~ {cafe.distance.toFixed(1)} km
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default CafeList;
