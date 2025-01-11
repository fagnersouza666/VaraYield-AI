import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';

function App() {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <Dashboard selectedRiskLevel={selectedRiskLevel} onRiskLevelChange={setSelectedRiskLevel} />
        </main>
      </div>
    </div>
  );
}

export default App;