// src/components/Schedule/MobileScheduleCards.jsx
import React from 'react';

const MobileScheduleCards = ({ day, daySchedule, styles }) => {
    return (
        <div className={styles.dayScheduleMobile}>
            <h2 className={styles.dayTitleMobile}>{day}</h2>
            <div className={styles.lessonList}>
                {daySchedule.map((lesson, index) => (
                    <div key={index} className={styles.lessonCard}>
                        <div className={styles.lessonTimePara}>
                            <span className={styles.lessonPara}><strong>Пара:</strong> {lesson['Пара']}</span>
                            <span className={styles.lessonTime}>{lesson['Время']}</span>
                        </div>
                        <div className={styles.lessonDetails}>
                            <div className={styles.lessonDiscipline}><strong>Дисциплина:</strong> {lesson['Дисциплина']}</div>
                            <div className={styles.lessonType}><strong>Тип:</strong> {lesson['Тип занятия']}</div>
                            <div className={styles.lessonTeacher}><strong>Преподаватель:</strong> {lesson['Преподаватель']}</div>
                            <div className={styles.lessonAuditorium}><strong>Аудитория:</strong> {lesson['Аудитория']}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MobileScheduleCards;