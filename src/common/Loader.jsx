import React from 'react';

const Loader = ({ fullScreen = false, text = "Loading..." }) => {
  const loaderContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-10 h-10">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gray-100"></div>
        {/* Spinning Primary Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent border-r-transparent animate-spin"></div>
        {/* Inner Spinning Ring */}
        <div className="absolute inset-1.5 rounded-full border-2 border-indigo-200 border-b-transparent border-l-transparent animate-[spin_1.5s_linear_infinite_reverse]"></div>
      </div>
      {text && <p className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300">
        {loaderContent}
      </div>
    );
  }

  return (
    <div className="flex w-full h-full min-h-[300px] items-center justify-center p-8">
      {loaderContent}
    </div>
  );
};

export default Loader;
