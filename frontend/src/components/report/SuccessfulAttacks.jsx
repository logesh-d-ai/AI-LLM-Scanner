import React, { useState } from 'react';

const AttacksTab = ({ parsedResults }) => {
  // Extract all successful attacks
  const successfulAttacks = [];
  parsedResults.forEach(r => {
    const attempts = r.parsedOutput.attempts || [];
    attempts.forEach(attempt => {
      if (attempt.status === 'SUCCESS') {
        successfulAttacks.push({
          ...attempt,
          vulnerability_type: r.vulnerability_type
        });
      }
    });
  });

  const [expandedCards, setExpandedCards] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const toggleCard = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (successfulAttacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-800/50 rounded-2xl border border-white/5">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Successful Attacks</h3>
        <p className="text-gray-400">The model successfully blocked adversarial prompts in all tests.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(successfulAttacks.length / rowsPerPage);
  const currentData = successfulAttacks.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-200">Successful Attacks ({successfulAttacks.length})</h3>
        <span className="text-sm bg-red-500/20 text-red-300 px-3 py-1 rounded-full border border-red-500/30">
          Highly Vulnerable Cases
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {currentData.map((attack, index) => {
          const globalIndex = `${currentPage}-${index}`;
          const isExpanded = expandedCards[globalIndex];
          return (
            <div key={globalIndex} className="bg-gray-800/80 rounded-2xl border border-red-500/20 overflow-hidden shadow-lg hover:border-red-500/40 transition-colors">
              <div className="p-5 border-b border-white/5 cursor-pointer flex justify-between items-center bg-red-900/10" onClick={() => toggleCard(globalIndex)}>
                <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-3">
                       <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-500/30">{attack.vulnerability_type}</span>
                       <span className="text-gray-400 text-xs">Seq: {attack.seq} | Gen Index: {attack.generation_index}</span>
                   </div>
                   <div className="text-gray-200 font-medium truncate max-w-2xl text-sm">
                       {attack.prompt.substring(0, 100)}...
                   </div>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors">
                  {isExpanded ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="p-6 bg-gray-900/50 space-y-6">
                  {/* Meta Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4 border border-white/5">
                          <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Detector Name</label>
                          <div className="text-sm text-yellow-400 font-mono">{attack.detector_name || "Unknown"}</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4 border border-white/5">
                          <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Trigger Keyword</label>
                          <div className="text-sm text-red-400 font-mono">{attack.trigger_keyword || "N/A"}</div>
                      </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Injected Prompt</label>
                     <div className="bg-gray-950 rounded-lg p-4 overflow-x-auto text-sm text-gray-300 font-mono border border-gray-800 shadow-inner whitespace-pre-wrap">
                        {attack.prompt}
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Model Response</label>
                     <div className="bg-gray-950 rounded-lg p-4 overflow-x-auto text-sm font-mono border border-gray-800 shadow-inner whitespace-pre-wrap text-red-200">
                        {attack.response}
                     </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 mt-6 pt-4 bg-gray-900/30 p-4 rounded-xl">
          <div className="text-sm text-gray-400">
            Showing <span className="font-semibold text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold text-white">{Math.min(currentPage * rowsPerPage, successfulAttacks.length)}</span> of <span className="font-semibold text-white">{successfulAttacks.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === 1 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600 border border-white/10'}`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === totalPages ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600 border border-white/10'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttacksTab;
