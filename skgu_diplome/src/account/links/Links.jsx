import React, { useState, useEffect } from 'react';
// Убери импорты конкретных иконок, так как они придут из API
// import { ReactComponent as ScheduleIcon } from './../../assets/svg/arrow_down.svg';
// import { ReactComponent as DiplomaIcon } from './../../assets/svg/arrow_down.svg';
// import { ReactComponent as ResourcesIcon } from './../../assets/svg/arrow_down.svg';
import LinkComponent from './Link'; // Переименовал импорт, чтобы не конфликтовать с тегом <a> (если Link - это <a>)
import styles from './Links.module.css';
import LoadingSpinner from '../../Components/loader/LoadingSpinner'; // Предполагаем, что есть компонент загрузки

const Links = () => {
    const [linksData, setLinksData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = `${process.env.REACT_APP_API_URL}/important_links/`; // Проверь URL

    useEffect(() => {
        let isMounted = true; // Флаг для предотвращения обновления состояния после размонтирования

        const fetchLinks = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(apiUrl); // GET-запрос по умолчанию
                if (!response.ok) {
                    let errorDetail = `Ошибка сети: ${response.status}`;
                    try {
                         const errorData = await response.json();
                         if (errorData && errorData.detail) {
                             errorDetail = errorData.detail;
                         }
                    } catch(e) { /* Ошибка парсинга JSON */ }
                    throw new Error(errorDetail);
                }
                const data = await response.json();
                if (isMounted) {
                    setLinksData(data || []); // Устанавливаем данные или пустой массив
                }
            } catch (err) {
                console.error("Ошибка загрузки ссылок:", err);
                if (isMounted) {
                    setError(err.message || 'Не удалось загрузить ссылки.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchLinks();

        // Функция очистки
        return () => {
            isMounted = false;
        };
    }, [apiUrl]); // Зависимость от apiUrl (хотя он обычно не меняется)

    // --- Отображение состояний ---
    if (loading) {
        return (
             <div className={styles.main_block}>
                 <div className={styles.status_container}>
                     <LoadingSpinner message="Загрузка ссылок..." />
                 </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.main_block}>
                 <div className={`${styles.status_container} ${styles.error}`}>
                    <p>Ошибка: {error}</p>
                 </div>
            </div>
        );
    }

     if (linksData.length === 0) {
        return (
            <div className={styles.main_block}>
                <div className={styles.status_container}>
                     <p>Полезные ссылки пока не добавлены.</p>
                 </div>
            </div>
        );
    }

    // --- Отображение загруженных ссылок ---
    return (
        <div className={styles.main_block}>
            <div className={styles.account_container}>
                {linksData.map((link) => (
                    // Используем твой компонент LinkComponent или рендерим прямо здесь
                    // Вариант 1: Если LinkComponent ожидает href, text и элемент иконки
                    /*
                    <LinkComponent
                        key={link.id}
                        href={link.link}
                        text={link.link_text}
                        icon={link.icon ? (
                                <span
                                    className={styles.apiSvgIcon} // Добавь стили для размера/цвета
                                    dangerouslySetInnerHTML={{ __html: link.icon }}
                                />
                            ) : (
                                <DefaultIcon /> // Компонент иконки по умолчанию
                            )
                        }
                    />
                    */

                    // Вариант 2: Рендерим все прямо здесь, если LinkComponent не нужен или
                    // ты хочешь больше контроля (предпочтительнее для простоты примера)
                    <a
                        key={link.id}
                        href={link.link}
                        className={styles.linkItem} // Добавь стили для элемента ссылки
                        target="_blank" // Открывать в новой вкладке
                        rel="noopener noreferrer" // Безопасность для target="_blank"
                    >
                        {link.icon && (
                            <span
                                className={styles.apiSvgIcon} // Стилизуй этот класс в CSS
                                dangerouslySetInnerHTML={{ __html: link.icon }}
                            />
                        )}
                        {/* Если иконки нет, можно показать заглушку или ничего */}
                        {!link.icon && (
                             <span className={styles.defaultIconPlaceholder}>🔗</span> // Простая иконка-заглушка
                        )}
                        <span className={styles.linkText}>
                            {/* Заменяем \n на <br /> для переносов, если нужно */}
                            {link.link_text.split('\\n').map((line, i, arr) => (
                                <React.Fragment key={i}>
                                    {line}
                                    {i < arr.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </span>
                         {/* Можно добавить иконку внешней ссылки */}
                         <span className={styles.externalLinkIcon}>↗</span>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default Links;