import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { getAllImportantLinksAdmin, deleteImportantLinkAdmin } from '../eventAdminService'; // Путь к сервису
import styles from '../AdminEvents.module.css'; // Используем общие стили админки

const AdminLinksListPage = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLinks = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getAllImportantLinksAdmin(token);
            setLinks(data || []);
        } catch (err) {
            console.error("Ошибка загрузки ссылок:", err);
            setError(err.message || "Не удалось загрузить список ссылок.");
            setLinks([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    const handleDelete = async (linkId, linkText) => {
        if (!token) return;
        if (window.confirm(`Вы уверены, что хотите удалить ссылку "${linkText}" (ID: ${linkId})?`)) {
            setLoading(true); // Можно использовать отдельный isDeleting стейт
            try {
                await deleteImportantLinkAdmin(linkId, token);
                await fetchLinks(); // Перезагружаем список
            } catch (err) {
                console.error("Ошибка удаления ссылки:", err);
                setError(err.message || "Не удалось удалить ссылку.");
                setLoading(false);
            }
            // setLoading(false); // Если используется общий loading
        }
    };

    // --- Рендеринг ---
    if (loading && links.length === 0) {
        return <div className={styles.statusMessage}>Загрузка ссылок...</div>;
    }

    if (error) {
        return <div className={`${styles.statusMessage} ${styles.error}`}>Ошибка: {error}</div>;
    }

    return (
        <div className={styles.adminPageContainer}>
            <h1 className={styles.adminPageTitle}>Управление Важными Ссылками</h1>

            <Link to="/admin/links/new" className={styles.createButton}>
                + Создать новую ссылку
            </Link>

            {links.length === 0 && !loading ? (
                <div className={styles.statusMessage}>Ссылки не найдены.</div>
            ) : (
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Иконка</th>
                            <th>Текст ссылки</th>
                            <th>URL</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {links.map((link) => (
                            <tr key={link.id}>
                                <td>{link.id}</td>
                                <td>
                                    {link.icon ? (
                                        <span
                                            title="Иконка SVG"
                                            className={styles.iconPreview} // Добавь стили для preview
                                            dangerouslySetInnerHTML={{ __html: link.icon }}
                                        />
                                    ) : (
                                        '-'
                                    )}
                                </td>
                                <td>{link.link_text}</td>
                                <td className={styles.urlCell}>
                                    <a href={link.link} target="_blank" rel="noopener noreferrer" title={link.link}>
                                        {link.link.length > 50 ? `${link.link.substring(0, 50)}...` : link.link}
                                    </a>
                                </td>
                                <td className={styles.actionsCell}>
                                    <Link
                                        to={`/admin/links/${link.id}/edit`}
                                        className={`${styles.actionButton} ${styles.editButton}`}
                                    >
                                        Редактировать
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(link.id, link.link_text)}
                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                        disabled={loading}
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminLinksListPage;