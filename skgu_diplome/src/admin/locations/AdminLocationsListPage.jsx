    // src/admin/locations/AdminLocationsListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { getAllLocationsAdmin, deleteLocationAdmin }  from '../eventAdminService';
import styles from '../AdminEvents.module.css'; // Используем общие стили

const AdminLocationsListPage = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    const fetchLocations = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getAllLocationsAdmin(token);
            setLocations(data || []);
        } catch (err) {
            console.error("Ошибка загрузки локаций:", err);
            setError(err.message || "Не удалось загрузить список локаций.");
            setLocations([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchLocations();
    }, [fetchLocations]);

    const handleDelete = async (locationId, locationTitle) => {
        if (!token || processingId) return;
        if (window.confirm(`Вы уверены, что хотите удалить локацию "${locationTitle}" (ID: ${locationId})?`)) {
            setProcessingId(locationId);
            setError(null);
            try {
                await deleteLocationAdmin(locationId, token);
                setLocations(prev => prev.filter(loc => loc.id !== locationId));
            } catch (err) {
                console.error("Ошибка удаления локации:", err);
                setError(err.message || "Не удалось удалить локацию.");
            } finally {
                setProcessingId(null);
            }
        }
    };

    // --- Рендеринг ---
     if (loading && locations.length === 0) {
        return <div className={styles.statusMessage}>Загрузка локаций...</div>;
    }

    {error && <div className={`${styles.statusMessage} ${styles.error} ${styles.stickyError}`}>Ошибка: {error}</div>}


    return (
        <div className={styles.adminPageContainer}>
            <h1 className={styles.adminPageTitle}>Управление Локациями</h1>

            <Link to="/admin/locations/new" className={styles.createButton}>
                + Создать новую локацию
            </Link>

            {locations.length === 0 && !loading ? (
                <div className={styles.statusMessage}>Локации не найдены.</div>
            ) : (
                <table className={styles.adminTable}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Адрес</th>
                            <th>Тип</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locations.map((location) => (
                             <tr key={location.id} className={processingId === location.id ? styles.processing : ''}>
                                <td>{location.id}</td>
                                <td>{location.title}</td>
                                <td>{location.address}</td>
                                <td>{location.type}</td>
                                <td className={styles.actionsCell}>
                                    <Link
                                        to={`/admin/locations/${location.id}/edit`}
                                        className={`${styles.actionButton} ${styles.editButton}`}
                                        style={processingId ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                                    >
                                        Редактировать
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(location.id, location.title)}
                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                        disabled={!!processingId}
                                    >
                                        {processingId === location.id ? 'Удаляем...' : 'Удалить'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminLocationsListPage;