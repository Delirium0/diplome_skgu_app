import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cl from './Account.module.css';
import Subject_container from './Subject_container';
import Footer from '../Components/Footer/Footer';
import { useAuth } from '../auth/AuthProvider';
import LoadingSpinner from '../Components/loader/LoadingSpinner';
const Subject_page = () => {
    const [subjectData, setSubjectData] = useState(null); // Изначально null
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Для реальных ошибок
    // Добавляем новое состояние для случая "Нет данных" (опционально, можно обойтись subjectData === [])
    // const [noDataAvailable, setNoDataAvailable] = useState(false);
    const { user } = useAuth();
    const token = user?.token;

    useEffect(() => {
        const fetchSubjectData = async () => {
            setError(null); // Сброс ошибки перед запросом
            setSubjectData(null); // Сброс данных
            // setNoDataAvailable(false); // Сброс флага "нет данных"
            try {
                const response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/schedule/evaluations/`,
                    {},
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                // Если бэкенд вернет пустой массив при успехе, это сработает
                setSubjectData(response.data);

            } catch (err) {
                if (err.response) {
                    // Обрабатываем ошибки с ответом от сервера
                    if (err.response.status === 401) {
                        setError(new Error('Необходимо авторизоваться или ваша сессия истекла.'));
                    } else if (err.response.status === 400) {
                        // *** Ключевое изменение: предполагаем, что 400 отсюда = "Нет данных" ***
                        console.warn("Получен статус 400 от API оценок, предполагаем 'Нет данных'.", err.response.data);
                        setSubjectData([]); // Устанавливаем пустой массив, чтобы сработала логика ниже
                        setError(null); // Это НЕ техническая ошибка, сбрасываем error state
                        // setNoDataAvailable(true); // Устанавливаем флаг (альтернатива)
                    } else {
                        // Другие HTTP ошибки (500, 404 и т.д.)
                        console.error("Ошибка HTTP:", err.response.status, err.response.data);
                        setError(new Error(`Ошибка сервера (${err.response.status}). Не удалось загрузить данные.`));
                    }
                } else if (err.request) {
                    // Ошибка сети (запрос был сделан, но ответ не пришел)
                    console.error("Сетевая ошибка:", err.request);
                    setError(new Error('Ошибка сети. Проверьте подключение и попробуйте снова.'));
                } else {
                    // Другие ошибки (ошибка в настройке запроса и т.д.)
                    console.error("Ошибка при настройке запроса:", err.message);
                    setError(new Error('Произошла внутренняя ошибка приложения.'));
                }
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            setLoading(true);
            fetchSubjectData();
        } else {
            setError(new Error('Токен авторизации отсутствует. Пожалуйста, войдите в систему.'));
            setLoading(false);
        }
    }, [token]);

    // --- Рендеринг ---

    if (loading) {
        return <LoadingSpinner />;
    }

    // Сначала показываем реальные ошибки
    if (error) {
        return (
            <div className={cl.account_block}>
               <div className={cl.errorMessage}> {/* Используйте ваш класс для ошибок */}
                 Ошибка: {error.message}
               </div>
               <Footer/>
            </div>
        );
    }

    // Теперь проверяем на отсутствие данных (null ИЛИ пустой массив)
    // Это сработает и если API вернул 200 OK с [], и если вернул 400, который мы обработали как []
    if (!subjectData || (Array.isArray(subjectData) && subjectData.length === 0)) {
         return (
            <div className={cl.account_block}>
               <div className={cl.noDataMessage}> {/* Используйте ваш класс для сообщений */}
                  Нет данных об оценках для отображения. Возможно, учебный год еще не начался или оценки не выставлены.
               </div>
               <Footer/>
            </div>
        );
    }

    // Если дошли сюда, значит есть данные для отображения
    return (
        <div className={cl.account_block}>
            {subjectData.map(subject_info => (
                <Subject_container key={subject_info.subject_name} currentSubjectData={subject_info} />
            ))}
            <Footer />
        </div>
    );
};

export default Subject_page;