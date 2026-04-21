import React from 'react';

const ConfigTab = ({ scanData }) => {
  // Extract fields
  const { model_name, model_type, tool_type, scan_type, created_at } = scanData;
  const dateObj = new Date(created_at);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Model Info */}
        <div className="bg-gray-800/80 rounded-2xl border border-white/5 overflow-hidden shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
             <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
             <h3 className="text-lg font-bold text-gray-200">Model Info</h3>
          </div>
          
          <div className="space-y-4">
             <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-gray-500 text-sm font-medium">Model Entity Name</span>
                <span className="text-white font-medium">{model_name}</span>
             </div>
             <div className="flex justify-between items-center pb-2">
                <span className="text-gray-500 text-sm font-medium">API Vendor / Type</span>
                <span className="bg-gray-900 border border-gray-700 px-3 py-1 rounded text-sm text-gray-300 font-mono capitalize">{model_type}</span>
             </div>
          </div>
        </div>

        {/* Scan Settings */}
        <div className="bg-gray-800/80 rounded-2xl border border-white/5 overflow-hidden shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
             <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             <h3 className="text-lg font-bold text-gray-200">Scan Settings</h3>
          </div>
          
          <div className="space-y-4">
             <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-gray-500 text-sm font-medium">Underlying Toolset Engine</span>
                <span className="text-white font-medium">{tool_type}</span>
             </div>
             <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-gray-500 text-sm font-medium">Scan Taxonomy Category</span>
                <span className="text-white font-medium">{scan_type}</span>
             </div>
             <div className="flex justify-between items-center pb-2">
                <span className="text-gray-500 text-sm font-medium">Execution Payload Date</span>
                <span className="text-gray-400 text-sm">{dateObj.toLocaleString()}</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ConfigTab;
