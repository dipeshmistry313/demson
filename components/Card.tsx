import React, { useEffect } from 'react';
import Icon from './Icon';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className, title, action, style }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-4 sm:p-6 ${className}`} style={style}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end sm:items-center animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b sticky top-0 bg-white rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close modal">
            <Icon name="x" className="w-6 h-6" />
          </button>
        </header>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
