// src/components/LessonSnippet/LessonSnippet.jsx
import React from 'react';
import styles from './LessonSnippet.module.css';

const LessonSnippet = ({ lesson }) => {
  if (!lesson) {
    return null; // Не рендерим ничего, если нет данных о занятии
  }

  // Извлекаем данные из объекта lesson (имена ключей должны соответствовать вашему API)
  const time = lesson['Время'] || 'N/A';
  const subject = lesson['Предмет'] || 'N/A';
  const lessonType = lesson['Тип занятия'] || '';
  const teacher = lesson['Преподаватель'] || '';
  const classroom = lesson['Аудитория'] || '';

  return (
    <div className={styles.snippet}>
      <div className={styles.timeSubject}>
        <span className={styles.time}>{time}</span>
        <span className={styles.subject}>{subject}</span>
        {lessonType && <span className={styles.lessonType}>({lessonType})</span>}
      </div>
      {teacher && <div className={styles.teacher}>Преп: {teacher}</div>}
      {classroom && <div className={styles.classroom}>Ауд: {classroom}</div>}
    </div>
  );
};

export default LessonSnippet;