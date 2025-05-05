// src/admin/events/AdminEventsListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider'; // Исправил путь, если AuthProvider в корне auth
import { getAllEventsAdmin, deleteEventAdmin, approveEventAdmin} from './eventAdminService'; // Исправил путь к сервису
import styles from './AdminEvents.module.css'; // Используем стили из родительской папки admin

const AdminEventsListPage = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null); // Для отслеживания одобрения/удаления

    const fetchEvents = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        setError(null);
        try {
            // Используем /events/all для админки
            const data = await getAllEventsAdmin(token);
            setEvents(data || []);
        } catch (err) {
            console.error("Ошибка загрузки событий:", err);
            setError(err.message || "Не удалось загрузить список событий.");
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
         fetchEvents();
    }, [fetchEvents]);

    const handleDelete = async (eventId, eventName) => {
        if (!token || processingId) return; // Не удаляем, если что-то уже обрабатывается

        if (window.confirm(`Вы уверены, что хотите удалить событие "${eventName}" (ID: ${eventId})?`)) {
            setProcessingId(eventId); // Блокируем кнопки для этой строки
            setError(null);
            try {
                await deleteEventAdmin(eventId, token);
                // Обновляем список после удаления
                setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
                // Можно добавить alert или toast для успеха
                // alert("Событие успешно удалено.");
            } catch (err) {
                console.error("Ошибка удаления события:", err);
                const errMsg = err.message || "Не удалось удалить событие.";
                setError(errMsg);
                // Можно добавить alert или toast для ошибки
                // alert(`Ошибка: ${errMsg}`);
            } finally {
                setProcessingId(null); // Снимаем блокировку
            }
        }
    };

    const handleApproveFromAdminList = async (eventId) => {
        if (!token || processingId) return;
        setProcessingId(eventId);
        setError(null);

        try {
            await approveEventAdmin(eventId, token);
            // Обновляем статус в локальном состоянии
            setEvents(prevEvents =>
                prevEvents.map(event =>
                    event.id === eventId
                        ? { ...event, is_moderate: true }
                        : event
                )
            );
             // Можно добавить alert или toast для успеха
             // alert("Событие успешно одобрено.");
        } catch (err) {
            console.error(`Ошибка одобрения события ${eventId}:`, err);
            const errMsg = `Не удалось одобрить событие ID ${eventId}: ${err.message}`;
            setError(errMsg);
             // Можно добавить alert или toast для ошибки
             // alert(`Ошибка: ${errMsg}`);
        } finally {
            setProcessingId(null);
        }
    };

    // --- Рендеринг ---
    if (loading && events.length === 0) {
        return <div className={styles.statusMessage}>Загрузка событий...</div>;
    }

    // Показываем ошибку API над таблицей, если она есть
    {error && <p className={`${styles.statusMessage} ${styles.error}`}>Ошибка: {error}</p>}

    return (
        <div className={styles.adminPageContainer}>
            <h1 className={styles.adminPageTitle}>Управление Событиями</h1>

            <Link to="/admin/events/new" className={styles.createButton}>
                + Создать новое событие
            </Link>

            {events.length === 0 && !loading ? (
                <div className={styles.statusMessage}>События не найдены.</div>
            ) : (
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Время</th>
                            <th>Создатель</th>
                            <th>Статус</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event.id}>
                                <td>{event.id}</td>
                                <td>{event.event_name}</td>
                                {/* Форматируем дату */}
                                <td>{event.event_time ? new Date(event.event_time).toLocaleString('ru-RU') : 'N/A'}</td>
                                <td>
                                    {/* Используем имя создателя из события, если есть, иначе из связанного юзера */}
                                    {event.event_creator_name || event.creator?.login || 'N/A'}
                                    {/* Показываем ID создателя для информации */}
                                    {event.creator_id && ` (ID: ${event.creator_id})`}
                                </td>
                                <td> {/* Статус модерации */}
                                    {event.is_moderate
                                    ? <span className={styles.statusApproved}>Одобрено</span>
                                    : <span className={styles.statusPending}>Ожидает</span>
                                    }
                                </td>
                                <td className={styles.actionsCell}>
                                    {/* Кнопка Редактировать */}
                                    <Link
                                        to={`/admin/events/${event.id}/edit`}
                                        className={`${styles.actionButton} ${styles.editButton}`}
                                    >
                                        Редактировать
                                    </Link>
                                    {/* Кнопка Удалить */}
                                    <button
                                        onClick={() => handleDelete(event.id, event.event_name)}
                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                        disabled={processingId === event.id} // Блокируем во время обработки этой строки
                                    >
                                        {processingId === event.id ? 'Удаление...' : 'Удалить'}
                                    </button>
                                    {/* Кнопка Одобрить (если не одобрено) */}
                                    {!event.is_moderate && (
                                        <button
                                            onClick={() => handleApproveFromAdminList(event.id)}
                                            className={`${styles.actionButton} ${styles.approveButton}`}
                                            disabled={processingId === event.id} // Блокируем во время обработки этой строки
                                        >
                                            {processingId === event.id ? 'Одобрение...' : 'Одобрить'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminEventsListPage;