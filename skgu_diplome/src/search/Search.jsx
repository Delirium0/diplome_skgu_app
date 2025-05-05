import React, { useEffect, useState } from "react";
import Search_results from "./search_results/Search_results";
import axios from "axios";
import cl from "./Search.module.css";
import Search_element from "./Search_element";
import Map from "../home/map/Map";
import Building_container_list from "./building_container/Building_container_list";
import Footer from "../Components/Footer/Footer";
const Search = () => {
  const [floorsData, setFloorsData] = useState([]);
  const [target, setTarget] = useState(null);
  const [point, setPoint] = useState(null);
  const [centerPoint, setCenterPoint] = useState(null);
  const start = "1_entrance"; // или другой начальный узел
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Отправляем запрос, когда выбран target
  useEffect(() => {
    if (!target) {
      // Сбрасываем состояние, если target становится null
      setFloorsData([]);
      setPoint(null);
      setCenterPoint(null);
      return; // Прекращаем выполнение, если target равен null
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}/search/route`, {
        params: {
          start: start,
          target: target.room_name,
          building: target.building_number,
        },
      })
      .then((response) => {
        const images = response.data.images.map((imgData) => ({
          floor: imgData.floor,
          image: `data:image/png;base64,${imgData.image}`,
        }));

        // Проверяем, есть ли данные для отображения карты
        if (
          response.data.location &&
          (response.data.location.bounds?.length > 0 ||
            (response.data.location.lat && response.data.location.lng))
        ) {
          // Есть данные для карты
          setPoint([response.data.location]);
          setCenterPoint(response.data.location.bounds?.[0] || null);
          console.log(response.data.location);
        } else {
          // Нет данных для карты
          console.warn("No valid location data found for this target.");
          setPoint(null); // Important: Set point to null
          setCenterPoint(null);
        }

        const sortedFloors = [...images].sort((a, b) => {
          return parseInt(a.floor, 10) - parseInt(b.floor, 10);
        });

        setFloorsData(sortedFloors);
      })
      .catch((error) => {
        console.error("Error fetching route:", error);
      });
  }, [target]);



  return (
    <div className={cl.main_search_block}>
      <Search_element onSelectTarget={setTarget} />

      {!target ? (
        <div className={cl.before_search_info}>
         <Building_container_list></Building_container_list>
        </div>
      ) : (
        <>
          {point !== null && (
            <Map
              points={point}
              selectedPoint={selectedPoint}
              center_points={centerPoint}
              zoom_size={17}
            />
          )}
          <Search_results floorsData={floorsData} />
        </>
      )}
      <Footer></Footer>
    </div>
    
  );
};

export default Search;