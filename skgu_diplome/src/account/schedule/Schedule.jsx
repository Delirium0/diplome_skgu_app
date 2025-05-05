// src/components/Schedule/Schedule.jsx
import React, { useState, useEffect } from 'react';
import styles from './Schedule.module.css';
import DesktopScheduleTable from './DesktopScheduleTable';
import MobileScheduleCards from './MobileScheduleCards';
import AccountBlock from '../AccountBlock';
import { ReactComponent as ScheduleSVG } from './../../assets/svg/calendar-days-svgrepo-com.svg';
import { useAuth } from '../../auth/AuthProvider';
import LoadingSpinner from '../../Components/loader/LoadingSpinner';
const Schedule = () => {
    const { user } = useAuth();
    const token = user?.token;
    const apiUrl = `${process.env.REACT_APP_API_URL}/schedule/schedule/`;
    const link_actual_schedule = { name: "Текущее занятие", linkTo: "/schedule_actual", SvgComponent: ScheduleSVG };
    const link_next_schedule = { name: "Следующее занятие", linkTo: "/next_lesson", SvgComponent: ScheduleSVG };

    const [scheduleData, setScheduleData] = useState(null); // Используем null как начальное состояние "нет данных"
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Флаг для предотвращения установки состояния после размонтирования компонента
        let isMounted = true;

        const fetchSchedule = async () => {
            console.log("fetchSchedule: Starting fetch..."); // DEBUG
            // Не нужно устанавливать loading true здесь, если он уже true из initialState или из проверки token
            setError(null);
            setScheduleData(null); // Сбрасываем перед запросом

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({})
                });

                console.log(`fetchSchedule: Response status: ${response.status}`); // DEBUG

                if (!response.ok) {
                    let errorMessage = `HTTP error! status: ${response.status}`;
                    // Попытка извлечь детали ошибки из тела ответа
                    try {
                        const errorData = await response.json();
                        console.log("fetchSchedule: Error response body:", errorData); // DEBUG
                        if (errorData && errorData.detail) {
                            errorMessage = errorData.detail; // Используем сообщение от API, если оно есть
                        }
                         // Специальная обработка для 401
                         if (response.status === 401) {
                             errorMessage = 'Сессия истекла или неверные учетные данные. Пожалуйста, войдите снова.';
                         }

                    } catch (jsonError) {
                         // Не удалось прочитать тело ошибки как JSON
                         console.warn("fetchSchedule: Could not parse error response body as JSON.");
                         if (response.status === 401) { // Все еще обрабатываем 401
                             errorMessage = 'Сессия истекла или неверные учетные данные. Пожалуйста, войдите снова.';
                         }
                    }
                    throw new Error(errorMessage); // Выбрасываем ошибку, чтобы попасть в catch
                }

                const data = await response.json();
                console.log("fetchSchedule: Data received:", data); // DEBUG

                if (isMounted) {
                    // Важно: Проверяем, что data и data.results существуют перед установкой
                    if (data && data.results) {
                         setScheduleData(data);
                    } else {
                         // Если структура ответа неожиданная, считаем, что данных нет
                         console.warn("fetchSchedule: API response did not contain 'results' array.");
                         setScheduleData({ results: [] }); // Устанавливаем пустой массив для консистентности
                    }
                }

            } catch (e) {
                console.error("fetchSchedule: Error caught:", e); // DEBUG
                if (isMounted) {
                    setError(e);
                }
            } finally {
                console.log("fetchSchedule: Finally block executing."); // DEBUG
                if (isMounted) {
                    console.log("fetchSchedule: Setting loading to false."); // DEBUG
                    setLoading(false);
                }
            }
        };

        if (token) {
            setLoading(true); // Устанавливаем loading=true ПЕРЕД тем, как начать запрос
            fetchSchedule();
        } else {
            setError(new Error('Токен авторизации отсутствует. Пожалуйста, войдите в систему.'));
            setLoading(false); // Нет токена - нет загрузки
        }

        // Функция очистки useEffect
        return () => {
            console.log("Schedule component unmounting or token changed."); // DEBUG
            isMounted = false; // Предотвращаем установку состояния после размонтирования
        };

    }, [apiUrl, token]); // Зависимости: apiUrl и token

    // --- Логирование состояний перед рендерингом ---
    console.log("Render Check - Loading:", loading, "Error:", error, "ScheduleData:", scheduleData);

    // --- Рендеринг состояний ---
    if (loading) {
        console.log("Render -> LoadingSpinner");
        return <LoadingSpinner message="Загрузка расписания..." />;
    }

    if (error) {
        console.log("Render -> Error Message:", error.message);
        return (
            <div className={`${styles.schedulePage} ${styles.page_block}`}>
                <div className={styles.page_content}>
                    {/* Используем NoDataPlaceholder для ошибки, если есть */}
                    {/* <NoDataPlaceholder message={`Ошибка загрузки: ${error.message}`} imageSrc="/images/error-icon.svg" /> */}
                     <p className={styles.error}>Ошибка загрузки расписания: {error.message}</p>
                </div>
                 {/* Футер */}
            </div>
        );
    }

    // Проверяем на отсутствие данных ПОСЛЕ проверки на loading и error
    // Это условие должно сработать, если scheduleData === null (начальное/сброшенное) ИЛИ scheduleData.results пуст
    if (!scheduleData || !scheduleData.results || scheduleData.results.length === 0) {
        console.log("Render -> No Schedule Data");
        return (
             <div className={`${styles.schedulePage} ${styles.page_block}`}>
                <div className={styles.page_content}>
                     {/* Используем NoDataPlaceholder, если он готов */}
                     {/* <NoDataPlaceholder message="Расписание на данный момент недоступно." imageSrc="/images/schedule-empty.svg" /> */}
                     <p className={styles.noSchedule}>Расписание не найдено или еще не опубликовано.</p>
                </div>
                 {/* Футер */}
            </div>
        );
    }

    // --- Если есть данные ---
    console.log("Render -> Schedule Data Exists, preparing tables/cards.");

    // Группировка расписания по дням недели (логика остается)
    const scheduleByDay = {};
    const daysOfWeekOrder = ["ПОНЕДЕЛЬНИК", "ВТОРНИК", "СРЕДА", "ЧЕТВЕРГ", "ПЯТНИЦА", "СУББОТА", "ВОСКРЕСЕНЬЕ"];
    scheduleData.results.forEach(lesson => {
        const day = lesson['День недели'];
        if (!scheduleByDay[day]) {
            scheduleByDay[day] = [];
        }
        scheduleByDay[day].push(lesson);
    });

    return (
        // ... остальная JSX разметка для отображения расписания ...
        <div className={`${styles.schedulePage} ${styles.page_block}`}>
            <div className={styles.schedule_next_and_actual}>
                <AccountBlock blockInfo={link_actual_schedule}></AccountBlock>
                <AccountBlock blockInfo={link_next_schedule}></AccountBlock>
            </div>

            <div className={styles.page_content}>
                <h1 className={styles.scheduleHeader}>Расписание</h1>

                {/* Десктопная версия */}
                <div className={styles.scheduleContainer}>
                    {daysOfWeekOrder.map(day => (
                        scheduleByDay[day] && scheduleByDay[day].length > 0 && (
                            <DesktopScheduleTable key={day} day={day} daySchedule={scheduleByDay[day]} styles={styles} />
                        )
                    ))}
                </div>

                {/* Мобильная версия */}
                <div className={styles.scheduleContainerMobile}>
                    {daysOfWeekOrder.map(day => (
                        scheduleByDay[day] && scheduleByDay[day].length > 0 && (
                            <MobileScheduleCards key={day} day={day} daySchedule={scheduleByDay[day]} styles={styles} />
                        )
                    ))}
                </div>
            </div>
             {/* Футер */}
        </div>
    );
};

export default Schedule;