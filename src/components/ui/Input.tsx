import React, { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  register?: UseFormRegisterReturn;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  register,
  type,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={`w-full rounded-lg border bg-white px-4 py-2 text-slate-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'
          } ${isPassword ? 'pr-11' : ''} ${className}`}
          {...props}
          {...register}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
