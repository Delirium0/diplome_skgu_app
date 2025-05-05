import React from 'react';
import './Button.css';

const Button = ({ onClick, children }) => {
  return (
    <button className='button_down_menu' onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;