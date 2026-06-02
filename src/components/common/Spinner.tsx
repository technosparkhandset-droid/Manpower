import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center" id="spinner-container">
      <div className="w-10 h-10 border-4 border-blue-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin mb-4" />
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">
        সম্পন্ন হচ্ছে... / Loading...
      </p>
    </div>
  );
};

export default Spinner;
