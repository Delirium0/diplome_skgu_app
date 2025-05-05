// src/api/admin/eventAdminService.js

const API_URL = process.env.REACT_APP_API_URL; // Убедись, что переменная настроена

// --- Хелпер для выполнения fetch запросов ---
const fetchAdminAPI = async (endpoint, token, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers, // Позволяет переопределить или добавить заголовки
    };

    const config = {
        ...options,
        headers: headers,
    };

    try {
        const response = await fetch(url, config);

        // Обработка ответа без тела (например, 204 No Content для DELETE)
        if (response.status === 204) {
            return null; // Или можно вернуть { success: true }
        }

        const data = await response.json(); // Пытаемся парсить JSON

        if (!response.ok) {
            // Если есть detail в ошибке FastAPI, используем его
            const errorDetail = data?.detail || `Ошибка HTTP: ${response.status}`;
            throw new Error(errorDetail);
        }

        return data; // Возвращаем данные в случае успеха
    } catch (error) {
        console.error(`Ошибка API запроса к ${url}:`, error);
        // Пробрасываем ошибку дальше, чтобы компонент мог ее обработать
        throw error;
    }
};

// --- Функции для работы с событиями ---

export const getAllEventsAdmin = (token) => {
    return fetchAdminAPI('/events/all', token, { method: 'GET' }); // <-- ИЗМЕНЕН ЭНДПОИНТ
};
export const getUnmoderatedEventsAdmin = (token) => {
    return fetchAdminAPI('/events/unmoderated', token, { method: 'GET' });
};

export const getEventByIdAdmin = (eventId, token) => {
    return fetchAdminAPI(`/events/${eventId}`, token, { method: 'GET' });
};

export const createEventAdmin = (eventData, token) => {
    // Убедимся, что обязательные поля из EventCreate присутствуют
    // (дополнительная клиентская проверка)
    if (!eventData.event_name || !eventData.event_time || !eventData.image_background || !eventData.event_creator_name) {
        return Promise.reject(new Error("Не заполнены все обязательные поля для создания события."));
    }
    return fetchAdminAPI('/events/', token, {
        method: 'POST',
        body: JSON.stringify(eventData),
    });
};

export const updateEventAdmin = (eventId, eventData, token) => {
    // eventData должно соответствовать EventUpdate схеме
    return fetchAdminAPI(`/events/${eventId}`, token, {
        method: 'PUT',
        body: JSON.stringify(eventData),
    });
};
export const getAllFeedbacksAdmin = (token, skip = 0, limit = 100) => {
    const endpoint = `/feedbacks/?skip=${skip}&limit=${limit}`;
    return fetchAdminAPI(endpoint, token, { method: 'GET' });
};
export const deleteFeedbackAdmin = (feedbackId, token) => {
    return fetchAdminAPI(`/feedbacks/${feedbackId}`, token, { method: 'DELETE' });
};
export const deleteEventAdmin = (eventId, token) => {
    return fetchAdminAPI(`/events/${eventId}`, token, { method: 'DELETE' });
};
export const getAllLocationsAdmin = (token) => {
    return fetchAdminAPI('/locations/admin/locations', token, { method: 'GET' });
};
export const getLocationByIdAdmin = (locationId, token) => {
    return fetchAdminAPI(`/locations/admin/locations/${locationId}`, token, { method: 'GET' });
};
export const createLocationAdmin = (locationData, token) => {
    // locationData должен содержать поле bounds: [[lat, lng], ...]
    if (!locationData.bounds || locationData.bounds.length < 3) {
        return Promise.reject(new Error("Для создания локации необходимо указать минимум 3 точки границ (bounds)."));
    }
    // Используем публичный POST, если он доступен админу для создания
     // Если для POST /locations нужны админ права, измени эндпоинт на /admin/locations
    return fetchAdminAPI('/locations/locations', token, { // Проверь эндпоинт и права доступа на бэке!
        method: 'POST',
        body: JSON.stringify(locationData),
    });
};

