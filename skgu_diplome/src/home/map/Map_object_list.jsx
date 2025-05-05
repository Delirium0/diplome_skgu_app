
import React from 'react';
import './Map.css';
import Object_card from './Object_card';

const Map_object_list = ({ points, selectedPoint, handlePointClick }) => {


  return (
    <div>
      <h3 className='object-card-list-title'>Список объектов:</h3>
      <div className="object-card-list"> {/* Используем div для списка карточек */}
        {points.map((point, index) => (
          <Object_card
            key={index} // Используем index как key (если нет уникального ID)
            point={point}   // Передаем данные точки в Object_card
            isSelected={selectedPoint === point} // Пропс для выделения выбранной карточки
            handlePointClick={handlePointClick} // Передаем функцию клика
          />
        ))}
      </div>
    </div>
  );
};

export default Map_object_list;