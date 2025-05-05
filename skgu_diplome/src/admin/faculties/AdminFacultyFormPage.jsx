// src/admin/faculties/AdminFacultyFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
// --- Убедись, что путь к facultyAdminService правильный ---
import { getFacultyByIdAdmin, createFacultyAdmin, updateFacultyAdmin } from './facultyAdminService';
// --- Используем те же стили или создай AdminFaculties.module.css ---
import styles from '../AdminEvents.module.css';

const AdminFacultyFormPage = () => {
    const { facultyId } = useParams();
    const isEditMode = Boolean(facultyId);
    const navigate = useNavigate();
    const { user } = useAuth();
    const token = user?.token;

    // Состояние формы (соответствует FacultyBase + social_links как строка для textarea)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        history: '',
        social_links: '', // Храним JSON как строку в textarea
        building: '',
        address: '',
        dean_phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // Ошибки API
    const [formError, setFormError] = useState(null); // Ошибки валидации формы/JSON

    // Загрузка данных для редактирования
    useEffect(() => {
        if (isEditMode && facultyId && token) {
            setLoading(true);
            setError(null);
            setFormError(null);
            getFacultyByIdAdmin(facultyId, token)
                .then(data => {
                    setFormData({
                        name: data.name || '',
                        description: data.description || '',
                        history: data.history || '',
                        // Преобразуем объект social_links в строку JSON для textarea
                        social_links: data.social_links ? JSON.stringify(data.social_links, null, 2) : '', // Форматируем для читаемости
                        building: data.building || '',
                        address: data.address || '',
                        dean_phone: data.dean_phone || '',
                    });
                })
                .catch(err => {
                    console.error("Ошибка загрузки факультета для редактирования:", err);
                    setError(err.message || "Не удалось загрузить данные факультета.");
                })
                .finally(() => setLoading(false));
        }
    }, [isEditMode, facultyId, token]);

    // Обработчик изменений в полях формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // При изменении полей сбрасываем ошибки
        setError(null);
        setFormError(null);
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

        // --- Подготовка данных для отправки ---
        let dataToSend = { ...formData };
        let socialLinksObject = null;

        // Пытаемся распарсить JSON из social_links
        if (dataToSend.social_links && dataToSend.social_links.trim() !== '') {
            try {
                socialLinksObject = JSON.parse(dataToSend.social_links);
                // Проверка, что это действительно объект (а не число, строка, массив и т.п.)
                if (typeof socialLinksObject !== 'object' || socialLinksObject === null || Array.isArray(socialLinksObject)) {
                    throw new Error("Содержимое поля 'Социальные сети' должно быть корректным JSON-объектом (ключ: значение).");
                }
            } catch (jsonError) {
                setFormError("Ошибка в формате JSON для поля 'Социальные сети': " + jsonError.message);
                setLoading(false);
                return; // Прерываем отправку
            }
        }

        // Заменяем строку JSON на распарсенный объект (или null)
        dataToSend.social_links = socialLinksObject;

        // Очищаем пустые строки, чтобы отправить null (если поле Optional)
        // Pydantic Update схема сама обработает None/отсутствующие поля
        // Но можно явно установить null, если строка пустая
        Object.keys(dataToSend).forEach(key => {
            if (typeof dataToSend[key] === 'string' && dataToSend[key].trim() === '') {
                 if (key !== 'social_links') { // social_links уже обработан
                    dataToSend[key] = null;
                 }
            }
        });


        try {
            if (isEditMode) {
                // Режим редактирования (PUT)
                // Используем dataToSend, который соответствует FacultyUpdate (все поля опциональны)
                await updateFacultyAdmin(facultyId, dataToSend, token);
                alert('Факультет успешно обновлен!');
            } else {
                // Режим создания (POST)
                // Используем dataToSend, который соответствует FacultyCreate (только name обязателен)
                await createFacultyAdmin(dataToSend, token);
                alert('Факультет успешно создан!');
            }
            navigate('/admin/faculties'); // Возвращаемся к списку
        } catch (err) {
            console.error("Ошибка сохранения факультета:", err);
            setError(err.message || "Не удалось сохранить факультет.");
        } finally {
            setLoading(false);
        }
    };

    // --- Рендеринг ---
    if (loading && isEditMode) {
        return <div className={styles.statusMessage}>Загрузка данных факультета...</div>;
    }
    // Не показываем общую ошибку API, если есть ошибка формы
    if (error && !formError) {
        return <div className={`${styles.statusMessage} ${styles.error}`}>Ошибка: {error}</div>;
    }


    return (
        <div className={styles.adminPageContainer}>
            <h1 className={styles.adminPageTitle}>
                {isEditMode ? `Редактировать факультет (ID: ${facultyId})` : 'Создать новый факультет'}
            </h1>

            <form onSubmit={handleSubmit} className={styles.adminForm}>
                {/* Поле Название */}
                <div className={styles.formGroup}>
                    <label htmlFor="name">Название факультета *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>

                {/* Поле Описание */}
                <div className={styles.formGroup}>
                    <label htmlFor="description">Описание</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="5"
                        disabled={loading}
                    />
                </div>

                 {/* Поле История */}
                <div className={styles.formGroup}>
                    <label htmlFor="history">История</label>
                    <textarea
                        id="history"
                        name="history"
                        value={formData.history}
                        onChange={handleChange}
                        rows="5"
                        disabled={loading}
                    />
                </div>

                 {/* Поле Социальные сети (JSON) */}
                <div className={styles.formGroup}>
                    <label htmlFor="social_links">Социальные сети (JSON)</label>
                    <textarea
                        id="social_links"
                        name="social_links"
                        value={formData.social_links}
                        onChange={handleChange}
                        rows="5"
                        placeholder={'{\n  "vk": "https://vk.com/...",\n  "telegram": "https://t.me/..."\n}'}
                        disabled={loading}
                    />
                    <small>Введите ссылки в формате JSON объекта {"{ \"ключ\": \"значение\" }"}.</small>
                     {/* Показываем ошибку парсинга JSON здесь */}
                    {formError && formError.includes("JSON") && <p className={styles.formError}>{formError}</p>}
                </div>

                {/* Поле Корпус */}
                <div className={styles.formGroup}>
                    <label htmlFor="building">Корпус</label>
                    <input
                        type="text"
                        id="building"
                        name="building"
                        value={formData.building}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                 {/* Поле Адрес */}
                <div className={styles.formGroup}>
                    <label htmlFor="address">Адрес</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                 {/* Поле Телефон деканата */}
                <div className={styles.formGroup}>
                    <label htmlFor="dean_phone">Телефон деканата</label>
                    <input
                        type="text"
                        id="dean_phone"
                        name="dean_phone"
                        value={formData.dean_phone}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>


                {/* Общее сообщение об ошибке API (если нет ошибки JSON) */}
                {error && !formError && <p className={styles.formError}>{error}</p>}
                {/* Ошибка обязательных полей (если не JSON ошибка) */}
                 {formError && !formError.includes("JSON") && <p className={styles.formError}>{formError}</p>}


                {/* Кнопки управления */}
                <div className={styles.formActions}>
                     <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Создать факультет')}
                    </button>
                    <Link to="/admin/faculties" className={styles.cancelButton}>
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AdminFacultyFormPage;