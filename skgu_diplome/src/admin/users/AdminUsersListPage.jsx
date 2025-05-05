import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { getAllUsersAdmin, deleteUserAdmin } from '../eventAdminService'; // Путь к сервису
import styles from '../AdminEvents.module.css'; // Общие стили админки

const AdminUsersListPage = () => {
    const { user: currentUser } = useAuth(); // Переименовали, чтобы не конфликтовать с user в map
    const token = currentUser?.token;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getAllUsersAdmin(token);
            setUsers(data || []);
        } catch (err) {
            console.error("Ошибка загрузки пользователей:", err);
            setError(err.message || "Не удалось загрузить список пользователей.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (userId, userLogin) => {
        if (!token) return;
        // Не позволяем админу удалить самого себя
        if (currentUser?.id === userId) {
            alert("Вы не можете удалить свою учетную запись.");
            return;
        }
        if (window.confirm(`Вы уверены, что хотите удалить пользователя "${userLogin}" (ID: ${userId})?`)) {
            setLoading(true);
            try {
                await deleteUserAdmin(userId, token);
                alert(`Пользователь "${userLogin}" успешно удален.`); // Используем alert
                await fetchUsers(); // Перезагружаем список
            } catch (err) {
                console.error("Ошибка удаления пользователя:", err);
                const errorMessage = err.message || "Не удалось удалить пользователя.";
                setError(errorMessage);
                alert(`Ошибка: ${errorMessage}`); // Используем alert для ошибки
                setLoading(false);
            }
            // setLoading(false); // Если используется общий loading
        }
    };

    // --- Рендеринг ---
    if (loading && users.length === 0) {
        return <div className={styles.statusMessage}>Загрузка пользователей...</div>;
    }

    if (error) {
        return <div className={`${styles.statusMessage} ${styles.error}`}>Ошибка: {error}</div>;
    }

    return (
        <div className={styles.adminPageContainer}>
            <h1 className={styles.adminPageTitle}>Управление Пользователями</h1>

            <Link to="/admin/users/new" className={styles.createButton}>
                + Создать нового пользователя
            </Link>

            {users.length === 0 && !loading ? (
                <div className={styles.statusMessage}>Пользователи не найдены.</div>
            ) : (
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Логин</th>
                            <th>Роль</th>
                            <th>Student ID</th>
                            <th>Группа ID</th>
                            {/* Добавь другие колонки если нужно */}
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.login}</td>
                                <td>{user.role}</td>
                                <td>{user.student_id ?? '-'}</td> {/* Показать прочерк если null */}
                                <td>{user.group_id ?? '-'}</td>
                                <td className={styles.actionsCell}>
                                    <Link
                                        to={`/admin/users/${user.id}/edit`}
                                        className={`${styles.actionButton} ${styles.editButton}`}
                                    >
                                        Редактировать
                                    </Link>
                                    {/* Не показываем кнопку удаления для текущего пользователя */}
                                    {currentUser?.id !== user.id && (
                                        <button
                                            onClick={() => handleDelete(user.id, user.login)}
                                            className={`${styles.actionButton} ${styles.deleteButton}`}
                                            disabled={loading}
                                        >
                                            Удалить
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminUsersListPage;  