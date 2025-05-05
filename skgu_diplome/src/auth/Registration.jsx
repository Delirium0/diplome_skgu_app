// Registration.js
import React from 'react';
import styles from './AuthPage.module.css'; // Импортируем CSS Module

const Registration = () => {
    const handleRegistration = (event) => {
        event.preventDefault(); // Предотвращаем стандартную отправку формы
        const regLogin = event.target.regLogin.value;
        const regEmail = event.target.regEmail.value;
        const regPassword = event.target.regPassword.value;
        const confirmPassword = event.target.confirmPassword.value;

        if (!regLogin || !regEmail || !regPassword || !confirmPassword) {
            alert('Пожалуйста, заполните все поля для регистрации.');
            return;
        }
        if (regPassword !== confirmPassword) {
            alert('Пароли не совпадают.');
            return;
        }

        // Заглушка запроса регистрации
        console.log('Выполнен POST запрос на регистрацию:');
        console.log('Эндпоинт: /api/register'); // Пример эндпоинта для регистрации
        console.log('Данные для регистрации:', { login: regLogin, email: regEmail, password: regPassword });

        // Здесь будет реальный запрос к API и обработка ответа
        alert('Регистрация выполнена (заглушка). Смотрите детали запроса в консоли.');
    };

    return (
        <div className={styles.authForm}>
            <form onSubmit={handleRegistration}>
                <div className={styles.inputGroup}>
                    <label htmlFor="regLogin">Логин</label>
                    <input type="text" id="regLogin" name="regLogin" placeholder="Придумайте логин" />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="regEmail">Email</label>
                    <input type="email" id="regEmail" name="regEmail" placeholder="Введите ваш email" />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="regPassword">Пароль</label>
                    <input type="password" id="regPassword" name="regPassword" placeholder="Придумайте пароль" />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="confirmPassword">Подтвердите пароль</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Повторите пароль" />
                </div>
                <button type="submit" className={styles.authButton}>Зарегистрироваться</button>
            </form>
        </div>
    );
};

export default Registration;