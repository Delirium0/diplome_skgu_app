import React from 'react';
import './Faculty.css'
import { Link } from 'react-router-dom'; // <<<--- Импортируем Link

const Faculty = ({event_info}) => {
    console.log(event_info)
    const { id, faculty_name, icon } = event_info;
    if (id === undefined || id === null) {
        console.warn("Компонент Faculty получил данные без ID:", event_info);
        // Можно вернуть null или отобразить заглушку/сообщение об ошибке
        return (
          <div className="faculty-card faculty-card-error">
            Ошибка: Не найден ID факультета
          </div>
        );
      }
    
    return (
        <Link to={`/faculty/${id}`} className="faculty-card-link"> {/* <--- Обертка Link */}
    
        <div className="faculties">
            <div className="faculty-icon">
                {event_info.icon}
            </div>
            <div>
            {event_info.faculty_name}

            </div>
        </div>
        </Link>

    );
};

export default Faculty;