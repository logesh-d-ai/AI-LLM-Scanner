import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';

const Navbar = () => {
  const getNavClass = ({ isActive }) => {
    return `px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
      isActive ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-gray-300'
    }`;
  };

  return (
    <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">
              S
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              LLM Security Scanner
            </span>
          </NavLink>

          <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide py-2">
            <NavLink to="/" end className={getNavClass}>
              Dashboard
            </NavLink>
            <NavLink to="/new-scan" className={getNavClass}>
              New Scan
            </NavLink>
            <NavLink to="/history" className={getNavClass}>
              History
            </NavLink>
            <Routes>
              <Route 
                path="/report/:scanId" 
                element={
                  <button className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-inner cursor-default">
                    Active Report
                  </button>
                } 
              />
              <Route path="*" element={null} />
            </Routes>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
