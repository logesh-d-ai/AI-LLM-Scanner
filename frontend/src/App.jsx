import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import NewScan from './pages/NewScan';
import History from './pages/History';
import Report from './pages/Report';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans selection:bg-indigo-500/30">
        <Navbar />

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/new-scan" element={<NewScan />} />
            <Route path="/history" element={<History />} />
            <Route path="/report/:scanId" element={<Report />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
