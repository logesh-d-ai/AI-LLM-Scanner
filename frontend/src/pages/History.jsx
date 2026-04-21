import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const History = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const res = await api.get('/scans');
        setScans(res.data);
      } catch (err) {
        console.error("Failed to fetch scans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-400">Loading scan history...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 p-6 sm:p-8 transform transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Scan History
      </h2>

      {scans.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
           No scans have been run yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-medium">Model</th>
                <th className="p-4 font-medium">Tool</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-300">
              {scans.map(scan => (
                <tr key={scan.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-indigo-300">{scan.model_name} <span className="text-xs text-gray-500 ml-1">({scan.model_type})</span></td>
                  <td className="p-4">{scan.tool_type}</td>
                  <td className="p-4">{scan.scan_type}</td>
                  <td className="p-4">
                    {scan.status === 'pending' || scan.status === 'running' ? (
                       <span className="text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20 text-xs font-semibold uppercase tracking-wide">Running</span>
                    ) : scan.status === 'failed' ? (
                       <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20 text-xs font-semibold uppercase tracking-wide">Failed</span>
                    ) : (
                       <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 text-xs font-semibold uppercase tracking-wide">Completed</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(scan.created_at).toLocaleDateString()} {new Date(scan.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => navigate(`/report/${scan.id}`)}
                      className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-lg transition-colors text-xs font-bold uppercase tracking-wide"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default History;
