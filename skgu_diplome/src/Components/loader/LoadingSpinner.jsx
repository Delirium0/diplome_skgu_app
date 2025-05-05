// src/Components/LoadingSpinner/LoadingSpinner.jsx
import React from 'react';
import styles from './LoadingSpinner.module.css';

// Простой компонент спиннера
// Можно добавить пропсы для настройки (размер, цвет, сообщение), если нужно
const LoadingSpinner = ({ message = "Загрузка..." }) => {
  return (
    // Контейнер, который можно стилизовать для центрирования или позиционирования
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      {message && <p className={styles.loadingMessage}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;