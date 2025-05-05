// src/api/admin/facultyAdminService.js
// (Добавь этот код в существующий src/api/admin/eventAdminService.js или создай новый файл
// и импортируй fetchAdminAPI, если он в отдельном файле)
import {fetchAdminAPI} from '../eventAdminService'
// Предполагаем, что fetchAdminAPI и API_URL уже определены выше в этом файле

// --- Функции для работы с ФАКУЛЬТЕТАМИ ---

/**
 * Получает список всех факультетов (ID и имя) для админки.
 * Использует публичный эндпоинт, возвращающий FacultyListResponse.
 */
export const getAllFacultiesAdmin = (token) => {
    // Используем публичный эндпоинт, он доступен и админу
    return fetchAdminAPI('/faculties/', token, { method: 'GET' });
};

/**
 * Получает детальную информацию о факультете по ID для админки.
 * Использует публичный эндпоинт, возвращающий FacultyResponse.
 */
export const getFacultyByIdAdmin = (facultyId, token) => {
    // Используем публичный эндпоинт для получения деталей
    return fetchAdminAPI(`/faculties/${facultyId}`, token, { method: 'GET' });
};

/**
 * Создает новый факультет (требуются права администратора).
 */
export const createFacultyAdmin = (facultyData, token) => {
    // facultyData должен соответствовать схеме FacultyCreate
    if (!facultyData.name) {
         return Promise.reject(new Error("Название факультета обязательно для создания."));
    }
    // Преобразуем social_links в JSON, если это объект
    let dataToSend = {...facultyData};
    if (dataToSend.social_links && typeof dataToSend.social_links === 'object') {
        try {
            // Pydantic на бэке ожидает JSON-совместимый объект, строка не нужна
            // dataToSend.social_links = JSON.stringify(dataToSend.social_links);
        } catch (e) {
             return Promise.reject(new Error("Некорректный формат социальных сетей (ожидается объект)."));
        }
    } else if (typeof dataToSend.social_links === 'string') {
         // Если пришла строка (например, из textarea), пытаемся парсить
         try {
            dataToSend.social_links = JSON.parse(dataToSend.social_links);
         } catch (e) {
            return Promise.reject(new Error("Некорректный JSON формат для социальных сетей."));
         }
    }


    return fetchAdminAPI('/faculties/', token, {
        method: 'POST',
        body: JSON.stringify(dataToSend), // Отправляем объект как JSON
    });
};

/**
 * Обновляет существующий факультет (требуются права администратора).
 */
export const updateFacultyAdmin = (facultyId, facultyData, token) => {
    // facultyData должен соответствовать схеме FacultyUpdate
    let dataToSend = {...facultyData};
     // Обработка social_links аналогично create
    if (dataToSend.social_links && typeof dataToSend.social_links === 'object') {
        // Оставляем как объект
    } else if (typeof dataToSend.social_links === 'string') {
         try {
            dataToSend.social_links = JSON.parse(dataToSend.social_links);
         } catch (e) {
            // Если пустая строка или некорректный JSON, можно отправить null или пустой объект
            // или выдать ошибку, в зависимости от логики бэка
            dataToSend.social_links = null; // Пример: отправляем null при ошибке парсинга строки
            console.warn("Не удалось распарсить JSON social_links, отправляем null:", dataToSend.social_links);
            // return Promise.reject(new Error("Некорректный JSON формат для социальных сетей."));
         }
    } else {
        // Если пришел не объект и не строка (например, null или undefined из формы),
        // явно устанавливаем null, чтобы PATCH-обновление сработало
        dataToSend.social_links = null;
    }


    return fetchAdminAPI(`/faculties/${facultyId}`, token, {
        method: 'PUT',
        body: JSON.stringify(dataToSend), // Отправляем объект как JSON
    });
};

/**
 * Удаляет факультет (требуются права администратора).
 */
export const deleteFacultyAdmin = (facultyId, token) => {
    return fetchAdminAPI(`/faculties/${facultyId}`, token, { method: 'DELETE' });
};