import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { measurementsAPI } from '../api';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function HistoryAnalytics({ rinkId, currentUser, onBack }) {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const rinkNames = {
    olympic: 'Olympic Rink (60m × 30m)',
    nhl: 'NHL Rink (200ft × 85ft)',
    studio: 'Studio Rink (40m × 20m)'
  };

  useEffect(() => {
    fetchData();
  }, [rinkId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsData, historyData] = await Promise.all([
        measurementsAPI.getAnalytics(rinkId),
        measurementsAPI.getHistory(rinkId, 50)
      ]);

      setAnalytics(analyticsData.analytics);
      setHistory(historyData.history);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No data available</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Status Distribution Pie Chart
  const statusData = {
    labels: ['Too Thin (<1")', 'Good (1-1.75")', 'Acceptable (1.76-2")', 'Too Thick (2.01-5")'],
    datasets: [{
      data: [analytics.tooThin, analytics.good, analytics.acceptable, analytics.tooThick],
      backgroundColor: ['#ef4444', '#10b981', '#eab308', '#f97316'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Timeline data - last 20 measurements
  const timelineData = {
    labels: history.slice(0, 20).reverse().map((_, i) => i + 1),
    datasets: [{
      label: 'Ice Depth (inches)',
      data: history.slice(0, 20).reverse().map(h => h.depth),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
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
                <span>Back</span>
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Analytics & History</h1>
                <p className="text-sm text-gray-500">{rinkNames[rinkId]}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-1">Total Points</p>
                <p className="text-3xl font-bold text-gray-800">{analytics.totalMeasurements}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-1">Average Depth</p>
                <p className="text-3xl font-bold text-blue-600">{analytics.averageDepth}"</p>
                <p className="text-xs text-gray-500 mt-1">{(analytics.averageDepth * 2.54).toFixed(2)} cm</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-1">Min Depth</p>
                <p className="text-3xl font-bold text-red-600">{analytics.minDepth}"</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-sm text-gray-600 mb-1">Max Depth</p>
                <p className="text-3xl font-bold text-orange-600">{analytics.maxDepth}"</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Status Distribution</h3>
                <div className="max-w-sm mx-auto">
                  <Pie data={statusData} options={{ maintainAspectRatio: true }} />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Too Thin: {analytics.tooThin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Good: {analytics.good}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Acceptable: {analytics.acceptable}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>Too Thick: {analytics.tooThick}</span>
                  </div>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Measurements Trend</h3>
                <Line
                  data={timelineData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Depth (inches)' }
                      },
                      x: {
                        title: { display: true, text: 'Measurement #' }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Measurement History</h3>
              <p className="text-sm text-gray-600 mt-1">Last 50 measurements</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Point</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Depth</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((record, index) => {
                    const depth = record.depth;
                    let status = 'Unknown';
                    let statusColor = 'gray';

                    if (depth < 1) {
                      status = 'Too Thin';
                      statusColor = 'red';
                    } else if (depth >= 1 && depth <= 1.75) {
                      status = 'Good';
                      statusColor = 'green';
                    } else if (depth > 1.75 && depth <= 2) {
                      status = 'Acceptable';
                      statusColor = 'yellow';
                    } else if (depth > 2 && depth <= 5) {
                      status = 'Too Thick';
                      statusColor = 'orange';
                    }

                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          {record.point_id.replace('circle-', 'Point ')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {depth}" ({(depth * 2.54).toFixed(2)} cm)
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-${statusColor}-500`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {record.notes || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(record.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
