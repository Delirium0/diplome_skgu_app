import React, { useEffect, useState } from 'react';
import cl from './Building_container_list.module.css';
import Building_contrainer from './Building_contrainer';
import universityIconSvg from './../../assets/svg/university-svgrepo-com.svg';
import axios from 'axios';

const Building_container_list = () => {
  const [locations, setLocations] = useState(null);
  const [loading, setLoading] = useState(true); // Добавляем состояние для отслеживания загрузки

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/locations/locations`);
        setLocations(response.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false); // Устанавливаем loading в false, когда данные загружены или произошла ошибка
      }
    };

    fetchData();
  }, []);

  const [filterType, setFilterType] = useState(null);

  const handleFilterClick = (type) => {
    setFilterType(type);
  };

  // Условный рендеринг:  Отображаем что-то, пока данные загружаются.
  if (loading) {
    return <div>Загрузка...</div>; // Или любой другой индикатор загрузки
  }

  // Если locations все еще null после загрузки, возможно, произошла ошибка.
  if (!locations) {
    return <div>Ошибка загрузки данных.</div>; // Сообщение об ошибке
  }

  const filteredPoints = filterType
    ? locations.filter(point => point.building_type === filterType)
    : locations;

  const buildingTypes = [...new Set(locations.map(point => point.building_type))].map(building_type => {
    const point = locations.find(p => p.building_type === building_type);
    return { building_type: building_type, building_type_name_ru: point.building_type_name_ru };
  });

  const groupedPoints = filteredPoints.reduce((acc, point) => {
    if (!acc[point.building_type]) {
      acc[point.building_type] = [];
    }
    acc[point.building_type].push(point);
    return acc;
  }, {});

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#222',
    color: 'white',
    cursor: 'pointer',
    margin: '4px',
    fontSize: '1.1em'
  };

  const activeButton = {
    ...buttonStyle,
    backgroundColor: '#28a745',
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '16px',
    marginTop: '10px',
  };

  const getTypeNameRu = (building_type) => {
    const point = locations.find(p => p.building_type === building_type);
    return point ? point.building_type_name_ru : building_type;
  };

  return (
    <div>
      <div style={buttonContainerStyle}>
        <button
          style={filterType === null ? activeButton : buttonStyle}
          onClick={() => handleFilterClick(null)}
        >
          Все
        </button>
        {buildingTypes.map(({ building_type, building_type_name_ru }) => (
          <button
            key={building_type}
            style={filterType === building_type ? activeButton : buttonStyle}
            onClick={() => handleFilterClick(building_type)}
          >
            {building_type_name_ru}
          </button>
        ))}
      </div>

      {Object.entries(groupedPoints).map(([building_type, points]) => (
        <div key={building_type} className={cl.typeBlock}>
          <h2 className={cl.typeTitle}>{getTypeNameRu(building_type)}</h2>
          {points.map(point => (
            <Building_contrainer key={point.title} point={point} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Building_container_list;