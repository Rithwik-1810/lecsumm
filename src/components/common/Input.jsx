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
        <label className="block text-sm font-bold text-slate-800 dark:text-white/90 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full px-4 py-2.5 bg-slate-100 dark:bg-[#1A1C23] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl focus:border-brand-500 shadow-glass-inset focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all duration-200 ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''} ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;