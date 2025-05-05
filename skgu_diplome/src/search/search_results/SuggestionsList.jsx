import React from 'react';
import cl from './SuggestionsList.module.css';
import searchIcon from './../../Components/Footer/search-svgrepo-com.svg'; // путь к вашей иконке

const SuggestionsList = ({ suggestions, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <ul className={cl.suggestionsList}>
      {suggestions.map((sugg) => (
        <li
          key={sugg.key}
          onClick={() => onSelect(sugg)}
          className={cl.suggestionItem}
        >
          <div className={cl.suggestionContent}> {/* Обертка для иконки и текста */}
            <img
              src={searchIcon}
              alt="иконка"
              className={cl.suggestionIcon}
            />
            <div> {/*  Блок для названия и дополнительной информации */}
              <div className={cl.suggestionName}>{sugg.building_name} {sugg.building_number} {sugg.name}</div> {/* Название */}
              <div className={cl.suggestionDetails}> {/* Дополнительная информация */}
                {sugg.description && `${sugg.description}`} {/* Описание */}
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default SuggestionsList;