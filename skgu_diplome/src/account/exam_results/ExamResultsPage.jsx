// src/account/exam_results/ExamResultsPage.jsx
import React, { useState, useEffect } from 'react';
import styles from './examResults.module.css';
import { useAuth } from '../../auth/AuthProvider';
import LoadingSpinner from '../../Components/loader/LoadingSpinner';

const ExamResultsPage = () => {
    const { user } = useAuth();
    const token = user?.token;
    // Убедись, что этот URL верный (ты указал /schedule/exams_evaluations/)
    const apiUrl = `${process.env.REACT_APP_API_URL}/schedule/exams_evaluations/`;

    const [resultsData, setResultsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- ВСТАВЛЯЕМ ФУНКЦИЮ ОПРЕДЕЛЕНИЯ ЦВЕТА ---
    const getGradeColor = (grade) => {
        // Обрабатываем нечисловые значения или плейсхолдеры
        if (grade === '-' || grade === 'Н/Д' || isNaN(parseInt(grade))) {
            return null; // Используем цвет текста по умолчанию из CSS
        }
        const gradeValue = parseInt(grade, 10);

        if (gradeValue < 50) {
            return '#F44336'; // Красный (неудовлетворительно)
        } else if (gradeValue <= 74) { // 50-74 (удовлетворительно)
            return '#FF9800'; // Оранжевый/Желтый
        } else if (gradeValue <= 89) { // 75-89 (хорошо)
            return '#00DF09'; // Зеленый
        } else if (gradeValue <= 100) { // 90-100 (отлично)
            return '#3AE8FF'; // Голубой/Бирюзовый
        }
        return null; // Цвет по умолчанию для неожиданных значений (например, > 100)
    };
    // ------------------------------------------

    useEffect(() => {
        // ... твой код useEffect без изменений ...
        let isMounted = true;

        const fetchExamResults = async () => {
            console.log("ExamResults: Starting fetch...");
            setLoading(true);
            setError(null);
            setResultsData([]);

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({})
                });

                console.log(`ExamResults: Response status: ${response.status}`);

                if (!response.ok) {
                    let errorMessage = `Ошибка сети: ${response.status}`;
                    try {
                        const errorData = await response.json();
                        if (errorData && errorData.detail) {
                            errorMessage = errorData.detail;
                        }
                        if (response.status === 401) {
                            errorMessage = 'Сессия истекла или неверные учетные данные. Пожалуйста, войдите снова.';
                        }
                    } catch (jsonError) {
                        console.warn("ExamResults: Could not parse error JSON.");
                         if (response.status === 401) {
                            errorMessage = 'Сессия истекла или неверные учетные данные. Пожалуйста, войдите снова.';
                        }
                    }
                    throw new Error(errorMessage);
                }

                const rawData = await response.json();
                console.log("ExamResults: Raw data received:", rawData);

                if (rawData && Array.isArray(rawData.results)) {
                    const parsedResults = rawData.results.map((item, index) => {
                        const subjectNameWithType = Object.keys(item)[0];
                        if (!subjectNameWithType) return null;
                        const details = item[subjectNameWithType];
                        if (!details) return null;

                        return {
                            id: details['№'] || `result-${index}`,
                            subject: subjectNameWithType,
                            semester: details['Семестр'] || 'Н/Д',
                            teacher: details['Преподаватели'] || 'Н/Д',
                            date: details['Дата контроля'] || 'Н/Д',
                            gradeLetter: details['Буквенная оценка'] || 'Н/Д',
                            gradeTraditional: details['Баллы'] || 'Н/Д', // Теперь здесь баллы
                        };
                    }).filter(result => result !== null);

                    console.log("ExamResults: Parsed data:", parsedResults);
                    if (isMounted) {
                        setResultsData(parsedResults);
                    }

                } else {
                     console.warn("ExamResults: API response structure is not as expected.");
                     if (isMounted) {
                         setResultsData([]);
                     }
                }

            } catch (e) {
                console.error("ExamResults: Error caught:", e);
                if (isMounted) {
                    setError(e);
                }
            } finally {
                if (isMounted) {
                    console.log("ExamResults: Setting loading to false.");
                    setLoading(false);
                }
            }
        };

        if (token) {
            fetchExamResults();
        } else {
            setError(new Error('Токен авторизации отсутствует. Пожалуйста, войдите в систему.'));
            setLoading(false);
        }

        return () => {
            isMounted = false;
            console.log("ExamResults: Component unmounting.");
        };
    }, [apiUrl, token]);

    // --- Рендеринг состояний ---
    if (loading) {
        return <LoadingSpinner message="Загрузка результатов..." />;
    }

    if (error) {
        return (
             <div className={`${styles.examResultsPage} ${styles.page_block}`}>
                <div className={`${styles.page_content} ${styles.statusMessage}`}>
                    <p className={styles.error}>Ошибка загрузки: {error.message}</p>
                </div>
            </div>
        );
    }

    if (resultsData.length === 0) {
         return (
            <div className={`${styles.examResultsPage} ${styles.page_block}`}>
                <div className={`${styles.page_content} ${styles.statusMessage}`}>
                    <p className={styles.noResults}>Результаты экзаменов не найдены или еще не опубликованы.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.examResultsPage} ${styles.page_block}`}>
            <div className={styles.page_content}>
                <h1 className={styles.resultsHeader}>Результаты экзаменов</h1>

                <div className={styles.resultsContainerDesktop}>
                    <table className={styles.resultsTable}>
                        <thead>
                            <tr>
                                <th>Предмет</th>
                                <th>Семестр</th>
                                <th>Преподаватель</th>
                                <th>Дата</th>
                                <th>Оценка (букв.)</th>
                                <th>Баллы</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {resultsData.map((result) => (
                                <tr key={result.id}>
                                    <td>{result.subject}</td>
                                    <td>{result.semester}</td>
                                    <td>{result.teacher}</td>
                                    <td>{result.date}</td>
                                    <td>{result.gradeLetter}</td>
                                    <td>
                                        <span style={{ color: getGradeColor(result.gradeTraditional), fontWeight: 'bold' }}>
                                            {result.gradeTraditional}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={styles.resultsContainerMobile}>
                    {resultsData.map((result) => (
                        <div key={result.id} className={styles.resultCard}>
                            <h2 className={styles.cardSubject}>{result.subject}</h2>
                            <div className={styles.cardDetails}>
                                <p><strong>Семестр:</strong> {result.semester}</p>
                                <p><strong>Преподаватель:</strong> {result.teacher}</p>
                                <p><strong>Дата:</strong> {result.date}</p>
                                <p className={styles.cardGrades}>
                                   <span><strong>Баллы:</strong>{' '}
                                       <span style={{ color: getGradeColor(result.gradeTraditional), fontWeight: 'bold' }}>
                                            {result.gradeTraditional}
                                        </span>
                                   </span>
                                   <span style={{color: getGradeColor(result.gradeTraditional)}}><strong>({result.gradeLetter})</strong></span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
             {/* Футер убран */}
        </div>
    );
};

export default ExamResultsPage;