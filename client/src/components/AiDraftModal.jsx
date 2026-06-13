import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, X } from 'lucide-react';

export default function AiDraftModal({ isOpen, onClose, client }) {
  const [notes, setNotes] = useState('');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !client) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    setDraft(''); 

    try {
      const response = await axios.post(`http://localhost:5000/api/clients/${client.id}/generate-follow-up`, {
        meetingNotes: notes
      });
      
      setDraft(response.data.draft);
    } catch (err) {
      console.error(`[AiDraftModal] POST /generate-follow-up failed for client ${client.id}:`, err);
      setError(err.response?.data?.error || "Failed to reach the AI service. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>AI Draft for {client.firstName}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="modal-form">
          {error && (
            <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label>Meeting Notes / Instructions</label>
            <textarea 
              rows="3" 
              placeholder="E.g., They love the dashboard but want a 10% discount. Make it friendly."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontFamily: 'inherit' }}
            />
          </div>
          
          <button 
            className="btn-primary" 
            onClick={handleGenerate} 
            disabled={isLoading || !notes.trim()}
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
          >
            <Sparkles size={16} /> 
            {isLoading ? "Generating Email..." : "Generate AI Follow-Up"}
          </button>

          {draft && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '500', color: '#6b7280', display: 'block', marginBottom: '8px' }}>
                Generated Email:
              </label>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#111827' }}>
                {draft}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}