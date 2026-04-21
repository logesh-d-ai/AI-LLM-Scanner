import React, { useState, useMemo } from 'react';

const AttemptsTab = ({ parsedResults }) => {
  // Flatten attempts
  const allAttempts = useMemo(() => {
    let attempts = [];
    parsedResults.forEach(r => {
      const atts = r.parsedOutput.attempts || [];
      atts.forEach(a => {
        attempts.push({ ...a, vulnerability_type: r.vulnerability_type });
      });
    });
    return attempts;
  }, [parsedResults]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, SUCCESS, BLOCKED
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [expandedRows, setExpandedRows] = useState({});

  // Filters logic
  const filteredData = useMemo(() => {
    return allAttempts.filter(item => {
      // Status Match
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }
      // Search Match
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        if (
          !item.prompt?.toLowerCase().includes(query) &&
          !item.response?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allAttempts, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleRow = (index) => {
    setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gray-800/80 rounded-2xl border border-white/5 overflow-hidden shadow-lg p-6">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
           <div className="relative w-full md:w-1/2">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             </div>
             <input
               type="text"
               placeholder="Search prompts or responses..."
               className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-xl bg-gray-900/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner text-sm"
               value={searchTerm}
               onChange={(e) => {
                   setSearchTerm(e.target.value);
                   setCurrentPage(1);
               }}
             />
           </div>

           <div className="flex gap-2">
             <button
               onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
               className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${statusFilter === 'ALL' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-gray-900 text-gray-400 border-white/10 hover:bg-gray-800'}`}
             >
               All
             </button>
             <button
               onClick={() => { setStatusFilter('SUCCESS'); setCurrentPage(1); }}
               className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${statusFilter === 'SUCCESS' ? 'bg-red-600 text-white border-red-500' : 'bg-gray-900 text-gray-400 border-white/10 hover:bg-gray-800'}`}
             >
               Success Only
             </button>
             <button
               onClick={() => { setStatusFilter('BLOCKED'); setCurrentPage(1); }}
               className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${statusFilter === 'BLOCKED' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-gray-900 text-gray-400 border-white/10 hover:bg-gray-800'}`}
             >
               Blocked Only
             </button>
           </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-gray-900/30">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-gray-800/80 text-xs uppercase text-gray-400 font-semibold tracking-wider">
              <tr>
                <th scope="col" className="w-[50px] px-4 py-4">Exp</th>
                <th scope="col" className="px-6 py-4 text-left">Probe</th>
                <th scope="col" className="px-6 py-4 text-left">Prompt Preview</th>
                <th scope="col" className="px-6 py-4 text-left">Response Preview</th>
                <th scope="col" className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
              {currentData.length > 0 ? (
                currentData.map((row, index) => {
                  const globalIndex = `${currentPage}-${index}`;
                  const isExpanded = expandedRows[globalIndex];
                  
                  return (
                    <React.Fragment key={globalIndex}>
                      <tr 
                        className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${isExpanded ? 'bg-white/[0.04]' : ''}`}
                        onClick={() => toggleRow(globalIndex)}
                      >
                        <td className="px-4 py-4 text-center text-gray-500">
                          {isExpanded ? (
                             <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          ) : (
                             <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-indigo-300">
                          {row.vulnerability_type}
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate">{row.prompt?.substring(0, 50)}...</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-gray-400">{row.response?.substring(0, 50)}...</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            {row.status === 'SUCCESS' ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-red-500/20 bg-red-500/10 text-red-400">
                                  SUCCESS
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                  BLOCKED
                                </span>
                            )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="5" className="px-0 py-0 border-b-0">
                            <div className="p-6 bg-gray-900 border-l-4 border-indigo-500 shadow-inner">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Prompt</h4>
                                  <div className="bg-gray-950 p-4 rounded-lg font-mono text-sm border border-gray-800 text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
                                    {row.prompt}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Model Response</h4>
                                  <div className={`p-4 rounded-lg font-mono text-sm border overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto ${row.status === 'SUCCESS' ? 'bg-red-950/20 border-red-900/30 text-red-200' : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-200'}`}>
                                    {row.response}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 bg-gray-900/10">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    No matching attempts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 mt-6 pt-4">
            <div className="text-sm text-gray-400">
              Showing <span className="font-semibold text-white">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold text-white">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> of <span className="font-semibold text-white">{filteredData.length}</span> results
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
    </div>
  );
};

export default AttemptsTab;
