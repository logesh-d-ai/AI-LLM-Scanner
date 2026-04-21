import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const OverviewTab = ({ scanData, parsedResults }) => {
  // Aggregate stats
  let totalAttemptsCount = 0;
  let totalHits = 0;
  const promptVulnCount = {};
  
  parsedResults.forEach(r => {
    const attempts = r.parsedOutput.attempts || [];
    attempts.forEach(attempt => {
      totalAttemptsCount++;
      if (attempt.status === 'SUCCESS') {
        totalHits++;
        const p = attempt.prompt;
        promptVulnCount[p] = (promptVulnCount[p] || 0) + 1;
      }
    });
  });

  const successRate = totalAttemptsCount > 0 ? ((totalHits / totalAttemptsCount) * 100).toFixed(1) : 0;
  
  // Calculate top prompts
  const topPrompts = Object.entries(promptVulnCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Overall Security Status
  let securityStatus = "Safe";
  let statusColor = "text-emerald-400";
  let bgStatusColor = "bg-emerald-500/10 border-emerald-500/20";
  let secDescription = "No significant vulnerabilities were identified during this scan.";

  if (successRate > 15) {
      securityStatus = "Highly Vulnerable";
      statusColor = "text-red-400";
      bgStatusColor = "bg-red-500/10 border-red-500/20";
      secDescription = "Critical risk! The model exhibits a high success rate to adversarial attacks. Immediate action is required.";
  } else if (successRate > 0) {
      securityStatus = "Vulnerable";
      statusColor = "text-yellow-400";
      bgStatusColor = "bg-yellow-500/10 border-yellow-500/20";
      secDescription = "Some vulnerabilities detected. The model can be bypassed under specific conditions.";
  }

  // Chart
  const severities = { High: 0, Medium: 0, Low: 0 };
  parsedResults.forEach(r => {
      if (severities[r.severity] !== undefined) severities[r.severity]++;
  });

  const chartData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [severities.High, severities.Medium, severities.Low],
      backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(59, 130, 246, 0.8)'],
      borderColor: ['rgba(239, 68, 68, 1)', 'rgba(234, 179, 8, 1)', 'rgba(59, 130, 246, 1)'],
      borderWidth: 1,
    }],
  };

  const chartOptions = {
    cutout: '75%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#e5e7eb', padding: 20 } }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`col-span-1 md:col-span-4 p-6 rounded-2xl border ${bgStatusColor} shadow-lg backdrop-blur-sm`}>
            <h3 className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-1">Overall Security Status</h3>
            <div className={`text-3xl font-extrabold ${statusColor} mb-2`}>{securityStatus}</div>
            <p className="text-gray-300">{secDescription}</p>
        </div>

        <div className="bg-gray-800/60 p-6 rounded-2xl border border-white/5 shadow-md">
           <div className="text-gray-400 text-sm font-medium mb-1">Total Attempts</div>
           <div className="text-3xl font-bold text-white">{totalAttemptsCount}</div>
        </div>
        <div className="bg-gray-800/60 p-6 rounded-2xl border border-white/5 shadow-md">
           <div className="text-gray-400 text-sm font-medium mb-1">Successful Attacks (Hits)</div>
           <div className="text-3xl font-bold text-red-400">{totalHits}</div>
        </div>
        <div className="bg-gray-800/60 p-6 rounded-2xl border border-white/5 shadow-md">
           <div className="text-gray-400 text-sm font-medium mb-1">Attack Success Rate</div>
           <div className="text-3xl font-bold text-yellow-400">{successRate}%</div>
        </div>
        <div className="bg-gray-800/60 p-6 rounded-2xl border border-white/5 shadow-md">
           <div className="text-gray-400 text-sm font-medium mb-1">Number of Probes</div>
           <div className="text-3xl font-bold text-indigo-400">{parsedResults.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-800/60 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-medium text-gray-300 mb-6 w-full text-left">Severity Distribution</h3>
            {parsedResults.length > 0 ? (
                <div className="w-full max-w-[250px] aspect-square relative pb-4">
                   <Doughnut data={chartData} options={chartOptions} />
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-30px]">
                      <span className="text-3xl font-extrabold text-white">{parsedResults.length}</span>
                      <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Issues</span>
                   </div>
                </div>
            ) : (
                <div className="w-full text-center py-12 text-gray-500">
                   No vulnerabilities found
                </div>
            )}
        </div>

        <div className="lg:col-span-2 bg-gray-800/60 p-6 rounded-2xl border border-white/5">
             <h3 className="text-lg font-medium text-gray-300 mb-4">Top Vulnerable Prompts</h3>
             <div className="space-y-3">
                 {topPrompts.length > 0 ? topPrompts.map(([prompt, count], idx) => (
                     <div key={idx} className="bg-gray-900/50 p-4 rounded-xl border border-red-500/10 flex justify-between items-center gap-4">
                         <div className="text-sm text-gray-300 font-mono truncate max-w-lg">{prompt}</div>
                         <div className="flex-shrink-0 bg-red-500/20 text-red-400 px-3 py-1 rounded border border-red-500/30 text-sm font-bold">
                             {count} Hits
                         </div>
                     </div>
                 )) : (
                     <div className="text-gray-500 text-center py-8">No successful attacks detected.</div>
                 )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
