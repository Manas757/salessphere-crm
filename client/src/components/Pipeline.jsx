import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Pipeline() {
  const [clients, setClients] = useState([]);
  
  const STAGES = ['Lead', 'Contacted', 'In Negotiations', 'Closed/Won'];

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/clients');
      setClients(data);
    } catch (error) {
      console.error("[Pipeline] Error fetching clients:", error);
    }
  };

  const handleDragStart = (e, clientId) => {
    e.dataTransfer.setData('clientId', clientId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData('clientId');

    setClients(prevClients => 
      prevClients.map(client => 
        client.id === parseInt(clientId) 
          ? { ...client, pipelineStage: newStage } 
          : client
      )
    );

    try {
      await axios.put(`http://localhost:5000/api/clients/${clientId}/stage`, {
        pipelineStage: newStage
      });
    } catch (error) {
      console.error("[Pipeline] Failed to update pipeline stage in database", error);
      fetchClients(); 
    }
  };

  return (
    <div className="pipeline-container">
      <div className="pipeline-header">
        <h1>Sales Pipeline</h1>
        <p className="subtitle">Drag and drop clients to update their current stage.</p>
      </div>

      <div className="pipeline-board">
        {STAGES.map(stage => (
          <div 
            key={stage} 
            className="pipeline-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="column-header">
              <h3 className="column-title">{stage}</h3>
              <span className="column-count">
                {clients.filter(c => c.pipelineStage === stage).length}
              </span>
            </div>
            
            <div className="card-list">
              {clients
                .filter(client => client.pipelineStage === stage)
                .map(client => (
                  <div 
                    key={client.id} 
                    className="client-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, client.id)}
                  >
                    <div className="card-header">
                      <h4 className="company-name">{client.company}</h4>
                      <span className={`sentiment-badge badge-${client.sentimentStatus.toLowerCase().replace(' ', '-')}`}>
                        {client.sentimentStatus}
                      </span>
                    </div>
                    <p className="contact-info font-medium">{client.firstName} {client.lastName}</p>
                    <p className="contact-info text-sm text-gray">{client.email}</p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}