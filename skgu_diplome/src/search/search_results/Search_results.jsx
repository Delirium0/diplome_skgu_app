// Search_results.jsx
import React from 'react';
import Search_result_map_block from './Search_result_map_block';

const Search_results = ({ floorsData }) => {
  return (
    <div>
      {floorsData.map((floorData, index) => (
        <Search_result_map_block 
          key={index} 
          floorLabel={`${floorData.floor} этаж`} 
          image={floorData.image} 
        />
      ))}
    </div>
  );
};

export default Search_results;
