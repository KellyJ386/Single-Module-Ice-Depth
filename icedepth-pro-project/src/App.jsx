import React, { useState, useEffect, useCallback, useRef } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ==================== HELPER FUNCTIONS ====================
// Convert inches to centimeters
const inchesToCm = (inches) => {
  const num = parseFloat(inches);
  return isNaN(num) ? 0 : (num * 2.54).toFixed(2);
};

// Get color based on ice depth threshold
const getDepthColor = (inches) => {
  const depth = parseFloat(inches);
  if (isNaN(depth)) return '#6b7280'; // gray for invalid
  if (depth < 1) return '#ef4444'; // red
  if (depth >= 1 && depth <= 1.75) return '#10b981'; // green
  if (depth > 1.75 && depth <= 2) return '#eab308'; // yellow
  if (depth > 2 && depth <= 5) return '#ef4444'; // red
  return '#6b7280'; // gray for out of range
};

// Measurement point numbering - snaking pattern from one end to the other
const POINT_NUMBERS = {
  olympic: {
    'circle-1': 1, 'circle-2': 2, 'circle-3': 3,
    'circle-4': 6, 'circle-5': 5, 'circle-6': 4,
    'circle-7': 7, 'circle-8': 8,
    'circle-9': 11, 'circle-10': 10, 'circle-11': 9,
    'circle-12': 12, 'circle-13': 13, 'circle-14': 14
  },
  nhl: {
    'circle-15': 1, 'circle-16': 2, 'circle-17': 3,
    'circle-18': 6, 'circle-19': 5, 'circle-20': 4,
    'circle-21': 7, 'circle-22': 8,
    'circle-23': 11, 'circle-24': 10, 'circle-25': 9,
    'circle-26': 12, 'circle-27': 13, 'circle-28': 14
  },
  studio: {
    'circle-29': 1, 'circle-30': 2, 'circle-31': 3,
    'circle-32': 6, 'circle-33': 5, 'circle-34': 4,
    'circle-35': 9, 'circle-36': 8, 'circle-37': 7,
    'circle-38': 10, 'circle-39': 11, 'circle-40': 12
  }
};

