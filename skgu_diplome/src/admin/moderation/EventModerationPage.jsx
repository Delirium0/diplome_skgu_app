// src/admin/moderation/EventModerationPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { getUnmoderatedEventsAdmin, approveEventAdmin, deleteEventAdmin } from '../eventAdminService'; // Используем сервис событий
import styles from '../AdminEvents.module.css';


const EventModerationPage = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null); // ID события, которое обрабатывается

    const fetchUnmoderatedEvents = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getUnmoderatedEventsAdmin(token);
            setEvents(data || []);
        } catch (err) {
            console.error("Ошибка загрузки неодобренных событий:", err);
            setError(err.message || "Не удалось загрузить события для модерации.");
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUnmoderatedEvents();
    }, [fetchUnmoderatedEvents]);

    const handleApprove = async (eventId) => {
        if (!token || processingId) return;
        setProcessingId(eventId); // Блокируем кнопки для этого события
        setError(null);
        try {
            await approveEventAdmin(eventId, token);
            // Удаляем из списка после одобрения
            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        } catch (err) {
            console.error("Ошибка одобрения события:", err);
            setError(`Ошибка одобрения события ID ${eventId}: ${err.message}`);
        } finally {
            setProcessingId(null); // Разблокируем кнопки
        }
    };

    const handleReject = async (eventId, eventName) => {
        if (!token || processingId) return;
        if (window.confirm(`Вы уверены, что хотите ОТКЛОНИТЬ (удалить) событие "${eventName}" (ID: ${eventId})?`)) {
            setProcessingId(eventId);
            setError(null);
            try {
                await deleteEventAdmin(eventId, token); // Используем функцию удаления
                // Удаляем из списка после отклонения
                setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            } catch (err) {
                console.error("Ошибка отклонения (удаления) события:", err);
                setError(`Ошибка отклонения события ID ${eventId}: ${err.message}`);
            } finally {
                setProcessingId(null);
            }
        }
    };

    // --- Рендеринг ---
     if (loading) {
        return <div className={styles.statusMessage}>Загрузка событий для модерации...</div>;
    }

    if (error) {
        // Показываем ошибку над списком
    }


    return (
        <div className={styles.adminPageContainer}>
            <h1 className={styles.adminPageTitle}>Модерация Событий</h1>

            {error && <div className={`${styles.statusMessage} ${styles.error} ${styles.stickyError}`}>Ошибка: {error}</div>}

            {events.length === 0 && !loading ? (
                <div className={styles.statusMessage}>Нет событий, ожидающих модерации.</div>
            ) : (
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Время</th>
                            <th>Организатор</th>
                            <th>Описание</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event.id} className={processingId === event.id ? styles.processing : ''}>
                                <td>{event.id}</td>
                                <td>
                                    <Link to={`/events/${event.id}`} target="_blank" title="Открыть в новой вкладке (если есть публичная страница)">
                                        {event.event_name}
                                    </Link>
                                     {/* Ссылка на редактирование в админке */}
                                    <Link to={`/admin/events/${event.id}/edit`} className={styles.editLinkSmall} title="Редактировать"> (ред.)</Link>
                                </td>
                                <td>{new Date(event.event_time).toLocaleString()}</td>
                                <td>{event.event_creator_name}</td>
                                <td title={event.event_description || ''}>
                                    {/* Показываем часть описания */}
                                    {event.event_description?.substring(0, 50)}{event.event_description && event.event_description.length > 50 ? '...' : ''}
                                </td>
                                <td className={styles.actionsCell}>
                                    <button
                                        onClick={() => handleApprove(event.id)}
                                        className={`${styles.actionButton} ${styles.approveButton}`} // Добавить стиль .approveButton
                                        disabled={!!processingId} // Блокируем все кнопки во время обработки
                                    >
                                        {processingId === event.id ? 'Одобряем...' : 'Одобрить'}
                                    </button>
                                    <button
                                        onClick={() => handleReject(event.id, event.event_name)}
                                        className={`${styles.actionButton} ${styles.deleteButton}`} // Используем стиль кнопки удаления
                                        disabled={!!processingId}
                                    >
                                        {processingId === event.id ? 'Отклоняем...' : 'Отклонить'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default EventModerationPage;