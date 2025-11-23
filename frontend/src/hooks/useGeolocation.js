import { useEffect, useState } from 'react';

export default function useGeolocation() {
  const [position, setPosition] = useState(null); // {lat, lng}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ GPS');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Không lấy được vị trí');
        setLoading(false);
      }
    );
  };

  // Tự động hỏi lần đầu
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { position, loading, error, requestLocation };
}
