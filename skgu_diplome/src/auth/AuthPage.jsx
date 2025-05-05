// AuthPage.js
import React, { useState } from 'react';
import Login from './Login';
import Registration from './Registration';
import styles from './AuthPage.module.css'; // Импортируем CSS Module
import Footer from '../Components/Footer/Footer';
const AuthPage = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);

    const toggleAuthMode = () => {
        setIsLoginMode(!isLoginMode);
    };

    return (
        <div className={`${styles.authPage} ${styles.page_block}`}>
            <div className={styles.page_content}>
                <h1 className={styles.authHeader}>{isLoginMode ? 'Авторизация' : 'Регистрация'}</h1>
                {isLoginMode ? <Login /> : <Registration />}
                <div className={styles.authLinks}>
                    {/* {isLoginMode ? (
                        <p>
                            Нет аккаунта? <a href="#" onClick={toggleAuthMode}>Регистрация</a>
                        </p>
                    ) : (
                        <p>
                            Уже есть аккаунт? <a href="#" onClick={toggleAuthMode}>Войти</a>
                        </p>
                    )} */}
                </div>
            </div>
            <Footer></Footer>
        </div>
    );
};

export default AuthPage;