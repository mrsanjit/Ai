import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ title = "An Error Occurred", message }) => {
  return (
    <div className="bg-red-700/30 backdrop-blur-sm border border-red-500/50 text-red-300 px-4 py-3 rounded-lg relative shadow-md" role="alert">
      <strong className="font-bold block mb-1">{title}</strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default ErrorMessage;