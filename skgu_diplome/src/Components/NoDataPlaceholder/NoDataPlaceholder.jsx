// src/Components/NoDataPlaceholder/NoDataPlaceholder.jsx
import React from 'react';
import styles from './NoDataPlaceholder.module.css';

// Компонент для отображения "пустого состояния"
const NoDataPlaceholder = ({
  imageSrc = '/images/no-data-illustration.svg', // Путь по умолчанию (из папки public)
  altText = 'Нет данных',
  message = 'На данный момент здесь нет данных.',
  className // Для дополнительной стилизации контейнера, если нужно
}) => {
  return (
    <div className={`${styles.placeholderContainer} ${className || ''}`}>
      <img
        src={imageSrc}
        alt={altText}
        className={styles.placeholderImage}
        // Можно добавить onError обработчик для случая, если картинка не загрузится
        onError={(e) => { e.target.style.display = 'none'; /* скрыть сломанную картинку */ }}
      />
      <p className={styles.placeholderMessage}>{message}</p>
    </div>
  );
};

// --- Если вы поместили картинку в src/assets/images ---
// 1. Импортируйте картинку:
// import defaultImage from '../../assets/images/no-data-illustration.svg';
// 2. Измените props по умолчанию:
// imageSrc = defaultImage,
// 3. В <img src={imageSrc} ... /> ничего менять не нужно.
// ---

export default NoDataPlaceholder;