import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Download, Plus, Sparkles, Edit, Filter } from 'lucide-react';
import AddClientModal from './AddClientModal';
import AiDraftModal from './AiDraftModal'; 

export default function Contacts() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [aiClient, setAiClient] = useState(null); 
  const [editingClient, setEditingClient] = useState(null);

  // --- NEW: State for Search and Filter ---
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('All');

 const fetchClients = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/clients`);
      setClients(data);
      setError(null);
    } catch (err) {
      console.error("[Contacts] GET /api/clients failed:", err);
      setError("Failed to load contacts. Please check database connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenAddModal = () => {
    setEditingClient(null); 
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  // --- NEW: Smart Filtering Logic using useMemo ---
  // useMemo ensures React doesn't recalculate this array unless the search or data changes
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // 1. Check if the text matches name, company, or email
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        client.firstName.toLowerCase().includes(searchLower) ||
        client.lastName.toLowerCase().includes(searchLower) ||
        client.company.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower);

      // 2. Check if the stage matches the dropdown (or if 'All' is selected)
      const matchesFilter = filterStage === 'All' || client.pipelineStage === filterStage;

      return matchesSearch && matchesFilter;
    });
  }, [clients, searchQuery, filterStage]);

  // --- NEW: Export to CSV Logic ---
  const handleExport = () => {
    if (filteredClients.length === 0) {
      alert("No data to export!");
      return;
    }

    // 1. Create the top row of the Excel/CSV file
    const headers = "ID,First Name,Last Name,Company,Email,Phone,Pipeline Stage,Sentiment Status\n";
    
    // 2. Loop through the filtered clients and create a row for each one
    const rows = filteredClients.map(c => 
      `${c.id},${c.firstName},${c.lastName},${c.company},${c.email},${c.phone},${c.pipelineStage},${c.sentimentStatus}\n`
    ).join("");

    // 3. Combine headers and rows
    const csvContent = headers + rows;

    // 4. Create a virtual file (Blob) in the browser and trigger a download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "xeno_contacts_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="contacts-container">
      <div className="contacts-header-section">
        <div>
          <h1>Contact Directory</h1>
          <p className="subtitle">Manage your lead database, track communications, and monitor client sentiment.</p>
        </div>
      </div>

      <div className="contacts-toolbar">
        <div className="search-bar">
          <Search size={18} className="text-gray" />
          <input 
            type="text" 
            placeholder="Search name, company, or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent' }}
          />
        </div>
        <div className="toolbar-actions">
          
          {/* SWAPPED BUTTON FOR A FUNCTIONAL DROPDOWN */}
          <select 
            className="btn-secondary"
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            style={{ appearance: 'none', cursor: 'pointer' }}
          >
            <option value="All">All Stages</option>
            <option value="Lead">Lead</option>
            <option value="Contacted">Contacted</option>
            <option value="In Negotiations">In Negotiations</option>
            <option value="Closed/Won">Closed/Won</option>
          </select>

          {/* BOUND THE EXPORT FUNCTION HERE */}
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={16} /> Export CSV
          </button>
          
          <button className="btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} /> Add New Client
          </button>
        </div>
      </div>

      <div className="table-container panel">
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Loading contacts...
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
            {error}
          </div>
        ) : filteredClients.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            No clients match your search criteria.
          </div>
        ) : (
          <table className="contacts-table">
            <thead>
              <tr>
                <th>Name & Contact</th>
                <th>Company</th>
                <th>Contact Details</th>
                <th>Expected Revenue</th>
                <th>Pipeline Stage</th>
                <th>Sentiment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* UPDATED TO MAP OVER FILTERED CLIENTS, NOT ALL CLIENTS */}
              {filteredClients.map(client => (
                <tr key={client.id}>
                  <td>
                    <div className="table-user">
                      <div className="avatar bg-blue-light text-blue">
                        {client?.firstName?.[0] || '?'}{client?.lastName?.[0] || ''}
                      </div>
                      <div>
                        <div className="font-medium">{client.firstName} {client.lastName}</div>
                        <div className="text-sm text-gray">ID: #{client.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-medium text-blue">{client.company}</td>
                  <td className="text-sm text-gray">
                    <div>{client.email}</div>
                    <div>{client.phone}</div>
                  </td>
                  <td className="font-medium" style={{ color: '#059669' }}>
                    ${client.dealValue?.toLocaleString() || '0'}
                  </td>
                  <td>
                    <span className="badge badge-gray">{client.pipelineStage}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${client.sentimentStatus.toLowerCase().replace(' ', '-')}`}>
                      {client.sentimentStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => setAiClient(client)}
                      >
                        <Sparkles size={14} /> AI Draft
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Edit client"
                        onClick={() => handleOpenEditModal(client)}
                      >
                        <Edit size={18} style={{ color: '#6b7280' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onClientAdded={fetchClients}
        editData={editingClient}
      />

      <AiDraftModal 
        isOpen={!!aiClient} 
        onClose={() => setAiClient(null)} 
        client={aiClient} 
      />
    </div>
  );
}