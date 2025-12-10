// src/components/MapView.js
import React, { useEffect, useRef } from 'react';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';

function MapView({ center, cafes, currentLocation, onSelectCafe }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const currentMarkerRef = useRef(null); // marker vị trí hiện tại
  // Track previous center to detect changes
  const prevCenterRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Track if map is ready
  const mapReadyRef = useRef(false);

  // init map - chỉ chạy 1 lần khi mount
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const token = process.env.REACT_APP_GOONG_MAPTILES_KEY;
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

    // Set initial center reference
    prevCenterRef.current = initialCenter;

    // Wait for map to load
    mapRef.current.on('load', () => {
      mapReadyRef.current = true;
    });

    // Also set ready after a short delay as fallback
    setTimeout(() => {
      mapReadyRef.current = true;
    }, 500);

    return () => {
      // Cancel any ongoing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Cleanup map
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      mapReadyRef.current = false;
    };
  }, []); // Empty dependency array - chỉ chạy 1 lần khi mount

  // Custom smooth transition function
  const smoothTransitionTo = (targetCenter, duration = 1000) => {
    if (!mapRef.current || !mapReadyRef.current) {
      // If map not ready, set center directly
      if (mapRef.current) {
        try {
          mapRef.current.setCenter([targetCenter.lng, targetCenter.lat]);
        } catch (err) {
          console.error('Error setting center (map not ready):', err);
        }
      }
      return;
    }

    try {
      const startCenter = mapRef.current.getCenter();
      if (!startCenter) {
        mapRef.current.setCenter([targetCenter.lng, targetCenter.lat]);
        return;
      }

      const startLng = startCenter.lng;
      const startLat = startCenter.lat;
      const targetLng = targetCenter.lng;
      const targetLat = targetCenter.lat;
      
      // If already at target, skip animation
      if (Math.abs(startLng - targetLng) < 0.0001 && Math.abs(startLat - targetLat) < 0.0001) {
        return;
      }
      
      const startTime = Date.now();

      // Easing function: ease-in-out cubic
      const easeInOutCubic = (t) => {
        return t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const animate = () => {
        if (!mapRef.current || !mapReadyRef.current) {
          animationFrameRef.current = null;
          return;
        }

        try {
          const now = Date.now();
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const easedProgress = easeInOutCubic(progress);
          
          const currentLng = startLng + (targetLng - startLng) * easedProgress;
          const currentLat = startLat + (targetLat - startLat) * easedProgress;
          
          mapRef.current.setCenter([currentLng, currentLat]);
          
          if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(animate);
          } else {
            animationFrameRef.current = null;
          }
        } catch (err) {
          console.error('Error in animation frame:', err);
          animationFrameRef.current = null;
        }
      };

      // Cancel any existing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    } catch (err) {
      console.error('Error in smoothTransitionTo:', err);
      // Fallback to direct setCenter
      try {
        mapRef.current.setCenter([targetCenter.lng, targetCenter.lat]);
      } catch (e) {
        console.error('Error setting center directly:', e);
      }
    }
  };

  // update center with smooth transition
  useEffect(() => {
    if (!mapRef.current || !center) return;
    
    // Skip if center hasn't changed (with small tolerance for floating point)
    if (prevCenterRef.current && 
        Math.abs(prevCenterRef.current.lat - center.lat) < 0.0001 && 
        Math.abs(prevCenterRef.current.lng - center.lng) < 0.0001) {
      return;
    }

    // Wait for map to be ready
    const updateCenter = () => {
      if (!mapRef.current) return;

      // Check if map is ready
      if (!mapReadyRef.current) {
        setTimeout(updateCenter, 100);
        return;
      }

      try {
        // Try native methods first
        if (typeof mapRef.current.flyTo === 'function') {
          mapRef.current.flyTo({
            center: [center.lng, center.lat],
            duration: 1200,
            zoom: mapRef.current.getZoom(),
            essential: true
          });
          prevCenterRef.current = center;
          return;
        } 
        
        if (typeof mapRef.current.easeTo === 'function') {
          mapRef.current.easeTo({
            center: [center.lng, center.lat],
            duration: 1000
          });
          prevCenterRef.current = center;
          return;
        }

        // Use custom smooth transition
        smoothTransitionTo(center, 1000);
        prevCenterRef.current = center;
      } catch (err) {
        console.error('Error updating center:', err);
        // Fallback to direct setCenter
        try {
          mapRef.current.setCenter([center.lng, center.lat]);
          prevCenterRef.current = center;
        } catch (e) {
          console.error('Error setting center directly:', e);
        }
      }
    };

    updateCenter();

    // Cleanup animation on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [center]);

  // markers quán cà phê
  useEffect(() => {
    if (!mapRef.current) return;

    console.log('MapView: cafes changed, count:', cafes.length);

    // Wait for map to be ready before adding markers
    const addMarkers = () => {
      if (!mapRef.current) return;

      // Check if map is ready
      if (!mapReadyRef.current) {
        setTimeout(addMarkers, 100);
        return;
      }

      try {
        console.log('MapView: Adding markers for', cafes.length, 'cafes');
        
        // clear cũ
        markersRef.current.forEach((m) => {
          try {
            if (m && typeof m.remove === 'function') {
              m.remove();
            }
          } catch (err) {
            // Ignore errors when removing markers
          }
        });
        markersRef.current = [];

        // Add markers for each cafe
        cafes.forEach((cafe, index) => {
          if (!cafe || typeof cafe.lat !== 'number' || typeof cafe.lng !== 'number') {
            console.warn('MapView: Invalid cafe data at index', index, cafe);
            return;
          }

          try {
            const marker = new goongjs.Marker()
              .setLngLat([cafe.lng, cafe.lat])
              .setPopup(
                new goongjs.Popup({ offset: 24 }).setHTML(`
                  <strong>${cafe.name || 'Cafe'}</strong><br/>
                  ${cafe.address || ''}
                `)
              )
              .addTo(mapRef.current);

            // Add smooth fade-in animation when marker is added
            const markerElement = marker.getElement();
            if (markerElement) {
              markerElement.classList.add('goong-marker');
              markerElement.style.opacity = '0';
              markerElement.style.transition = 'opacity 0.3s ease-in';
              // Trigger fade-in after a small delay
              setTimeout(() => {
                if (markerElement && markerElement.style) {
                  markerElement.style.opacity = '1';
                }
              }, 10);
            }

            if (onSelectCafe) {
              const element = marker.getElement();
              if (element) {
                element.addEventListener('click', () => onSelectCafe(cafe));
              }
            }

            markersRef.current.push(marker);
          } catch (err) {
            console.error('Error creating marker for cafe:', cafe.name, err);
          }
        });
      } catch (err) {
        console.error('Error adding markers:', err);
      }
    };

    addMarkers();
  }, [cafes, onSelectCafe]);

  // marker vị trí hiện tại
  useEffect(() => {
    if (!mapRef.current) return;

    // Wait for map to be ready
    const addCurrentLocationMarker = () => {
      if (!mapRef.current) return;

      // Check if map is ready
      if (!mapReadyRef.current) {
        setTimeout(addCurrentLocationMarker, 100);
        return;
      }

      // xoá marker cũ nếu có
      if (currentMarkerRef.current) {
        try {
          currentMarkerRef.current.remove();
        } catch (err) {
          // Ignore errors
        }
        currentMarkerRef.current = null;
      }

      if (!currentLocation) return;

      try {
        // tạo HTML element custom cho marker
        const el = document.createElement('div');
        el.className = 'current-location-marker';

        currentMarkerRef.current = new goongjs.Marker({ element: el })
          .setLngLat([currentLocation.lng, currentLocation.lat])
          .setPopup(
            new goongjs.Popup({ offset: 20 }).setHTML('<strong>Vị trí của tôi</strong>')
          )
          .addTo(mapRef.current);
      } catch (err) {
        console.error('Error adding current location marker:', err);
      }
    };

    addCurrentLocationMarker();
  }, [currentLocation]);

  return <div ref={mapContainerRef} className="map-wrapper" />;
}

export default MapView;
