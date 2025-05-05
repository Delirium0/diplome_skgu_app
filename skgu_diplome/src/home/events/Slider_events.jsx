import React from 'react';
import './Slider.css'
import Event from './Event';
const Slider_events = ({events}) => {
    return (
        <div className="carousel-container">
        <div className="carousel">
            {events.map((event) => (
                <Event key={event.id} event_info={event} />
            ))}
        </div>
    </div>
    );
};

export default Slider_events;