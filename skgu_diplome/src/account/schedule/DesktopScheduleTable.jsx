// src/components/Schedule/DesktopScheduleTable.jsx
import React from 'react';

const DesktopScheduleTable = ({ day, daySchedule, styles }) => {
    return (
        <div className={styles.daySchedule}>
            <h2 className={styles.dayTitle}>{day}</h2>
            <table className={styles.scheduleTable}>
                <thead>
                    <tr>
                        <th>Пара</th>
                        <th>Время</th>
                        <th>Дисциплина</th>
                        <th>Тип</th>
                        <th>Преподаватель</th>
                        <th>Аудитория</th>
                    </tr>
                </thead>
                <tbody>
                    {daySchedule.map((lesson, index) => (
                        <tr key={index}>
                            <td>{lesson['Пара']}</td>
                            <td>{lesson['Время']}</td>
                            <td>{lesson['Дисциплина']}</td>
                            <td>{lesson['Тип занятия']}</td>
                            <td>{lesson['Преподаватель']}</td>
                            <td>{lesson['Аудитория']}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DesktopScheduleTable;