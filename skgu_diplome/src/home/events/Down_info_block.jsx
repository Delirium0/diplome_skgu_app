import React from "react";
import "./Down_menu.css";
import Button from "./Button";
import Event_text_and_icon from "./Event_text_and_icon";
import cl from './new.module.css'
import { Link } from 'react-router-dom'; // <-- ДОБАВЛЕНО: Импорт Link

const Down_info_block = ({ time, raiting, event_name, eventId  }) => {
  const svgIconStar = (
    <svg className="svg_time">
      <path d="M12,2C6.477,2,2,6.477,2,12c0,5.523,4.477,10,10,10s10-4.477,10-10C22,6.477,17.523,2,12,2z M14.586,16l-3.293-3.293 C11.105,12.519,11,12.265,11,12V7c0-0.552,0.448-1,1-1h0c0.552,0,1,0.448,1,1v4.586l3,3c0.39,0.39,0.39,1.024,0,1.414l0,0 C15.61,16.39,14.976,16.39,14.586,16z" />
    </svg>
  );
  const svgIconClock = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M12 17.3l-5.1 2.7q-.575.275-1.05-.1-.475-.375-.375-1.025l1-5.95-4.3-4.175q-.5-.475-.325-1.05.175-.575.825-.675l5.975-.875L10.8 1.7q.275-.575.975-.575T12.8 1.7l2.675 5.5 5.975.875q.65.1.825.675.175.575-.325 1.05L17.65 14l1 5.95q.1.65-.375 1.025-.475.375-1.05.1Z" />
    </svg>
  );
  const formattedTime = time instanceof Date ? time.toLocaleString() : time;

  return (
    <div className="down_info_container">
      <div className="down_info_block">
        <h3 className="header_down_info">
          {event_name}
        </h3>
        <div className="down_info_and_button">
            <div className="down_all_info">
            <Event_text_and_icon
            svgIcon={svgIconStar}
            text={formattedTime}
          ></Event_text_and_icon>
          <Event_text_and_icon
            svgIcon={svgIconClock}
            text={raiting}
          ></Event_text_and_icon>

            </div>

            {eventId ? ( 
                 <Link to={`/events/${eventId}`} className={cl.new_button} >
                     Подробнее
                 </Link>
             ) : (
                 <button className={cl.new_button} disabled>Подробнее</button>
             )}
        </div>
      </div>
    </div>
  );
};

export default Down_info_block;
