import React from "react";
import "./Object_card.css"; // Убедитесь, что этот CSS файл существует и стилизует классы
import cl from "./Text_and_icon.module.css"; // Используется для других элементов

const Object_card = ({ point, isSelected, handlePointClick }) => {

  // Ваши SVG для иконок времени и геопозиции (остаются без изменений)
  const svg_geo_marker = (
     <svg viewBox="0 0 527.678 527.678" fill="currentColor"> {/* Используйте currentColor для наследования цвета */}
       <g>
         <g>
           <path
             d="M263.877,0C169.782,0,93.512,76.271,93.512,170.213c0,93.941,159.197,349.834,159.197,349.834 c6.196,10.175,16.217,10.175,22.338,0c0,0,159.119-255.816,159.119-349.834C434.166,76.194,357.973,0,263.877,0z M263.877,264.537 c-61.583,0-111.384-49.878-111.384-111.384c0-61.506,49.801-111.461,111.384-111.461c61.582,0,111.384,49.878,111.384,111.384 S325.459,264.537,263.877,264.537z"
           />
           <ellipse cx="263.877" cy="153.153" rx="69.844" ry="69.844" />
         </g>
       </g>
     </svg>
   );

  const svgIconClock = ( // Переименовал для ясности
     <svg className="svg_time" viewBox="0 0 24 24" fill="currentColor"> {/* Добавлен viewBox и fill */}
       <path d="M12,2C6.477,2,2,6.477,2,12c0,5.523,4.477,10,10,10s10-4.477,10-10C22,6.477,17.523,2,12,2z M14.586,16l-3.293-3.293 C11.105,12.519,11,12.265,11,12V7c0-0.552,0.448-1,1-1h0c0.552,0,1,0.448,1,1v4.586l3,3c0.39,0.39,0.39,1.024,0,1.414l0,0 C15.61,16.39,14.976,16.39,14.586,16z" />
     </svg>
   );


  // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
  // Формируем src для img из Base64 строки
  // Предполагаем, что это SVG. Если могут быть другие типы (PNG, JPG),
  // нужно будет либо передавать MIME-тип с бэкенда, либо пытаться его определить.
  const imageSrc = point.main_icon
    ? `data:image/svg+xml;base64,${point.main_icon}`
    : null; // Если иконки нет, src будет null

  return (
    <div
      className={`card ${isSelected ? 'selected' : ''}`}
      onClick={() => handlePointClick(point)}
    >
<div className="svg_block">
  {point.main_icon ? (
    <img
      src={point.main_icon} // Используем напрямую!
      alt={point.title || 'Иконка объекта'}
      className="card-main-icon" // Убедитесь, что стили для этого класса правильные
    />
  ) : (
    <div className="icon-placeholder"></div>
  )}
</div>

      <div className="main_info_block">
        {/* Используем классы из cl (CSS Modules) */}
        <div className={cl.text_and_icon}>
          <div className={`${cl.text} ${cl.main_text}`}>{point.title}</div>
        </div>

        {/* Отображаем время, если оно есть */}
        {(point.time_start || point.time_end) && (
           <div className={cl.text_and_icon}>
             <div className={cl.icon}>{svgIconClock}</div>
             {point.time_start && <span className={cl.text_time}>{point.time_start}</span>}
             {/* Добавим дефис или другой разделитель, если есть оба времени */}
             {point.time_start && point.time_end && <span className={cl.text_time}> - </span>}
             {point.time_end && <span className={cl.text_time}>{point.time_end}</span>}
           </div>
        )}

        {/* Отображаем адрес, если он есть */}
        {point.address && (
          <div className={cl.text_and_icon}>
            <div className={cl.icon_geo}>{svg_geo_marker}</div>
            <div className={cl.text_geo}>{point.address}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Object_card;