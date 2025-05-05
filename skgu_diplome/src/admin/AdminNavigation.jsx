// src/admin/AdminNavigation.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './AdminDashboard.module.css'; // Создадим эти стили ниже
import { useAuth } from '../auth/AuthProvider'; // <-- Импорт useAuth

const AdminNavigation = () => {
    const { user } = useAuth(); // <-- Получаем пользователя

    // Функция для добавления класса 'active' через NavLink
    const navLinkClassName = ({ isActive }) =>
        isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;

    return (
        <nav className={styles.adminNav}>
            <ul>
            {user && (user.role === 'admin' || user.role === 'moderator') && (
                    <li>
                        <NavLink to="/admin/moderation/events" className={navLinkClassName}>
                            Модерация Событий
                        </NavLink>
                    </li>
                )}
                <li>
                    <NavLink to="/admin/events" className={navLinkClassName}>
                        События
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/users" className={navLinkClassName}>
                        Пользователи
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/faculties" className={navLinkClassName}>
                        Факультеты
                    </NavLink>
                </li>
                 <li>
                    <NavLink to="/admin/feedbacks" className={navLinkClassName}>
                        Отзывы
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/locations" className={navLinkClassName}>
                        Локации
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/links" className={navLinkClassName}>
                        Важные ссылки
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default AdminNavigation;