// src/admin/events/AdminEventFormPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { getEventByIdAdmin, createEventAdmin, updateEventAdmin } from './eventAdminService';
import styles from './AdminEvents.module.css';
const AdminEventFormPage = () => {
    const { eventId } = useParams();
    const isEditMode = Boolean(eventId);
    const navigate = useNavigate();
    const { user } = useAuth();
    const token = user?.token;

    // Добавляем address в начальное состояние
    const [formData, setFormData] = useState({
        event_name: '',
        event_description: '',
        event_time: '',
        image_background: '', // URL или Base64? API ожидает строку
        event_creator_name: '',
        event_creator_image: '', // URL или Base64?
        contact_phone: '',
        contact_email: '',
        address: '', // <-- ДОБАВЛЕНО
        // Добавим is_moderate для формы редактирования
        is_moderate: false,
    });

    // --- Состояния для файлов (если нужна загрузка Base64) ---
    // Если image_background и event_creator_image должны быть файлами,
    // нужно добавить отдельные состояния и обработчики как в AdminLinkFormPage
    // Пока оставляем как строки (URL или уже Base64)
    // ---------------------------------------------------------

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);

    // Загрузка данных для редактирования
    useEffect(() => {
        if (isEditMode && eventId && token) {
            setLoading(true);
            setError(null);
            getEventByIdAdmin(eventId, token)
                .then(data => {
                    const formattedDate = data.event_time
                        ? new Date(new Date(data.event_time).getTime() - new Date().getTimezoneOffset() * 60000)
                            .toISOString().slice(0, 16)
                        : '';

                    setFormData({
                        event_name: data.event_name || '',
                        event_description: data.event_description || '',
                        event_time: formattedDate,
                        image_background: data.image_background || '',
                        event_creator_name: data.event_creator_name || '',
                        event_creator_image: data.event_creator_image || '',
                        contact_phone: data.contact_phone || '',
                        contact_email: data.contact_email || '',
                        address: data.address || '', // <-- ДОБАВЛЕНО
                        is_moderate: data.is_moderate || false, // Загружаем статус модерации
                    });
                })
                .catch(err => {
                    console.error("Ошибка загрузки события для редактирования:", err);
                    setError(err.message || "Не удалось загрузить данные события.");
                })
                .finally(() => setLoading(false));
        }
    }, [isEditMode, eventId, token]);

    // Обработчик изменений в полях формы
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value // Обработка чекбокса
        }));
        setFormError(null);
        setError(null); // Сбрасываем и ошибку API
    };

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setError("Отсутствует токен авторизации.");
            return;
        }
        setLoading(true);
        setError(null);
        setFormError(null);

        // Готовим данные к отправке
        const dataToSend = { ...formData };
        if (!dataToSend.event_time) {
           delete dataToSend.event_time;
        }
         // Преобразуем дату в ISO перед отправкой, если она есть
         // Убедимся, что бэкенд (Pydantic/SQLAlchemy) правильно обработает это
        if (dataToSend.event_time) {
             try {
                 dataToSend.event_time = new Date(dataToSend.event_time).toISOString();
             } catch (dateError) {
                  console.error("Ошибка преобразования даты:", dateError);
                  setFormError("Неверный формат даты и времени.");
                  setLoading(false);
                  return;
             }
        }

        // Убираем поля, которых нет в схемах API (если они случайно попали)
        // delete dataToSend.someOtherField;

        try {
            if (isEditMode) {
                // Режим редактирования (PUT)
                // Включаем address и is_moderate
                const updateData = {
                    event_name: dataToSend.event_name,
                    event_description: dataToSend.event_description,
                    event_time: dataToSend.event_time,
                    image_background: dataToSend.image_background,
                    event_creator_name: dataToSend.event_creator_name,
                    event_creator_image: dataToSend.event_creator_image,
                    contact_phone: dataToSend.contact_phone,
                    contact_email: dataToSend.contact_email,
                    address: dataToSend.address, // <-- ДОБАВЛЕНО
                    is_moderate: dataToSend.is_moderate, // <-- ДОБАВЛЕНО
                };
                await updateEventAdmin(eventId, updateData, token);
                alert('Событие успешно обновлено!'); // Замени на toast если нужно
                navigate('/admin/events');
            } else {
                // Режим создания (POST)
                // Включаем address, is_moderate не отправляем (он по умолчанию false)
                const createData = {
                    event_name: dataToSend.event_name,
                    event_description: dataToSend.event_description,
                    event_time: dataToSend.event_time,
                    image_background: dataToSend.image_background,
                    event_creator_name: dataToSend.event_creator_name,
                    event_creator_image: dataToSend.event_creator_image,
                    contact_phone: dataToSend.contact_phone,
                    contact_email: dataToSend.contact_email,
                    address: dataToSend.address, // <-- ДОБАВЛЕНО
                };
                await createEventAdmin(createData, token);
                alert('Событие успешно создано!'); // Замени на toast если нужно
                navigate('/admin/events');
            }
        } catch (err) {
            console.error("Ошибка сохранения события:", err);
             if (err.message.includes("Не заполнены")) {
                 setFormError(err.message);
            } else {
                setError(err.message || "Не удалось сохранить событие.");
            }
        } finally {
            setLoading(false);
        }
    };

    // --- Рендеринг ---
    if (loading && isEditMode) {
        return <div className={styles.statusMessage}>Загрузка данных события...</div>;
    }

    // Ошибка API приоритетнее ошибки формы
    const displayError = error || formError;

    return (
        <div className={styles.adminPageContainer}>
            <h1 className={styles.adminPageTitle}>
                {isEditMode ? `Редактировать событие (ID: ${eventId})` : 'Создать новое событие'}
            </h1>

            {/* Сообщение об ошибке */}
            {displayError && <p className={styles.formError} style={{ marginBottom: '15px' }}>{displayError}</p>}


            <form onSubmit={handleSubmit} className={styles.adminForm}>
                {/* Поле Название */}
                <div className={styles.formGroup}>
                    <label htmlFor="event_name">Название события *</label>
                    <input type="text" id="event_name" name="event_name" value={formData.event_name} onChange={handleChange} required disabled={loading}/>
                </div>

                {/* Поле Описание */}
                <div className={styles.formGroup}>
                    <label htmlFor="event_description">Описание</label>
                    <textarea id="event_description" name="event_description" value={formData.event_description} onChange={handleChange} rows="5" disabled={loading}/>
                </div>

                 {/* Поле Время события */}
                 <div className={styles.formGroup}>
                    <label htmlFor="event_time">Время события *</label>
                    <input type="datetime-local" id="event_time" name="event_time" value={formData.event_time} onChange={handleChange} required disabled={loading}/>
                 </div>

                 {/* --- ДОБАВЛЕНО ПОЛЕ АДРЕСА --- */}
                 <div className={styles.formGroup}>
                    <label htmlFor="address">Адрес проведения</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Например, Пушкина 76"
                        disabled={loading}
                    />
                 </div>
                 {/* --- КОНЕЦ ПОЛЯ АДРЕСА --- */}


                 {/* Поле URL Фона */}
                <div className={styles.formGroup}>
                    <label htmlFor="image_background">URL/Base64 фонового изображения *</label>
                    {/* Если нужен File Input для Base64, замени этот input */}
                    <input type="text" id="image_background" name="image_background" value={formData.image_background} onChange={handleChange} placeholder="https://... или data:image/..." required disabled={loading}/>
                </div>

                 {/* Поле Имя создателя */}
                <div className={styles.formGroup}>
                    <label htmlFor="event_creator_name">Имя организатора *</label>
                    <input type="text" id="event_creator_name" name="event_creator_name" value={formData.event_creator_name} onChange={handleChange} required disabled={loading}/>
                </div>

                 {/* Поле URL Аватарки создателя */}
                <div className={styles.formGroup}>
                    <label htmlFor="event_creator_image">URL/Base64 изображения организатора</label>
                     {/* Если нужен File Input для Base64, замени этот input */}
                    <input type="text" id="event_creator_image" name="event_creator_image" value={formData.event_creator_image} onChange={handleChange} placeholder="https://... или data:image/..." disabled={loading}/>
                </div>

                {/* Поле Контактный телефон */}
                <div className={styles.formGroup}>
                    <label htmlFor="contact_phone">Контактный телефон</label>
                    <input type="tel" id="contact_phone" name="contact_phone" value={formData.contact_phone} onChange={handleChange} disabled={loading}/>
                </div>

                {/* Поле Контактный Email */}
                <div className={styles.formGroup}>
                    <label htmlFor="contact_email">Контактный Email</label>
                    <input type="email" id="contact_email" name="contact_email" value={formData.contact_email} onChange={handleChange} disabled={loading}/>
                </div>

                {/* --- ДОБАВЛЕНО ПОЛЕ СТАТУСА МОДЕРАЦИИ (только в режиме редактирования) --- */}
                {isEditMode && (
                    <div className={styles.formGroup}>
                         <label htmlFor="is_moderate" className={styles.checkboxLabel}>
                             <input
                                type="checkbox"
                                id="is_moderate"
                                name="is_moderate"
                                checked={formData.is_moderate}
                                onChange={handleChange}
                                disabled={loading}
                             />
                             Одобрено (is_moderate)
                         </label>
                    </div>
                )}
                {/* --- КОНЕЦ ПОЛЯ СТАТУСА --- */}


                {/* Кнопки управления */}
                <div className={styles.formActions}>
                     <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Создать событие')}
                    </button>
                    <Link to="/admin/events" className={styles.cancelButton}>
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AdminEventFormPage;