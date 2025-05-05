import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import styles from './Location.module.css';

const Location = () => {
  const { id } = useParams();
  const [locationData, setLocationData] = useState(null);
  const [floorsData, setFloorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const token = user?.token;

  useEffect(() => {
    const fetchLocationAndFloors = async () => {
      setLoading(true);
      setError(null);
      try {
        const locationApiUrl = `${process.env.REACT_APP_API_URL}/locations/locations/${id}`;
        const locationResponse = await fetch(locationApiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!locationResponse.ok) {
          if (locationResponse.status === 404) {
            setError("Location not found");
          } else {
            throw new Error(`HTTP error! status: ${locationResponse.status}`);
          }
          return;
        }
        const locationData = await locationResponse.json();
        console.log(locationData)
        setLocationData(locationData);
        setFloorsData(locationData.floors || []);
      } catch (e) {
        setError("Failed to load location data");
        console.error("Fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationAndFloors();
  }, [id, token]);


  if (loading) {
    return (
      <div className={styles.locationPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>
            Загрузка данных о локации... {/* Русское сообщение о загрузке */}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>Ошибка: {error}</div>; // Русское сообщение об ошибке
  }

  if (!locationData) {
    return <div>Данные о локации отсутствуют.</div>; // Русское сообщение
  }

  return (
    <div className={styles.locationPage}>
      <div className={styles.locationContainer}>
        <h1 className={styles.locationHeader}>{locationData.title}</h1>
        <div className={styles.locationInfo}>
          <p><span className={styles.infoLabel}>Адрес:</span> {locationData.address}</p> {/* Адрес */}
          {locationData.building_type_name_ru && (
            <p><span className={styles.infoLabel}>Тип здания:</span> {locationData.building_type_name_ru}</p> 
          )}
          {locationData.time_start && locationData.time_end && (
            <p><span className={styles.infoLabel}>Время работы:</span> {/* Время работы */}
              {locationData.time_start} - {locationData.time_end}
            </p>
          )}
        </div>

        {floorsData.length > 0 && (
          <div className={styles.floorsSection}>
            <h2 className={styles.floorsHeader}>Этажи</h2>
            <ul className={styles.floorsList}>
              {floorsData.map(floor => (
                <li key={floor.id} className={styles.floorItem}>
                  <h3 className={styles.floorNumber}>Этаж {floor.floor_number}</h3>
                  <div className={styles.floorImageContainer}>
                    <img
                      src={`data:image/png;base64,${floor.image_data}`}
                      alt={`План этажа ${floor.floor_number}`}
                      className={styles.floorImage}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Location;