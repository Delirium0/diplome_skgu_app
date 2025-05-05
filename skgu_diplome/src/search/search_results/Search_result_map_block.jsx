// Search_result_map_block.jsx
import React from 'react';
import cl from './Search_result_map_block.module.css';

const Search_result_map_block = ({ image, floorLabel }) => {
  return (
    <div className={cl.map_block}>
      <div className={cl.label}>{floorLabel}</div>
      <img src={image} alt={floorLabel} />
    </div>
  );
};

export default Search_result_map_block;
