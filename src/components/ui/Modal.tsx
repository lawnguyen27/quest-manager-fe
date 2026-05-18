import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Square panel, centered title, red styling — for error alerts */
  variant?: 'default' | 'error';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  };

  const isError = variant === 'error';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className={
          isError
            ? `flex w-[min(18rem,calc(100vw-2rem),calc(100vh-8rem))] h-[min(18rem,calc(100vw-2rem),calc(100vh-8rem))] flex-col overflow-hidden rounded-xl border-2 border-red-500 bg-white shadow-xl shadow-red-500/25 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 dark:border-red-600 dark:bg-slate-900 dark:shadow-red-900/40`
            : `w-full overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 ${sizeClasses[size]} animate-in zoom-in-95 slide-in-from-bottom-4 duration-300`
        }
      >
        {isError ? (
          <>
            <div className="relative shrink-0 border-b border-red-200 bg-red-50 px-10 py-4 dark:border-red-900/60 dark:bg-red-950/50">
              <h3 className="text-center text-base font-bold text-red-600 dark:text-red-400">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">{children}</div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between border-b px-6 py-4 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
