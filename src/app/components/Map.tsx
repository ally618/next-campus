import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { School } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';

// ✅ 여기에 발급받은 토큰 붙여넣기
mapboxgl.accessToken =
  'pk.eyJ1IjoieW91bmdnbnVveSIsImEiOiJjbW8wcG9iZnMwYnIwMnBva3lsc2pva2luIn0.B_ipDZ4OZyIxMy3vH8dJiw';

interface MapProps {
  schools: School[];
  selectedSchool: School | null;
  onSchoolSelect: (school: School) => void;
  onZoomChange: (zoom: number) => void;
}

export function Map({
  schools,
  selectedSchool,
  onSchoolSelect,
  onZoomChange,
}: MapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFavorite } = useFavorites();

  // 지도 초기화
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12', // 지도 스타일 (밝은 테마)
      center: [-105, 55],
      zoom: 4.5,
    });

    mapRef.current = map;

    // 줌 변경 이벤트
    map.on('zoom', () => {
      onZoomChange(map.getZoom());
    });

    // 줌 컨트롤 추가
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.remove();
    };
  }, [onZoomChange]);

  // 마커 추가
  useEffect(() => {
    if (!mapRef.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    schools.forEach((school) => {
      const isSaved = isFavorite(school.id);

      // 마커 색상: 저장된 학교는 파란색, 일반은 빨간색
      const color = isSaved ? '#2563eb' : '#ef4444';

      // 팝업 생성
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="text-align: center; padding: 4px;">
          <h3 style="font-weight: 600; margin-bottom: 4px;">${school.name}</h3>
          <p style="font-size: 12px; color: #666;">${school.country}</p>
          ${
            isSaved
              ? '<p style="font-size: 11px; color: #2563eb; margin-top: 4px;">⭐ 저장된 학교</p>'
              : ''
          }
        </div>
      `);

      // 마커 생성 및 추가
      const marker = new mapboxgl.Marker({ color })
        .setLngLat([school.lng, school.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      // 클릭 이벤트
      marker.getElement().addEventListener('click', () => {
        onSchoolSelect(school);
      });

      markersRef.current.push(marker);
    });
  }, [schools, onSchoolSelect, isFavorite]);

  // 선택된 학교로 지도 이동
  useEffect(() => {
    if (!mapRef.current || !selectedSchool) return;
    mapRef.current.flyTo({
      center: [selectedSchool.lng, selectedSchool.lat],
      zoom: 12,
      duration: 1500,
    });
  }, [selectedSchool]);

  return <div ref={containerRef} className="w-full h-full" />;
}
