import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import searchIcon from './../Components/Footer/search-svgrepo-com.svg';
import cl from './Search_element.module.css';
import SuggestionsList from './search_results/SuggestionsList';

const Search_element = ({ onSelectTarget }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [skipSuggestions, setSkipSuggestions] = useState(false);
  const inputRef = useRef(null);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    // Сбрасываем флаг, если пользователь вводит новый текст
    setSkipSuggestions(false);
  };

  // Debounce ввода пользователя
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Запрос подсказок при изменении debouncedSearchTerm, если не выбран элемент
  useEffect(() => {
    if (skipSuggestions) return; // Если подсказка уже выбрана, не запрашиваем снова
    if (debouncedSearchTerm) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/search/suggest`, {
          params: { temp: debouncedSearchTerm },
        })
        .then((response) => {
          setSuggestions(response.data.suggestions);
        })
        .catch((error) => {
          console.error('Error fetching suggestions:', error);
        });
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchTerm, skipSuggestions]);

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name);
    setSuggestions([]);
    // Устанавливаем флаг, чтобы не запрашивать подсказки по уже выбранному значению
    setSkipSuggestions(true);
    // Передаём выбранный target (например, "2_office_214")
    onSelectTarget({room_name: suggestion.id, building_number: suggestion.building_number});
  };

  const handleBlockClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleIconClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClearClick = () => {
    setSearchTerm('');
    setDebouncedSearchTerm(''); // Сбрасываем debouncedSearchTerm
    setSuggestions([]); // Очищаем список предложений
    setSkipSuggestions(false); // Разрешаем заново показывать подсказки
    onSelectTarget(null);  // Сбрасываем target в null
    if (inputRef.current) {
      inputRef.current.focus(); // Возвращаем фокус в поле ввода
    }
  };

  return (
    <div className={cl.searchContainer}>
      <div className={cl.search_block} onClick={handleBlockClick}>
        <img
          className={cl.search_icon}
          src={searchIcon}
          alt="search icon"
          onClick={handleIconClick}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Найти объект или кабинет"
          ref={inputRef}
        />
        {searchTerm && (  // Отображаем крестик только если что-то введено
          <button className={cl.clearButton} onClick={handleClearClick}>
            ✕ 
          </button>
        )}
      </div>
      <SuggestionsList suggestions={suggestions} onSelect={handleSuggestionClick} />
    </div>
  );
};

export default Search_element;