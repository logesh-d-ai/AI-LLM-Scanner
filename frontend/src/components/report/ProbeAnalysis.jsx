import React from 'react';

const ProbeAnalysisTab = ({ parsedResults }) => {
  if (!parsedResults || parsedResults.length === 0) {
    return <div className="text-gray-500 py-12 text-center">No probe data available for this scan.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gray-800/80 rounded-2xl border border-white/5 overflow-hidden shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-200 mb-6">Execution Breakdown per Probe</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parsedResults.map((probe, index) => {
             const { vulnerability_type, severity, parsedOutput } = probe;
             const total = parsedOutput.total_attempts || 0;
             const hits = parsedOutput.successful_attacks || 0;
             const rate = parsedOutput.success_rate || 0;
             
             let riskPill = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
             if (severity === 'High') riskPill = "bg-red-500/10 border-red-500/20 text-red-400";
             else if (severity === 'Medium') riskPill = "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
             else if (severity === 'Low') riskPill = "bg-blue-500/10 border-blue-500/20 text-blue-400";

             return (
                 <div key={index} className="bg-gray-900/50 rounded-xl p-5 border border-white/5 hover:border-indigo-500/30 transition-colors">
                     <div className="flex justify-between items-start mb-4">
                        <div className="text-sm font-mono text-indigo-300 truncate max-w-[200px]" title={vulnerability_type}>
                            {vulnerability_type.replace('promptinject.', '')}
                        </div>
                        <div className={`px-2 py-0.5 rounded text-xs font-bold border ${riskPill}`}>
                            {severity} Risk
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-4 mb-4">
                         <div className="text-center bg-gray-950 rounded py-2">
                             <div className="text-xs text-gray-500 font-medium">Attempts</div>
                             <div className="text-xl font-bold text-gray-300">{total}</div>
                         </div>
                         <div className="text-center bg-gray-950 rounded py-2">
                             <div className="text-xs text-gray-500 font-medium">Hits</div>
                             <div className="text-xl font-bold text-red-400">{hits}</div>
                         </div>
                         <div className="text-center bg-gray-950 rounded py-2 relative overflow-hidden">
                             <div className="text-xs text-gray-500 font-medium">Rate</div>
                             <div className="text-xl font-bold text-white">{rate.toFixed(1)}%</div>
                         </div>
                     </div>
                     
                     <div className="w-full bg-gray-800 rounded-full h-2">
                         <div 
                           className={`h-2 rounded-full ${hits > 0 ? (rate > 15 ? 'bg-red-500' : 'bg-yellow-500') : 'bg-emerald-500'}`} 
                           style={{ width: `${Math.max(2, rate)}%` }}
                         ></div>
                     </div>
                 </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProbeAnalysisTab;
