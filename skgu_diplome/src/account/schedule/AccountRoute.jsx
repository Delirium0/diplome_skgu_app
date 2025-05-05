// src/components/AccountRoute.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Map from "../../home/map/Map"; // Убедитесь, что путь верный
import Search_results from "../../search/search_results/Search_results"; // Убедитесь, что путь верный
import styles from './Schedule.module.css'; // Стили основной страницы расписания
import routeStyles from './AccountRoute.module.css'; // Добавим отдельные стили для этой страницы
import Footer from "../../Components/Footer/Footer"; // Убедитесь, что путь верный
import { useAuth } from '../../auth/AuthProvider';
import LoadingSpinner from "../../Components/loader/LoadingSpinner";
import LessonSnippet from './LessonSnippet'
const AccountRoute = () => {
    const { user } = useAuth();
    const token = user?.token;
    const apiUrl = `${process.env.REACT_APP_API_URL}/schedule/schedule/`;
    const routeApiUrl = `${process.env.REACT_APP_API_URL}/search/route_suggestions`;
    const start = "1_entrance"; // Точка старта для маршрута

    // Состояния для расписания
    const [scheduleData, setScheduleData] = useState(null);
    const [loadingSchedule, setLoadingSchedule] = useState(true);
    const [scheduleError, setScheduleError] = useState(null);

    // Состояния для текущего занятия
    const [currentLesson, setCurrentLesson] = useState(null); // Теперь храним весь объект

    // Состояния для маршрута
    const [floorsData, setFloorsData] = useState([]);
    const [point, setPoint] = useState(null);
    const [centerPoint, setCenterPoint] = useState(null);
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [routeError, setRouteError] = useState(null);

    // --- Функция поиска текущего занятия ---
    const findCurrentLesson = (schedule) => {
        if (!schedule || !schedule.results || schedule.results.length === 0) {
            return null;
        }
        const now = new Date();
        const currentDayOfWeek = now.toLocaleDateString('ru-RU', { weekday: 'long' }).toUpperCase();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // Время в минутах от полуночи

        console.log("AccountRoute: Ищем занятие на:", currentDayOfWeek, "Время:", currentTime);

        const lessonsToday = schedule.results.filter(lesson =>
            lesson['День недели'] && lesson['День недели'].toUpperCase() === currentDayOfWeek
        );

        if (lessonsToday.length === 0) {
            console.log("AccountRoute: На сегодня занятий нет.");
            return null;
        }

        for (const lesson of lessonsToday) {
            if (!lesson['Время']) continue; // Пропускаем занятия без времени

            const timeParts = lesson['Время'].split(' - ');
            if (timeParts.length !== 2) continue; // Некорректный формат

            // Используем более надежный парсинг времени
            const startMatch = timeParts[0].match(/(\d{1,2})[.:](\d{1,2})/);
            const endMatch = timeParts[1].match(/(\d{1,2})[.:](\d{1,2})/);

            if (!startMatch || !endMatch) continue; // Не удалось распознать время

            const [, startHour, startMinute] = startMatch.map(Number);
            const [, endHour, endMinute] = endMatch.map(Number);

            const lessonStartTime = startHour * 60 + startMinute;
            const lessonEndTime = endHour * 60 + endMinute;

            if (currentTime >= lessonStartTime && currentTime < lessonEndTime) {
                console.log("AccountRoute: Найдено текущее занятие:", lesson);
                return lesson; // Возвращаем ВЕСЬ объект занятия
            }
        }

        console.log("AccountRoute: Текущих занятий в данный момент не найдено.");
        return null; // Нет занятий в данный момент
    };


    // --- useEffect для загрузки РАСПИСАНИЯ ---
    useEffect(() => {
        let isMounted = true;
        const fetchSchedule = async () => {
            console.log("AccountRoute: Загрузка расписания...");
            setScheduleError(null);
            setScheduleData(null); // Сброс данных перед запросом
            setCurrentLesson(null); // Сброс текущего урока
            setFloorsData([]);     // Сброс маршрута
            setPoint(null);
            setCenterPoint(null);
            setRouteError(null);
            setLoadingRoute(false); // Убедимся, что лоадер маршрута выключен

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({})
                });

                 if (!response.ok) {
                    let errorMessage = `Ошибка HTTP: ${response.status}`;
                     try {
                         const errorData = await response.json();
                         if (errorData && errorData.detail) errorMessage = errorData.detail;
                     } catch (e) { /* ignore json parse error */ }
                     if (response.status === 401) errorMessage = 'Сессия истекла. Пожалуйста, войдите снова.';
                     throw new Error(errorMessage);
                 }

                const data = await response.json();
                 console.log("AccountRoute: Расписание получено", data);
                if (isMounted) {
                     // Проверяем структуру ответа
                     if (data && Array.isArray(data.results)) {
                         setScheduleData(data);
                         // Сразу ищем текущее занятие после успешной загрузки
                         const lesson = findCurrentLesson(data);
                         setCurrentLesson(lesson);
                     } else {
                         console.warn("AccountRoute: Неожиданная структура данных расписания");
                         setScheduleData({ results: [] }); // Устанавливаем пустой массив для консистентности
                     }
                }
            } catch (e) {
                console.error("AccountRoute: Ошибка загрузки расписания:", e);
                if (isMounted) setScheduleError(e);
            } finally {
                if (isMounted) setLoadingSchedule(false);
            }
        };

        if (token) {
             setLoadingSchedule(true); // Начинаем загрузку
             fetchSchedule();
        } else {
            setScheduleError(new Error('Токен авторизации отсутствует.'));
            setLoadingSchedule(false); // Загрузка не начнется
        }
        return () => { isMounted = false; }; // Очистка при размонтировании
    }, [apiUrl, token]); // Зависит от apiUrl и token


    // --- useEffect для загрузки МАРШРУТА (когда currentLesson изменится) ---
    useEffect(() => {
        // Не выполняем, если расписание еще грузится или есть ошибка
        if (loadingSchedule || scheduleError) return;

        let isMounted = true;

        if (currentLesson && currentLesson['Аудитория']) {
            const classroom = currentLesson['Аудитория'];
            const classroomParts = classroom.split('/');
            const roomNumber = classroomParts[0].trim(); // Убираем лишние пробелы
            const buildingNumber = classroomParts.length > 1 ? classroomParts[1].trim() : '6'; // Дефолтный корпус

            console.log(`AccountRoute: Запрос маршрута для аудитории ${roomNumber}, корпус ${buildingNumber}`);
            setLoadingRoute(true); // Начинаем загрузку маршрута
            setRouteError(null);
            setFloorsData([]);
            setPoint(null);
            setCenterPoint(null);

            axios
                .get(routeApiUrl, {
                    params: { start, target: roomNumber, building: buildingNumber },
                    headers: { // Добавляем токен и сюда, если API маршрутов требует авторизацию
                         'Authorization': `Bearer ${token}`
                    }
                })
                .then((response) => {
                    console.log("AccountRoute: Ответ API маршрутов:", response.data);
                    if (!isMounted) return;

                     // Обработка изображений этажей
                    const images = response.data.images?.map((imgData) => ({
                        floor: imgData.floor,
                        image: `data:image/png;base64,${imgData.image}`,
                    })) || []; // Обработка случая, если images отсутствует
                    const sortedFloors = [...images].sort((a, b) => parseInt(a.floor, 10) - parseInt(b.floor, 10));
                    setFloorsData(sortedFloors);

                    // Обработка точки на карте
                     if (response.data.location && (response.data.location.bounds?.length > 0 || (response.data.location.lat && response.data.location.lng))) {
                         setPoint([response.data.location]);
                         setCenterPoint(response.data.location.bounds?.[0] || { lat: response.data.location.lat, lng: response.data.location.lng });
                     } else {
                          console.warn("AccountRoute: Не найдены валидные координаты для карты.");
                          setPoint(null);
                          setCenterPoint(null);
                     }

                })
                .catch((error) => {
                    console.error("AccountRoute: Ошибка загрузки маршрута:", error);
                    if (isMounted) {
                         let message = "Не удалось построить маршрут.";
                         if (error.response && error.response.data && error.response.data.detail) {
                             message = error.response.data.detail; // Сообщение об ошибке от API
                         } else if (error.response && error.response.status === 404) {
                             message = `Аудитория ${roomNumber} (корп. ${buildingNumber}) не найдена на карте.`;
                         }
                         setRouteError(new Error(message));
                         setPoint(null); // Сбрасываем карту при ошибке
                         setCenterPoint(null);
                         setFloorsData([]);
                    }
                })
                .finally(() => {
                    if (isMounted) setLoadingRoute(false); // Завершаем загрузку маршрута
                });
        } else {
            // Если нет текущего занятия или у него нет аудитории, сбрасываем маршрут
             console.log("AccountRoute: Нет текущего занятия с аудиторией для построения маршрута.");
            setFloorsData([]);
            setPoint(null);
            setCenterPoint(null);
            setLoadingRoute(false); // Убедимся, что лоадер выключен
            setRouteError(null);
        }

         return () => { isMounted = false; }; // Очистка
    }, [currentLesson, loadingSchedule, scheduleError, routeApiUrl, token, start]); // Зависит от currentLesson и других


    // --- Рендеринг Компонента ---

    // 1. Загрузка расписания
    if (loadingSchedule) {
        return (
             <div className={`${styles.schedulePage} ${styles.page_block}`}>
                 <div className={routeStyles.container}> {/* Добавляем обертку для центрирования */}
                    <LoadingSpinner message="Загрузка данных расписания..." />
                 </div>
                <Footer />
            </div>
        );
    }

    // 2. Ошибка загрузки расписания
    if (scheduleError) {
        return (
            <div className={`${styles.schedulePage} ${styles.page_block}`}>
                <div className={routeStyles.container}>
                 
                </div>
                <Footer />
            </div>
        );
    }

    // 3. Расписание загружено, но пустое
    if (!scheduleData || !scheduleData.results || scheduleData.results.length === 0) {
        return (
             <div className={`${styles.schedulePage} ${styles.page_block}`}>
                
                <Footer />
            </div>
        );
    }

    // 4. Основной рендер (расписание есть)
    return (
        <div className={`${styles.schedulePage} ${styles.page_block}`}>
             {/* Используем новый класс для контента этой страницы */}
            <div className={routeStyles.contentWrapper}>
                <h2 className={routeStyles.routeHeader}>Маршрут к текущему занятию</h2>

                {/* Отображение текущего занятия или плейсхолдера */}
                {currentLesson ? (
                    <LessonSnippet lesson={currentLesson} />
                ) : (
                    console.log('qefqefqef')
                )}

                {/* Секция с маршрутом (только если есть текущее занятие с аудиторией) */}
                {currentLesson && currentLesson['Аудитория'] && (
                    <div className={routeStyles.routeSection}>
                        {loadingRoute && <LoadingSpinner message="Построение маршрута..." />}

                        {/* Показываем ошибку маршрута, если она есть и маршрут не грузится */}
                        {routeError && !loadingRoute && (
                            <div className={routeStyles.errorMessage}> {/* Стилизуем ошибку */}
                                {routeError.message}
                            </div>
                        )}

                        {/* Показываем карту и схемы, если нет загрузки, нет ошибки И есть данные */}
                        {!loadingRoute && !routeError && floorsData.length > 0 && (
                            <>
                                {point && (
                                    <div className={routeStyles.mapContainer}> {/* Обертка для карты */}
                                        <Map points={point} center_points={centerPoint} zoom_size={18} />
                                    </div>
                                )}
                                <Search_results floorsData={floorsData} />
                            </>
                        )}

                        {/* Сообщение, если маршрут загрузился без данных (и без ошибки) */}
                        {!loadingRoute && !routeError && floorsData.length === 0 && !point && (
                            <p className={styles.noSchedule}>Не удалось получить данные маршрута для этой аудитории.</p>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default AccountRoute;