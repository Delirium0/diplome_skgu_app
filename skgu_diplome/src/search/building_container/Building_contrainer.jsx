import React from "react";
import cl from "./Building_container.module.css";
import clockIconSvg from "./../../assets/svg/clock-svgrepo-com.svg";
import locationIconSvg from "./../../assets/svg/location-marker-svgrepo-com.svg";
import Button from "../../home/events/Button";
import { useNavigate } from "react-router-dom";

const Building_contrainer = ({ point }) => {
  const svg_geo_marker = locationIconSvg;
  const svgclock = clockIconSvg;

  const navigate = useNavigate();

  const handleClick = () => {
    // Переходим на страницу /location/<point.id>
    navigate(`/location/${point.id}`);
  };
  return (
    <div
      className={cl.cardqefqef}
      // onClick={() => handlePointClick(point)}
    >
      <div className={cl.image_text_wrapper}> {/*  Добавляем обертку */}
        <div className="svg_block">
          <img src={point.main_icon} alt="иконка" className={cl.main_icon} />
        </div>
        <div className="main_info_block">
          <div className={cl.text_and_icon}>
            <div className={cl.main_text}>{point.title}</div>
          </div>
          <div className={cl.text_and_icon}>
            {/* <img
              src={svgclock}
              alt="время работы"
              className={cl.suggestionIcon}
            /> */}
            <span className={cl.text_time}>{point.time_start}</span>
            <span className={cl.text_time}>{point.time_end}</span>
          </div>
          <div className={cl.text_and_icon}>
            {/* <img src={svg_geo_marker} alt="адрес" className={cl.suggestionIcon} /> */}
            <div className={cl.text_geo}>{point.address}</div>
          </div>
        </div>
      </div> {/*  Закрываем обертку */}
      <div className={cl.button_dop_info}>
      <Button onClick={handleClick}> Подробнее</Button>
      </div>
    </div>
  );
};

export default Building_contrainer;