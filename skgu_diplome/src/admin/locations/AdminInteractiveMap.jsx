// src/admin/locations/AdminInteractiveMap.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';

const AdminInteractiveMap = ({ initialBounds = [], onBoundsChange, center = [54.8754, 69.1351], zoom = 15 }) => {
    const mapRef = useRef(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [polygon, setPolygon] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [currentBounds, setCurrentBounds] = useState(initialBounds);

    // Загрузка API 2GIS (можно вынести в хук или загружать один раз в App)
    useEffect(() => {
        const scriptId = '2gis-api-script';
        if (document.getElementById(scriptId)) {
            // Если скрипт уже есть, просто инициализируем карту, если DG доступен
            if (window.DG) {
                 initializeMap();
            } else {
                // Если DG еще не загрузился, ждем события
                window.addEventListener('dgApiLoaded', initializeMap, { once: true });
            }
            return; // Не добавляем скрипт повторно
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
        script.async = true;
        script.onload = () => {
            console.log("2GIS API loaded for interactive map.");
             // Уведомляем другие компоненты, если нужно
             window.dispatchEvent(new CustomEvent('dgApiLoaded'));
            initializeMap(); // Инициализируем карту после загрузки
        };
        script.onerror = () => console.error("Error loading 2GIS API");
        document.head.appendChild(script);

        // Очистка при размонтировании
        return () => {
            // Удаляем слушателя, чтобы избежать утечек памяти
            window.removeEventListener('dgApiLoaded', initializeMap);
            // Скрипт можно не удалять, он может быть нужен другим картам
        };
    }, []); // Загружаем API один раз

    // Инициализация карты
    const initializeMap = useCallback(() => {
         if (!window.DG || mapInstance || !mapRef.current) return; // Предотвращаем повторную инициализацию
         window.DG.then(() => {
            console.log("Initializing DG Map...");
            const map = window.DG.map(mapRef.current, {
                center: center,
                zoom: zoom
            });
            setMapInstance(map);
         });
    }, [center, zoom, mapInstance]); // Зависимости для инициализации

    // Обработчик клика по карте
    useEffect(() => {
        if (!mapInstance) return;

        const handleClick = (e) => {
            const newPoint = [e.latlng.lat, e.latlng.lng];
            const updatedBounds = [...currentBounds, newPoint];
            setCurrentBounds(updatedBounds); // Обновляем внутреннее состояние
            onBoundsChange(updatedBounds);  // Сообщаем родителю
        };

        mapInstance.on('click', handleClick);

        // Очистка слушателя при размонтировании или изменении mapInstance
        return () => {
            mapInstance.off('click', handleClick);
        };
    }, [mapInstance, currentBounds, onBoundsChange]);

    // Отрисовка/обновление полигона и маркеров
    useEffect(() => {
        if (!mapInstance) return;

        // Удаляем старые маркеры
        markers.forEach(marker => marker.remove());
        setMarkers([]); // Очищаем массив ссылок

        // Удаляем старый полигон
        if (polygon) {
            polygon.remove();
            setPolygon(null);
        }

        // Рисуем новые маркеры для каждой точки bounds
        const newMarkers = currentBounds.map(point =>
            window.DG.marker(point, { draggable: false }).addTo(mapInstance) // Делаем маркеры неперетаскиваемыми
        );
        setMarkers(newMarkers);

        // Рисуем новый полигон, если точек 3 или больше
        if (currentBounds.length >= 3) {
            const newPolygon = window.DG.polygon(currentBounds, {
                color: '#3f51b5',       // Цвет линии
                fillColor: '#3f51b5', // Цвет заливки
                fillOpacity: 0.3,    // Прозрачность заливки
                weight: 2             // Толщина линии
            }).addTo(mapInstance);
            setPolygon(newPolygon);
        }

    }, [mapInstance, currentBounds]); // Зависимость от карты и текущих границ

     // Обновление карты при изменении initialBounds (например, при загрузке в режиме редактирования)
     useEffect(() => {
        // Сравниваем initialBounds с currentBounds, чтобы избежать бесконечного цикла,
        // если onBoundsChange обновляет пропс initialBounds
        if (JSON.stringify(initialBounds) !== JSON.stringify(currentBounds)) {
             console.log("Updating bounds from initialBounds:", initialBounds);
             setCurrentBounds(initialBounds);
             // Центрирование карты на новых границах (опционально)
             if (mapInstance && initialBounds.length > 0) {
                 try {
                    const dgBounds = window.DG.latLngBounds(initialBounds);
                    mapInstance.fitBounds(dgBounds, { padding: [30, 30] }); // Центрируем с отступами
                 } catch(e) {
                    console.error("Error fitting bounds:", e);
                    // Если ошибка (например, одна точка), центрируемся на первой точке
                    mapInstance.setView(initialBounds[0], zoom);
                 }
             } else if (mapInstance) {
                 // Если initialBounds пустые, сбрасываем вид на начальный центр
                 mapInstance.setView(center, zoom);
             }
        }
    }, [initialBounds, mapInstance, center, zoom]); // Добавили зависимости

    return (
        <div
            ref={mapRef}
            style={{ width: '100%', height: '400px', borderRadius: '8px', backgroundColor: '#eee' }}
        >
            {!mapInstance && "Загрузка карты..."}
        </div>
    );
};

export default AdminInteractiveMap;