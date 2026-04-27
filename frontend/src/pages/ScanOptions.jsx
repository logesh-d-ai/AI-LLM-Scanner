import React from 'react';
import { useNavigate } from 'react-router-dom';

const ScanOptions = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-8 animate-in slide-in-from-bottom-8 duration-500 flex flex-col items-center">
      <h2 className="text-3xl font-extrabold mb-10 text-white flex items-center gap-2 tracking-tight">
        Choose Scan Target
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Local Models Card */}
        <div 
          onClick={() => navigate('/local-scan')}
          className="group cursor-pointer bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-indigo-500/20 hover:border-indigo-500/50 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">Local Models</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Scan natively supported models (OpenAI, HuggingFace, Cohere, Anthropic). Ideal for standardized API endpoints with built-in integrations.
          </p>
        </div>

        {/* Custom Endpoint Card */}
        <div 
          onClick={() => navigate('/custom-scan')}
          className="group cursor-pointer bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-purple-500/20 hover:border-purple-500/50 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">Custom Endpoint</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Scan any external or private REST API endpoint. Configure custom headers, request body templates, and precise response field mappings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScanOptions;
