// src/admin/locations/AdminLocationFormPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { getLocationByIdAdmin, createLocationAdmin, updateLocationAdmin } from '../eventAdminService';
import styles from '../AdminEvents.module.css';

// Глобальные флаги для загрузки скрипта
let is2gisScriptLoading = false;
let is2gisScriptLoaded = typeof window !== 'undefined' && !!window.DG;

const AdminLocationFormPage = () => {
    const { locationId } = useParams();
    const isEditMode = Boolean(locationId);
    const navigate = useNavigate();
    const { user } = useAuth();
    const token = user?.token;

    // --- Состояния формы ---
    const [formData, setFormData] = useState({
        lat: 54.8754,
        lng: 69.1351,
        title: '',
        type: '',
        address: '',
        time_start: '',
        time_end: '',
        main_icon: '', // Будет хранить Base64 строку 'data:image/...'
        building_type: '',
        building_type_name_ru: '',
    });
    const [bounds, setBounds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);

    // --- Состояния и Refs для карты ---
    const [apiLoaded, setApiLoaded] = useState(is2gisScriptLoaded);
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const polygonRef = useRef(null);

    // --- 1. Загрузка скрипта 2GIS API ---
    useEffect(() => {
        if (is2gisScriptLoaded || is2gisScriptLoading) {
            if(is2gisScriptLoaded && !apiLoaded) setApiLoaded(true);
            return;
        }
        is2gisScriptLoading = true;
        const script = document.createElement('script');
        script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full';
        script.async = true;
        script.onload = () => {
            console.log("2GIS API script loaded successfully!");
            is2gisScriptLoaded = true;
            is2gisScriptLoading = false;
            setApiLoaded(true);
        };
        script.onerror = () => {
            console.error("Error loading 2GIS API script");
            is2gisScriptLoading = false;
            setError("Не удалось загрузить API карты 2GIS.");
        };
        document.head.appendChild(script);
    }, []); // Загрузка один раз

    // --- 2. Загрузка данных формы ---
    useEffect(() => {
        if (isEditMode && locationId && token) {
            setLoading(true); // Ставим loading здесь
            setError(null);
            setFormError(null);
            getLocationByIdAdmin(locationId, token)
                .then(data => {
                    const loadedBounds = data.bounds || [];
                    const initialLat = data.lat || 54.8754;
                    const initialLng = data.lng || 69.1351;
                    setFormData({ // Обновляем все поля, включая иконку
                        lat: initialLat,
                        lng: initialLng,
                        title: data.title || '',
                        type: data.type || '',
                        address: data.address || '',
                        time_start: data.time_start || '',
                        time_end: data.time_end || '',
                        main_icon: data.main_icon || '', // Загружаем Base64 иконку
                        building_type: data.building_type || '',
                        building_type_name_ru: data.building_type_name_ru || '',
                    });
                    setBounds(loadedBounds);
                    // Обновляем карту/полигон, если API загружено и карта создана
                    if (apiLoaded && mapInstanceRef.current && polygonRef.current) {
                        window.DG.then(() => {
                            polygonRef.current.setLatLngs(loadedBounds);
                             if (loadedBounds.length >= 3) {
                                mapInstanceRef.current.fitBounds(polygonRef.current.getBounds());
                            } else {
                                 mapInstanceRef.current.setView([initialLat, initialLng], 13);
                            }
                        });
                    }
                })
                .catch(err => {
                    console.error("Ошибка загрузки локации:", err);
                    setError(err.message || "Не удалось загрузить данные.");
                })
                .finally(() => setLoading(false)); // Убираем loading здесь
        } else {
            // Сброс для создания
             setFormData(prev => ({ // Сбрасываем и иконку тоже
                ...prev, // Сохраняем lat/lng по умолчанию
                title: '', type: '', address: '', time_start: '', time_end: '',
                main_icon: '', building_type: '', building_type_name_ru: ''
             }));
             setBounds([]);
              // Очищаем полигон, если карта уже есть
             if (apiLoaded && mapInstanceRef.current && polygonRef.current) {
                 window.DG.then(() => polygonRef.current?.setLatLngs([]));
             }
        }
    }, [isEditMode, locationId, token, apiLoaded]);

    // --- 3. Инициализация и управление картой ---
    useEffect(() => {
        if (!apiLoaded || !mapContainerRef.current) return;

        window.DG.then(() => {
            if (!mapInstanceRef.current) {
                const initialCenter = [formData.lat, formData.lng];
                const map = window.DG.map(mapContainerRef.current, {
                    center: initialCenter,
                    zoom: 13,
                    // Попробуем отключить перетаскивание карты по умолчанию,
                    // чтобы проверить, не мешает ли оно редактированию.
                    // Если редактирование перестанет работать, вернуть true или убрать.
                    // !!! ЭТО МОЖЕТ СЛОМАТЬ ПЕРЕМЕЩЕНИЕ КАРТЫ ВООБЩЕ !!!
                    // dragging: false, // <-- ЭКСПЕРИМЕНТ!
                });
                mapInstanceRef.current = map;

                const initialPolygonPoints = bounds;
                const polygon = window.DG.polygon(initialPolygonPoints, {
                    color: 'blue',
                    opacity: 0.5,
                    weight: 2,
                    editable: true // Это должно включать перетаскивание вершин
                }).addTo(map);
                polygonRef.current = polygon;

                if (initialPolygonPoints.length >= 3) {
                    map.fitBounds(polygon.getBounds());
                }

                // --- Слушатели событий карты/полигона ---
                map.on('click', (e) => {
                    if (polygonRef.current) {
                        const latlng = [e.latlng.lat, e.latlng.lng];
                        const currentLatLngs = polygonRef.current.getLatLngs()[0] || [];
                        currentLatLngs.push(window.DG.latLng(latlng[0], latlng[1]));
                        polygonRef.current.setLatLngs(currentLatLngs);
                        const newPointsArray = polygonRef.current.getLatLngs()[0].map(p => [p.lat, p.lng]);
                        setBounds(newPointsArray);
                        setFormError(null);
                    }
                });

                polygon.on('edit', function () {
                    const editedPoints = this.getLatLngs()[0].map(p => [p.lat, p.lng]);
                    setBounds(editedPoints);
                    setFormError(null);
                });

                // --- НОВОЕ: Удаление вершины по ПКМ ---
                map.on('contextmenu', (e) => {
                    if (!polygonRef.current) return;

                    const clickLatLng = e.latlng; // DG.LatLng объект
                    const vertices = polygonRef.current.getLatLngs()[0] || []; // Массив DG.LatLng объектов

                    // Не удаляем, если вершин 3 или меньше
                    if (vertices.length <= 3) return;

                    let vertexIndexToRemove = -1;
                    const clickTolerance = 0.0001; // Допуск для сравнения координат

                    for (let i = 0; i < vertices.length; i++) {
                        const vertex = vertices[i];
                        // Сравниваем координаты с допуском
                        if (Math.abs(vertex.lat - clickLatLng.lat) < clickTolerance &&
                            Math.abs(vertex.lng - clickLatLng.lng) < clickTolerance)
                        {
                            vertexIndexToRemove = i;
                            break;
                        }
                    }

                    if (vertexIndexToRemove !== -1) {
                        // Предотвращаем стандартное меню браузера
                        e.originalEvent.preventDefault();

                        // Создаем новый массив БЕЗ удаленной вершины
                        const newVertices = vertices.slice(); // Копируем массив
                        newVertices.splice(vertexIndexToRemove, 1); // Удаляем элемент по индексу

                        // Обновляем полигон на карте
                        polygonRef.current.setLatLngs(newVertices);

                        // Обновляем состояние bounds в React
                        const newBounds = newVertices.map(p => [p.lat, p.lng]);
                        setBounds(newBounds);
                        setFormError(null);

                        console.log(`Вершина ${vertexIndexToRemove} удалена`);
                    }
                });
            }
        });

        return () => {
            // Очистка карты
             if (mapInstanceRef.current) {
                console.log("Очистка карты 2GIS...");
                 try {
                    window.DG?.then(() => {
                        mapInstanceRef.current?.remove();
                        mapInstanceRef.current = null;
                        polygonRef.current = null;
                    });
                 } catch(cleanupError) {
                     console.error("Ошибка при очистке карты:", cleanupError);
                     mapInstanceRef.current = null;
                     polygonRef.current = null;
                 }
            }
        };
    }, [apiLoaded]); // Зависимость только от apiLoaded для инициализации

     // Обновление полигона и вида карты при изменении bounds или центра извне
     useEffect(() => {
        if (apiLoaded && polygonRef.current && mapInstanceRef.current) {
            window.DG?.then(() => {
                // Обновление полигона
                const currentPolyPoints = polygonRef.current?.getLatLngs()[0]?.map(p => [p.lat, p.lng]) || [];
                if (JSON.stringify(currentPolyPoints) !== JSON.stringify(bounds)) {
                    polygonRef.current?.setLatLngs(bounds);
                }
                // Обновление вида карты (например, если координаты центра изменились в полях)
                 mapInstanceRef.current?.setView([formData.lat, formData.lng]);
                 // Центрирование по полигону, если он валидный
                  if (bounds.length >= 3) {
                     try { // Оборачиваем в try-catch, getBounds может упасть, если полигон некорректный
                         mapInstanceRef.current?.fitBounds(polygonRef.current.getBounds());
                     } catch (fitBoundsError){
                         console.warn("Не удалось центрировать по границам:", fitBoundsError)
                     }
                  }

            });
        }
    }, [bounds, formData.lat, formData.lng, apiLoaded]); // Следим за bounds и центром + apiLoaded


    // --- Обработчики формы ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null); // Сбрасываем общую ошибку при любом изменении
        setFormError(null); // Сбрасываем ошибку формы
    };

    // --- НОВОЕ: Обработчик изменения файла иконки ---
    const handleIconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Проверка типа файла (опционально, но желательно)
            if (!file.type.startsWith('image/')) {
                setFormError('Пожалуйста, выберите файл изображения.');
                return;
            }
            // Проверка размера файла (опционально)
            const maxSizeInBytes = 2 * 1024 * 1024; // Например, 2MB
            if (file.size > maxSizeInBytes) {
                 setFormError(`Файл слишком большой. Максимальный размер: ${maxSizeInBytes / 1024 / 1024}MB`);
                 return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                // Результат reader.result будет содержать Base64 строку 'data:image/...'
                setFormData(prev => ({ ...prev, main_icon: reader.result }));
                setFormError(null); // Сбрасываем ошибку при успешном чтении
            };
            reader.onerror = () => {
                console.error("Ошибка чтения файла:", reader.error);
                 setFormError("Не удалось прочитать файл изображения.");
            };
            reader.readAsDataURL(file); // Читаем файл как Base64
        }
         // Очистка input type="file", чтобы можно было выбрать тот же файл снова
         e.target.value = null;
    };

    const clearBounds = () => {
        setBounds([]);
        setFormError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) { setError("Нет токена."); return; }
        if (formData.type !== 'point' && bounds.length > 0 && bounds.length < 3) {
            setFormError("Для полигона нужно > 2 точек."); return;
        }
        if (formData.type !== 'point' && bounds.length === 0) {
            setFormError("Укажите границы на карте."); return;
        }

        setLoading(true); // Ставим загрузку перед отправкой
        setError(null);
        setFormError(null);

        // Создаем копию данных для отправки
        const dataToSend = { ...formData };
        // Преобразуем lat/lng в числа перед отправкой
        dataToSend.lat = parseFloat(dataToSend.lat) || 0;
        dataToSend.lng = parseFloat(dataToSend.lng) || 0;
        // Добавляем актуальные bounds
        dataToSend.bounds = bounds;
         // Убедимся, что пустые необязательные поля отправляются как null (если API этого ожидает)
         dataToSend.time_start = dataToSend.time_start || null;
         dataToSend.time_end = dataToSend.time_end || null;
         dataToSend.main_icon = dataToSend.main_icon || null; // Отправляем Base64 или null
         dataToSend.building_type = dataToSend.building_type || null;
         dataToSend.building_type_name_ru = dataToSend.building_type_name_ru || null;

        console.log("Отправка данных:", dataToSend); // Для отладки

        try {
            if (isEditMode) {
                 await updateLocationAdmin(locationId, dataToSend, token);
                alert('Локация успешно обновлена!');
            } else {
                 await createLocationAdmin(dataToSend, token);
                alert('Локация успешно создана!');
            }
            navigate('/admin/locations');
        } catch (err) {
            console.error("Ошибка сохранения:", err);
            const errorDetail = err.response?.data?.detail || err.message || "Не удалось сохранить.";
            setError(errorDetail); // Показываем ошибку API
             if (err.response?.status === 422) {
                 setFormError("Ошибка валидации данных. Проверьте поля."); // Доп. сообщение при 422
            }
        } finally {
            setLoading(false); // Убираем загрузку после ответа
        }
    };

    // --- Рендеринг ---
    return (
        <div className={styles.adminPageContainer}>
            <h1 className={styles.adminPageTitle}>
                {isEditMode ? `Редактировать локацию (ID: ${locationId})` : 'Создать новую локацию'}
            </h1>

            {/* Показываем общую ошибку API, если она есть и нет ошибки формы */}
             {error && !formError && <p className={`${styles.errorMessage} ${styles.apiError}`}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.adminForm}>
                {/* Поля формы */}
                 <div className={styles.formGroup}>
                    <label htmlFor="title">Название *</label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required disabled={loading} />
                </div>
                {/* ... остальные текстовые поля ... */}
                <div className={styles.formGroup}>
                    <label htmlFor="address">Адрес *</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required disabled={loading} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="type">Тип (англ.) *</label>
                    <input type="text" id="type" name="type" value={formData.type} onChange={handleChange} required disabled={loading} placeholder="building, landmark, square..." />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="building_type">Тип здания (англ., опционально)</label>
                    <input type="text" id="building_type" name="building_type" value={formData.building_type} onChange={handleChange} disabled={loading} placeholder="academic_building, dormitory..." />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="building_type_name_ru">Название типа здания (рус., опционально)</label>
                    <input type="text" id="building_type_name_ru" name="building_type_name_ru" value={formData.building_type_name_ru} onChange={handleChange} disabled={loading} placeholder="Учебный корпус, Общежитие..." />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className={styles.formGroup} style={{ flex: 1 }}>
                        <label htmlFor="lat">Широта (центр) *</label>
                        <input type="number" step="any" id="lat" name="lat" value={formData.lat} onChange={handleChange} required disabled={loading} />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1 }}>
                        <label htmlFor="lng">Долгота (центр) *</label>
                        <input type="number" step="any" id="lng" name="lng" value={formData.lng} onChange={handleChange} required disabled={loading} />
                    </div>
                 </div>
                 <div style={{ display: 'flex', gap: '15px' }}>
                    <div className={styles.formGroup} style={{ flex: 1 }}>
                        <label htmlFor="time_start">Время начала работы</label>
                        <input type="text" id="time_start" name="time_start" value={formData.time_start} onChange={handleChange} disabled={loading} placeholder="ПН-ПТ 09:00" />
                    </div>
                    <div className={styles.formGroup} style={{ flex: 1 }}>
                        <label htmlFor="time_end">Время конца работы</label>
                        <input type="text" id="time_end" name="time_end" value={formData.time_end} onChange={handleChange} disabled={loading} placeholder="18:00" />
                    </div>
                 </div>

                {/* --- НОВОЕ: Поле для иконки с превью и загрузкой --- */}
                <div className={styles.formGroup}>
                    <label htmlFor="main_icon_upload">Главная иконка</label>
                    {/* Превью текущей иконки */}
                    {formData.main_icon && (
                        <div style={{ marginBottom: '10px' }}>
                            <img
                                src={formData.main_icon} // Прямо используем Base64 строку
                                alt="Текущая иконка"
                                style={{ maxHeight: '50px', maxWidth: '50px', border: '1px solid #ccc', padding: '2px' }}
                            />
                             <button
                                 type="button"
                                 onClick={() => setFormData(prev => ({ ...prev, main_icon: '' }))} // Кнопка для очистки
                                 style={{ marginLeft: '10px', padding: '2px 5px', fontSize: '0.8em', cursor: 'pointer' }}
                                 title="Удалить иконку"
                                 disabled={loading}
                             >
                                 X
                             </button>
                        </div>
                    )}
                    {/* Input для загрузки нового файла */}
                    <input
                        type="file"
                        id="main_icon_upload" // ID для label (если используется)
                        accept="image/*" // Принимаем только изображения
                        onChange={handleIconChange}
                        style={{ display: 'block' }} // Показываем стандартный input file
                        disabled={loading}
                    />
                     <small>Выберите файл изображения (PNG, JPG, SVG, GIF...).</small>
                </div>


                {/* --- Карта --- */}
                <div className={styles.formGroup}>
                    <label>Границы на карте (клик - добавить, ПКМ на вершину - удалить, перетаскивание - изменить)</label>
                    <div
                        ref={mapContainerRef}
                        id={`map-container-admin-${locationId || 'new'}`}
                        style={{ width: '100%', height: '450px', border: '1px solid #ccc', marginBottom: '10px', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' /* Для сообщений */ }}
                    >
                         {!apiLoaded && <span style={{color:'#555'}}>Загрузка карты...</span>}
                         {/* Если карта не загрузилась из-за ошибки API */}
                         {error && error.includes("API карты") && <span style={{color:'red', textAlign:'center', padding:'10px'}}>{error}<br/>Карта недоступна.</span>}
                    </div>
                    {apiLoaded && ( // Показываем кнопку только если API загружено
                        <button type="button" onClick={clearBounds} className={styles.clearButton} disabled={loading || bounds.length === 0}>
                            Очистить границы
                        </button>
                    )}
                     <small style={{display:'block', marginTop:'5px'}}>Кликните по карте для добавления точек. Кликните ПКМ по вершине для её удаления. Перетаскивайте вершины/ребра для изменения формы.</small>
                 </div>

                {/* Сообщение об ошибке формы */}
                {formError && <p className={`${styles.errorMessage} ${styles.formError}`}>{formError}</p>}

                {/* Кнопки управления */}
                <div className={styles.formActions}>
                    <button type="submit" className={styles.submitButton} disabled={loading || !apiLoaded}>
                        {loading ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Создать локацию')}
                    </button>
                    <Link to="/admin/locations" className={styles.cancelButton}>
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AdminLocationFormPage;