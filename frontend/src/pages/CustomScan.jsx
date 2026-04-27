import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import ScanFormLayout from '../components/common/ScanFormLayout';

const CustomScan = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    scan_type: 'Prompt Injection',
    model_name: 'custom-model',
    endpoint: '',
    method: 'POST',
    headers: '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{key}}"\n}',
    api_key: '',
    req_template: '{\n  "model": "my-model",\n  "messages": [{ "role": "user", "content": "{{input}}" }]\n}',
    response_field: 'choices[0].message.content'
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTest = async () => {
    setTesting(true);
    setError(null);
    setTestResult(null);

    if (!formData.endpoint) {
      setError("Endpoint URL is required for testing.");
      setTesting(false);
      return;
    }

    try {
      let parsedHeaders;
      let parsedBody;
      try {
        parsedHeaders = JSON.parse(formData.headers || "{}");
        parsedBody = JSON.parse(formData.req_template || "{}");
      } catch (e) {
        throw new Error("Invalid JSON format in Headers or Request Body Template.");
      }

      const res = await api.post('/scan/test-endpoint', {
        endpoint: formData.endpoint,
        method: formData.method,
        headers: parsedHeaders,
        req_template: parsedBody,
        response_field: formData.response_field,
        api_key: formData.api_key
      });

      setTestResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.message || err.response?.data?.detail || "An error occurred testing the endpoint.");
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let parsedHeaders;
      let parsedBody;
      try {
        parsedHeaders = JSON.parse(formData.headers || "{}");
        parsedBody = JSON.parse(formData.req_template || "{}");
      } catch (e) {
        throw new Error("Invalid JSON format in Headers or Request Body Template.");
      }

      const payload = {
        tool_type: 'Garak',
        scan_type: formData.scan_type,
        model_type: 'rest',
        model_name: formData.model_name,
        custom_rest_config: {
          endpoint: formData.endpoint,
          method: formData.method,
          headers: parsedHeaders,
          req_template: parsedBody,
          response_field: formData.response_field
        },
        api_key: formData.api_key
      };

      const res = await api.post('/scan', payload);
      navigate(`/report/${res.data.id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || err.response?.data?.detail || "An error occurred starting the scan.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "mt-1 block w-full rounded-lg bg-gray-900 border-gray-700 text-white focus:border-purple-500 focus:ring-purple-500 shadow-sm transition duration-150 ease-in-out sm:text-sm p-3 border font-mono text-sm";
  const labelClasses = "block text-sm font-medium text-gray-300";

  return (
    <ScanFormLayout
      title="Custom Endpoint Configuration"
      icon={<svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>}
      theme="purple"
      error={error}
      onSubmit={handleSubmit}
      maxWidth="max-w-3xl"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
            <h3 className="text-lg font-medium text-purple-300 mb-4">Scan Settings</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClasses}>Scan Type</label>
                <select name="scan_type" value={formData.scan_type} onChange={handleChange} className={inputClasses.replace("font-mono text-sm", "")}>
                  <option value="Prompt Injection">Prompt Injection</option>
                  <option value="Jailbreak">Jailbreak</option>
                  <option value="Data Leakage">Data Leakage</option>
                  <option value="Toxicity">Toxicity</option>
                  <option value="Custom">Custom (All)</option>
                </select>
              </div>
              <div>
                <label className={labelClasses}>Model Name (Display)</label>
                <input required type="text" name="model_name" value={formData.model_name} onChange={handleChange} className={inputClasses.replace("font-mono text-sm", "")} />
              </div>
            </div>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClasses}>Endpoint URL</label>
          <input required type="url" name="endpoint" value={formData.endpoint} onChange={handleChange} placeholder="https://api.example.com/v1/chat/completions" className={inputClasses} />
        </div>

        <div>
          <label className={labelClasses}>HTTP Method</label>
          <select name="method" value={formData.method} onChange={handleChange} className={inputClasses}>
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </select>
        </div>

        <div>
          <label className={labelClasses}>Bearer Token <span className="text-gray-500 text-xs ml-1">(Replaces {`{{key}}`})</span></label>
          <input type="password" name="api_key" value={formData.api_key} onChange={handleChange} placeholder="sk-..." className={inputClasses} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClasses}>Headers (JSON)</label>
          <textarea name="headers" value={formData.headers} onChange={handleChange} rows={4} className={inputClasses}></textarea>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClasses}>Request Body Template (JSON)</label>
          <p className="text-xs text-gray-500 mb-2">Use {`{{input}}`} where the prompt should be injected.</p>
          <textarea name="req_template" value={formData.req_template} onChange={handleChange} rows={6} className={inputClasses}></textarea>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClasses}>Response Field Path</label>
          <p className="text-xs text-gray-500 mb-2">The path to the model's response text (e.g. <code>choices[0].message.content</code> or <code>text</code>).</p>
          <input required type="text" name="response_field" value={formData.response_field} onChange={handleChange} placeholder="choices[0].message.content" className={inputClasses} />
        </div>
      </div>

      {testResult && (
        <div className={`p-4 rounded-xl border ${testResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} overflow-hidden`}>
          <h3 className={`font-bold mb-2 ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
            Test Result: {testResult.success ? 'Success' : 'Failed'} (Status {testResult.status_code})
          </h3>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-300 mb-1">Parsed Output (from Response Field Path):</p>
            <div className="p-3 bg-gray-900 rounded border border-gray-700 font-mono text-sm break-words whitespace-pre-wrap">
              {testResult.parsed_output !== null ? testResult.parsed_output : <span className="text-gray-500 italic">null (field not found or empty)</span>}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-300 mb-1">Raw Response:</p>
            <div className="p-3 bg-gray-900 rounded border border-gray-700 font-mono text-xs overflow-x-auto max-h-48 custom-scrollbar">
              <pre>{JSON.stringify(testResult.raw_response, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 flex gap-4">
        <button
          type="button"
          onClick={handleTest}
          disabled={testing || loading}
          className="flex-1 py-3 px-4 border border-purple-500/50 rounded-xl text-sm font-bold text-purple-300 bg-purple-900/20 hover:bg-purple-800/40 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? "Testing..." : "Test Endpoint"}
        </button>
        <button
          type="submit"
          disabled={loading || testing}
          className="flex-2 w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-purple-500/30 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Starting...
            </>
          ) : "Start Vulnerability Scan"}
        </button>
      </div>
    </ScanFormLayout>
  );
};

export default CustomScan;
