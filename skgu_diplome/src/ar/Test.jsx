import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import styles from './Test.module.css';

const Test = () => {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [mindFileUrl, setMindFileUrl] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [buildingNumber, setBuildingNumber] = useState('6');
  const [floorNumber, setFloorNumber] = useState('1');
  const [error, setError] = useState(null);
  const [arConfigNotFound, setArConfigNotFound] = useState(false);

  const buildingOptions = ['1','2','3','4','5', '6'];
  const floorOptions = ['1', '2', '3', '4', '5'];

  const sceneRef = useRef(null);

  // Функция для удаления элементов mindar-ui-overlay
  const removeMindarOverlays = () => {
    const overlays = document.querySelectorAll('.mindar-ui-overlay');
    overlays.forEach(overlay => {
      overlay.remove();
    });
  };

  useEffect(() => {
    const loadScripts = async () => {
      const injectScript = (src) =>
        new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

      try {
        if (!window.AFRAME) {
          await injectScript('https://aframe.io/releases/1.6.0/aframe.min.js');
        }
        if (!window.MINDAR) {
          await injectScript('https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js');
        }
        setScriptsLoaded(true);
      } catch (error) {
        console.error('Ошибка загрузки скриптов:', error);
        setError(error);
      }
    };

    loadScripts();

    return () => {
      removeMindarOverlays();
      console.log('Mindar Overlays удалены при размонтировании компонента');
      document.body.style.overflow = 'auto'; // Явно возвращаем прокрутку body
      document.documentElement.style.overflow = 'auto'; // И html элемента на всякий случай
    };

  }, []);

  useEffect(() => {
    if (!scriptsLoaded) return;

    // Удаляем overlay элементы перед новым запросом конфигурации
    removeMindarOverlays();

    const fetchArConfig = async () => {
      setLoadingConfig(true);
      setError(null);
      setArConfigNotFound(false);
      setMindFileUrl('');

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/ar/config`,
          {
            params: { building_number: buildingNumber, floor_number: floorNumber },
            responseType: 'blob',
          }
        );
        const blobUrl = URL.createObjectURL(response.data);
        setMindFileUrl(blobUrl);
      } catch (error) {
        console.error('Ошибка загрузки AR конфигурации:', error);
        if (error.response && error.response.status === 404) {
          setArConfigNotFound(true);
          // Удаляем overlay элементы при 404 ошибке
          // removeMindarOverlays();
        } else {
          setError(error);
        }
      } finally {
        setLoadingConfig(false);
      }
    };

    const fetchRooms = async () => {
      setLoadingRooms(true);
      setError(null);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/ar/rooms`,
          {
            params: { building_number: buildingNumber, floor_number: floorNumber },
          }
        );
        setRooms(response.data);
        console.log('Загружены комнаты:', response.data);
      } catch (error) {
        console.error('Ошибка загрузки данных о комнатах:', error);
        setError(error);
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchArConfig();
    fetchRooms();
  }, [scriptsLoaded, buildingNumber, floorNumber]);

  useEffect(() => {
    if (!scriptsLoaded || !mindFileUrl || rooms.length === 0) return;

    const scene = sceneRef.current;
    if (!scene) {
      console.error('Сцена не найдена');
      return;
    }

    const handleTargetEvents = () => {
      const targets = scene.querySelectorAll('[mindar-image-target]');
      if (targets.length === 0) {
        console.error('Цели MindAR не найдены');
        return;
      }

      console.log(`Инициализация ${targets.length} целей`);

      targets.forEach((targetEl) => {
        const targetIndex = parseInt(targetEl.getAttribute('targetIndex'), 10);
        const room = rooms.find((r) => r.target_index === targetIndex);

        if (!room) {
          console.error(`Комната не найдена для targetIndex: ${targetIndex}`);
          return;
        }

        targetEl.addEventListener('targetFound', () => {
          console.log(`[${new Date().toISOString()}] Найден кабинет ${room.room_number}`);
          setCurrentRoom(room);
        });

        targetEl.addEventListener('targetLost', () => {
          console.log(`[${new Date().toISOString()}] Потерян кабинет ${room.room_number}`);
          setCurrentRoom(null);
          document.body.style.backgroundColor = '';
        });
      });
    };

    if (scene.hasLoaded) {
      handleTargetEvents();
    } else {
      scene.addEventListener('loaded', handleTargetEvents, { once: true });
    }

    return () => {
      const targets = scene.querySelectorAll('[mindar-image-target]');
      targets.forEach((targetEl) => {
        targetEl.removeEventListener('targetFound', () => {});
        targetEl.removeEventListener('targetLost', () => {});
      });
    };
  }, [scriptsLoaded, mindFileUrl, rooms]);

  const handleBuildingChange = (e) => setBuildingNumber(e.target.value);
  const handleFloorChange = (e) => setFloorNumber(e.target.value);

  return (
    <div className={styles.arPage}>
      <div className={styles.arSelectors}>
        <div className={styles.arSelectorGroup}>
          <label htmlFor="buildingNumber" className={styles.arLabel}>
            Корпус:
          </label>
          <select
            id="buildingNumber"
            className={styles.arSelect}
            value={buildingNumber}
            onChange={handleBuildingChange}
          >
            <option value="" disabled>
              Выберите корпус
            </option>
            {buildingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.arSelectorGroup}>
          <label htmlFor="floorNumber" className={styles.arLabel}>
            Этаж:
          </label>
          <select
            id="floorNumber"
            className={styles.arSelect}
            value={floorNumber}
            onChange={handleFloorChange}
          >
            <option value="" disabled>
              Выберите этаж
            </option>
            {floorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingConfig && <div className={styles.loading}>Загрузка AR...</div>}
      {loadingRooms && <div className={styles.loading}>Загрузка комнат...</div>}
      {arConfigNotFound && (
        <div className={styles.error}>
          AR конфигурация не найдена для данного корпуса и этажа.
        </div>
      )}
      {error && !arConfigNotFound && (
        <div className={styles.error}>Ошибка: {error.message}</div>
      )}

      {!loadingConfig && !loadingRooms && !arConfigNotFound && !error && (
        <div>
          {currentRoom ? (
            <div className={styles.arMessageContainer}>
              <h1 className={styles.arMessage}>
                Кабинет {currentRoom.room_number} - {currentRoom.room_name}
              </h1>
              {currentRoom.description && (
                <p className={styles.arDescription}>
                  {currentRoom.description}
                </p>
              )}
            </div>
          ) : (
            <h1 className={styles.arMessage}>Наведите камеру на маркер</h1>
          )}

          {mindFileUrl && scriptsLoaded && rooms.length > 0 && (
            <div className={styles.arCameraContainer}>
              <a-scene
                ref={sceneRef}
                mindar-image={`imageTargetSrc: ${mindFileUrl}; autoStart: true;`}
                color-space="sRGB"
                renderer="colorManagement: true, physicallyCorrectLights"
                vr-mode-ui="enabled: false"
                device-orientation-permission-ui="enabled: false"
              >
                <a-assets></a-assets>
                <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
                {rooms.map((room) => (
                  <a-entity
                    key={room.id}
                    mindar-image-target={`targetIndex: ${room.target_index}`}
                    targetIndex={room.target_index}
                  >

                  </a-entity>
                ))}
              </a-scene>
            </div>
          )}
        </div>
      )}
      {/* Здесь будут автоматически добавлены <div class="mindar-ui-overlay ..."> элементы, если MindAR скрипты их добавляют */}
    </div>
  );
};

export default Test;