export const updateLocationAdmin = (locationId, locationData, token) => {
    // locationData должен содержать поле bounds: [[lat, lng], ...]
    // Бэкенд ожидает bounds в теле запроса (согласно предложенной реализации роутера)
     if (locationData.bounds === undefined) { // Убедимся что bounds переданы (могут быть пустым массивом)
         return Promise.reject(new Error("Данные для обновления границ (bounds) отсутствуют."));
     }
     if (locationData.bounds !== null && locationData.bounds.length > 0 && locationData.bounds.length < 3) {
        return Promise.reject(new Error("Для обновления границ необходимо указать минимум 3 точки или пустой массив/null для удаления."));
     }
    return fetchAdminAPI(`/locations/admin/locations/${locationId}`, token, {
        method: 'PUT',
        body: JSON.stringify(locationData),
    });
};
export const getAllImportantLinksAdmin = (token) => {
    return fetchAdminAPI('/important_links/', token, { method: 'GET' });
};

export const getImportantLinkByIdAdmin = (linkId, token) => {
    return fetchAdminAPI(`/important_links/${linkId}`, token, { method: 'GET' });
};

// linkData: { link: string, link_text: string, icon: string | null (base64) }
export const createImportantLinkAdmin = (linkData, token) => {
    if (!linkData.link || !linkData.link_text) {
        return Promise.reject(new Error("URL ссылки и Текст ссылки обязательны."));
    }
    return fetchAdminAPI('/important_links/', token, {
        method: 'POST',
        body: JSON.stringify(linkData),
    });
};

// linkData: { link?: string, link_text?: string, icon?: string | null (base64) }
export const updateImportantLinkAdmin = (linkId, linkData, token) => {
    return fetchAdminAPI(`/important_links/${linkId}`, token, {
        method: 'PUT', // Используем PUT, т.к. в роутере FastAPI указан PUT
        body: JSON.stringify(linkData),
    });
};

export const deleteImportantLinkAdmin = (linkId, token) => {
    return fetchAdminAPI(`/important_links/${linkId}`, token, { method: 'DELETE' });
};


export const getAllUsersAdmin = (token) => {
    // Нужен эндпоинт на бэкенде для получения списка пользователей
    // Предположим, он /admin/users/
    return fetchAdminAPI('/admin/users/', token, { method: 'GET' });
};

export const getUserByIdAdmin = (userId, token) => {
    // Нужен эндпоинт на бэкенде для получения одного пользователя
    // Предположим, он /admin/users/{user_id}
    return fetchAdminAPI(`/admin/users/${userId}`, token, { method: 'GET' });
};

// userData: { login, password (plain), role, student_id?, semester?, year?, cmbPeriod?, group_id? }
export const createUserAdmin = (userData, token) => {
    // Валидация обязательных полей
    if (!userData.login || !userData.password || !userData.role) {
        return Promise.reject(new Error("Логин, пароль и роль обязательны для создания пользователя."));
    }
    // Эндпоинт для создания пользователя админом
    // Предположим, он /admin/users/
    return fetchAdminAPI('/admin/users/', token, {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

// userData: { login?, password? (plain), role?, student_id?, semester?, year?, cmbPeriod?, group_id? }
// ВАЖНО: Бэкенд должен уметь обрабатывать обновление пароля (plain text -> hash)
export const updateUserAdmin = (userId, userData, token) => {
     // Эндпоинт для обновления пользователя админом
    // Предположим, он /admin/users/{user_id}
    return fetchAdminAPI(`/admin/users/${userId}`, token, {
        method: 'PUT', // Или PATCH, если бэкенд поддерживает частичное обновление
        body: JSON.stringify(userData),
    });
};

export const deleteUserAdmin = (userId, token) => {
     // Эндпоинт для удаления пользователя админом
    // Предположим, он /admin/users/{user_id}
    return fetchAdminAPI(`/admin/users/${userId}`, token, { method: 'DELETE' });
};
export const deleteLocationAdmin = (locationId, token) => {
    return fetchAdminAPI(`/locations/admin/locations/${locationId}`, token, { method: 'DELETE' });
};
export const approveEventAdmin = (eventId, token) => {
    return fetchAdminAPI(`/events/${eventId}/moderate`, token, { method: 'PATCH' }); // Используем PATCH
};
export { fetchAdminAPI };
