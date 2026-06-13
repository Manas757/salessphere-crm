import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, CheckCircle, TrendingUp, Plus } from 'lucide-react';
import axios from 'axios';
import AddClientModal from './AddClientModal'; // <-- Import your modal

// --- Brand Colors for the Pie Chart ---
const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalRevenue: 0,
    dealsClosed: 0,
    winRate: 0,
    sentimentData: [],
    topOpportunities: []
  });

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/analytics');
      
      const closed = data.pipelineData?.find(d => d.stage === 'Closed/Won')?.count || 0;
      
      setStats({
        totalClients: data.totalClients || 0,
        totalRevenue: data.totalRevenue || 0,
        dealsClosed: closed,
        winRate: closed > 0 ? ((closed / data.totalClients) * 100).toFixed(1) : 0,
        sentimentData: data.sentimentData || [],
        topOpportunities: data.topOpportunities || []
      });
    } catch (error) {
      console.error("Failed to load dashboard stats", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Analytics Dashboard</h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Welcome back. Here's what's happening in your pipeline today.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <StatCard icon={<Users size={20} color="#0ea5e9"/>} title="Total Active Leads" value={stats.totalClients} trend="+12.5%" />
        <StatCard icon={<DollarSign size={20} color="#10b981"/>} title="Revenue in Pipeline" value={`$${stats.totalRevenue.toLocaleString()}`} trend="+8.2%" />
        <StatCard icon={<CheckCircle size={20} color="#6366f1"/>} title="Deals Closed (MTD)" value={stats.dealsClosed} trend="+18.4%" />
        <StatCard icon={<TrendingUp size={20} color="#f43f5e"/>} title="Win Rate" value={`${stats.winRate}%`} trend="-2.1%" negative />
      </div>

      {/* Side-by-Side: Client Sentiment & Top Opportunities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Client Sentiment Donut Chart */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#0f172a' }}>Client Sentiment</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>Distribution of lead readiness and health.</p>
          </div>
          
          <div style={{ height: '300px', width: '100%' }}>
            {stats.sentimentData && stats.sentimentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '100px 0' }}>No sentiment data available.</p>
            )}
          </div>
        </div>

        {/* Weighted Top Opportunities List */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '600', color: '#0f172a' }}> Top Opportunities</h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.85rem' }}>Deals prioritized by revenue & sentiment weight.</p>
            
            {stats.topOpportunities.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '80px 0' }}>No active priority opportunities found.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {stats.topOpportunities.map((opp) => (
                  <li key={opp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div>
                      <span style={{ fontWeight: '600', display: 'block', color: '#334155', fontSize: '0.95rem' }}>{opp.company}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', display: 'inline-block' }}>
                        {opp.name} • <span style={{ color: '#0ea5e9', fontWeight: '500' }}>{opp.sentiment}</span>
                      </span>
                    </div>
                    <span style={{ fontWeight: '600', color: '#10b981', fontSize: '1rem', alignSelf: 'center' }}>
                      ${opp.dealValue?.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '16px', paddingTop: '16px', textAlign: 'center' }}>
             <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Formula: Deal Value × Sentiment Weight Multiplier</span>
          </div>
        </div>

      </div>

      {/* Add Client Modal Component */}
      <AddClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onClientAdded={fetchStats}
        editData={null}
      />

    </div>
  );
}

// Mini Component for Stat Cards
function StatCard({ icon, title, value, trend, negative }) {
  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '8px' }}>
          {icon}
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '4px 8px', borderRadius: '20px', backgroundColor: negative ? '#ffe4e6' : '#ecfdf5', color: negative ? '#e11d48' : '#059669' }}>
          {trend}
        </span>
      </div>
      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>{title}</p>
      <h2 style={{ margin: '5px 0 0 0', fontSize: '1.8rem', color: '#0f172a' }}>{value}</h2>
    </div>
  );
}