/// Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AuthPage.module.css';
import { useAuth } from './AuthProvider';
import { jwtDecode } from "jwt-decode";

const Login = () => {
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // Используем useAuth хук, чтобы получить login функцию из вашего контекста

    const handleLogin = async (event) => {
        event.preventDefault();
        const userLogin = event.target.login.value; // Переименуем переменную login, чтобы не конфликтовало с функцией login из контекста
        const password = event.target.password.value;

        if (!userLogin || !password) {
            setMessage('Пожалуйста, заполните все поля для входа.');
            setIsSuccess(false);
            return;
        }

        setMessage('Выполняется авторизация...');
        setIsSuccess(null);

        try {
            const apiUrl = `${process.env.REACT_APP_API_URL}/auth/login`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ login: userLogin, password: password }) // Используем userLogin здесь
            });

            if (!response.ok) {
                let errorMessage = 'Ошибка авторизации';
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.detail) {
                        errorMessage = errorData.detail;
                    }
                } catch (jsonError) {
                    console.error('Ошибка при чтении JSON ошибки:', jsonError);
                }
                setMessage(errorMessage);
                setIsSuccess(false);
                return;
            }
            const responseData = await response.json();
            const token = responseData.access_token;

            if (token) {
                const decodedPayload = jwtDecode(token); 
                const roleFromToken = decodedPayload.role; 

                const userData = {
                    token: token,
                    login: userLogin,
                    role: roleFromToken,
                };
                login(userData); 
                setMessage('Авторизация успешна!');
                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                setMessage('Успешная авторизация, но токен не получен.');
                setIsSuccess(false);
            }

            console.log('Успешная авторизация. Ответ сервера:', responseData);

        } catch (error) {
            console.error('Ошибка при выполнении запроса на авторизацию:', error);
            setMessage('Произошла ошибка при авторизации. Пожалуйста, попробуйте позже.');
            setIsSuccess(false);
        }
    };

    return (
        <div className={styles.authForm}>
            <form onSubmit={handleLogin}>
                <div className={styles.inputGroup}>
                    <label htmlFor="login">Логин</label>
                    <input type="text" id="login" name="login" placeholder="Введите логин" />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="password">Пароль</label>
                    <input type="password" id="password" name="password" placeholder="Введите пароль" />
                </div>
                <button type="submit" className={styles.authButton}>Войти</button>

                {message && (
                    <div className={`${styles.message} ${isSuccess === true ? styles.success : isSuccess === false ? styles.error : ''}`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};

export default Login;