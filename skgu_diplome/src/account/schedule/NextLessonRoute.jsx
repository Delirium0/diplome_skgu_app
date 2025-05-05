// src/components/NextLessonRoute.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Map from "../../home/map/Map"; // Убедитесь, что путь верный
import Search_results from "../../search/search_results/Search_results"; // Убедитесь, что путь верный
import styles from './Schedule.module.css'; // Стили основной страницы расписания (если нужны)
import routeStyles from './AccountRoute.module.css'; // Используем те же стили, что и для текущего маршрута
import Footer from "../../Components/Footer/Footer"; // Убедитесь, что путь верный
import { useAuth } from '../../auth/AuthProvider';
import LoadingSpinner from '../../Components/loader/LoadingSpinner'; // <-- Путь к лоадеру
// import NoDataPlaceholder from '../../Components/NoDataPlaceholder/NoDataPlaceholder'; // <-- Убираем импорт
import LessonSnippet from './LessonSnippet'; // <-- Используем тот же сниппет

const NextLessonRoute = () => {
    const { user } = useAuth();
    const token = user?.token;
    const apiUrl = `${process.env.REACT_APP_API_URL}/schedule/schedule/`;
    const routeApiUrl = `${process.env.REACT_APP_API_URL}/search/route_suggestions`;
    const start = "1_entrance"; // Точка старта для маршрута

    // Состояния для расписания
    const [scheduleData, setScheduleData] = useState(null);
    const [loadingSchedule, setLoadingSchedule] = useState(true);
    const [scheduleError, setScheduleError] = useState(null);

    // Состояния для СЛЕДУЮЩЕГО занятия
    const [nextLesson, setNextLesson] = useState(null); // Храним объект следующего занятия

    // Состояния для маршрута (остаются такими же)
    const [floorsData, setFloorsData] = useState([]);
    const [point, setPoint] = useState(null);
    const [centerPoint, setCenterPoint] = useState(null);
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [routeError, setRouteError] = useState(null);

    // --- Функция поиска СЛЕДУЮЩЕГО занятия ---
    const findNextLesson = (schedule) => {
        if (!schedule || !schedule.results || schedule.results.length === 0) {
            return null;
        }
        const now = new Date();
        const currentDayOfWeek = now.toLocaleDateString('ru-RU', { weekday: 'long' }).toUpperCase();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        console.log("NextLessonRoute: Ищем занятие на:", currentDayOfWeek, "Время:", currentTime);

        const lessonsToday = schedule.results.filter(lesson =>
            lesson['День недели'] && lesson['День недели'].toUpperCase() === currentDayOfWeek
        );

        if (lessonsToday.length === 0) {
            console.log("NextLessonRoute: На сегодня занятий больше нет.");
            return null;
        }

        let earliestNextLesson = null;
        let minStartTimeDiff = Infinity;

        for (const lesson of lessonsToday) {
            if (!lesson['Время']) continue;

            const timeParts = lesson['Время'].split(' - ');
            if (timeParts.length !== 2) continue;

            const startMatch = timeParts[0].match(/(\d{1,2})[.:](\d{1,2})/);
            if (!startMatch) continue;

            const [, startHour, startMinute] = startMatch.map(Number);
            const lessonStartTime = startHour * 60 + startMinute;

            if (lessonStartTime > currentTime) {
                const timeDiff = lessonStartTime - currentTime;
                if (timeDiff < minStartTimeDiff) {
                    minStartTimeDiff = timeDiff;
                    earliestNextLesson = lesson;
                }
            }
        }

        if (earliestNextLesson) {
             console.log("NextLessonRoute: Найдено следующее занятие:", earliestNextLesson);
        } else {
             console.log("NextLessonRoute: Следующих занятий на сегодня не найдено.");
        }
        return earliestNextLesson;
    };


    // --- useEffect для загрузки РАСПИСАНИЯ ---
    useEffect(() => {
        let isMounted = true;
        const fetchSchedule = async () => {
            console.log("NextLessonRoute: Загрузка расписания...");
            setScheduleError(null);
            setScheduleData(null);
            setNextLesson(null);
            setFloorsData([]);
            setPoint(null);
            setCenterPoint(null);
            setRouteError(null);
            setLoadingRoute(false);

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
                     } catch (e) { /* ignore */ }
                     if (response.status === 401) errorMessage = 'Сессия истекла. Пожалуйста, войдите снова.';
                     throw new Error(errorMessage);
                 }
                const data = await response.json();
                 console.log("NextLessonRoute: Расписание получено", data);
                if (isMounted) {
                     if (data && Array.isArray(data.results)) {
                         setScheduleData(data);
                         const lesson = findNextLesson(data);
                         setNextLesson(lesson);
                     } else {
                         console.warn("NextLessonRoute: Неожиданная структура данных расписания");
                         setScheduleData({ results: [] });
                     }
                }
            } catch (e) {
                console.error("NextLessonRoute: Ошибка загрузки расписания:", e);
                if (isMounted) setScheduleError(e);
            } finally {
                if (isMounted) setLoadingSchedule(false);
            }
        };

        if (token) {
             setLoadingSchedule(true);
             fetchSchedule();
        } else {
            setScheduleError(new Error('Токен авторизации отсутствует.'));
            setLoadingSchedule(false);
        }
        return () => { isMounted = false; };
    }, [apiUrl, token]);


    // --- useEffect для загрузки МАРШРУТА (когда nextLesson изменится) ---
    useEffect(() => {
        if (loadingSchedule || scheduleError) return;

        let isMounted = true;

        if (nextLesson && nextLesson['Аудитория']) {
            const classroom = nextLesson['Аудитория'];
            const classroomParts = classroom.split('/');
            const roomNumber = classroomParts[0].trim();
            const buildingNumber = classroomParts.length > 1 ? classroomParts[1].trim() : '6';

            console.log(`NextLessonRoute: Запрос маршрута к следующему занятию: ауд. ${roomNumber}, корп. ${buildingNumber}`);
            setLoadingRoute(true);
            setRouteError(null);
            setFloorsData([]);
            setPoint(null);
            setCenterPoint(null);

            axios
                .get(routeApiUrl, {
                    params: { start, target: roomNumber, building: buildingNumber },
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then((response) => {
                     console.log("NextLessonRoute: Ответ API маршрутов:", response.data);
                     if (!isMounted) return;
                     const images = response.data.images?.map((imgData) => ({
                         floor: imgData.floor,
                         image: `data:image/png;base64,${imgData.image}`,
                     })) || [];
                     const sortedFloors = [...images].sort((a, b) => parseInt(a.floor, 10) - parseInt(b.floor, 10));
                     setFloorsData(sortedFloors);
                     if (response.data.location && (response.data.location.bounds?.length > 0 || (response.data.location.lat && response.data.location.lng))) {
                          setPoint([response.data.location]);
                          setCenterPoint(response.data.location.bounds?.[0] || { lat: response.data.location.lat, lng: response.data.location.lng });
                     } else {
                          console.warn("NextLessonRoute: Не найдены валидные координаты для карты.");
                          setPoint(null);
                          setCenterPoint(null);
                     }
                })
                .catch((error) => {
                     console.error("NextLessonRoute: Ошибка загрузки маршрута:", error);
                     if (isMounted) {
                          let message = "Не удалось построить маршрут к следующему занятию.";
                          if (error.response && error.response.data && error.response.data.detail) {
                              message = error.response.data.detail;
                          } else if (error.response && error.response.status === 404) {
                              message = `Аудитория ${roomNumber} (корп. ${buildingNumber}) не найдена на карте.`;
                          }
                          setRouteError(new Error(message));
                          setPoint(null);
                          setCenterPoint(null);
                          setFloorsData([]);
                     }
                })
                .finally(() => {
                    if (isMounted) setLoadingRoute(false);
                });
        } else {
             console.log("NextLessonRoute: Нет следующего занятия с аудиторией для построения маршрута.");
            setFloorsData([]);
            setPoint(null);
            setCenterPoint(null);
            setLoadingRoute(false);
            setRouteError(null);
        }
         return () => { isMounted = false; };
    }, [nextLesson, loadingSchedule, scheduleError, routeApiUrl, token, start]);


    // --- Рендеринг Компонента ---

    // 1. Загрузка расписания
    if (loadingSchedule) {
        return (
             <div className={`${styles.schedulePage} ${styles.page_block}`}>
                 <div className={routeStyles.container}> {/* Используем обертку для центрирования */}
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
                {/* Возвращаем простое сообщение об ошибке */}
                <div className={routeStyles.contentWrapper}> {/* Обертка для контента */}
                    <p className={styles.error}> {/* Используем старый стиль ошибки */}
                        Ошибка загрузки расписания: {scheduleError.message}
                    </p>
                </div>
                <Footer />
            </div>
        );
    }

    // 3. Расписание загружено, но пустое
    if (!scheduleData || !scheduleData.results || scheduleData.results.length === 0) {
        return (
             <div className={`${styles.schedulePage} ${styles.page_block}`}>
                {/* Возвращаем простое сообщение об отсутствии расписания */}
                 <div className={routeStyles.contentWrapper}>
                    <p className={styles.noSchedule}> {/* Используем старый стиль */}
                        Расписание не найдено или еще не опубликовано.
                    </p>
                 </div>
                <Footer />
            </div>
        );
    }

    // 4. Основной рендер (расписание есть)
    return (
        <div className={`${styles.schedulePage} ${styles.page_block}`}>
            <div className={routeStyles.contentWrapper}>
                {/* Изменяем заголовок */}
                <h2 className={routeStyles.routeHeader}>Маршрут к следующему занятию</h2>

                {/* Отображение СЛЕДУЮЩЕГО занятия или сообщения */}
                {nextLesson ? (
                    <LessonSnippet lesson={nextLesson} />
                ) : (
                    // Возвращаем простое текстовое сообщение
                     <p className={styles.noSchedule}>
                         На сегодня больше нет запланированных занятий.
                     </p>
                )}

                {/* Секция с маршрутом (только если есть СЛЕДУЮЩЕЕ занятие с аудиторией) */}
                {nextLesson && nextLesson['Аудитория'] && (
                    <div className={routeStyles.routeSection}>
                        {loadingRoute && <LoadingSpinner message="Построение маршрута..." />}

                        {/* Сообщение об ошибке маршрута */}
                        {routeError && !loadingRoute && (
                            <div className={routeStyles.errorMessage}>
                                {routeError.message}
                            </div>
                        )}

                        {/* Карта и схемы этажей */}
                        {!loadingRoute && !routeError && floorsData.length > 0 && (
                            <>
                                {point && (
                                    <div className={routeStyles.mapContainer}>
                                        <Map points={point} center_points={centerPoint} zoom_size={18} />
                                    </div>
                                )}
                                <Search_results floorsData={floorsData} />
                            </>
                        )}

                        {/* Сообщение, если маршрут загрузился без данных */}
                        {!loadingRoute && !routeError && floorsData.length === 0 && !point && (
                             <p className={styles.noSchedule}>
                                 Не удалось получить данные маршрута для этой аудитории.
                             </p>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default NextLessonRoute;