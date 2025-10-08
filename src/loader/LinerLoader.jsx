import React from 'react';


const LinearLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        
        {/* Text */}
        <p className="mt-4 text-blue-600 text-lg font-semibold">Generating Summary...</p>
      </div>
    );
  };



export default LinearLoader;