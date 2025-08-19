import React, { ReactNode } from 'react';

// XMarkIcon SVG
const XMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl' 
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[9990] transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={`bg-slate-800/70 backdrop-blur-lg rounded-xl shadow-2xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow border border-slate-600/80`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-600/80 sticky top-0 bg-slate-800/70 backdrop-blur-lg z-10 rounded-t-xl">
            <h3 id="modal-title" className="text-lg font-semibold text-slate-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 md:p-5 flex-grow overflow-y-auto text-slate-300">
            {children}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalShow {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modalShow {
          animation: modalShow 0.3s forwards;
        }
      `}</style>
    </>
  );
};

export default Modal;