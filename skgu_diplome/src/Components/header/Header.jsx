// Header.js (или Header.jsx)
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../../auth/AuthProvider';
const Header = () => {
    const { user, logout } = useAuth(); // Используем useAuth хук, чтобы получить user и logout функцию из вашего контекста
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Вызываем функцию logout из вашего AuthContext для выхода
        navigate('/'); // Перенаправляем на главную страницу после выхода (опционально)
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <Link to="/" className={styles.logo}>
                </Link>
                <nav className={styles.headerNav}>
                </nav>
                <div className={styles.authButtons}>
                    {user ? ( // Проверяем наличие user в контексте (если user есть - значит залогинен)
                        <button onClick={handleLogout} className={styles.authButton}>
                            Выйти
                        </button>
                    ) : (
                        <Link to="/auth" className={styles.authButton}>
                            Войти
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;