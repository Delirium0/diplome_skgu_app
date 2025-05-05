import React from "react";
import Event_bookmark from "./Event_bookmark";
import Eventcreator from "./Eventcreator";
import "./Event.css";
import Down_info_block from "./Down_info_block";

const Event = ({ event_info }) => {
  console.log(event_info)
  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return date.toLocaleDateString('ru-RU', options); // 'ru-RU' для русского языка, можно изменить на нужный
  };
  const formattedTime = formatDate(event_info.event_time);
  return (
    <div className="event_contrainer">
      <div className="background_event_block">
        <div
          className="background_event"
          style={{ backgroundImage: `url(${event_info.image_background})` }}
        >
          <Event_bookmark />
        </div>
      </div>
      <div className="event_creator_block_overlay">
        <Eventcreator
          event_creator_name={event_info.event_creator_name}
          event_creator_image={event_info.event_creator_image}
        />
      </div>

      <Down_info_block
        time={formattedTime}
        raiting={event_info.event_raiting}
        event_name={event_info.event_name}
        eventId={event_info.id}
      />
    </div>
  );
};

export default Event;
