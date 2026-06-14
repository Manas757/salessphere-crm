import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

const INITIAL_STATE = {
  firstName: '',
  lastName: '',
  company: '',
  email: '',
  phone: '',
  pipelineStage: 'Lead',
  sentimentStatus: 'Hesitant',
  dealValue: 0
};

export default function AddClientModal({ isOpen, onClose, onClientAdded, editData }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editData) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/clients/${editData.id}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/clients`, formData);
      }

      setFormData(INITIAL_STATE);
      onClientAdded();
      onClose();
    } catch (err) {
      console.error("[AddClientModal] Save failed:", err);
      setError(err.response?.data?.error || "Failed to save client. Is the server running?");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h2>{editData ? "Edit Client" : "Add New Client"}</h2>
            <p className="subtitle">
              {editData ? "Update the client's profile details." : "Enter the details to create a new client profile."}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstName" placeholder="e.g. John" required
                value={formData.firstName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastName" placeholder="e.g. Doe" required
                value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Company</label>
            <input type="text" name="company" placeholder="Company Name" required
              value={formData.company} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="john.doe@example.com" required
              value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" placeholder="+1 (555) 000-0000"
              value={formData.phone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Expected Deal Value ($)</label>
            <input
              type="number"
              name="dealValue"
              placeholder="e.g. 50000"
              min="0"
              value={formData.dealValue}
              // We use parseInt so it saves as a number, not a string
              onChange={(e) => setFormData(prev => ({ ...prev, dealValue: parseInt(e.target.value) || 0 }))}
            />
          </div>

          <div className="form-group">
            <label>Initial Pipeline Stage</label>
            <select name="pipelineStage" value={formData.pipelineStage} onChange={handleChange}>
              <option value="Lead">Lead</option>
              <option value="Contacted">Contacted</option>
              <option value="In Negotiations">In Negotiations</option>
              <option value="Closed/Won">Closed/Won</option>
            </select>
          </div>

          <div className="form-group">
            <label>Client Sentiment</label>
            <select name="sentimentStatus" value={formData.sentimentStatus} onChange={handleChange}>
              <option value="Ready">Ready</option>
              <option value="Interested">Interested</option>
              <option value="Hesitant">Hesitant</option>
              <option value="At Risk">At Risk</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">
              {editData ? "Update Client" : "Save Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}