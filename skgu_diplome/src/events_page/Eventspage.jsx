// src/events/EventPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './eventspage.module.css'; // Создадим этот файл ниже

const EventPage = () => {
    const { eventId } = useParams(); // Получаем ID события из URL
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Функция для форматирования даты и времени
    const formatDateTime = (isoString) => {
        if (!isoString) return 'Дата не указана';
        try {
            const date = new Date(isoString);
            // Формат: "15 мая 2024 г., 18:30"
            return date.toLocaleString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                // timeZone: 'Europe/Moscow' // Укажи нужный часовой пояс, если требуется
            });
        } catch (e) {
            console.error("Ошибка форматирования даты:", e);
            return isoString; // Возвращаем как есть, если ошибка
        }
    };


    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            setError('');
            try {
                const apiUrl = `${process.env.REACT_APP_API_URL}/events/${eventId}`;
                const response = await fetch(apiUrl);

                if (!response.ok) {
                     let errorDetail = "Событие не найдено или произошла ошибка";
                     try {
                         const errorData = await response.json();
                         if (errorData && errorData.detail) {
                             errorDetail = errorData.detail;
                         }
                     } catch (jsonError) {
                        console.error("Ошибка парсинга JSON ошибки:", jsonError)
                     }
                     throw new Error(`${errorDetail} (Статус: ${response.status})`);
                }

                const data = await response.json();
                setEvent(data);

            } catch (err) {
                console.error("Ошибка при загрузке события:", err);
                setError(err.message || 'Не удалось загрузить данные события.');
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchEvent();
        } else {
            setError("ID события не указан.");
            setLoading(false);
        }

        // Очистка при размонтировании (не обязательно для fetch, но хорошая практика)
        // return () => { /* можно добавить AbortController для отмены fetch */ };
    }, [eventId]); // Перезапускаем эффект, если eventId изменился

    // Отображение состояний
    if (loading) {
        return <div className={styles.statusMessage}>Загрузка данных события...</div>;
    }

    if (error) {
        return <div className={`${styles.statusMessage} ${styles.error}`}>{error}</div>;
    }

    if (!event) {
        // Это состояние не должно возникать, если error или loading не сработали,
        // но добавим на всякий случай
        return <div className={styles.statusMessage}>Событие не найдено.</div>;
    }

    // --- Отображение данных события ---
    return (
        <div className={styles.eventPage}> {/* Основной контейнер страницы */}
            <div className={styles.contentWrapper}> {/* Обертка для контента */}

                {/* Баннер с фоновым изображением */}
                {event.image_background && (
                    <div className={styles.eventBanner}>
                        <img src={event.image_background} alt={`Фон для ${event.event_name}`} />
                    </div>
                )}

                {/* Название события */}
                <h1 className={styles.eventName}>{event.event_name}</h1>

                {/* Блок с мета-информацией */}
                <div className={styles.eventMeta}>
                    <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>🕒</span> {/* Замени на SVG иконку, если есть */}
                        <span>{formatDateTime(event.event_time)}</span>
                    </div>
                    {event.address && (
                        <div className={styles.metaItem}>
                            <span className={styles.metaIcon}>📍</span> {/* Замени на SVG иконку */}
                            <span>{event.address}</span>
                        </div>
                    )}
                    {event.event_rating && (
                         <div className={styles.metaItem}>
                            <span className={styles.metaIcon}>⭐</span> {/* Замени на SVG иконку */}
                            <span>Рейтинг: {event.event_rating.toFixed(1)}</span>
                        </div>
                    )}
                     {/* Информация о создателе */}
                     <div className={styles.creatorInfo}>
                        {event.event_creator_image && (
                             <img src={event.event_creator_image} alt={event.event_creator_name} className={styles.creatorImage}/>
                        )}
                        <span className={styles.creatorName}>Организатор: {event.event_creator_name}</span>
                    </div>
                </div>

                {/* Описание события */}
                {event.event_description && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Описание</h2>
                        <div className={styles.textBlock}>
                            {/* Используем dangerouslySetInnerHTML, если описание может содержать HTML,
                                иначе просто {event.event_description}
                                ВАЖНО: Убедись, что HTML в описании безопасен (санитизирован на бэкенде)!
                            */}
                            <p>{event.event_description}</p>
                        </div>
                    </section>
                )}

                {/* Контакты */}
                {(event.contact_phone || event.contact_email) && (
                     <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Контакты</h2>
                        <div className={styles.contactInfo}>
                             {event.contact_phone && (
                                 <p>
                                     <span className={styles.contactIcon}>📞</span> {/* Замени на SVG */}
                                     <a href={`tel:${event.contact_phone}`}>{event.contact_phone}</a>
                                 </p>
                             )}
                             {event.contact_email && (
                                <p>
                                     <span className={styles.contactIcon}>✉️</span> {/* Замени на SVG */}
                                     <a href={`mailto:${event.contact_email}`}>{event.contact_email}</a>
                                </p>
                             )}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};

export default EventPage;