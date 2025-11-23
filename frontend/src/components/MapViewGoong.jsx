// src/components/MapViewGoong.jsx
import React, { useEffect, useRef } from 'react';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';

function MapViewGoong({ center, markers }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    goongjs.accessToken = process.env.REACT_APP_GOONG_MAPTILES_KEY;

    mapRef.current = new goongjs.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [center.lng, center.lat], // [lng, lat]
      zoom: 14,
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  },);

  // update markers khi props markers đổi
  useEffect(() => {
    if (!mapRef.current) return;
    // ở mức cơ bản: clear và add lại markers
    // bạn có thể nâng cấp sau
    markers.forEach((m) => {
      new goongjs.Marker()
        .setLngLat([m.lng, m.lat])
        .addTo(mapRef.current);
    });
  }, [markers]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '400px' }}
    />
  );
}

export default MapViewGoong;
