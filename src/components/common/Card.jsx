import React from 'react';

const Card = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`glass-card-ai p-6 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;