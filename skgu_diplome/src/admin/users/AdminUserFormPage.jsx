import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { getUserByIdAdmin, createUserAdmin, updateUserAdmin } from '../eventAdminService'; // Путь к сервису
import styles from '../AdminEvents.module.css'; // Общие стили админки

const AdminUserFormPage = () => {
    const { userId } = useParams();
    const isEditMode = Boolean(userId);
    const navigate = useNavigate();
    const { user: currentUser } = useAuth(); // Текущий админ
    const token = currentUser?.token;

    // Состояние формы
    const [formData, setFormData] = useState({
        login: '',
        password: '', // Пароль вводим только при создании или если хотим сменить
        role: 'user', // Роль по умолчанию
        student_id: '',
        semester: '',
        year: '',
        cmbPeriod: '', // Дата в формате YYYY-MM-DD
        group_id: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Загрузка данных для редактирования
    useEffect(() => {
        if (isEditMode && userId && token) {
            setLoading(true);
            setError(null);
            getUserByIdAdmin(userId, token)
                .then(data => {
                    setFormData({
                        login: data.login || '',
                        password: '', // Пароль НЕ загружаем для редактирования
                        role: data.role || 'user',
                        student_id: data.student_id ?? '', // Используем ?? для null/undefined
                        semester: data.semester ?? '',
                        year: data.year ?? '',
                        cmbPeriod: data.cmbPeriod || '', // Дата приходит как строка
                        group_id: data.group_id ?? '',
                    });
                })
                .catch(err => {
                    console.error("Ошибка загрузки пользователя для редактирования:", err);
                    setError(err.message || "Не удалось загрузить данные пользователя.");
                })
                .finally(() => setLoading(false));
        }
    }, [isEditMode, userId, token]);

    // Обработчик изменений
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
             ...prev,
             [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
             // Для числовых полей сохраняем пустую строку или число
            }));
        setError(null); // Сбрасываем ошибку при изменении
    };

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setError("Отсутствует токен авторизации.");
            return;
        }

        // Валидация
        if (!formData.login || !formData.role) {
            setError("Поля 'Логин' и 'Роль' обязательны.");
            return;
        }
        if (!isEditMode && !formData.password) {
             setError("Поле 'Пароль' обязательно при создании нового пользователя.");
             return;
        }

        setLoading(true);
        setError(null);

        // Подготовка данных для отправки
        const dataToSend = { ...formData };

        // Преобразуем пустые строки числовых полей в null перед отправкой
        // Или можно сделать это на бэкенде при валидации Pydantic
        ['student_id', 'semester', 'year', 'group_id'].forEach(key => {
            if (dataToSend[key] === '') {
                dataToSend[key] = null;
            }
        });
         // Дата тоже может быть пустой
        if (dataToSend.cmbPeriod === '') {
            dataToSend.cmbPeriod = null;
        }

        // Если пароль не введен при редактировании, не отправляем его
        if (isEditMode && !dataToSend.password) {
            delete dataToSend.password; // Удаляем ключ password из объекта
            // Также можно удалить password_no_hash, если он есть в dataToSend
            // delete dataToSend.password_no_hash;
        }

        try {
            if (isEditMode) {
                await updateUserAdmin(userId, dataToSend, token);
                alert('Пользователь успешно обновлен!'); // Используем alert
            } else {
                await createUserAdmin(dataToSend, token);
                 alert('Пользователь успешно создан!'); // Используем alert
            }
            navigate('/admin/users'); // Возвращаемся к списку
        } catch (err) {
            console.error("Ошибка сохранения пользователя:", err);
            const errorMessage = err.message || "Не удалось сохранить пользователя.";
            setError(errorMessage);
            alert(`Ошибка: ${errorMessage}`); // Используем alert для ошибки
        } finally {
            setLoading(false);
        }
    };

    // --- Рендеринг ---
     if (loading && isEditMode) {
        return <div className={styles.statusMessage}>Загрузка данных пользователя...</div>;
    }

    return (
        <div className={styles.adminPageContainer}>
            <h1 className={styles.adminPageTitle}>
                {isEditMode ? `Редактировать пользователя (ID: ${userId})` : 'Создать нового пользователя'}
            </h1>

             {/* Сообщение об ошибке */}
             {error && <p className={styles.formError} style={{marginBottom: '15px'}}>{error}</p>}

            <form onSubmit={handleSubmit} className={styles.adminForm}>
                {/* Логин */}
                <div className={styles.formGroup}>
                    <label htmlFor="login">Логин *</label>
                    <input
                        type="text"
                        id="login"
                        name="login"
                        value={formData.login}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>

                 {/* Пароль */}
                <div className={styles.formGroup}>
                    <label htmlFor="password">Пароль {isEditMode ? '(оставьте пустым, чтобы не менять)' : '*'}</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!isEditMode} // Обязателен только при создании
                        disabled={loading}
                        autoComplete="new-password" // Помогает избежать автозаполнения
                    />
                </div>

                 {/* Роль */}
                <div className={styles.formGroup}>
                    <label htmlFor="role">Роль *</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    >
                        <option value="user">User</option>
                        <option value="teacher">Teacher</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {/* Student ID */}
                 <div className={styles.formGroup}>
                    <label htmlFor="student_id">Student ID</label>
                    <input
                        type="number"
                        id="student_id"
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                 {/* Semester */}
                 <div className={styles.formGroup}>
                    <label htmlFor="semester">Semester</label>
                    <input
                        type="number"
                        id="semester"
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                 {/* Year */}
                 <div className={styles.formGroup}>
                    <label htmlFor="year">Year</label>
                    <input
                        type="number"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        disabled={loading}
                        min="1900" // Примерные ограничения
                        max="2100"
                    />
                </div>

                 {/* cmbPeriod (Date) */}
                 <div className={styles.formGroup}>
                    <label htmlFor="cmbPeriod">cmbPeriod (Дата)</label>
                    <input
                        type="date"
                        id="cmbPeriod"
                        name="cmbPeriod"
                        value={formData.cmbPeriod}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                 {/* Group ID */}
                 <div className={styles.formGroup}>
                    <label htmlFor="group_id">Group ID</label>
                    <input
                        type="number"
                        id="group_id"
                        name="group_id"
                        value={formData.group_id}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>


                {/* Кнопки управления */}
                <div className={styles.formActions}>
                     <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Создать пользователя')}
                    </button>
                    <Link to="/admin/users" className={styles.cancelButton}>
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AdminUserFormPage;