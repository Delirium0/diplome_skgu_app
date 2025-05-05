import React from 'react';
import cl from './Text_and_icon.module.css';

const Text_and_icon = ({ svgIcon, text }) => {
  return (
    <div className={cl.text_and_icon}>
      {svgIcon && <div className={cl.icon}>{svgIcon}</div>}
      <div className={cl.text}>{text}</div>
    </div>
  );
};

export default Text_and_icon;