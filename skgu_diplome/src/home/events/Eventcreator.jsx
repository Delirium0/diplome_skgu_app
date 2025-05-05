import React from "react";
import "./Creator_event.css";

const Eventcreator = ({ event_creator_name, event_creator_image }) => {
  return (
    <div className="event_creator_block">
      <div
        className="event_creator_image"
        style={{ backgroundImage: `url(${event_creator_image})` }}
      ></div>
      <div className="event_creator_name">{event_creator_name}</div>
    </div>
  );
};

export default Eventcreator;
