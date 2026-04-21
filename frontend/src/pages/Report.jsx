import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../config/api';

import ReportOverview from '../components/report/ReportOverview';
import AttemptsLog from '../components/report/AttemptsLog';
import SuccessfulAttacks from '../components/report/SuccessfulAttacks';
import ProbeAnalysis from '../components/report/ProbeAnalysis';
import RunConfiguration from '../components/report/RunConfiguration';

const POLL_INTERVAL_MS = 3000;

const Report = () => {
  const { scanId } = useParams();
  const [scanData, setScanData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    let timeoutId;
    
    const fetchScanData = async () => {
      try {
        const res = await api.get(`/results/${scanId}`);
        setScanData(res.data);
        
        // Polling logic
        if (res.data.status === 'pending' || res.data.status === 'running') {
            timeoutId = setTimeout(fetchScanData, POLL_INTERVAL_MS);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch scan results.");
      }
    };

    if (scanId) {
       fetchScanData();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [scanId]);

  // Safely parse JSON strings globally
  const parsedResults = useMemo(() => {
    if (!scanData || !scanData.results) return [];
    return scanData.results.map(r => {
        let parsed = { attempts: [] };
        try {
            if (r.raw_output) parsed = JSON.parse(r.raw_output);
        } catch(e) {}
        return { ...r, parsedOutput: parsed };
    });
  }, [scanData]);

  if (error) {
    return <div className="text-red-400 p-8 text-center bg-red-900/10 rounded-xl">{error}</div>;
  }

  if (!scanData) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-400">Loading scan details...</p>
      </div>
    );
  }

  const { status, model_name, model_type, tool_type, scan_type } = scanData;
  const isScanning = status === 'pending' || status === 'running';

  const tabs = ['Overview', 'Attempts Log', 'Successful Attacks', 'Probe Analysis', 'Run Configuration'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Top Banner Header */}
      <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 overflow-hidden relative">
         {/* Background Accent Gradients */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

         <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
               <div className="flex items-center gap-2 mb-2">
                   <div className="h-4 w-1 bg-indigo-500 rounded-full"></div>
                   <h1 className="text-xl font-medium text-gray-400 uppercase tracking-widest">Security Dashboard</h1>
               </div>
               <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
                 {model_name} <span className="text-indigo-400 opacity-50 block md:inline text-2xl md:text-4xl">/ {scan_type}</span>
               </h2>
            </div>
            
            <div className="flex flex-col items-end gap-3 self-stretch md:self-auto justify-center">
               <div className="flex items-center gap-2 bg-gray-900/50 px-4 py-2 rounded-xl border border-gray-700 text-sm shadow-inner">
                  <div className="text-gray-400 font-medium">Status</div>
                  {isScanning ? (
                      <div className="flex items-center text-indigo-400 font-bold ml-2">
                          <span className="relative flex h-3 w-3 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                          </span>
                          Running...
                      </div>
                  ) : status === 'failed' ? (
                      <span className="text-red-400 font-bold ml-2">Failed</span>
                  ) : (
                      <span className="text-emerald-400 font-bold ml-2">Completed</span>
                  )}
               </div>
            </div>
         </div>
         
         {/* Tab Navigation */}
         {!isScanning && status !== 'failed' && (
             <div className="border-t border-white/10 bg-gray-900/50 px-4 md:px-8 flex overflow-x-auto relative z-10 scrollbar-hide">
                <div className="flex space-x-1 py-3">
                   {tabs.map(tab => (
                     <button
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 ${
                         activeTab === tab 
                           ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm' 
                           : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                       }`}
                     >
                       {tab}
                     </button>
                   ))}
                </div>
             </div>
         )}
      </div>

      {scanData.error_message && (
          <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-300">
            <h4 className="font-bold text-red-400 mb-1">Execution Failed</h4>
            <p className="text-sm font-mono whitespace-pre-wrap">{scanData.error_message}</p>
          </div>
      )}

      {/* Render Active Tab */}
      {!isScanning && status !== 'failed' && (
        <div className="min-h-[400px]">
           {activeTab === 'Overview' && <ReportOverview scanData={scanData} parsedResults={parsedResults} />}
           {activeTab === 'Attempts Log' && <AttemptsLog parsedResults={parsedResults} />}
           {activeTab === 'Successful Attacks' && <SuccessfulAttacks parsedResults={parsedResults} />}
           {activeTab === 'Probe Analysis' && <ProbeAnalysis parsedResults={parsedResults} />}
           {activeTab === 'Run Configuration' && <RunConfiguration scanData={scanData} />}
        </div>
      )}
    </div>
  );
};

export default Report;
