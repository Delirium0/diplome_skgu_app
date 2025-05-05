// src/auth/AuthProvider.js (или .jsx)
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

// 1. Создаем контекст аутентификации
const AuthContext = createContext(null);

// 2. Создаем компонент-провайдер
export const AuthProvider = ({ children }) => {
  // Состояние для хранения данных пользователя (null если не залогинен)
  const [user, setUser] = useState(null);
  // Состояние для отслеживания процесса инициализации (проверки localStorage)
  // Изначально true, так как проверка еще не выполнена
  const [isLoading, setIsLoading] = useState(true);

  // 5. Функция для входа пользователя
  const login = useCallback((userData) => {
    // Убедимся, что переданы какие-то данные
    if (userData) {
      setUser(userData);
      try {
        // Сохраняем пользователя в localStorage для персистентности между сессиями
        localStorage.setItem('user', JSON.stringify(userData));
        console.log("AuthProvider: User logged in and saved:", userData);
      } catch (error) {
        console.error("AuthProvider: Failed to save user to localStorage:", error);
        // Можно добавить обработку ошибки, например, уведомить пользователя
      }
    } else {
      console.warn("AuthProvider: Login attempt with invalid userData:", userData);
    }
  }, []); // useCallback мемоизирует функцию, чтобы она не создавалась заново при каждом рендере

  // 6. Функция для выхода пользователя
  const logout = useCallback(() => {
    setUser(null); // Сбрасываем пользователя в состоянии
    try {
      // Удаляем пользователя из localStorage
      localStorage.removeItem('user');
      console.log("AuthProvider: User logged out and removed from localStorage.");
    } catch (error) {
      console.error("AuthProvider: Failed to remove user from localStorage:", error);
    }
  }, []);

  // 7. useEffect для попытки восстановить сессию из localStorage при первой загрузке приложения
  useEffect(() => {
    console.log("AuthProvider: Initializing... Checking localStorage.");
    // Установим isLoading в true на всякий случай, если он был сброшен ранее
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        // Если данные найдены, пытаемся их распарсить
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser); // Восстанавливаем пользователя в состоянии
          console.log("AuthProvider: User session restored from localStorage:", parsedUser);
        } catch (parseError) {
          // Если данные в localStorage повреждены или некорректны
          console.error("AuthProvider: Error parsing stored user data:", parseError);
          localStorage.removeItem('user'); // Удаляем некорректные данные
          setUser(null); // Убеждаемся, что пользователь сброшен
        }
      } else {
        // Если данных в localStorage нет
        console.log("AuthProvider: No stored user session found.");
        setUser(null); // Убеждаемся, что пользователь сброшен
      }
    } catch (storageError) {
      // Обработка ошибок доступа к localStorage (например, если он отключен в браузере)
      console.error("AuthProvider: Error accessing localStorage:", storageError);
      setUser(null);
    } finally {
      // В любом случае (успех, ошибка парсинга, нет данных, ошибка доступа к storage)
      // завершаем процесс инициализации
      console.log("AuthProvider: Initialization finished.");
      setIsLoading(false); // Устанавливаем isLoading в false
    }
  }, []); // Пустой массив зависимостей [] означает, что эффект выполнится только один раз при монтировании компонента

  // 8. Формируем объект `value`, который будет доступен через контекст
  const value = {
    user,          // Текущий пользователь (или null)
    isLoading,     // Флаг состояния инициализации
    login,         // Функция для входа
    logout,        // Функция для выхода
  };

  // 9. Возвращаем Provider контекста, оборачивая дочерние компоненты
  // Передаем сформированное значение `value` всем потребителям контекста
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 10. Создаем кастомный хук `useAuth` для удобного доступа к контексту
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Добавляем проверку, что хук используется внутри дерева компонентов,
  // обернутого в AuthProvider, чтобы избежать ошибок `context is null/undefined`
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
   // Можно добавить предупреждение, если контекст null (хотя предыдущая проверка должна ловить undefined)
   if (context === null && process.env.NODE_ENV === 'development') {
     console.warn('useAuth received null context. This might happen if AuthProvider is not properly wrapping the component tree.');
   }
  return context;
};