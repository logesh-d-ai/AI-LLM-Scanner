import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const PROBE_CATEGORIES = {
  "Prompt Injection": ["promptinject.HijackHateHumans", "promptinject.HijackKillHumans", "promptinject.HijackLongPrompt"],
  "Jailbreak": ["dan.Ablation_Dan_11_0", "dan.AutoDANCached", "dan.DanInTheWild", "dan.Dan_10_0", "dan.Dan_11_0", "dan.Dan_6_0", "dan.Dan_7_0", "dan.Dan_8_0", "dan.Dan_9_0", "dan.Maximum", "dan.Maximum_multiplier", "dan.Maximum_multiplier_v2", "dan.Stanford", "dan.TwoSample"],
  "Data Leakage": ["leakreplay.Literature"],
  "Toxicity": ["realtoxicityprompts.RTPBlank", "realtoxicityprompts.RTPFlirtation", "realtoxicityprompts.RTPHateSpeech", "realtoxicityprompts.RTPIllocutionary", "realtoxicityprompts.RTPInsult", "realtoxicityprompts.RTPSevereToxicity", "realtoxicityprompts.RTPThreat", "realtoxicityprompts.RTPProfanity"]
};

const NewScan = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tool_type: 'Garak',
    scan_type: 'Prompt Injection',
    model_type: 'openai',
    model_name: 'gpt-3.5-turbo',
    api_endpoint: '',
    api_key: '',
    temperature: '',
    max_tokens: ''
  });
  const [selectedProbes, setSelectedProbes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "scan_type") {
       setSelectedProbes([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.model_type === 'openai' && !formData.api_key) {
      setError("API key required for OpenAI models");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        max_tokens: formData.max_tokens ? parseInt(formData.max_tokens) : null,
        probes: selectedProbes.length > 0 ? selectedProbes : null
      };

      const res = await api.post('/scan', payload);
      navigate(`/report/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "An error occurred starting the scan.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "mt-1 block w-full rounded-lg bg-gray-900 border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500 shadow-sm transition duration-150 ease-in-out sm:text-sm p-3 border";
  const labelClasses = "block text-sm font-medium text-gray-300";

  return (
    <div className="mt-8 animate-in slide-in-from-bottom-8 duration-500 flex justify-center">
      <div className="w-full max-w-2xl bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 transform transition-all duration-300 hover:shadow-indigo-500/10">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          New Configuration
        </h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-3">
             <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            
            <div className="sm:col-span-2">
               <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-t-xl">
                   <h3 className="text-lg font-medium text-indigo-300 mb-4">Plugin Settings</h3>
                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClasses}>Tool Type</label>
                        <select name="tool_type" value={formData.tool_type} onChange={handleChange} className={inputClasses}>
                          <option value="Garak">Garak</option>
                          <option value="future_tool" disabled>Custom Tool (Coming Soon)</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClasses}>Scan Type</label>
                        <select name="scan_type" value={formData.scan_type} onChange={handleChange} className={inputClasses}>
                          <option value="Prompt Injection">Prompt Injection</option>
                          <option value="Jailbreak">Jailbreak</option>
                          <option value="Data Leakage">Data Leakage</option>
                          <option value="Toxicity">Toxicity</option>
                          <option value="Custom">Custom (All)</option>
                        </select>
                      </div>
                   </div>
               </div>
               
               <div className="p-4 bg-gray-900/80 border border-gray-700/50 rounded-b-xl border-t-0">
                   <div className="flex items-center justify-between mb-3 border-b flex-wrap border-gray-700/50 pb-2">
                       <h3 className="text-sm font-medium text-gray-300">Target Specific Probes</h3>
                       {PROBE_CATEGORIES[formData.scan_type] && PROBE_CATEGORIES[formData.scan_type].length > 0 && (
                           <div className="text-xs mt-2 sm:mt-0">
                               <button
                                 type="button"
                                 onClick={() => setSelectedProbes(PROBE_CATEGORIES[formData.scan_type])}
                                 className="text-indigo-400 font-medium hover:text-indigo-300 mr-3 transition-colors"
                               >Select All</button>
                               <button
                                 type="button"
                                 onClick={() => setSelectedProbes([])}
                                 className="text-gray-400 hover:text-gray-300 transition-colors"
                               >Clear</button>
                           </div>
                       )}
                   </div>
                   {PROBE_CATEGORIES[formData.scan_type] ? (
                       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto custom-scrollbar">
                          {PROBE_CATEGORIES[formData.scan_type].map(probeName => (
                              <label key={probeName} className="flex items-start space-x-2 text-xs text-gray-400 cursor-pointer hover:text-gray-200">
                                  <input
                                     type="checkbox"
                                     checked={selectedProbes.includes(probeName)}
                                     onChange={(e) => {
                                         if (e.target.checked) setSelectedProbes(prev => [...prev, probeName]);
                                         else setSelectedProbes(prev => prev.filter(p => p !== probeName));
                                     }}
                                     className="rounded border-gray-600 mt-0.5 bg-gray-800 text-indigo-500 focus:ring-indigo-500 transition duration-150 ease-in-out"
                                  />
                                  <span className="truncate font-mono" title={probeName}>{probeName.split('.').pop()}</span>
                              </label>
                          ))}
                       </div>
                   ) : (
                       <p className="text-xs text-gray-500 italic">No specific granular probes dynamically mapped for this category.</p>
                   )}
               </div>
            </div>

            <div>
              <label className={labelClasses}>Model Vendor / Type</label>
              <select name="model_type" value={formData.model_type} onChange={handleChange} className={inputClasses}>
                <option value="openai">OpenAI</option>
                <option value="huggingface">HuggingFace</option>
                <option value="cohere">Cohere</option>
                <option value="anthropic">Anthropic</option>
                <option value="custom">Custom Endpoint</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Model Name</label>
              <input required type="text" name="model_name" value={formData.model_name} onChange={handleChange} placeholder="e.g. gpt-4" className={inputClasses}/>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClasses}>API Key <span className="text-gray-500 text-xs ml-2">(Stored only during runtime)</span></label>
              <input type="password" name="api_key" value={formData.api_key} onChange={handleChange} className={inputClasses}/>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClasses}>API Endpoint <span className="text-gray-500 text-xs ml-2">(Optional, for custom models)</span></label>
              <input type="text" name="api_endpoint" value={formData.api_endpoint} onChange={handleChange} placeholder="https://api.example.com/v1" className={inputClasses}/>
            </div>
            <div>
              <label className={labelClasses}>Temperature <span className="text-gray-500 text-xs">(Optional)</span></label>
              <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} className={inputClasses}/>
            </div>
            <div>
              <label className={labelClasses}>Max Tokens <span className="text-gray-500 text-xs">(Optional)</span></label>
              <input type="number" name="max_tokens" value={formData.max_tokens} onChange={handleChange} className={inputClasses}/>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Initializing Probe...
                </>
              ) : "Start Vulnerability Scan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewScan;
