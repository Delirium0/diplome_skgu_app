import React, { useState, useEffect } from "react";
import Map from "./Map"; // Убедись, что путь к Map.jsx верный
import Map_object_list from "./Map_object_list"; // Убедись, что путь к Map_object_list.jsx верный
// import styles from './MapContainer.module.css'; // Раскомментируй, если есть стили

const Map_container = () => {
  const [locations, setLocations] = useState([]); // Инициализируем пустым массивом
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Координаты центра карты и зум (могут остаться статичными или тоже грузиться)
  const center_points = [54.875406, 69.135137];
  const zoom_size = 13;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Используем fetch, как в FeedbackPage, но можно и axios, как в Building_container_list
        const response = await fetch(`${process.env.REACT_APP_API_URL}/locations/locations_main_page`);

        if (!response.ok) {
          let errorDetail = `Ошибка HTTP: ${response.status}`;
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail;
          } catch (e) {
            console.error("Не удалось распарсить тело ошибки:", e);
          }
          throw new Error(errorDetail);
        }

        const data = await response.json();
        // Важно: Убедимся, что data - это массив
        if (Array.isArray(data)) {
          setLocations(data);
        } else {
          console.error("API не вернул массив:", data);
          throw new Error("Получен неверный формат данных от API.");
        }

      } catch (err) {
        console.error("Ошибка при загрузке локаций:", err);
        setError(err.message || "Не удалось загрузить локации.");
        setLocations([]); // Очищаем локации в случае ошибки
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Пустой массив зависимостей - запускаем один раз при монтировании

  const handlePointClick = (point) => {
    setSelectedPoint(point);
    // Опционально: можно центрировать карту на выбранной точке
    // setCenterPoints([point.lat, point.lng]);
  };

  // --- Рендеринг ---

  if (loading) {
    // Можно использовать более красивый лоадер
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка карты и объектов...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>Ошибка: {error}</div>;
  }

  // Если загрузка завершена без ошибок, но данных нет
  if (locations.length === 0) {
      return <div style={{ padding: '20px', textAlign: 'center' }}>Нет доступных локаций.</div>;
  }

  return (
    // Можно добавить стили контейнера при необходимости
    // <div className={styles.mapPageContainer}>
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
       {/*
         Передаем загруженные locations в Map и Map_object_list
         Предполагается, что Map и Map_object_list ожидают пропс 'points'
         и могут обработать поле 'main_icon' как URL или base64 строку для <img>
       */}
      <Map
        points={locations}
        selectedPoint={selectedPoint}
        center_points={center_points}
        zoom_size={zoom_size}
        onPointClick={handlePointClick} // Передаем обработчик клика в Map (если нужно)
      />
      <Map_object_list
        points={locations}
        selectedPoint={selectedPoint}
        handlePointClick={handlePointClick} // Передаем обработчик клика в список
      />
    </div>
    // </div>
  );
};

export default Map_container;