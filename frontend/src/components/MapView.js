// src/components/MapView.js
import React, { useEffect, useRef, useCallback } from 'react';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';

function MapView({ center, cafes, currentLocation, onSelectCafe, zoomToLocation }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const currentMarkerRef = useRef(null); // marker vị trí hiện tại
  // Track previous center to detect changes
  const prevCenterRef = useRef(null);
  const animationFrameRef = useRef(null);
  const prevZoomToLocationRef = useRef(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - chỉ chạy 1 lần khi mount (init map)

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

  // Zoom to location when zoomToLocation prop changes
  useEffect(() => {
    if (!mapRef.current || !zoomToLocation) {
      prevZoomToLocationRef.current = null;
      return;
    }
    
    // Always zoom when zoomToLocation is set (don't skip if same location, allow re-zoom)
    const zoomToLocationHandler = () => {
      if (!mapRef.current) return;

      if (!mapReadyRef.current) {
        setTimeout(zoomToLocationHandler, 100);
        return;
      }

      try {
        // Zoom to location with appropriate zoom level (15 is good for street level)
        if (typeof mapRef.current.flyTo === 'function') {
          mapRef.current.flyTo({
            center: [zoomToLocation.lng, zoomToLocation.lat],
            zoom: 15,
            duration: 1500,
            essential: true
          });
          prevZoomToLocationRef.current = zoomToLocation;
        } else if (typeof mapRef.current.easeTo === 'function') {
          mapRef.current.easeTo({
            center: [zoomToLocation.lng, zoomToLocation.lat],
            zoom: 15,
            duration: 1200
          });
          prevZoomToLocationRef.current = zoomToLocation;
        } else {
          mapRef.current.setCenter([zoomToLocation.lng, zoomToLocation.lat]);
          mapRef.current.setZoom(15);
          prevZoomToLocationRef.current = zoomToLocation;
        }
      } catch (err) {
        console.error('Error zooming to location:', err);
      }
    };

    zoomToLocationHandler();
  }, [zoomToLocation]);

  // update center with smooth transition
  useEffect(() => {
    if (!mapRef.current || !center) return;
    
    // Check if center has changed (including timestamp for force update)
    const centerChanged = !prevCenterRef.current || 
        Math.abs(prevCenterRef.current.lat - center.lat) > 0.0001 || 
        Math.abs(prevCenterRef.current.lng - center.lng) > 0.0001 ||
        (center._timestamp && prevCenterRef.current._timestamp !== center._timestamp);
    
    if (!centerChanged) {
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
        // Normal center update - always update center when it changes
        // Don't change zoom here, zoom is handled by zoomToLocation effect
        const currentZoom = mapRef.current.getZoom();
        
        // Try native methods first
        if (typeof mapRef.current.flyTo === 'function') {
          mapRef.current.flyTo({
            center: [center.lng, center.lat],
            duration: 1200,
            zoom: currentZoom,
            essential: true
          });
          prevCenterRef.current = { lat: center.lat, lng: center.lng };
          return;
        } 
        
        if (typeof mapRef.current.easeTo === 'function') {
          mapRef.current.easeTo({
            center: [center.lng, center.lat],
            duration: 1000,
            zoom: currentZoom
          });
          prevCenterRef.current = { lat: center.lat, lng: center.lng };
          return;
        }

        // Use custom smooth transition
        smoothTransitionTo(center, 1000);
        prevCenterRef.current = { lat: center.lat, lng: center.lng };
      } catch (err) {
        console.error('Error updating center:', err);
        // Fallback to direct setCenter
        try {
          mapRef.current.setCenter([center.lng, center.lat]);
          prevCenterRef.current = { lat: center.lat, lng: center.lng };
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

  // Helper function to format rating stars
  const formatRatingStars = useCallback((rating) => {
    if (!rating || rating === null || rating === undefined) {
      return '<span style="color: #999;">☆☆☆☆☆</span> <span style="color: #999; font-size: 12px;">N/A</span>';
    }
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - Math.ceil(rating);
    return `
      <span style="color: #fbbf24;">${'★'.repeat(fullStars)}${hasHalfStar ? '½' : ''}${'☆'.repeat(emptyStars)}</span>
      <span style="color: #666; font-size: 12px; margin-left: 4px;">${rating.toFixed(1)}</span>
    `;
  }, []);

  // Helper function to create popup HTML
  const createPopupHTML = useCallback((cafe) => {
    const rating = cafe.user_rating != null ? cafe.user_rating : (cafe.rating || null);
    const distance = cafe.distance !== null && cafe.distance !== undefined 
      ? `${cafe.distance.toFixed(1)} km` 
      : '距離不明';
    
    // Get images (1-2 images)
    const images = [];
    if (cafe.photo_url) {
      images.push(cafe.photo_url);
    }
    // If there are multiple photos in photos array
    if (cafe.photos && Array.isArray(cafe.photos) && cafe.photos.length > 0) {
      cafe.photos.slice(0, 2).forEach(photo => {
        const photoUrl = photo.photo_reference || photo.reference || photo.url;
        if (photoUrl && !images.includes(photoUrl)) {
          images.push(photoUrl);
        }
      });
    }
    // Limit to 2 images
    const displayImages = images.slice(0, 2);
    
    // Default image if no images available
    const defaultImage = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=150&fit=crop&q=80';
    
    return `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        max-width: 280px;
        padding: 0;
      ">
        ${displayImages.length > 0 ? `
          <div style="
            display: flex;
            gap: 4px;
            margin-bottom: 8px;
            border-radius: 8px 8px 0 0;
            overflow: hidden;
          ">
            ${displayImages.map((img, idx) => `
              <img 
                src="${img}" 
                alt="${cafe.name}"
                style="
                  width: ${displayImages.length === 1 ? '100%' : 'calc(50% - 2px)'};
                  height: 100px;
                  object-fit: cover;
                  display: block;
                "
                onerror="this.src='${defaultImage}'"
              />
            `).join('')}
          </div>
        ` : `
          <div style="
            width: 100%;
            height: 100px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin-bottom: 8px;
            border-radius: 8px 8px 0 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
          ">☕</div>
        `}
        <div style="padding: 0 4px 4px 4px;">
          <h3 style="
            margin: 0 0 6px 0;
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.3;
          ">${cafe.name || 'Cafe'}</h3>
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 6px;
            flex-wrap: wrap;
          ">
            <div style="display: flex; align-items: center;">
              ${formatRatingStars(rating)}
            </div>
            <span style="
              color: #6b7280;
              font-size: 12px;
              background: #f3f4f6;
              padding: 2px 6px;
              border-radius: 4px;
            ">📍 ${distance}</span>
          </div>
          ${cafe.address ? `
            <p style="
              margin: 0;
              font-size: 12px;
              color: #6b7280;
              line-height: 1.4;
            ">${cafe.address}</p>
          ` : ''}
        </div>
      </div>
    `;
  }, [formatRatingStars]);

  // markers quán cà phê
  useEffect(() => {
    if (!mapRef.current) {
      console.log('MapView: mapRef.current is null, skipping marker update');
      return;
    }

    console.log('MapView: cafes changed, count:', cafes.length);
    if (cafes.length > 0) {
      console.log('MapView: Sample cafe:', {
        name: cafes[0].name,
        lat: cafes[0].lat,
        lng: cafes[0].lng,
        typeLat: typeof cafes[0].lat,
        typeLng: typeof cafes[0].lng
      });
    }

    // Wait for map to be ready before adding markers
    const addMarkers = () => {
      if (!mapRef.current) {
        console.log('MapView: mapRef.current is null in addMarkers');
        return;
      }

      // Check if map is ready
      if (!mapReadyRef.current) {
        console.log('MapView: Map not ready yet, retrying in 100ms');
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
          if (!cafe) {
            console.warn('MapView: Null/undefined cafe at index', index);
            return;
          }
          
          if (typeof cafe.lat !== 'number' || typeof cafe.lng !== 'number' || isNaN(cafe.lat) || isNaN(cafe.lng)) {
            console.warn('MapView: Invalid cafe coordinates at index', index, {
              name: cafe.name,
              lat: cafe.lat,
              lng: cafe.lng,
              typeLat: typeof cafe.lat,
              typeLng: typeof cafe.lng
            });
            return;
          }
          
          // Validate lat/lng range
          if (cafe.lat < -90 || cafe.lat > 90 || cafe.lng < -180 || cafe.lng > 180) {
            console.warn('MapView: Cafe coordinates out of range at index', index, {
              name: cafe.name,
              lat: cafe.lat,
              lng: cafe.lng
            });
            return;
          }

          try {
            const popup = new goongjs.Popup({ 
              offset: 24,
              closeButton: false,
              closeOnClick: false,
              className: 'cafe-marker-popup'
            }).setHTML(createPopupHTML(cafe));

            const marker = new goongjs.Marker()
              .setLngLat([cafe.lng, cafe.lat])
              .setPopup(popup)
              .addTo(mapRef.current);

            // Add smooth fade-in animation when marker is added
            const markerElement = marker.getElement();
            if (markerElement) {
              markerElement.classList.add('goong-marker');
              markerElement.style.opacity = '0';
              markerElement.style.transition = 'opacity 0.3s ease-in';
              markerElement.style.cursor = 'pointer';
              // Trigger fade-in after a small delay
              setTimeout(() => {
                if (markerElement && markerElement.style) {
                  markerElement.style.opacity = '1';
                }
              }, 10);
            }

            // Add hover event listeners to show popup on hover
            const element = marker.getElement();
            if (element) {
              let hoverTimeout = null;
              let isHovering = false;

              // Show popup on mouseenter
              element.addEventListener('mouseenter', () => {
                isHovering = true;
                if (hoverTimeout) {
                  clearTimeout(hoverTimeout);
                  hoverTimeout = null;
                }
                if (marker.getPopup() && !marker.getPopup().isOpen()) {
                  marker.togglePopup();
                }
              });

              // Hide popup on mouseleave
              element.addEventListener('mouseleave', () => {
                isHovering = false;
                // Wait a bit to see if mouse moves to popup
                hoverTimeout = setTimeout(() => {
                  if (!isHovering && marker.getPopup() && marker.getPopup().isOpen()) {
                    marker.togglePopup();
                  }
                }, 200);
              });

              // Also handle popup hover
              const popup = marker.getPopup();
              if (popup) {
                // Wait for popup to be added to DOM
                setTimeout(() => {
                  const popupElement = popup.getElement();
                  if (popupElement) {
                    popupElement.addEventListener('mouseenter', () => {
                      isHovering = true;
                      if (hoverTimeout) {
                        clearTimeout(hoverTimeout);
                        hoverTimeout = null;
                      }
                    });

                    popupElement.addEventListener('mouseleave', () => {
                      isHovering = false;
                      hoverTimeout = setTimeout(() => {
                        if (!isHovering && popup.isOpen()) {
                          marker.togglePopup();
                        }
                      }, 200);
                    });
                  }
                }, 100);
              }

              // Click event to select cafe
              if (onSelectCafe) {
                element.addEventListener('click', () => onSelectCafe(cafe));
              }
            }

            markersRef.current.push(marker);
            console.log('MapView: Successfully added marker for:', cafe.name, 'at', [cafe.lng, cafe.lat]);
          } catch (err) {
            console.error('Error creating marker for cafe:', cafe.name, err);
          }
        });
        
        console.log('MapView: Total markers added:', markersRef.current.length);
      } catch (err) {
        console.error('Error adding markers:', err);
      }
    };

    addMarkers();
  }, [cafes, onSelectCafe, createPopupHTML]);

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

      if (!currentLocation) {
        console.log('MapView: No current location to display');
        return;
      }

      try {
        console.log('MapView: Adding current location marker at:', {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          coordinates: [currentLocation.lng, currentLocation.lat]
        });

        // tạo HTML element custom cho marker
        const el = document.createElement('div');
        el.className = 'current-location-marker';
        
        // Style cho marker vị trí hiện tại
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#4285F4';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        
        // Thêm animation khi marker xuất hiện
        el.style.animation = 'pulse 2s infinite';

        // Đảm bảo sử dụng đúng format [lng, lat] cho Goong Maps
        const coordinates = [currentLocation.lng, currentLocation.lat];
        console.log('MapView: Setting marker coordinates:', coordinates);

        currentMarkerRef.current = new goongjs.Marker({ element: el })
          .setLngLat(coordinates)
          .setPopup(
            new goongjs.Popup({ offset: 20 }).setHTML(
              `<strong>📍 Vị trí của tôi</strong><br/>
              Lat: ${currentLocation.lat.toFixed(6)}<br/>
              Lng: ${currentLocation.lng.toFixed(6)}`
            )
          )
          .addTo(mapRef.current);

        // Verify marker position
        const markerPosition = currentMarkerRef.current.getLngLat();
        console.log('MapView: Marker position verified:', {
          lng: markerPosition.lng,
          lat: markerPosition.lat
        });
          
        // Tự động mở popup khi marker được thêm vào
        if (currentMarkerRef.current.getPopup) {
          setTimeout(() => {
            try {
              currentMarkerRef.current.togglePopup();
            } catch (e) {
              console.warn('Could not toggle popup:', e);
            }
          }, 500);
        }
      } catch (err) {
        console.error('Error adding current location marker:', err);
      }
    };

    addCurrentLocationMarker();
  }, [currentLocation]);

  return <div ref={mapContainerRef} className="map-wrapper-new" />;
}

export default MapView;
