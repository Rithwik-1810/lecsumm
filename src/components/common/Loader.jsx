import React from 'react';
import { ThreeDots } from 'react-loader-spinner';

const Loader = ({ size = 'md', color = '#1e3a8a' }) => {
  const sizes = {
    sm: 30,
    md: 50,
    lg: 80
  };

  return (
    <div className="flex items-center justify-center">
      <ThreeDots
        height={sizes[size]}
        width={sizes[size]}
        radius="9"
        color={color}
        ariaLabel="three-dots-loading"
        visible={true}
      />
    </div>
  );
};

export default Loader;