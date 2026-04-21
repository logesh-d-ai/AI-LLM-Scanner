import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center mt-20 mb-32 animate-in fade-in zoom-in duration-500">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-400 drop-shadow-sm">
          Secure your Language Models
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Run advanced vulnerability assessments, identify prompt injections, detect data leakage, and ensure your AI integrations are safe for production deployment.
        </p>
        <div className="mt-10 flex justify-center gap-4">
            <button 
              onClick={() => navigate('/new-scan')} 
              className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
            >
               Start New Scan
            </button>
            <button 
              onClick={() => navigate('/history')} 
              className="px-8 py-3 rounded-full bg-gray-800 border border-gray-600 hover:bg-gray-700 text-white font-bold transition-all hover:scale-105"
            >
               View Reports
            </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
