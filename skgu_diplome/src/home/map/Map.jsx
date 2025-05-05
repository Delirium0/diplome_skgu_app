import React, { useEffect, useRef, useState } from 'react';
import './Map.css'
const Map = ({ points, selectedPoint, center_points, zoom_size}) => {
    const mapRef = useRef(null);
    const [apiLoaded, setApiLoaded] = useState(false);
    const [mapInstance, setMapInstance] = useState(null);
    const [markers, setMarkers] = useState([]); // Состояние для хранения маркеров

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
        script.async = true;
        script.onload = () => {
            console.log("2GIS API loaded successfully!");
            setApiLoaded(true);
        };
        script.onerror = () => {
            console.error("Error loading 2GIS API");
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (!apiLoaded || !center_points || !points) return; // Проверка на наличие данных

        window.DG.then(() => {
            if (!mapInstance) {
                // Создаем карту только один раз
                const map = window.DG.map(mapRef.current, {
                    center: center_points,
                    zoom: zoom_size
                });
                setMapInstance(map);
                return; // Выходим, чтобы не рендерить маркеры при первом рендере карты
            }

            // Удаляем старые маркеры с карты
            markers.forEach(marker => marker.remove());
            setMarkers([]);

            const newMarkers = [];

            points.forEach(point => {
                let marker;
                if (point.type === 'square') {
                    if (point.bounds?.length === 4) {
                        marker = window.DG.polygon(point.bounds, {
                            color: '#ff0000',
                            fillColor: '#ff0000',
                            weight: 2,
                        });
                    }
                } else {
                    marker = window.DG.marker([point.lat, point.lng]);
                }

                if (marker) {
                    marker.bindPopup(point.title);
                    marker.addTo(mapInstance);
                    newMarkers.push(marker); // Сохраняем ссылку на маркер
                }
            });

            setMarkers(newMarkers); // Обновляем состояние маркеров

            // Центрируем карту после добавления маркеров
            mapInstance.setView(center_points, zoom_size);

            // Возвращаем функцию очистки (необязательно, если карта не удаляется)
            // return () => {
            //     mapInstance.remove();
            // };
        });
    }, [apiLoaded, points, center_points, zoom_size, mapInstance]); // Важно: добавлены center_points и zoom_size

    useEffect(() => {
        if (mapInstance && selectedPoint) {
            mapInstance.setView([selectedPoint.lat, selectedPoint.lng], 17);
        }
    }, [selectedPoint, mapInstance]);

    return apiLoaded ? (
        <div className='main_map_container'>
        <div
            id="map"
            ref={mapRef}
            style={{
                width: '100%',
                height: '400px',
                borderRadius: '8px',
              }}
            className='map_main'
        /></div>
    ) : (
        <div style={{
            width: '100%',
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f0f0',
            borderRadius: '8px'
        }}>
            Загрузка карты...
        </div>
    );
};

export default Map;