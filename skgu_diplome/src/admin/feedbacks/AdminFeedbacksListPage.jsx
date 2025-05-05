// src/admin/feedbacks/AdminFeedbacksListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { getAllFeedbacksAdmin, deleteFeedbackAdmin } from '../eventAdminService';
// Используем стили админки
import styles from '../AdminEvents.module.css'; // Или создай AdminFeedbacks.module.css

// Компонент для отображения звезд (можно вынести в утилиты)
const StaticStarRating = ({ rating }) => {
    return (
        <span title={`${rating}/5`}>
            {[1, 2, 3, 4, 5].map((starValue) => (
                <span
                    key={starValue}
                    style={{ color: rating >= starValue ? 'gold' : 'grey', fontSize: '1.2em' }}
                >
                    ★
                </span>
            ))}
        </span>
    );
};


const AdminFeedbacksListPage = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null); // Для блокировки кнопки удаления

    // Добавим пагинацию (простой вариант)
    const [page, setPage] = useState(0); // Номер страницы (начинаем с 0)
    const [limit] = useState(25); // Количество отзывов на странице
    const [hasMore, setHasMore] = useState(true); // Есть ли еще страницы

    const fetchFeedbacks = useCallback(async (pageNum = 0) => {
        if (!token) return;
        setLoading(true); // Индикатор загрузки
        setError(null);
        const skip = pageNum * limit;

        try {
            const data = await getAllFeedbacksAdmin(token, skip, limit);
            // Если вернулось меньше элементов, чем лимит, значит, это последняя страница
            setHasMore(data.length === limit);
            // Добавляем новые отзывы к существующим, если грузим следующую страницу
            setFeedbacks(prev => pageNum === 0 ? data : [...prev, ...data]);
            setPage(pageNum); // Обновляем номер текущей страницы
        } catch (err) {
            console.error("Ошибка загрузки отзывов:", err);
            setError(err.message || "Не удалось загрузить список отзывов.");
            setHasMore(false); // Считаем, что больше нет, раз ошибка
        } finally {
            setLoading(false);
        }
    }, [token, limit]); // Зависимости

    useEffect(() => {
        // Загружаем первую страницу при монтировании
        fetchFeedbacks(0);
    }, [fetchFeedbacks]); // fetchFeedbacks мемоизирован и зависит от token/limit

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchFeedbacks(page + 1);
        }
    };


    const handleDelete = async (feedbackId) => {
        if (!token || processingId) return;
        if (window.confirm(`Вы уверены, что хотите удалить отзыв ID: ${feedbackId}?`)) {
            setProcessingId(feedbackId);
            setError(null);
            try {
                await deleteFeedbackAdmin(feedbackId, token);
                // Удаляем из локального состояния
                setFeedbacks(prevFeedbacks => prevFeedbacks.filter(fb => fb.id !== feedbackId));
            } catch (err) {
                console.error("Ошибка удаления отзыва:", err);
                setError(`Ошибка удаления отзыва ID ${feedbackId}: ${err.message}`);
            } finally {
                setProcessingId(null);
            }
        }
    };

    // --- Рендеринг ---
    return (
        <div className={styles.adminPageContainer}>
            <h1 className={styles.adminPageTitle}>Просмотр Отзывов</h1>

            {error && <div className={`${styles.statusMessage} ${styles.error} ${styles.stickyError}`}>Ошибка: {error}</div>}

            {feedbacks.length === 0 && loading && page === 0 ? ( // Лоадер только при первой загрузке
                <div className={styles.statusMessage}>Загрузка отзывов...</div>
            ) : feedbacks.length === 0 && !loading ? (
                <div className={styles.statusMessage}>Отзывы не найдены.</div>
            ) : (
                <>
                    <table className={styles.adminTable}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Рейтинг</th>
                                <th>Комментарий</th>
                                <th>Пользователь</th>
                                <th>Дата</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedbacks.map((feedback) => (
                                <tr key={feedback.id} className={processingId === feedback.id ? styles.processing : ''}>
                                    <td>{feedback.id}</td>
                                    <td><StaticStarRating rating={feedback.rating} /></td>
                                    <td title={feedback.comment || ''}>
                                        {feedback.comment?.substring(0, 100)}{feedback.comment && feedback.comment.length > 100 ? '...' : ''}
                                    </td>
                                    <td>
                                        {/* Отображаем логин пользователя, если бэкенд его вернул */}
                                        {feedback.user ? `${feedback.user.login} (ID: ${feedback.user.id})` : `User ID: ${feedback.user_id}`}
                                    </td>
                                    <td>{new Date(feedback.created_at).toLocaleString()}</td>
                                    <td className={styles.actionsCell}>
                                        <button
                                            onClick={() => handleDelete(feedback.id)}
                                            className={`${styles.actionButton} ${styles.deleteButton}`}
                                            disabled={!!processingId}
                                        >
                                            {processingId === feedback.id ? 'Удаляем...' : 'Удалить'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Кнопка "Загрузить еще" */}
                    {hasMore && (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className={styles.submitButton} // Используем стиль submit кнопки
                            >
                                {loading ? 'Загрузка...' : 'Загрузить еще'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminFeedbacksListPage;