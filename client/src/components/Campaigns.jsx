import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Users, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function Campaigns() {
  const [stage, setStage] = useState('Lead');
  const [sentiment, setSentiment] = useState('Hesitant');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      // TODO: Swap localhost for import.meta.env.VITE_API_BASE_URL before cloud deployment
      const response = await axios.post('http://localhost:5000/api/campaigns/generate', {
        pipelineStage: stage,
        sentimentStatus: sentiment
      });
      
      setResult(response.data);
    } catch (err) {
      console.error("[Campaigns] POST /api/campaigns/generate failed:", err);
      setError(err.response?.data?.error || "Failed to reach the AI service. Is the local server running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="panel" style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={28} className="text-blue" />
          Audience Campaign Builder
        </h1>
        <p className="text-gray subtitle">Select an audience segment to generate a targeted, multi-channel AI drip campaign.</p>
      </div>

      {/* TODO: Refactor these inline styles into a proper CSS module or styled-components later */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ flex: 1 }}>
          <label className="font-medium">Target Pipeline Stage</label>
          <select 
            value={stage} 
            onChange={(e) => setStage(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          >
            <option value="Lead">Lead</option>
            <option value="Contacted">Contacted</option>
            <option value="In Negotiations">In Negotiations</option>
            <option value="Closed/Won">Closed/Won</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label className="font-medium">Target Sentiment</label>
          <select 
            value={sentiment} 
            onChange={(e) => setSentiment(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          >
            <option value="Ready">Ready</option>
            <option value="Interested">Interested</option>
            <option value="Hesitant">Hesitant</option>
            <option value="At Risk">At Risk</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <button 
        className="btn-primary" 
        onClick={handleGenerate} 
        disabled={isLoading}
        style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem' }}
      >
        <Sparkles size={18} />
        {isLoading ? "Analyzing Audience & Generating Campaign..." : "Generate AI Campaign Segment"}
      </button>

      {error && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '30px', padding: '24px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#047857', backgroundColor: '#d1fae5', padding: '10px 15px', borderRadius: '6px', fontWeight: '500' }}>
            <Users size={20} />
            Success! Campaign tailored for {result.targetCount} matching clients.
          </div>
          
          {/* THE PROFESSIONAL MARKDOWN RENDERER */}
          <div className="ai-markdown-content" style={{ lineHeight: '1.6', color: '#374151' }}>
            <ReactMarkdown
              components={{
                h3: ({node, ...props}) => <h3 style={{ marginTop: '1.5em', marginBottom: '0.5em', color: '#111827', fontSize: '1.2rem' }} {...props} />,
                strong: ({node, ...props}) => <strong style={{ color: '#111827', fontWeight: '600' }} {...props} />,
                hr: ({node, ...props}) => <hr style={{ margin: '2em 0', border: 'none', borderTop: '1px solid #e5e7eb' }} {...props} />,
                p: ({node, ...props}) => <p style={{ marginBottom: '1em' }} {...props} />
              }}
            >
              {result.draft}
            </ReactMarkdown>
          </div>

        </div>
      )}
    </div>
  );
}