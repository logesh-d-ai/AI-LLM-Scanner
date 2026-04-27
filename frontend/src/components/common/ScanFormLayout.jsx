import React from 'react';

const ScanFormLayout = ({ title, icon, theme = 'indigo', error, onSubmit, children, maxWidth = 'max-w-2xl' }) => {
  const themeClasses = {
    indigo: {
      shadow: 'hover:shadow-indigo-500/10',
      icon: 'text-indigo-400',
    },
    purple: {
      shadow: 'hover:shadow-purple-500/10',
      icon: 'text-purple-400',
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.indigo;

  return (
    <div className="mt-8 animate-in slide-in-from-bottom-8 duration-500 flex justify-center pb-20">
      <div className={`w-full ${maxWidth} bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 transform transition-all duration-300 ${currentTheme.shadow}`}>
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          {icon}
          {title}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          {children}
        </form>
      </div>
    </div>
  );
};

export default ScanFormLayout;
