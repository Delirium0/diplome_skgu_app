// src/feedback/FeedbackPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthProvider'; // Убедись, что путь верный
import styles from './FeedbackPage.module.css'; // Стили для этой страницы

// Компонент для отображения звезд рейтинга
const StarRating = ({ rating, setRating, hoverRating, setHoverRating, disabled }) => {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((starValue) => (
        <span
          key={starValue}
          className={`
            ${styles.star}
            ${disabled ? styles.disabled : ''}
            ${(hoverRating || rating) >= starValue ? styles.filled : styles.empty}
          `}
          onClick={() => !disabled && setRating(starValue)}
          onMouseEnter={() => !disabled && setHoverRating(starValue)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          role="button"
          aria-label={`Оценить ${starValue} из 5`}
          tabIndex={disabled ? -1 : 0} // Доступность: можно фокусироваться, если не отключено
          onKeyDown={(e) => { // Доступность: выбор через Enter/Space
            if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
              setRating(starValue);
            }
          }}
        >
          ★ {/* Символ звезды */}
        </span>
      ))}
       {/* Показываем численное значение рядом со звездами */}
      {rating > 0 && <span className={styles.ratingValue}>({rating}/5)</span>}
    </div>
  );
};


// Основной компонент страницы
const FeedbackPage = () => {
  const { user } = useAuth(); // Получаем пользователя и токен
  const token = user?.token;

  const [rating, setRating] = useState(0); // 0 - оценка не выбрана
  const [hoverRating, setHoverRating] = useState(0); // Для эффекта при наведении на звезды
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); // Состояние для показа сообщения об успехе

  const handleCommentChange = (event) => {
    setComment(event.target.value);
     // Сбрасываем сообщение об успехе/ошибке при изменении ввода
    if (success) setSuccess(false);
    if (error) setError(null);
  };

   // Функция для установки рейтинга (передается в StarRating)
  const handleSetRating = (newRating) => {
    setRating(newRating);
    // Сбрасываем сообщение об успехе/ошибке при изменении ввода
    if (success) setSuccess(false);
    if (error) setError(null);
  };


  const handleSubmit = async (event) => {
    event.preventDefault(); // Предотвращаем стандартную отправку формы

    // 1. Проверка авторизации
    if (!token) {
      setError("Пожалуйста, войдите в систему, чтобы оставить отзыв.");
      return;
    }

    // 2. Проверка выбора оценки
    if (rating === 0) {
      setError("Пожалуйста, выберите оценку (от 1 до 5 звезд).");
      return;
    }

    // 3. Начало процесса отправки
    setLoading(true);
    setError(null);
    setSuccess(false);

    // 4. Подготовка данных и URL
    const apiUrl = `${process.env.REACT_APP_API_URL}/feedbacks/`; // Убедись что URL правильный
    const feedbackData = {
      rating: rating,
      // Отправляем null, если комментарий пустой, как ожидает бэкенд (Optional[str])
      comment: comment.trim() === '' ? null : comment.trim(),
    };

    // 5. Настройка запроса
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    try {
      // 6. Отправка запроса
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(feedbackData),
      });

      // 7. Обработка ответа
      if (!response.ok) {
        let errorDetail = `Ошибка HTTP: ${response.status}`;
        try {
           // Пытаемся получить сообщение об ошибке из тела ответа (FastAPI часто кладет в 'detail')
          const errorData = await response.json();
          errorDetail = errorData.detail || errorDetail;
        } catch (e) {
          // Если тело ответа не JSON или пустое, используем статус HTTP
          console.error("Не удалось распарсить тело ошибки:", e);
        }
        throw new Error(errorDetail); // Выбрасываем ошибку для блока catch
      }

      // Успех!
      setSuccess(true);
      // Опционально: сбросить форму после успешной отправки
      setRating(0);
      setComment('');

    } catch (err) {
      console.error("Ошибка при отправке отзыва:", err);
      setError(err.message || "Не удалось отправить отзыв. Проверьте соединение или попробуйте позже.");
      setSuccess(false); // Убедимся, что сообщение об успехе скрыто
    } finally {
      // 8. Завершение процесса отправки
      setLoading(false);
    }
  };

  // Рендеринг компонента
  return (
    <div className={styles.feedbackPage}> {/* Общий контейнер страницы */}
      <div className={styles.contentWrapper}> {/* Обертка для контента как в FacultyPage */}
        <h1 className={styles.title}>Оставить отзыв о приложении</h1>

        {/* Показываем сообщение об успехе, если state success === true */}
        {success && (
          <div className={styles.successMessage}>
            ✓ Спасибо за ваш отзыв! Мы ценим ваше мнение.
          </div>
        )}

        {/* Показываем форму, только если отзыв еще не был успешно отправлен */}
        {!success && (
          <form onSubmit={handleSubmit} className={styles.feedbackForm}>
            {/* Секция для выбора рейтинга */}
            <div className={styles.formSection}>
              <label className={styles.label}>Ваша оценка:</label>
              <StarRating
                  rating={rating}
                  setRating={handleSetRating} // Передаем функцию для обновления рейтинга
                  hoverRating={hoverRating}
                  setHoverRating={setHoverRating}
                  disabled={loading} // Блокируем во время отправки
              />
            </div>

            {/* Секция для ввода комментария */}
            <div className={styles.formSection}>
              <label htmlFor="comment" className={styles.label}>Комментарий (необязательно):</label>
              <textarea
                id="comment"
                value={comment}
                onChange={handleCommentChange}
                className={styles.textArea}
                rows="6"
                placeholder="Поделитесь вашими впечатлениями, предложениями или сообщениями об ошибках..."
                disabled={loading} // Блокируем во время отправки
              />
            </div>

            {/* Показываем сообщение об ошибке, если оно есть */}
            {error && <div className={styles.errorMessage}>{error}</div>}

            {/* Кнопка отправки */}
            <button
              type="submit"
              className={styles.submitButton}
              // Кнопка неактивна, если: идет загрузка ИЛИ оценка не выбрана ИЛИ нет токена
              disabled={loading || rating === 0 || !token}
            >
              {loading ? 'Отправка...' : 'Отправить отзыв'}
            </button>

            {!token && <p className={styles.authReminder}>Необходимо войти в систему для отправки отзыва.</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;