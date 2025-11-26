// src/components/MapView.js
import React, { useEffect, useRef } from 'react';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';

function MapView({ center, cafes, currentLocation, onSelectCafe }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const currentMarkerRef = useRef(null); // marker vị trí hiện tại

  // init map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const token =process.env.REACT_APP_GOONG_MAPTILES_KEY;
    if (!token) {
      console.error('Missing REACT_APP_GOONG_MAPTILES_KEY');
      return;
    }

    goongjs.accessToken = token;

    const initialCenter = center || { lat: 21.028511, lng: 105.804817 };

    mapRef.current = new goongjs.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center: [initialCenter.lng, initialCenter.lat],
      zoom: 14
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center]);

  // update center
  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.setCenter([center.lng, center.lat]);
  }, [center]);

  // markers quán cà phê
  useEffect(() => {
    if (!mapRef.current) return;

    // clear cũ
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    cafes.forEach((cafe) => {
      if (typeof cafe.lat !== 'number' || typeof cafe.lng !== 'number') return;

      const marker = new goongjs.Marker()
        .setLngLat([cafe.lng, cafe.lat])
        .setPopup(
          new goongjs.Popup({ offset: 24 }).setHTML(`
            <strong>${cafe.name}</strong><br/>
            ${cafe.address || ''}
          `)
        )
        .addTo(mapRef.current);

      if (onSelectCafe) {
        marker.getElement().addEventListener('click', () => onSelectCafe(cafe));
      }

      markersRef.current.push(marker);
    });
  }, [cafes, onSelectCafe]);

  // marker vị trí hiện tại
  useEffect(() => {
    if (!mapRef.current) return;

    // xoá marker cũ nếu có
    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
      currentMarkerRef.current = null;
    }

    if (!currentLocation) return;

    // tạo HTML element custom cho marker
    const el = document.createElement('div');
    el.className = 'current-location-marker';

    currentMarkerRef.current = new goongjs.Marker({ element: el })
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .setPopup(
        new goongjs.Popup({ offset: 20 }).setHTML('<strong>Vị trí của tôi</strong>')
      )
      .addTo(mapRef.current);
  }, [currentLocation]);

  return <div ref={mapContainerRef} className="map-wrapper" />;
}

export default MapView;
