// src/pages/Home.js
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { message, Avatar } from 'antd';
import { LogoutOutlined, HeartOutlined, EnvironmentOutlined, SearchOutlined, UserOutlined, StarOutlined, SettingOutlined, BellOutlined, GiftOutlined } from '@ant-design/icons';
import LanguageDropdown from '../components/LanguageDropdown';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import DirectionsModal from '../components/DirectionsModal';
import PromotionNotification from '../components/PromotionNotification';
import apiService from '../services/apiService';
import authService from '../services/authService';
import profileService from '../services/profileService';
import promotionService from '../services/promotionService';
import { useTranslation } from '../hooks/useTranslation';


// Configure message globally


function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [center, setCenter] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sort, setSort] = useState('rating');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('nearby'); // 'nearby' | 'search'
  const [messageApi, contextHolder] = message.useMessage();
  const [filters, setFilters] = useState({
    minRating: null,
    maxDistance: null,
    isOpen: null // null = tất cả, true = đang mở, false = đã đóng
  });
  const [allCafes, setAllCafes] = useState([]); // Lưu tất cả quán trước khi filter
  const [shouldZoomToLocation, setShouldZoomToLocation] = useState(false);
  const [displayedCafesCount, setDisplayedCafesCount] = useState(3); // Số lượng cafes hiển thị ban đầu
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const isLocatingRef = useRef(false); // Ref để track xem đang trong quá trình locate không
  const [showCafesOnMap, setShowCafesOnMap] = useState(true);
  const [directionsModalVisible, setDirectionsModalVisible] = useState(false);
  const [selectedCafeForDirections, setSelectedCafeForDirections] = useState(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [databaseCafes, setDatabaseCafes] = useState([]); // Cafes từ database
  const [showPromotionsList, setShowPromotionsList] = useState(false); // Hiển thị danh sách promotions
  const [allPromotions, setAllPromotions] = useState([]); // Tất cả promotions
  const [loadingPromotions, setLoadingPromotions] = useState(false);

  const handleLogout = () => {
    authService.logout();
    message.success(t('common.logout'));
    navigate('/auth');
  };

  const handleGoToFavorites = () => {
    navigate('/favorites');
  };

  // Xử lý click vào nút thông báo khuyến mãi
  const handleTogglePromotionsList = async () => {
    if (!showPromotionsList) {
      // Nếu đang ẩn, chỉ load lại nếu chưa có data hoặc refresh data
      if (allPromotions.length === 0) {
        setLoadingPromotions(true);
        try {
          const promotions = await promotionService.getAllActivePromotions();
          setAllPromotions(promotions);
        } catch (err) {
          console.error('Error loading promotions:', err);
          messageApi.error('Không thể tải danh sách khuyến mãi');
        } finally {
          setLoadingPromotions(false);
        }
      }
      setShowPromotionsList(true);
    } else {
      // Nếu đang hiển thị, ẩn đi
      setShowPromotionsList(false);
    }
  };

  // Load user avatar khi component mount
  useEffect(() => {
    const loadUserAvatar = async () => {
      try {
        const data = await profileService.getProfile(1, 1);
        if (data.user && data.user.avatar_url) {
          setUserAvatar(data.user.avatar_url);
        }
      } catch (err) {
        // Không hiển thị error nếu không load được avatar, chỉ log
        console.log('Could not load user avatar:', err);
      }
    };
    loadUserAvatar();
  }, []);

  // Hàm áp dụng filters
  const applyFilters = (cafes, filterOptions, isSearchMode = false) => {
    let filtered = [...cafes];

    // Filter theo rating
    if (filterOptions.minRating) {
      const minRatingValue = parseFloat(filterOptions.minRating);
      filtered = filtered.filter(cafe => {
        const rating = cafe.user_rating != null ? cafe.user_rating : (cafe.rating || 0);
        return rating >= minRatingValue;
      });
    }

    // Filter theo khoảng cách - CHỈ áp dụng khi KHÔNG phải search mode
    // Khi search, hiển thị tất cả kết quả không filter theo khoảng cách
    if (!isSearchMode && filterOptions.maxDistance) {
      const maxDistanceValue = parseFloat(filterOptions.maxDistance);
      console.log('Filtering by max distance:', maxDistanceValue, 'km');
      const beforeCount = filtered.length;
      filtered = filtered.filter(cafe => {
        // Nếu cafe không có distance (null), chỉ loại bỏ nếu user đã set filter
        // Nhưng để user-friendly, nếu distance là null thì giữ lại (có thể là search result không có location)
        if (cafe.distance === null || cafe.distance === undefined) {
          console.log('Cafe without distance:', cafe.name);
          return false; // Loại bỏ cafes không có distance khi filter theo distance
        }
        const keep = cafe.distance <= maxDistanceValue;
        if (!keep) {
          console.log(`Cafe ${cafe.name} filtered out: distance ${cafe.distance}km > ${maxDistanceValue}km`);
        }
        return keep;
      });
      console.log(`Distance filter: ${beforeCount} -> ${filtered.length} cafes`);
    }

    // Filter theo trạng thái mở cửa
    // Lưu ý: API hiện tại chưa trả về opening_hours, nên phần này sẽ được implement sau
    // khi có dữ liệu từ Google/Goong Places API
    if (filterOptions.isOpen !== null) {
      // Tạm thời bỏ qua vì chưa có dữ liệu opening_hours
      // filtered = filtered.filter(cafe => {
      //   if (!cafe.opening_hours) return filterOptions.isOpen === false;
      //   return cafe.opening_hours.open_now === filterOptions.isOpen;
      // });
    }

    return filtered;
  };

  // Lấy quán gần "vị trí của tôi" trong 2km
  // Lưu ý: Không include filters trong dependency để tránh tự động trigger lại
  const handleLocateMe = useCallback(async (sortOverride) => {
    // Đảm bảo chỉ gọi API 1 lần mỗi lần click
    if (isLocatingRef.current || loading) {
      console.log('Already locating, skipping duplicate request');
      return;
    }

    if (!navigator.geolocation && !currentLocation) {
      messageApi.warning('Trình duyệt của bạn không hỗ trợ GPS.');
      return;
    }

    try {
      isLocatingRef.current = true; // Đánh dấu đang trong quá trình locate
      setLoading(true);

      let loc = currentLocation;

      if (!loc && navigator.geolocation) {
        try {
          loc = await new Promise((resolve, reject) => {
            // Sử dụng watchPosition để lấy vị trí chính xác hơn, sau đó clear watch
            const watchId = navigator.geolocation.watchPosition(
              (pos) => {
                // Chỉ chấp nhận vị trí có accuracy tốt (< 100m)
                if (pos.coords.accuracy > 100) {
                  console.warn('Location accuracy too low:', pos.coords.accuracy, 'm, waiting for better...');
                  return; // Tiếp tục chờ vị trí chính xác hơn
                }
                
                // Clear watch sau khi có vị trí tốt
                navigator.geolocation.clearWatch(watchId);
                
                const location = {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude
                };
                console.log('GPS Location obtained (high accuracy):', {
                  lat: location.lat,
                  lng: location.lng,
                  accuracy: pos.coords.accuracy,
                  altitude: pos.coords.altitude,
                  altitudeAccuracy: pos.coords.altitudeAccuracy
                });
                resolve(location);
              },
              (err) => {
                // Clear watch khi có lỗi
                navigator.geolocation.clearWatch(watchId);
                console.warn('Geolocation error:', err.code, err.message);
                
                // Thử lại với getCurrentPosition nếu watchPosition thất bại
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const location = {
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude
                    };
                    console.log('GPS Location from getCurrentPosition:', location);
                    resolve(location);
                  },
                  () => {
                    // Nếu cả hai đều thất bại, fallback về Hà Nội
                    const fallback = {
                      lat: 21.028511,
                      lng: 105.804817
                    };
                    console.log('Using fallback location:', fallback);
                    resolve(fallback);
                  },
                  { 
                    enableHighAccuracy: true, 
                    timeout: 5000, 
                    maximumAge: 0
                  }
                );
              },
              { 
                enableHighAccuracy: true, 
                timeout: 15000,  // Tăng timeout lên 15s
                maximumAge: 0  // Không sử dụng cache, luôn lấy vị trí mới
              }
            );
            
            // Timeout sau 15s nếu vẫn chưa có vị trí tốt
            setTimeout(() => {
              navigator.geolocation.clearWatch(watchId);
              // Thử getCurrentPosition như fallback
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const location = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                  };
                  console.log('GPS Location from timeout fallback:', location);
                  resolve(location);
                },
                () => {
                  const fallback = {
                    lat: 21.028511,
                    lng: 105.804817
                  };
                  console.log('Using fallback location after timeout:', fallback);
                  resolve(fallback);
                },
                { 
                  enableHighAccuracy: false,  // Không yêu cầu high accuracy cho fallback
                  timeout: 5000, 
                  maximumAge: 60000  // Chấp nhận cache 1 phút
                }
              );
            }, 15000);
          });
          setCurrentLocation(loc);
          console.log('Current location set:', loc);
        } catch (err) {
          console.error('Error getting location:', err);
          // Fallback về Hà Nội nếu có lỗi
          loc = { lat: 21.028511, lng: 105.804817 };
          setCurrentLocation(loc);
        }
      } else if (loc) {
        console.log('Using existing location:', loc);
      }

      // Đưa vị trí lên giữa bản đồ ngay lập tức và trigger zoom
      if (loc) {
        // Reset zoom trigger trước để có thể trigger lại
        setShouldZoomToLocation(false);
        // Tạo object mới với timestamp để force update center
        const newCenter = { lat: loc.lat, lng: loc.lng, _timestamp: Date.now() };
        setCenter(newCenter);
        // Trigger zoom to location ngay sau khi set center
        setTimeout(() => {
          setShouldZoomToLocation(true);
        }, 50);
      }

      const s = sortOverride || sort || 'distance';
      const list = await apiService.getNearbyCafes({
        lat: loc.lat,
        lng: loc.lng,
        radius: 2000,
        sort: s
      });

      console.log('Nearby results:', list.length, 'cafes found');
      console.log('Nearby results details:', list.map(c => ({ name: c.name, distance: c.distance, rating: c.rating })));

      if (!Array.isArray(list)) {
        console.error('Invalid response format:', list);
        messageApi.error('Dữ liệu trả về không đúng định dạng');
        setCafes([]);
        setAllCafes([]);
        return;
      }

      if (list.length === 0) {
        console.warn('No cafes found nearby');
        messageApi.info('Không tìm thấy quán cà phê nào gần đây');
        setCafes([]);
        setAllCafes([]);
        return;
      }

      setAllCafes(list);
      // Apply filters ngay lập tức (không chờ useEffect)
      const filtered = applyFilters(list, filters, false);
      setCafes(filtered);
      setDisplayedCafesCount(3); // Reset về 3 items ban đầu
      
      console.log('After filter:', filtered.length, 'cafes');
      if (filtered.length === 0 && list.length > 0) {
        console.warn('All cafes filtered out! Filters:', filters);
        messageApi.warning('Không có quán nào phù hợp với bộ lọc đã chọn. Hãy thử điều chỉnh bộ lọc.');
      }
      
      setMode('nearby');
      setSort(s);
      
      // Reset zoom trigger after delay để có thể trigger lại lần sau
      setTimeout(() => setShouldZoomToLocation(false), 2000);
    } catch (err) {
      console.error('Locate me error', err);
      messageApi.error('Không thể lấy vị trí hiện tại hoặc dữ liệu quán gần bạn.');
    } finally {
      setLoading(false);
      isLocatingRef.current = false; // Reset flag sau khi hoàn thành
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation, sort]); // Loại bỏ filters khỏi dependency để tránh tự động trigger lại

  // Khi user bấm Tìm kiếm
  const handleSearch = useCallback(async (keyword) => {
    const q = keyword ?? searchKeyword;
    const trimmed = q.trim();

    if (!trimmed) {
      // ô rỗng → không làm gì, yêu cầu user nhập từ khóa
      messageApi.warning('検索キーワードを入力してください');
      return;
    }

    try {
      setLoading(true);
      const list = await apiService.searchCafes({
        query: trimmed,
        lat: currentLocation?.lat,
        lng: currentLocation?.lng,
        sort
      });
      
      console.log('Search results:', list.length, 'cafes found');
      
      if (!Array.isArray(list)) {
        console.error('Invalid response format:', list);
        messageApi.error('Dữ liệu trả về không đúng định dạng');
        setCafes([]);
        setAllCafes([]);
        return;
      }
      
      setAllCafes(list);
      // Khi search, không filter theo khoảng cách (isSearchMode = true)
      // Apply filters ngay lập tức (không chờ useEffect)
      const filtered = applyFilters(list, filters, true);
      setCafes(filtered);
      setDisplayedCafesCount(3); // Reset về 3 items ban đầu
      
      console.log('After filter (search mode - no distance filter):', filtered.length, 'cafes');
      
      if (filtered.length > 0) {
        setCenter({ lat: filtered[0].lat, lng: filtered[0].lng });
      } else if (list.length > 0) {
        // If all filtered out, still center on first result
        setCenter({ lat: list[0].lat, lng: list[0].lng });
      }
      setMode('search');
      setSearchKeyword(trimmed);
    } catch (err) {
      console.error('Search error:', err);
      messageApi.error(`Lỗi khi tìm kiếm quán cà phê: ${err.message}`);
      setCafes([]);
      setAllCafes([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeyword, currentLocation, sort, messageApi]); // Loại bỏ filters khỏi dependency để tránh tự động trigger lại

  // Apply filters khi filters thay đổi (chỉ khi đã có allCafes)
  // Lưu ý: Chỉ apply khi user thay đổi filters thủ công, không tự động sau search
  useEffect(() => {
    // Chỉ apply filters nếu đã có allCafes và không đang loading
    if (allCafes.length > 0 && !loading) {
      console.log('Filters changed, applying filters to existing cafes...', filters);
      const isSearchMode = mode === 'search';
      const filtered = applyFilters(allCafes, filters, isSearchMode);
      setCafes(filtered);
      setDisplayedCafesCount(3); // Reset infinite scroll to show first 3 items
      
      if (filtered.length === 0 && allCafes.length > 0) {
        console.warn('All cafes filtered out! Filters:', filters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Chỉ trigger khi filters thay đổi, không phụ thuộc vào mode/search

  // Listen for review submission to refresh cafe list
  useEffect(() => {
    const handleReviewSubmitted = async (event) => {
      // Refresh cafe list khi có review mới được submit
      console.log('Review submitted, refreshing cafe list...', event.detail);
      if (mode === 'nearby' && currentLocation) {
        await handleLocateMe(sort);
        messageApi.success('Đã cập nhật rating của quán!');
      } else if (mode === 'search' && searchKeyword.trim()) {
        await handleSearch(searchKeyword);
        messageApi.success('Đã cập nhật rating của quán!');
      }
    };

    window.addEventListener('reviewSubmitted', handleReviewSubmitted);
    return () => {
      window.removeEventListener('reviewSubmitted', handleReviewSubmitted);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, currentLocation, searchKeyword, sort, messageApi]); // Loại bỏ handleLocateMe và handleSearch khỏi dependency

  // Load số lượng promotions khi component mount để hiển thị badge
  useEffect(() => {
    const loadPromotionsCount = async () => {
      try {
        const promotions = await promotionService.getAllActivePromotions();
        setAllPromotions(promotions);
      } catch (err) {
        console.error('Error loading promotions count:', err);
        // Không hiển thị error, chỉ log
      }
    };
    loadPromotionsCount();
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPromotionsList && !event.target.closest('.promotions-dropdown-container')) {
        setShowPromotionsList(false);
      }
    };

    if (showPromotionsList) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPromotionsList]);

  // Load cafes từ database khi component mount
  useEffect(() => {
    const loadDatabaseCafes = async () => {
      try {
        const savedCafes = await apiService.getSavedCafes();
        console.log('getSavedCafes response:', savedCafes);
        if (Array.isArray(savedCafes)) {
          // Filter chỉ lấy cafes có lat/lng hợp lệ
          const validCafes = savedCafes.filter(cafe => 
            cafe && 
            typeof cafe.lat === 'number' && 
            typeof cafe.lng === 'number' &&
            !isNaN(cafe.lat) && 
            !isNaN(cafe.lng) &&
            cafe.lat >= -90 && cafe.lat <= 90 &&
            cafe.lng >= -180 && cafe.lng <= 180
          );
          console.log('Loaded', validCafes.length, 'valid cafes from database (out of', savedCafes.length, 'total)');
          setDatabaseCafes(validCafes);
        } else {
          console.warn('getSavedCafes did not return an array:', savedCafes);
          setDatabaseCafes([]);
        }
      } catch (err) {
        console.error('Error loading cafes from database:', err);
        setDatabaseCafes([]);
        // Không hiển thị error, chỉ log để không làm phiền user
      }
    };
    
    loadDatabaseCafes();
    
    // Set center mặc định là Hà Nội để map có vị trí hiển thị
    setCenter({ lat: 21.028511, lng: 105.804817 });
  }, []); // Chỉ chạy 1 lần khi mount

  // Khi user gõ trong ô search
  const handleKeywordChange = (value) => {
    setSearchKeyword(value);
    // Không tự động load khi xóa search keyword
    // User phải click "Vị trí của tôi" hoặc search lại
  };

  const handleSelectCafe = (cafe) => {
    setCenter({ lat: cafe.lat, lng: cafe.lng });
  };

  // Mở modal chọn ứng dụng bản đồ
  const handleOpenDirections = (e, cafe) => {
    e.stopPropagation();
    setSelectedCafeForDirections(cafe);
    setDirectionsModalVisible(true);
  };

  const handleCloseDirectionsModal = () => {
    setDirectionsModalVisible(false);
    setSelectedCafeForDirections(null);
  };

  const handleSaveFavorite = async (cafe) => {
    try {
      await apiService.saveFavoriteCafe({
        provider: cafe.provider,
        provider_place_id: cafe.provider_place_id,
        name: cafe.name,
        address: cafe.address,
        lat: cafe.lat,
        lng: cafe.lng,
        rating: cafe.rating,
        user_rating_count: cafe.user_rating_count
      });
      
      // Cập nhật databaseCafes nếu cafe mới được thêm vào database
      // Reload cafes từ database để có dữ liệu mới nhất
      try {
        const savedCafes = await apiService.getSavedCafes();
        if (Array.isArray(savedCafes)) {
          setDatabaseCafes(savedCafes);
        }
      } catch (err) {
        console.error('Error reloading cafes from database:', err);
      }
      
      messageApi.success({
        content: `✅ Đã thêm "${cafe.name}" vào danh sách yêu thích`,
        duration: 5,
        style: {
          marginTop: '2vh',
          fontSize: '16px',
        },
      });
    } catch (err) {
      console.error(err);
      if (err.message === 'Not authenticated') {
        messageApi.error({
          content: '🔒 Vui lòng đăng nhập để lưu yêu thích',
          duration: 5,
          style: {
            marginTop: '20vh',
            fontSize: '16px',
          },
        });
        navigate('/auth');
      } else {
        messageApi.error({
          content: '❌ Không thể lưu quán yêu thích',
          duration: 5,
          style: {
            marginTop: '20vh',
            fontSize: '16px',
          },
        });
      }
    }
  };

  // Merge cafes từ search/nearby với cafes từ database để hiển thị trên map
  const mergedCafesForMap = useMemo(() => {
    if (!showCafesOnMap) {
      console.log('MapView: showCafesOnMap is false, returning empty array');
      return [];
    }
    
    // Merge cafes từ search/nearby với cafes từ database
    // Loại bỏ duplicates dựa trên provider + provider_place_id hoặc id
    const mergedCafes = [];
    const existingKeys = new Set();
    
    // Thêm cafes hiện tại (từ search/nearby) - filter chỉ lấy cafes có lat/lng hợp lệ
    cafes.forEach(cafe => {
      if (!cafe) return;
      if (typeof cafe.lat !== 'number' || typeof cafe.lng !== 'number' || 
          isNaN(cafe.lat) || isNaN(cafe.lng) ||
          cafe.lat < -90 || cafe.lat > 90 || cafe.lng < -180 || cafe.lng > 180) {
        console.warn('Skipping cafe without valid coordinates:', cafe?.name || cafe, {
          lat: cafe.lat,
          lng: cafe.lng,
          typeLat: typeof cafe.lat,
          typeLng: typeof cafe.lng
        });
        return;
      }
      const key = cafe.id 
        ? `id_${cafe.id}` 
        : `${cafe.provider || 'unknown'}_${cafe.provider_place_id || 'unknown'}`;
      if (!existingKeys.has(key)) {
        mergedCafes.push(cafe);
        existingKeys.add(key);
      }
    });
    
    // Thêm cafes từ database nếu chưa có
    databaseCafes.forEach(cafe => {
      if (!cafe) return;
      if (typeof cafe.lat !== 'number' || typeof cafe.lng !== 'number' ||
          isNaN(cafe.lat) || isNaN(cafe.lng) ||
          cafe.lat < -90 || cafe.lat > 90 || cafe.lng < -180 || cafe.lng > 180) {
        console.warn('Skipping database cafe without valid coordinates:', cafe?.name || cafe, {
          lat: cafe.lat,
          lng: cafe.lng,
          typeLat: typeof cafe.lat,
          typeLng: typeof cafe.lng
        });
        return; // Skip cafes without valid coordinates
      }
      const key = cafe.id 
        ? `id_${cafe.id}` 
        : `${cafe.provider || 'unknown'}_${cafe.provider_place_id || 'unknown'}`;
      if (!existingKeys.has(key)) {
        mergedCafes.push(cafe);
        existingKeys.add(key);
      }
    });
    
    console.log('MapView: Merged cafes for map:', {
      cafesCount: cafes.length,
      databaseCafesCount: databaseCafes.length,
      mergedCount: mergedCafes.length,
      showCafesOnMap,
      validCafes: mergedCafes.filter(c => c && c.lat && c.lng).length,
      sampleCafe: mergedCafes[0] ? {
        name: mergedCafes[0].name,
        lat: mergedCafes[0].lat,
        lng: mergedCafes[0].lng
      } : null
    });
    
    return mergedCafes;
  }, [showCafesOnMap, cafes, databaseCafes]);

  // Infinite scroll logic
  // Hiển thị cafes từ đầu đến displayedCafesCount
  const currentCafes = cafes.slice(0, displayedCafesCount);
  const hasMore = displayedCafesCount < cafes.length;

  // Reset displayed count khi cafes thay đổi (search mới, filter mới, etc.)
  useEffect(() => {
    setDisplayedCafesCount(3); // Reset về 3 items ban đầu
  }, [cafes.length, mode, searchKeyword]); // Reset khi danh sách cafes thay đổi hoặc chuyển mode

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    // Simulate loading delay để UX mượt hơn
    setTimeout(() => {
      setDisplayedCafesCount(prev => Math.min(prev + 3, cafes.length));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore, cafes.length]);

  // Infinite scroll using Intersection Observer (hiệu quả hơn scroll event)
  useEffect(() => {
    if (!hasMore || isLoadingMore || !sentinelRef.current) return;

    const sentinel = sentinelRef.current;
    const cafeListPanel = document.querySelector('.cafe-cards-container');
    if (!cafeListPanel) return;

    // Sử dụng Intersection Observer để detect khi sentinel visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !isLoadingMore) {
            handleLoadMore();
          }
        });
      },
      {
        root: cafeListPanel,
        rootMargin: '50px', // Trigger trước 50px
        threshold: 0.1
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, handleLoadMore]);

  return (
    <>
      {contextHolder}
      <header className="app-header-new">
        <div className="app-header-content">
          <div className="app-header-left-new">
            <div className="app-logo-new">
              <span className="coffee-icon">☕</span>
              <span className="app-logo-text">{t('home.title')}</span>
            </div>
            <div className="app-search-bar-new">
              <SearchOutlined className="search-icon" />
              <input
                type="text"
                className="header-search-input"
                placeholder={t('home.searchPlaceholder')}
                value={searchKeyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchKeyword);
                  }
                }}
              />
            </div>
          </div>
          <nav className="app-header-nav">
            <button 
              className="nav-link"
              onClick={() => handleLocateMe()}
              disabled={loading}
            >
              {loading ? t('common.loading') : t('home.locateMe')}
            </button>
            <button 
              className="nav-link"
              onClick={handleGoToFavorites}
            >
              <HeartOutlined /> {t('home.favorites')}
            </button>
            <LanguageDropdown textColor="#4b5563" />
            <div style={{ position: 'relative' }} className="promotions-dropdown-container">
              <button 
                className="nav-link"
                onClick={handleTogglePromotionsList}
                style={{ position: 'relative' }}
              >
                <BellOutlined /> 
                {allPromotions.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ff4d4f',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {allPromotions.length}
                  </span>
                )}
              </button>
              {/* Dropdown promotions list */}
              {showPromotionsList && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '16px',
                  minWidth: '350px',
                  maxWidth: '400px',
                  maxHeight: '500px',
                  overflowY: 'auto',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e0b88a',
                  zIndex: 1000
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                      <GiftOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
                      {t('promotion.title')} ({allPromotions.length})
                    </h3>
                    <button
                      onClick={() => setShowPromotionsList(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '20px',
                        color: '#666',
                        padding: '0',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                  {loadingPromotions ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>{t('common.loading')}...</div>
                  ) : allPromotions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      {t('promotion.noPromotions')}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {allPromotions.map((promo) => {
                        const formatDiscount = () => {
                          if (promo.discount_type === 'percentage') {
                            return `${t('promotion.percentage')} ${promo.discount_value}%`;
                          } else if (promo.discount_type === 'fixed_amount') {
                            return `${t('promotion.fixedAmount')} ${promo.discount_value?.toLocaleString('vi-VN')}đ`;
                          } else if (promo.discount_type === 'free_item') {
                            return `${t('promotion.freeItem')} ${promo.discount_value}`;
                          }
                          return t('promotion.special');
                        };

                        const formatTimeRemaining = () => {
                          const now = new Date();
                          const end = new Date(promo.end_date);
                          const diff = end - now;
                          if (diff < 0) return t('promotion.expired');
                          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                          if (days > 0) return `${t('promotion.remainingTime')} ${days} ${t('promotion.daysRemaining')}`;
                          if (hours > 0) return `${t('promotion.remainingTime')} ${hours} ${t('promotion.hoursRemaining')}`;
                          return t('promotion.soonExpired');
                        };

                        return (
                          <div
                            key={promo.id}
                            onClick={async () => {
                              // Tìm cafe trong danh sách hiện tại
                              let cafe = cafes.find(c => c.id === promo.cafe_id) ||
                                databaseCafes.find(c => c.id === promo.cafe_id);
                              
                              // Nếu không tìm thấy, tạo cafe object từ promotion data
                              if (!cafe && promo.cafe_lat && promo.cafe_lng) {
                                cafe = {
                                  id: promo.cafe_id,
                                  name: promo.cafe_name,
                                  address: promo.cafe_address || promo.cafe_name || '',
                                  lat: parseFloat(promo.cafe_lat),
                                  lng: parseFloat(promo.cafe_lng),
                                  rating: null,
                                  user_rating: null,
                                  review_count: 0,
                                  provider: 'database',
                                  provider_place_id: `cafe_${promo.cafe_id}`
                                };
                                
                                // Thêm cafe vào databaseCafes nếu chưa có
                                setDatabaseCafes(prev => {
                                  const exists = prev.find(c => c.id === cafe.id);
                                  if (!exists) {
                                    console.log('Adding cafe from promotion to databaseCafes:', cafe);
                                    return [...prev, cafe];
                                  }
                                  return prev;
                                });
                                
                                // Đợi một chút để state update
                                await new Promise(resolve => setTimeout(resolve, 100));
                              }
                              
                              if (cafe && cafe.lat && cafe.lng) {
                                // Set center và zoom vào cafe
                                const newCenter = { 
                                  lat: cafe.lat, 
                                  lng: cafe.lng, 
                                  _timestamp: Date.now() 
                                };
                                setCenter(newCenter);
                                setShouldZoomToLocation(true);
                                
                                // Select cafe để highlight marker
                                setTimeout(() => {
                                  handleSelectCafe(cafe);
                                }, 500);
                                
                                setTimeout(() => setShouldZoomToLocation(false), 2000);
                              } else {
                                messageApi.warning('Không tìm thấy thông tin vị trí của quán này');
                              }
                              setShowPromotionsList(false);
                            }}
                            style={{
                              background: '#f5ede0',
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid #e0b88a',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#e8dcc8';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f5ede0';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1f2937', flex: 1 }}>
                                {promo.title}
                              </h4>
                              <span style={{
                                background: '#ff4d4f',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                marginLeft: '8px',
                                whiteSpace: 'nowrap'
                              }}>
                                {formatDiscount()}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                              <EnvironmentOutlined style={{ marginRight: '4px' }} />
                              {promo.cafe_name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#999' }}>
                              {formatTimeRemaining()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
            {authService.isAdmin() && (
              <button 
                className="nav-link"
                onClick={() => navigate('/admin')}
                title="Admin Dashboard"
              >
                <SettingOutlined /> Admin
              </button>
            )}
            <div 
              className="nav-link nav-link-avatar"
              onClick={() => navigate('/profile')}
            >
              <Avatar 
                src={userAvatar} 
                icon={<UserOutlined />}
                size={32}
                className="header-avatar"
              />
            </div>
            <button 
              className="nav-link nav-link-logout"
              onClick={handleLogout}
            >
              <LogoutOutlined /> {t('home.logout')}
            </button>
          </nav>
        </div>
      </header>

      <main className="app-layout-new">
        <section className="app-sidebar-new">
          <div className="cafe-list-panel">
            <h2 className="cafe-list-title">{t('home.cafeList')}</h2>
            <div className="cafe-cards-container">
              {loading ? (
                <div className="cafe-empty">{t('common.loading')}</div>
              ) : currentCafes.length > 0 ? (
                currentCafes.map((cafe) => (
                  <div
                    key={`${cafe.provider}:${cafe.provider_place_id}`}
                    className="cafe-card-image"
                    onClick={() => handleSelectCafe(cafe)}
                  >
                    <div className="cafe-image-container">
                      <img 
                        src={cafe.photo_url || `https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&h=120&fit=crop&q=80`}
                        alt={cafe.name}
                        className="cafe-image"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&h=120&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <div className="cafe-info-section">
                      <div className="cafe-info-header">
                        <h3 className="cafe-name-text">{cafe.name || 'カフエ名A'}</h3>
                        <button
                          type="button"
                          className="cafe-favorite-btn-image"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveFavorite(cafe);
                          }}
                          title="Thêm vào yêu thích"
                        >
                          ❤
                        </button>
                      </div>
                      <div className="cafe-rating-display">
                        {cafe.user_rating != null ? (
                          <>
                            <span className="cafe-stars">
                              {'★'.repeat(Math.floor(cafe.user_rating))}
                              {cafe.user_rating % 1 >= 0.5 ? '½' : ''}
                              {'☆'.repeat(5 - Math.ceil(cafe.user_rating))}
                            </span>
                            <span className="cafe-rating-number">{cafe.user_rating.toFixed(1)}</span>
                            {cafe.review_count > 0 && (
                              <span className="cafe-review-count">({cafe.review_count} {t('home.reviews')})</span>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="cafe-stars">☆☆☆☆☆</span>
                            <span className="cafe-rating-number">N/A</span>
                          </>
                        )}
                        <span className="cafe-distance-text">
                          {cafe.distance !== null && cafe.distance !== undefined 
                            ? `${cafe.distance.toFixed(1)} km` 
                            : t('home.distanceUnknown')}
                        </span>
                      </div>
                      <p className="cafe-address-text">{cafe.address || '新昕総 倦涉万'}</p>
                      <div className="cafe-action-buttons">
                        <button
                          type="button"
                          className="cafe-directions-btn-image"
                          onClick={(e) => handleOpenDirections(e, cafe)}
                          title={t('home.directions')}
                        >
                          <EnvironmentOutlined />
                        </button>
                        <button
                          type="button"
                          className="cafe-rating-btn-image"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!cafe.id) {
                              navigate(`/review/${cafe.provider}_${cafe.provider_place_id}`, {
                                state: { cafe }
                              });
                            } else {
                              navigate(`/review/${cafe.id}`, {
                                state: { cafe }
                              });
                            }
                          }}
                          title={t('home.reviews')}
                        >
                          <StarOutlined />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : allCafes.length === 0 ? (
                <div className="cafe-empty">
                  <p>{t('home.noCafes')}</p>
                  <ul style={{ textAlign: 'left', marginTop: '12px', paddingLeft: '20px' }}>
                    <li>{t('home.noCafesHint1')}</li>
                    <li>{t('home.noCafesHint2')}</li>
                  </ul>
                </div>
              ) : (
                <div className="cafe-empty">{t('home.noFilteredCafes')}</div>
              )}
              {/* Sentinel element cho infinite scroll */}
              {hasMore && (
                <div 
                  ref={sentinelRef}
                  className="infinite-scroll-sentinel"
                  style={{ 
                    height: '1px', 
                    visibility: 'hidden',
                    marginTop: '10px'
                  }}
                />
              )}
            </div>
            {/* Infinite scroll loading indicator */}
            {hasMore && (
              <div className="infinite-scroll-loader" style={{ 
                textAlign: 'center', 
                padding: '20px',
                color: '#666'
              }}>
                {isLoadingMore ? (
                  <div>
                    <span style={{ marginRight: '8px' }}>⏳</span>
                    {t('common.loading')}...
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {t('home.total')} {cafes.length} {t('home.items')} • {t('home.scrollForMore')}
                  </div>
                )}
              </div>
            )}
            {!hasMore && cafes.length > 0 && (
              <div className="infinite-scroll-end" style={{ 
                textAlign: 'center', 
                padding: '20px',
                color: '#999',
                fontSize: '12px'
              }}>
                {t('home.allCafesLoaded')} ({t('home.total')} {cafes.length} {t('home.items')})
              </div>
            )}
          </div>
        </section>

        <section className="map-panel-new">
          <div className="map-header-new">
            <h2 className="map-title-new">{t('home.mapDisplay')}</h2>
            <div className="map-controls">
              <label className="map-checkbox-label">
                <input
                  type="checkbox"
                  checked={showCafesOnMap}
                  onChange={(e) => setShowCafesOnMap(e.target.checked)}
                />
                <span>{t('home.showCafesOnMap')}</span>
              </label>
            </div>
          </div>
          <MapView
            center={center}
            cafes={mergedCafesForMap}
            currentLocation={currentLocation}
            onSelectCafe={handleSelectCafe}
            zoomToLocation={shouldZoomToLocation && currentLocation ? currentLocation : null}
          />
        </section>
      </main>

      {/* Directions Modal */}
      <DirectionsModal
        visible={directionsModalVisible}
        onCancel={handleCloseDirectionsModal}
        cafe={selectedCafeForDirections}
        currentLocation={currentLocation}
      />

      {/* Promotion Notifications */}
      <PromotionNotification
        currentLocation={currentLocation}
        onPromotionClick={(promotion) => {
          // Tìm cafe tương ứng và center vào đó
          const cafe = cafes.find(
            (c) => c.id === promotion.cafe_id ||
            (c.provider && c.provider_place_id && 
             `${c.provider}_${c.provider_place_id}` === `${promotion.cafe_id}`)
          );
          if (cafe) {
            setCenter({ lat: cafe.lat, lng: cafe.lng });
            handleSelectCafe(cafe);
          } else if (promotion.cafe_lat && promotion.cafe_lng) {
            setCenter({ lat: promotion.cafe_lat, lng: promotion.cafe_lng });
          }
        }}
      />
    </>
  );
}

export default Home;
