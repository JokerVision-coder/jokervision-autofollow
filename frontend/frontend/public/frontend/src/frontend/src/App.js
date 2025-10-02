import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🚗 JokerVision AutoFollow</h1>
        <p>AI-Powered Car Dealership Platform</p>
        <div className="dashboard">
          <nav>
            <button>Dashboard</button>
            <button>Leads</button>
            <button>Sales</button>
            <button>Team</button>
          </nav>
          <div className="content">
            <h2>Welcome to Your Dashboard</h2>
            <p>Backend Status: Connected ✅</p>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
