// src/faculties/FacultyPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider'; // Импортируем useAuth
import styles from './FacultyPage.module.css';
import Footer from '../Components/Footer/Footer'; // Если нужен внизу страницы

const FacultyPage = () => {
  const { facultyId } = useParams(); // Получаем ID из URL
  const { user } = useAuth(); // Используем хук useAuth для получения информации о пользователе
  const token = user?.token; // Получаем токен пользователя

  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacultyData = async () => {
      setLoading(true);
      setError(null);
      setFacultyData(null);

      // 1. Проверка наличия facultyId (важно для построения URL)
      if (!facultyId) {
        setError(new Error("ID факультета не указан в URL."));
        setLoading(false);
        return;
      }

      // 2. Определение URL API
      const apiUrl = `${process.env.REACT_APP_API_URL}/faculties/${facultyId}`;

      // 3. Подготовка заголовков
      const headers = {
        'Content-Type': 'application/json', // Оставляем для консистентности, хотя для GET не всегда обязательно
      };
      // Добавляем заголовок Authorization, *только если* токен существует
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log("Используется токен для запроса факультета."); // Для дебага
      } else {
        console.log("Запрос факультета выполняется без токена."); // Для дебага
      }

      try {
        // 4. Выполнение fetch запроса (метод GET по умолчанию)
        const response = await fetch(apiUrl, {
          method: 'GET', // Явно указываем GET для ясности
          headers: headers,
          // body для GET запроса не нужен
        });

        // 5. Обработка ответа
        if (!response.ok) {
          // Обрабатываем разные статусы ошибок
          if (response.status === 401) {
             // Хотя для публичных данных это может не случиться, но для консистентности
            setError(new Error('Ошибка авторизации при запросе данных факультета.'));
          } else if (response.status === 404) {
            setError(new Error('Факультет с таким ID не найден.'));
          } else {
            // Общая ошибка HTTP
            throw new Error(`Ошибка HTTP: ${response.status}`);
          }
          // В случае ошибки, данные не устанавливаем
          setFacultyData(null);
        } else {
          // Если ответ успешный (response.ok === true)
          const data = await response.json();
          setFacultyData(data); // Устанавливаем полученные данные
        }
      } catch (err) {
        // Обработка ошибок сети или других исключений
        console.error("Ошибка при загрузке данных факультета:", err);
        // Устанавливаем ошибку в состояние, если это не HTTP ошибка, обработанная выше
        if (!error) { // Устанавливаем ошибку, только если она еще не была установлена из response
             setError(err);
        }
        setFacultyData(null);
      } finally {
        // В любом случае (успех или ошибка) завершаем загрузку
        setLoading(false);
      }
    };

    // Вызываем функцию загрузки данных при монтировании или изменении зависимостей
    fetchFacultyData();

    // Зависимости: facultyId и token.
    // Если facultyId изменится (маловероятно без перезагрузки, но возможно),
    // или если пользователь залогинится/разлогинится (token изменится),
    // useEffect выполнится заново.
  }, [facultyId, token]);

  // --- Рендеринг компонента (остается без изменений) ---
  if (loading) {
    return <div className={styles.statusMessage}>Загрузка данных факультета...</div>;
  }

  if (error) {
    return <div className={`${styles.statusMessage} ${styles.error}`}>Ошибка: {error.message}</div>;
  }

  if (!facultyData) {
    // Это состояние может возникнуть, если была ошибка 404 или другая, но error message уже показан выше
    // Или если API вернул пустой успешный ответ (что странно)
    return <div className={styles.statusMessage}>Данные факультета не найдены или не удалось загрузить.</div>;
  }

  // Отображение данных факультета...
  return (
    <div className={styles.facultyPage}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.facultyName}>{facultyData.name}</h1>

        {/* Описание */}
        {facultyData.description && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Описание</h2>
            <div className={styles.textBlock} dangerouslySetInnerHTML={{ __html: facultyData.description }} />
          </section>
        )}

        {/* История */}
        {facultyData.history && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>История</h2>
              <div className={styles.textBlock} dangerouslySetInnerHTML={{ __html: facultyData.history }} />
            </section>
        )}

        {/* Социальные сети */}
        {facultyData.social_links && Object.keys(facultyData.social_links).length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Факультет в социальных сетях</h2>
            <ul className={styles.linkList}>
              {Object.entries(facultyData.social_links).map(([network, url]) => (
                <li key={network}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                    {network.charAt(0).toUpperCase() + network.slice(1)}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Контактная информация */}
        {(facultyData.building || facultyData.address || facultyData.dean_phone) && (
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Контактная информация</h2>
                {facultyData.building && <p><strong>Учебный корпус:</strong> {facultyData.building}</p>}
                {facultyData.address && <p><strong>Адрес:</strong> {facultyData.address}</p>}
                {facultyData.dean_phone && <p><strong>Телефон деканата:</strong> {facultyData.dean_phone}</p>}
            </section>
        )}

        {/* Кафедры */}
        {facultyData.departments && facultyData.departments.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Кафедры</h2>
            <ul className={styles.linkList}>
              {facultyData.departments.map(dept => (
                <li key={dept.id}>
                  {dept.name}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Образовательные программы */}
        {facultyData.educational_programs && facultyData.educational_programs.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Образовательные программы</h2>
            {['Бакалавриат', 'Магистратура', 'Докторантура'].map(level => {
              const programsInLevel = facultyData.educational_programs.filter(prog => prog.level === level);
              if (programsInLevel.length === 0) return null;
              return (
                <div key={level}>
                  <h3 className={styles.subSectionTitle}>{level}:</h3>
                  <ul className={styles.linkList}>
                    {programsInLevel.map(prog => (
                      <li key={prog.id}>
                        {prog.code} {prog.name}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        )}

      </div>
      {/* <Footer /> */}{/* Раскомментируй, если Footer не часть PageLayout */}
    </div>
  );
};

export default FacultyPage;