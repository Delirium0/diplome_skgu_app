import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { getImportantLinkByIdAdmin, createImportantLinkAdmin, updateImportantLinkAdmin } from '../eventAdminService'; // Путь к сервису
import styles from '../AdminEvents.module.css'; // Используем общие стили админки

// Утилита для конвертации файла в Base64
const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
            resolve(fileReader.result); // Возвращает строку base64 с префиксом data:image/...
        };
        fileReader.onerror = (error) => {
            reject(error);
        };
    });
};


const AdminLinkFormPage = () => {
    const { linkId } = useParams();
    const isEditMode = Boolean(linkId);
    const navigate = useNavigate();
    const { user } = useAuth();
    const token = user?.token;

    // Состояние формы
    const [formData, setFormData] = useState({
        link: '',
        link_text: '',
        icon: null, // Будет хранить строку base64 или null
    });
    const [iconPreview, setIconPreview] = useState(null); // Для отображения превью
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Загрузка данных для редактирования
    useEffect(() => {
        if (isEditMode && linkId && token) {
            setLoading(true);
            setError(null);
            getImportantLinkByIdAdmin(linkId, token)
                .then(data => {
                    setFormData({
                        link: data.link || '',
                        link_text: data.link_text || '',
                        icon: data.icon || null, // Сохраняем base64 из API
                    });
                    setIconPreview(data.icon || null); // Устанавливаем превью
                })
                .catch(err => {
                    console.error("Ошибка загрузки ссылки для редактирования:", err);
                    setError(err.message || "Не удалось загрузить данные ссылки.");
                })
                .finally(() => setLoading(false));
        }
    }, [isEditMode, linkId, token]);

    // Обработчик изменений для текстовых полей
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null); // Сбрасываем ошибку при изменении
    };

    // Обработчик изменения файла иконки
    const handleIconChange = async (e) => {
         setError(null);
         const file = e.target.files[0];
         if (file) {
             if (!file.type.startsWith('image/')) {
                 setError("Пожалуйста, выберите файл изображения (png, jpg, svg и т.д.).");
                 setIconPreview(formData.icon); // Возвращаем старое превью, если было
                 e.target.value = null; // Очищаем input file
                 return;
             }
             try {
                 const base64 = await convertToBase64(file);
                 setFormData(prev => ({ ...prev, icon: base64 }));
                 setIconPreview(base64);
             } catch (err) {
                 console.error("Ошибка конвертации иконки в base64:", err);
                 setError("Не удалось обработать файл иконки.");
                 setIconPreview(formData.icon); // Возвращаем старое превью
                 e.target.value = null;
             }
         } else {
             // Если файл не выбран (например, отменили выбор),
             // оставляем текущее значение formData.icon (оно может быть от редактирования)
             // Но можно и сбросить, если логика требует:
             // setFormData(prev => ({ ...prev, icon: null }));
             // setIconPreview(null);
         }
    };

    // Функция для удаления иконки
    const removeIcon = () => {
        setFormData(prev => ({ ...prev, icon: null }));
        setIconPreview(null);
        // Очищаем значение input file, если он есть
        const fileInput = document.getElementById('icon');
        if (fileInput) {
            fileInput.value = null;
        }
    };

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setError("Отсутствует токен авторизации.");
            return;
        }
        if (!formData.link || !formData.link_text) {
             setError("Поля 'URL ссылки' и 'Текст ссылки' обязательны.");
             return;
        }

        setLoading(true);
        setError(null);

        // Данные для отправки уже содержат base64 или null в formData.icon
        const dataToSend = {
            link: formData.link,
            link_text: formData.link_text,
            icon: formData.icon,
        };

        try {
            if (isEditMode) {
                await updateImportantLinkAdmin(linkId, dataToSend, token);
                alert('Ссылка успешно обновлена!');
            } else {
                await createImportantLinkAdmin(dataToSend, token);
                alert('Ссылка успешно создана!');
            }
            navigate('/admin/links'); // Возвращаемся к списку
        } catch (err) {
            console.error("Ошибка сохранения ссылки:", err);
            setError(err.message || "Не удалось сохранить ссылку.");
        } finally {
            setLoading(false);
        }
    };

    // --- Рендеринг ---
     if (loading && isEditMode) {
        return <div className={styles.statusMessage}>Загрузка данных ссылки...</div>;
    }

    return (
        <div className={styles.adminPageContainer}>
            <h1 className={styles.adminPageTitle}>
                {isEditMode ? `Редактировать ссылку (ID: ${linkId})` : 'Создать новую ссылку'}
            </h1>

            <form onSubmit={handleSubmit} className={styles.adminForm}>
                {/* URL Ссылки */}
                <div className={styles.formGroup}>
                    <label htmlFor="link">URL ссылки *</label>
                    <input
                        type="url" // Используем тип url для базовой валидации
                        id="link"
                        name="link"
                        value={formData.link}
                        onChange={handleChange}
                        required
                        placeholder="https://example.com"
                        disabled={loading}
                    />
                </div>

                 {/* Текст ссылки */}
                <div className={styles.formGroup}>
                    <label htmlFor="link_text">Текст ссылки *</label>
                    <input
                        type="text"
                        id="link_text"
                        name="link_text"
                        value={formData.link_text}
                        onChange={handleChange}
                        required
                        placeholder="Например, 'Официальный сайт'"
                        disabled={loading}
                    />
                </div>

                {/* Иконка (файл) */}
                <div className={styles.formGroup}>
                    <label htmlFor="icon">Иконка (необязательно, .png, .jpg, .svg)</label>
                    <input
                        type="file"
                        id="icon"
                        name="icon"
                        accept="image/*" // Принимаем любые изображения
                        onChange={handleIconChange}
                        disabled={loading}
                    />
                     {/* Превью иконки */}
                    {iconPreview && (
                        <div className={styles.iconPreviewContainer}>
                            <p>Превью:</p>
                            <img src={iconPreview} alt="Превью иконки" className={styles.iconPreviewImage} />
                             <button type="button" onClick={removeIcon} className={styles.removeIconButton} disabled={loading}>
                                Удалить иконку
                            </button>
                        </div>
                    )}
                </div>


                {/* Сообщение об ошибке */}
                {error && <p className={styles.formError}>{error}</p>}

                {/* Кнопки управления */}
                <div className={styles.formActions}>
                     <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Сохранение...' : (isEditMode ? 'Сохранить изменения' : 'Создать ссылку')}
                    </button>
                    <Link to="/admin/links" className={styles.cancelButton}>
                        Отмена
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AdminLinkFormPage;