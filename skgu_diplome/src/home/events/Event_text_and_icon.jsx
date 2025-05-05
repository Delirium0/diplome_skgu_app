import React from 'react';
import "./Down_menu.css";

const Event_text_and_icon = ({svgIcon, text}) => {
    
    return (
        <div className="text_and_icon">
        {svgIcon}

        <p className="icon_text">{text}</p>
      </div>
  
    );
};

export default Event_text_and_icon;