// ==================== ICE RINK SVG TEMPLATES ====================
const RINK_SVGS = {
  olympic: `<svg viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="ice-texture" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
  <rect width="20" height="20" fill="#e8f4f8"/><circle cx="5" cy="5" r="1" fill="#d0e8f0" opacity="0.3"/>
  <circle cx="15" cy="15" r="1" fill="#d0e8f0" opacity="0.3"/></pattern></defs>
  <rect width="1200" height="600" fill="url(#ice-texture)"/>
  <rect x="50" y="50" width="1100" height="500" fill="none" stroke="#1e3a8a" stroke-width="8" rx="40"/>
  <line x1="350" y1="50" x2="350" y2="550" stroke="#1e40af" stroke-width="4"/>
  <line x1="850" y1="50" x2="850" y2="550" stroke="#1e40af" stroke-width="4"/>
  <line x1="600" y1="50" x2="600" y2="550" stroke="#dc2626" stroke-width="4"/>
  <circle cx="600" cy="300" r="80" fill="none" stroke="#1e40af" stroke-width="3"/>
  <circle cx="600" cy="300" r="5" fill="#1e40af"/>
  <circle cx="300" cy="200" r="60" fill="none" stroke="#dc2626" stroke-width="2"/>
  <circle cx="300" cy="400" r="60" fill="none" stroke="#dc2626" stroke-width="2"/>
  <circle cx="900" cy="200" r="60" fill="none" stroke="#dc2626" stroke-width="2"/>
  <circle cx="900" cy="400" r="60" fill="none" stroke="#dc2626" stroke-width="2"/>
  <path d="M 150 280 Q 180 300 150 320" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <path d="M 1050 280 Q 1020 300 1050 320" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <circle id="circle-1" cx="200" cy="150" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="200" y="155" text-anchor="middle" font-size="11" font-weight="bold" fill="white">1</text>
  <circle id="circle-2" cx="200" cy="300" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="200" y="305" text-anchor="middle" font-size="11" font-weight="bold" fill="white">2</text>
  <circle id="circle-3" cx="200" cy="450" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="200" y="455" text-anchor="middle" font-size="11" font-weight="bold" fill="white">3</text>
  <circle id="circle-4" cx="400" cy="150" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="400" y="155" text-anchor="middle" font-size="11" font-weight="bold" fill="white">6</text>
  <circle id="circle-5" cx="400" cy="300" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="400" y="305" text-anchor="middle" font-size="11" font-weight="bold" fill="white">5</text>
  <circle id="circle-6" cx="400" cy="450" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="400" y="455" text-anchor="middle" font-size="11" font-weight="bold" fill="white">4</text>
  <circle id="circle-7" cx="600" cy="150" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="600" y="155" text-anchor="middle" font-size="11" font-weight="bold" fill="white">7</text>
  <circle id="circle-8" cx="600" cy="450" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="600" y="455" text-anchor="middle" font-size="11" font-weight="bold" fill="white">8</text>
  <circle id="circle-9" cx="800" cy="150" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="800" y="155" text-anchor="middle" font-size="11" font-weight="bold" fill="white">11</text>
  <circle id="circle-10" cx="800" cy="300" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="800" y="305" text-anchor="middle" font-size="11" font-weight="bold" fill="white">10</text>
  <circle id="circle-11" cx="800" cy="450" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="800" y="455" text-anchor="middle" font-size="11" font-weight="bold" fill="white">9</text>
  <circle id="circle-12" cx="1000" cy="150" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="1000" y="155" text-anchor="middle" font-size="11" font-weight="bold" fill="white">12</text>
  <circle id="circle-13" cx="1000" cy="300" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="1000" y="305" text-anchor="middle" font-size="11" font-weight="bold" fill="white">13</text>
  <circle id="circle-14" cx="1000" cy="450" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="1000" y="455" text-anchor="middle" font-size="11" font-weight="bold" fill="white">14</text>
  <text x="600" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#1e3a8a">Olympic Ice Rink - 60m × 30m</text>
</svg>`,
  
  nhl: `<svg viewBox="0 0 1200 510" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="ice-nhl" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
  <rect width="20" height="20" fill="#e8f4f8"/><circle cx="5" cy="5" r="1" fill="#d0e8f0" opacity="0.3"/>
  <circle cx="15" cy="15" r="1" fill="#d0e8f0" opacity="0.3"/></pattern></defs>
  <rect width="1200" height="510" fill="url(#ice-nhl)"/>
  <rect x="50" y="50" width="1100" height="410" fill="none" stroke="#1e3a8a" stroke-width="8" rx="28"/>
  <line x1="350" y1="50" x2="350" y2="460" stroke="#1e40af" stroke-width="4"/>
  <line x1="850" y1="50" x2="850" y2="460" stroke="#1e40af" stroke-width="4"/>
  <line x1="600" y1="50" x2="600" y2="460" stroke="#dc2626" stroke-width="4"/>
  <circle cx="600" cy="255" r="65" fill="none" stroke="#1e40af" stroke-width="3"/>
  <circle cx="600" cy="255" r="4" fill="#1e40af"/>
  <circle cx="280" cy="160" r="55" fill="none" stroke="#dc2626" stroke-width="2"/>
  <circle cx="280" cy="350" r="55" fill="none" stroke="#dc2626" stroke-width="2"/>
  <circle cx="920" cy="160" r="55" fill="none" stroke="#dc2626" stroke-width="2"/>
  <circle cx="920" cy="350" r="55" fill="none" stroke="#dc2626" stroke-width="2"/>
  <path d="M 130 235 Q 160 255 130 275" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <path d="M 1070 235 Q 1040 255 1070 275" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <circle id="circle-15" cx="180" cy="140" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="180" y="145" text-anchor="middle" font-size="11" font-weight="bold" fill="white">1</text>
  <circle id="circle-16" cx="180" cy="255" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="180" y="260" text-anchor="middle" font-size="11" font-weight="bold" fill="white">2</text>
  <circle id="circle-17" cx="180" cy="370" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="180" y="375" text-anchor="middle" font-size="11" font-weight="bold" fill="white">3</text>
  <circle id="circle-18" cx="450" cy="140" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="450" y="145" text-anchor="middle" font-size="11" font-weight="bold" fill="white">6</text>
  <circle id="circle-19" cx="450" cy="255" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="450" y="260" text-anchor="middle" font-size="11" font-weight="bold" fill="white">5</text>
  <circle id="circle-20" cx="450" cy="370" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="450" y="375" text-anchor="middle" font-size="11" font-weight="bold" fill="white">4</text>
  <circle id="circle-21" cx="600" cy="140" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="600" y="145" text-anchor="middle" font-size="11" font-weight="bold" fill="white">7</text>
  <circle id="circle-22" cx="600" cy="370" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="600" y="375" text-anchor="middle" font-size="11" font-weight="bold" fill="white">8</text>
  <circle id="circle-23" cx="750" cy="140" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="750" y="145" text-anchor="middle" font-size="11" font-weight="bold" fill="white">11</text>
  <circle id="circle-24" cx="750" cy="255" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="750" y="260" text-anchor="middle" font-size="11" font-weight="bold" fill="white">10</text>
  <circle id="circle-25" cx="750" cy="370" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="750" y="375" text-anchor="middle" font-size="11" font-weight="bold" fill="white">9</text>
  <circle id="circle-26" cx="1020" cy="140" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="1020" y="145" text-anchor="middle" font-size="11" font-weight="bold" fill="white">12</text>
  <circle id="circle-27" cx="1020" cy="255" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="1020" y="260" text-anchor="middle" font-size="11" font-weight="bold" fill="white">13</text>
  <circle id="circle-28" cx="1020" cy="370" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="1020" y="375" text-anchor="middle" font-size="11" font-weight="bold" fill="white">14</text>
  <text x="600" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#1e3a8a">NHL Ice Rink - 200ft × 85ft</text>
</svg>`,
  
  studio: `<svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <defs><pattern id="ice-studio" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
  <rect width="20" height="20" fill="#e8f4f8"/><circle cx="5" cy="5" r="1" fill="#d0e8f0" opacity="0.3"/>
  <circle cx="15" cy="15" r="1" fill="#d0e8f0" opacity="0.3"/></pattern></defs>
  <rect width="800" height="400" fill="url(#ice-studio)"/>
  <rect x="50" y="50" width="700" height="300" fill="none" stroke="#1e3a8a" stroke-width="6" rx="30"/>
  <line x1="400" y1="50" x2="400" y2="350" stroke="#dc2626" stroke-width="3"/>
  <circle cx="400" cy="200" r="50" fill="none" stroke="#1e40af" stroke-width="2"/>
  <circle cx="400" cy="200" r="4" fill="#1e40af"/>
  <circle cx="250" cy="130" r="40" fill="none" stroke="#dc2626" stroke-width="2"/>
  <circle cx="250" cy="270" r="40" fill="none" stroke="#dc2626" stroke-width="2"/>
  <circle cx="550" cy="130" r="40" fill="none" stroke="#dc2626" stroke-width="2"/>
  <circle cx="550" cy="270" r="40" fill="none" stroke="#dc2626" stroke-width="2"/>
  <circle id="circle-29" cx="150" cy="120" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="150" y="125" text-anchor="middle" font-size="11" font-weight="bold" fill="white">1</text>
  <circle id="circle-30" cx="150" cy="200" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="150" y="205" text-anchor="middle" font-size="11" font-weight="bold" fill="white">2</text>
  <circle id="circle-31" cx="150" cy="280" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="150" y="285" text-anchor="middle" font-size="11" font-weight="bold" fill="white">3</text>
  <circle id="circle-32" cx="300" cy="120" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="300" y="125" text-anchor="middle" font-size="11" font-weight="bold" fill="white">6</text>
  <circle id="circle-33" cx="300" cy="200" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="300" y="205" text-anchor="middle" font-size="11" font-weight="bold" fill="white">5</text>
  <circle id="circle-34" cx="300" cy="280" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="300" y="285" text-anchor="middle" font-size="11" font-weight="bold" fill="white">4</text>
  <circle id="circle-35" cx="500" cy="120" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="500" y="125" text-anchor="middle" font-size="11" font-weight="bold" fill="white">9</text>
  <circle id="circle-36" cx="500" cy="200" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="500" y="205" text-anchor="middle" font-size="11" font-weight="bold" fill="white">8</text>
  <circle id="circle-37" cx="500" cy="280" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="500" y="285" text-anchor="middle" font-size="11" font-weight="bold" fill="white">7</text>
  <circle id="circle-38" cx="650" cy="120" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="650" y="125" text-anchor="middle" font-size="11" font-weight="bold" fill="white">10</text>
  <circle id="circle-39" cx="650" cy="200" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="650" y="205" text-anchor="middle" font-size="11" font-weight="bold" fill="white">11</text>
  <circle id="circle-40" cx="650" cy="280" r="12" fill="#ef4444" stroke="white" stroke-width="2"/>
  <text x="650" y="285" text-anchor="middle" font-size="11" font-weight="bold" fill="white">12</text>
  <text x="400" y="30" text-anchor="middle" font-size="18" font-weight="bold" fill="#1e3a8a">Studio Ice Rink - 40m × 20m</text>
</svg>`
};

