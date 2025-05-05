// src/admin/faculties/AdminFacultiesListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { getAllFacultiesAdmin, deleteFacultyAdmin } from './facultyAdminService';
import styles from '../AdminEvents.module.css';

const AdminFacultiesListPage = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFaculties = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            // Используем API функцию для получения списка факультетов
            const data = await getAllFacultiesAdmin(token);
            setFaculties(data || []);
        } catch (err) {
            console.error("Ошибка загрузки факультетов:", err);
            setError(err.message || "Не удалось загрузить список факультетов.");
            setFaculties([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchFaculties();
    }, [fetchFaculties]);

    const handleDelete = async (facultyId, facultyName) => {
        if (!token) return;
        if (window.confirm(`Вы уверены, что хотите удалить факультет "${facultyName}" (ID: ${facultyId})? Все связанные кафедры и программы будут также удалены!`)) {
            // Можно добавить отдельный state isDeleting для блокировки только кнопки удаления
            setLoading(true);
            try {
                await deleteFacultyAdmin(facultyId, token);
                await fetchFaculties(); // Перезагружаем список
            } catch (err) {
                console.error("Ошибка удаления факультета:", err);
                setError(err.message || "Не удалось удалить факультет.");
                setLoading(false); // Сбросить, если не перезагружаем список сразу
            }
            // setLoading(false); // Если используется общий loading
        }
    };

    // --- Рендеринг ---
    if (loading && faculties.length === 0) {
        return <div className={styles.statusMessage}>Загрузка факультетов...</div>;
    }

    if (error) {
        return <div className={`${styles.statusMessage} ${styles.error}`}>Ошибка: {error}</div>;
    }

    return (
        <div className={styles.adminPageContainer}>
            <h1 className={styles.adminPageTitle}>Управление Факультетами</h1>

            <Link to="/admin/faculties/new" className={styles.createButton}>
                + Создать новый факультет
            </Link>

            {faculties.length === 0 && !loading ? (
                <div className={styles.statusMessage}>Факультеты не найдены.</div>
            ) : (
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            {/* Можно добавить кол-во кафедр/программ, если API будет их возвращать в списке */}
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faculties.map((faculty) => (
                            <tr key={faculty.id}>
                                <td>{faculty.id}</td>
                                <td>{faculty.name}</td>
                                <td className={styles.actionsCell}>
                                    <Link
                                        to={`/admin/faculties/${faculty.id}/edit`}
                                        className={`${styles.actionButton} ${styles.editButton}`}
                                    >
                                        Редактировать
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(faculty.id, faculty.name)}
                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                        disabled={loading} // Блокируем кнопку во время общего лоадинга
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

export default AdminFacultiesListPage;