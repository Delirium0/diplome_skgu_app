import React, { useState } from 'react';
import styles from './EventsCreate.module.css';
import { useAuth } from '../../auth/AuthProvider';
import Footer from '../../Components/Footer/Footer';
const Events_сreate = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [eventData, setEventData] = useState({
        image_background: '', // Будет хранить base64
        event_creator_name: '',
        event_creator_image: '', // Будет хранить base64 (опционально)
        event_rating: '',
        event_time: '',
        event_name: '',
        event_description: '',
        contact_phone: '',
        contact_email: '',
        address: '',

    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    const handleChange = async (e) => {
        if (e.target.name === 'image_background' || e.target.name === 'event_creator_image') {
            if (e.target.files && e.target.files[0]) {
                try {
                    const base64 = await convertToBase64(e.target.files[0]);
                    setEventData({ ...eventData, [e.target.name]: base64 });
                } catch (error) {
                    console.error("Ошибка конвертации изображения в base64:", error);
                    setErrorMessage("Ошибка при загрузке изображения.");
                }
            } else {
                setEventData({ ...eventData, [e.target.name]: '' }); // Очистить, если файл не выбран
            }
        } else {
            setEventData({ ...eventData, [e.target.name]: e.target.value });
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        if (!eventData.event_name || !eventData.event_creator_name || !eventData.image_background || !eventData.event_time) {
            setErrorMessage("Пожалуйста, заполните обязательные поля: Название события, Имя создателя, Фоновое изображение и Время.");
            setLoading(false);
            return;
        }

        try {
            const apiUrl = `${process.env.REACT_APP_API_URL}/events/`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...eventData,
                    event_rating: eventData.event_rating ? parseFloat(eventData.event_rating) : null,
                    event_time: new Date(eventData.event_time).toISOString(),
                }),
            });

            if (!response.ok) {
                let errorDetail = "Ошибка создания события";
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.detail) {
                        errorDetail = errorData.detail;
                    }
                } catch (jsonError) {}
                throw new Error(`${errorDetail} (HTTP status ${response.status})`);
            }

            setSuccessMessage('Событие успешно создано!');
            setEventData({
                image_background: '',
                event_creator_name: '',
                event_creator_image: '',
                event_rating: '',
                event_time: '',
                event_name: '',
                event_description: '',
                contact_phone: '',
                contact_email: '',
                address: '',

            });
        } catch (error) {
            setErrorMessage(`Ошибка при создании события: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${styles.eventsCreatePage} ${styles.page_block}`}>
            <div className={styles.page_content}>
                <h1 className={styles.eventsCreateHeader}>Создать новое событие</h1>

                {errorMessage && <div className={styles.error}>{errorMessage}</div>}
                {successMessage && <div className={styles.success}>{successMessage}</div>}

                <div className={styles.eventsCreateContainer}>
                    <form onSubmit={handleSubmit} className={styles.eventForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="event_name" className={styles.formLabel}>Название события*:</label>
                            <input
                                type="text"
                                id="event_name"
                                name="event_name"
                                value={eventData.event_name}
                                onChange={handleChange}
                                className={styles.formInput}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="event_creator_name" className={styles.formLabel}>Имя создателя*:</label>
                            <input
                                type="text"
                                id="event_creator_name"
                                name="event_creator_name"
                                value={eventData.event_creator_name}
                                onChange={handleChange}
                                className={styles.formInput}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="image_background" className={styles.formLabel}>Фоновое изображение*:</label>
                            <input
                                type="file" // Изменено на type="file"
                                id="image_background"
                                name="image_background"
                                accept="image/*" // Принимать только изображения
                                onChange={handleChange}
                                className={styles.formInput}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="event_creator_image" className={styles.formLabel}>Изображение создателя:</label>
                            <input
                                type="file" // Изменено на type="file"
                                id="event_creator_image"
                                name="event_creator_image"
                                accept="image/*" // Принимать только изображения
                                onChange={handleChange}
                                className={styles.formInput}
                            />
                        </div>


                        <div className={styles.formGroup}>
                            <label htmlFor="event_time" className={styles.formLabel}>Время события*:</label>
                            <input
                                type="datetime-local"
                                id="event_time"
                                name="event_time"
                                value={eventData.event_time}
                                onChange={handleChange}
                                className={styles.formInput}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="event_description" className={styles.formLabel}>Описание события:</label>
                            <textarea
                                id="event_description"
                                name="event_description"
                                value={eventData.event_description}
                                onChange={handleChange}
                                className={styles.formTextarea}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="contact_phone" className={styles.formLabel}>Контактный телефон:</label>
                            <input
                                type="tel"
                                id="contact_phone"
                                name="contact_phone"
                                value={eventData.contact_phone}
                                onChange={handleChange}
                                className={styles.formInput}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="contact_email" className={styles.formLabel}>Контактный email:</label>
                            <input
                                type="email"
                                id="contact_email"
                                name="contact_email"
                                value={eventData.contact_email}
                                onChange={handleChange}
                                className={styles.formInput}
                            />
                        </div>
                        <div className={styles.formGroup}>
                        <label htmlFor="address" className={styles.formLabel}>Адрес проведения:</label>
                        <input
                            type="text"
                            id="address"
                            name="address" // Важно: name совпадает с ключом в state
                            value={eventData.address}
                            onChange={handleChange}
                            className={styles.formInput}
                        />
                    </div>

                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Создание...' : 'Создать событие'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer></Footer>
        </div>
    );
};

export default Events_сreate;