// ==================== COMPLETE ICEDEPTH PRO SAAS APPLICATION ====================

export default function IceDepthProSAAS() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRink, setSelectedRink] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  if (!currentUser) {
    return <LoginPage onLogin={(user) => {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }} />;
  }

  if (selectedRink) {
    return <RinkEditor 
      rinkId={selectedRink} 
      currentUser={currentUser}
      onBack={() => setSelectedRink(null)}
      onLogout={() => {
        setCurrentUser(null);
        setSelectedRink(null);
        localStorage.removeItem('currentUser');
      }}
    />;
  }

  return <Dashboard 
    currentUser={currentUser}
    onSelectRink={setSelectedRink}
    onLogout={() => {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
    }}
  />;
}

// ==================== LOGIN PAGE COMPONENT ====================
function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields');
      return;
    }

    const users = JSON.parse(localStorage.getItem('iceRinkUsers') || '[]');

    if (isLogin) {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        onLogin({ email: user.email, name: user.name, id: user.id });
      } else {
        setError('Invalid email or password');
      }
    } else {
      if (users.some(u => u.email === email)) {
        setError('Email already exists');
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('iceRinkUsers', JSON.stringify(users));
      onLogin({ email: newUser.email, name: newUser.name, id: newUser.id });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">IceDepth Pro</h1>
          <p className="text-gray-600 mt-2">Professional Ice Rink Monitoring System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-4 text-center font-semibold transition-colors ${
                isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-4 text-center font-semibold transition-colors ${
                !isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="John Smith"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p className="font-semibold mb-1">Demo Account:</p>
              <p>Email: demo@icedepth.com</p>
              <p>Password: demo123</p>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2025 IceDepth Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// ==================== DASHBOARD COMPONENT ====================
function Dashboard({ currentUser, onSelectRink, onLogout }) {
  const RINK_TEMPLATES = [
    {
      id: 'olympic',
      name: 'Olympic Rink',
      description: 'Standard Olympic size: 60m × 30m',
      dimensions: '60m × 30m',
      icon: '🏒',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'nhl',
      name: 'NHL Rink',
      description: 'North American hockey standard: 200ft × 85ft',
      dimensions: '200ft × 85ft',
      icon: '🥅',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'studio',
      name: 'Studio Rink',
      description: 'Smaller practice/training rink: 40m × 20m',
      dimensions: '40m × 20m',
      icon: '⛸️',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">IceDepth Pro</h1>
                <p className="text-sm text-gray-500">Ice Rink Monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {currentUser.name}!
          </h2>
          <p className="text-gray-600">
            Select a rink template to start monitoring ice depth measurements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Rinks</p>
                <p className="text-3xl font-bold text-gray-800">3</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Measurements Today</p>
                <p className="text-3xl font-bold text-gray-800">
                  {Object.keys(JSON.parse(localStorage.getItem(`iceDepth_${currentUser.id}`) || '{}')).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Account Status</p>
                <p className="text-3xl font-bold text-green-600">Active</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Select Ice Rink Template</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {RINK_TEMPLATES.map((rink) => (
            <div
              key={rink.id}
              onClick={() => onSelectRink(rink.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:scale-105 transform"
            >
              <div className={`bg-gradient-to-r ${rink.color} p-6 text-white`}>
                <div className="text-5xl mb-3">{rink.icon}</div>
                <h3 className="text-2xl font-bold mb-1">{rink.name}</h3>
                <p className="text-sm opacity-90">{rink.dimensions}</p>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{rink.description}</p>
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                  <span>Open Rink</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">How to use IceDepth Pro</h4>
              <p className="text-sm text-gray-600 mb-3">
                Click on any rink template above to start. Once inside, click on the red measurement points to record ice depth readings. Your data is automatically saved and associated with your account.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click red circles to add depth measurements</li>
                <li>• Blue badges show saved measurements</li>
                <li>• Data persists across sessions</li>
                <li>• Export reports (coming soon)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ==================== RINK EDITOR COMPONENT ====================
function RinkEditor({ rinkId, currentUser, onBack, onLogout }) {
  const [svgContent, setSvgContent] = useState(null);
  const [popupPos, setPopupPos] = useState(null);
  const [popupContent, setPopupContent] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [notesValue, setNotesValue] = useState("");
  const [savedValues, setSavedValues] = useState({});
  const [svgRef, setSvgRef] = useState(null);
  const svgContainerRef = useRef(null);
  const [isSvgInjected, setIsSvgInjected] = useState(false);
  const savedValuesRef = useRef(savedValues);

  useEffect(() => {
    savedValuesRef.current = savedValues;
  }, [savedValues]);

  useEffect(() => {
    const storageKey = `iceDepth_${currentUser.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const allData = JSON.parse(saved);
      const rinkData = allData[rinkId] || {};
      setSavedValues(rinkData);
    }
  }, [rinkId, currentUser.id]);

  useEffect(() => {
    setSvgContent(RINK_SVGS[rinkId]);
  }, [rinkId]);

  useEffect(() => {
    document.body.style.overflow = popupPos ? "hidden" : "";
  }, [popupPos]);

  useEffect(() => {
    if (svgContent && svgContainerRef.current) {
      svgContainerRef.current.innerHTML = svgContent;
      setIsSvgInjected(true);
    }
  }, [svgContent]);

  useEffect(() => {
    if (!svgContainerRef.current || !isSvgInjected) return;

    const svgEl = svgContainerRef.current.querySelector("svg");
    if (!svgEl) return;

    setSvgRef(svgContainerRef);

    svgEl.setAttribute("width", "100%");
    svgEl.setAttribute("height", "100%");
    svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svgEl.style.display = "block";

    const circles = svgEl.querySelectorAll('circle[r="12"]');
    circles.forEach((circle) => {
      if (!circle.getAttribute("data-clicked")) {
        circle.style.cursor = "pointer";
        circle.addEventListener("click", () => handleCircleClick(circle));
        circle.setAttribute("data-clicked", "true");
      }
    });
  }, [isSvgInjected]);

  useEffect(() => {
    if (!svgContainerRef.current || !isSvgInjected) return;

    const svgEl = svgContainerRef.current.querySelector("svg");
    if (!svgEl) return;

    Object.entries(savedValues).forEach(([id, data]) => {
      if (svgEl.querySelector(`g[data-for="${id}"]`)) return;

      const circle = svgEl.querySelector(`#${id}`);
      if (!circle) return;

      const cx = circle.getAttribute("cx");
      const cy = circle.getAttribute("cy");

      // Handle both old string format and new object format
      const depthValue = typeof data === 'string' ? data : data.depth;
      const cm = inchesToCm(depthValue);
      const color = getDepthColor(depthValue);

      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("data-for", id);
      group.setAttribute("pointer-events", "none");

      const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      bgCircle.setAttribute("cx", cx);
      bgCircle.setAttribute("cy", cy);
      bgCircle.setAttribute("r", "22");
      bgCircle.setAttribute("fill", color);

      // Display inches on first line
      const textInches = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textInches.setAttribute("x", cx);
      textInches.setAttribute("y", parseInt(cy) - 2);
      textInches.setAttribute("text-anchor", "middle");
      textInches.setAttribute("font-size", "11");
      textInches.setAttribute("font-weight", "bold");
      textInches.setAttribute("fill", "white");
      textInches.textContent = `${depthValue}"`;

      // Display cm on second line
      const textCm = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textCm.setAttribute("x", cx);
      textCm.setAttribute("y", parseInt(cy) + 10);
      textCm.setAttribute("text-anchor", "middle");
      textCm.setAttribute("font-size", "9");
      textCm.setAttribute("font-weight", "normal");
      textCm.setAttribute("fill", "white");
      textCm.setAttribute("opacity", "0.9");
      textCm.textContent = `${cm}cm`;

      group.appendChild(bgCircle);
      group.appendChild(textInches);
      group.appendChild(textCm);
      svgEl.appendChild(group);
    });
  }, [savedValues, isSvgInjected]);

  const handleCircleClick = useCallback((circleEl) => {
    const id = circleEl.id?.replace("circle-", "") || circleEl.id;
    const rect = circleEl.getBoundingClientRect();
    const popupWidth = 250;
    const popupHeight = 120;

    const space = {
      top: rect.top,
      bottom: window.innerHeight - rect.bottom,
      left: rect.left,
      right: window.innerWidth - rect.right,
    };

    let translate = { x: "-50%", y: "-100%" };
    let posX = rect.left + rect.width / 2;
    let posY = rect.top;

    if (space.bottom > popupHeight) {
      translate.y = "0%";
      posY = rect.bottom;
    } else if (space.top > popupHeight) {
      translate.y = "-100%";
      posY = rect.top;
    } else {
      translate.y = "0%";
      posY = rect.bottom;
    }

    if (space.left < popupWidth / 2) {
      translate.x = "0%";
    } else if (space.right < popupWidth / 2) {
      translate.x = "-100%";
    }

    const fullId = `circle-${id}`;
    const savedData = savedValuesRef.current[fullId];
    const pointNumber = POINT_NUMBERS[rinkId][fullId] || id;

    setPopupPos({ x: posX, y: posY, translate, id: fullId });
    setPopupContent(`Measurement Point #${pointNumber}`);

    // Handle both old string format and new object format
    if (typeof savedData === 'string') {
      setInputValue(savedData);
      setNotesValue("");
    } else if (savedData && typeof savedData === 'object') {
      setInputValue(savedData.depth || "");
      setNotesValue(savedData.notes || "");
    } else {
      setInputValue("");
      setNotesValue("");
    }
  }, [rinkId]);

  const handleSave = useCallback(() => {
    const fullId = popupPos.id;
    const svgEl = svgRef?.current?.querySelector("svg");
    const circleEl = svgEl?.querySelector(`#${fullId}`);
    if (!circleEl || !svgEl) return;

    const storageKey = `iceDepth_${currentUser.id}`;
    const allData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const rinkData = { ...allData[rinkId] } || {};
    
    const existingGroup = svgEl.querySelector(`g[data-for="${fullId}"]`);
    if (existingGroup) svgEl.removeChild(existingGroup);

    if (inputValue.trim() === "") {
      delete rinkData[fullId];
      if (Object.keys(rinkData).length === 0) {
        delete allData[rinkId];
      }
    } else {
      // Save as object with depth, notes, and timestamp
      rinkData[fullId] = {
        depth: inputValue.trim(),
        notes: notesValue.trim(),
        timestamp: new Date().toISOString()
      };
    }

    allData[rinkId] = rinkData;
    localStorage.setItem(storageKey, JSON.stringify(allData));
    setSavedValues(rinkData);
    closePopup();
  }, [popupPos, inputValue, notesValue, svgRef, rinkId, currentUser.id]);

  const closePopup = useCallback(() => {
    setPopupPos(null);
    setPopupContent("");
  }, []);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    const rinkNames = {
      olympic: 'Olympic Rink (60m × 30m)',
      nhl: 'NHL Rink (200ft × 85ft)',
      studio: 'Studio Rink (40m × 20m)'
    };

    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138);
    doc.text('IceDepth Pro - Measurement Report', 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(rinkNames[rinkId], 14, 30);
    doc.text(`User: ${currentUser.name} (${currentUser.email})`, 14, 37);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 44);

    // Prepare table data
    const tableData = [];
    Object.entries(savedValues).forEach(([id, data]) => {
      const pointNumber = POINT_NUMBERS[rinkId][id] || id.replace('circle-', '');
      const depthValue = typeof data === 'string' ? data : data.depth;
      const notes = typeof data === 'object' ? data.notes : '';
      const timestamp = typeof data === 'object' ? new Date(data.timestamp).toLocaleString() : 'N/A';
      const cm = inchesToCm(depthValue);

      const depth = parseFloat(depthValue);
      let status = 'Unknown';
      if (!isNaN(depth)) {
        if (depth < 1) status = 'Too Thin';
        else if (depth >= 1 && depth <= 1.75) status = 'Good';
        else if (depth > 1.75 && depth <= 2) status = 'Acceptable';
        else if (depth > 2 && depth <= 5) status = 'Too Thick';
      }

      tableData.push([
        pointNumber,
        `${depthValue}"`,
        `${cm} cm`,
        status,
        notes || '-',
        timestamp
      ]);
    });

    // Sort by point number
    tableData.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

    // Add table
    doc.autoTable({
      head: [['Point #', 'Depth (in)', 'Depth (cm)', 'Status', 'Notes', 'Recorded']],
      body: tableData,
      startY: 52,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 22 },
        2: { cellWidth: 22 },
        3: { cellWidth: 25 },
        4: { cellWidth: 50 },
        5: { cellWidth: 40 }
      },
      didParseCell: function(data) {
        if (data.column.index === 3 && data.section === 'body') {
          const status = data.cell.text[0];
          if (status === 'Too Thin' || status === 'Too Thick') {
            data.cell.styles.textColor = [239, 68, 68]; // red
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'Good') {
            data.cell.styles.textColor = [16, 185, 129]; // green
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'Acceptable') {
            data.cell.styles.textColor = [234, 179, 8]; // yellow
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    // Footer with guidelines
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Depth Guidelines:', 14, finalY);
    doc.setFontSize(9);
    doc.setTextColor(239, 68, 68);
    doc.text('• <1" - Too thin', 14, finalY + 7);
    doc.setTextColor(16, 185, 129);
    doc.text('• 1"-1.75" - Good', 14, finalY + 13);
    doc.setTextColor(234, 179, 8);
    doc.text('• 1.76"-2" - Acceptable', 14, finalY + 19);
    doc.setTextColor(239, 68, 68);
    doc.text('• 2.01"-5" - Too thick', 14, finalY + 25);

    // Save PDF
    const fileName = `IceDepth_${rinkId}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }, [savedValues, rinkId, currentUser]);

  const rinkNames = {
    olympic: 'Olympic Rink',
    nhl: 'NHL Rink',
    studio: 'Studio Rink'
  };

  const measurementCount = Object.keys(savedValues).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Dashboard</span>
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{rinkNames[rinkId]}</h1>
                <p className="text-sm text-gray-500">{measurementCount} measurements recorded</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {measurementCount > 0 && (
                <button
                  onClick={exportToPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export PDF</span>
                </button>
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">How to Record Measurements</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click any <span className="text-red-600 font-semibold">red circle</span> on the rink to add an ice depth measurement</li>
                <li>• Measurements are shown as <span className="text-blue-600 font-semibold">blue badges</span> with the depth value</li>
                <li>• Click on a blue badge to edit or delete the measurement (leave blank to delete)</li>
                <li>• All data is automatically saved to your account</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div ref={svgContainerRef} className="w-full" />
        </div>
      </main>

      {popupPos && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-40 z-[999]"
            onClick={closePopup}
          />
          <div
            className="fixed bg-white p-5 border border-gray-200 rounded-xl shadow-2xl min-w-[350px] max-w-[400px] z-[1000]"
            style={{
              top: popupPos.y,
              left: popupPos.x,
              transition: ".3s ease-in-out",
              transform: `translate(${popupPos.translate.x}, ${popupPos.translate.y})`,
            }}
          >
            <div className="text-blue-700 font-bold text-lg mb-1">{popupContent}</div>
            <p className="text-gray-500 text-sm mb-3">Enter ice depth in inches</p>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ice Depth</label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder='e.g., 1.5'
                className="outline-none h-12 w-full px-4 rounded-lg border-2 border-blue-500 focus:border-blue-600 text-gray-700 font-medium"
                autoFocus
              />
              {inputValue && !isNaN(parseFloat(inputValue)) && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    = <span className="font-semibold">{inchesToCm(inputValue)} cm</span>
                  </span>
                  <div
                    className="px-3 py-1 rounded-full text-white font-medium text-xs"
                    style={{ backgroundColor: getDepthColor(inputValue) }}
                  >
                    {parseFloat(inputValue) < 1 ? 'Too Thin' :
                     parseFloat(inputValue) >= 1 && parseFloat(inputValue) <= 1.75 ? 'Good' :
                     parseFloat(inputValue) > 1.75 && parseFloat(inputValue) <= 2 ? 'Acceptable' : 'Too Thick'}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder='Add any notes or observations...'
                className="outline-none w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 text-gray-700 resize-none"
                rows="3"
              />
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-semibold text-gray-700 mb-2">Depth Guidelines:</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">&lt;1" - Too thin</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">1"-1.75" - Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-600">1.76"-2" - Acceptable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">2.01"-5" - Too thick</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="cursor-pointer flex-1 bg-blue-600 text-white h-11 rounded-lg font-semibold text-base hover:bg-blue-700 transition-colors shadow-md"
              >
                Save
              </button>
              <button
                onClick={closePopup}
                className="cursor-pointer flex-1 h-11 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
