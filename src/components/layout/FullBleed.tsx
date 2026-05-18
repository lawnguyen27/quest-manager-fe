import React from 'react';

/** Full-bleed strip inside padded main layout (`max-w-7xl` parent). */
export function FullBleed({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={`relative left-1/2 w-screen -translate-x-1/2 ${className}`}>
      {children}
    </div>
  );
}
