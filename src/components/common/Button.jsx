import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-full transition-all duration-200 inline-flex items-center justify-center relative overflow-hidden group';
  
  const variants = {
    primary: 'stripe-gradient-bg text-slate-900 dark:text-white shadow-glow-brand hover:scale-[1.02]',
    secondary: 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white/90 hover:text-slate-900 dark:text-white hover:bg-slate-200 dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:scale-[1.02]',
    outline: 'border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 hover:border-brand-500 hover:text-brand-400 bg-transparent',
    glass: 'bg-slate-100 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-glass-inset hover:shadow-glow-brand hover:scale-[1.02]',
    danger: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 hover:scale-[1.02]',
    success: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 hover:scale-[1.02]'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5',
    lg: 'px-8 py-3.5 text-lg'
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none grayscale' : ''
      }`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      {!disabled && (
        <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out z-0"></div>
      )}
    </button>
  );
};

export default Button;