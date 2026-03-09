import React from 'react';

const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;