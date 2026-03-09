import React from 'react';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;