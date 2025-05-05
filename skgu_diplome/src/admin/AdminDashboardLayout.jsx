// src/admin/AdminDashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavigation from './AdminNavigation'; // Импортируем навигацию
import styles from './AdminDashboard.module.css'; // Стили для лейаута

const AdminDashboardLayout = () => {
    return (
        <div className={styles.dashboardLayout}>
            <aside className={styles.sidebar}> {/* Или используй div, если табы сверху */}
                <AdminNavigation />
            </aside>
            <main className={styles.contentArea}>
                {/* Сюда React Router будет рендерить компонент текущего дочернего маршрута */}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminDashboardLayout;