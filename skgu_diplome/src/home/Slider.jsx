import React from 'react';
import './events/Slider.css'
const Slider = ({events, Component}) => {
    return (
        <div className="carousel-container">
        <div className="carousel">
            {events.map((event) => (
                <Component key={event.id} event_info={event} />
            ))}
        </div>
    </div>
    );
};

export default Slider;