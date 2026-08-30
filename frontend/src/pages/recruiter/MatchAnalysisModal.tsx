import React from 'react';
import type { ExplainabilityData, MatchResult } from '../../api/jobs';
import { Card } from '../../components/Card';
import './MatchProfiles.css'; // Reuse styles or add new ones

interface MatchAnalysisModalProps {
  matchResult: MatchResult;
  onClose: () => void;
}

export const MatchAnalysisModal: React.FC<MatchAnalysisModalProps> = ({ matchResult, onClose }) => {
  let explainData: ExplainabilityData | null = null;
  try {
    if (typeof matchResult.explanation === 'string') {
      explainData = JSON.parse(matchResult.explanation);
    } else {
      explainData = matchResult.explanation;
    }
  } catch (e) {
    console.error("Failed to parse explanation data", e);
  }

  if (!explainData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', padding: '2rem' }}>
          <h2>Match Analysis</h2>
          <p>Detailed analysis is not available for this candidate.</p>
          <button className="btn" onClick={onClose} style={{ marginTop: '1rem' }}>Close</button>
        </div>
      </div>
    );
  }

  const {
    overall_match, match_label, confidence, category_scores,
    matched_requirements, partial_requirements, missing_requirements, not_available_requirements,
    summary, strengths, gaps
  } = explainData;

  const renderRequirement = (req: any, icon: string, color: string) => (
    <div key={req.requirement} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <strong>{req.requirement}</strong>
        <span style={{ fontSize: '0.8rem', color: color, background: `${color}15`, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
          {req.status}
        </span>
      </div>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginLeft: '1.7rem' }}>
        <strong>Evidence:</strong> {req.evidence}
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '0' }}>
        
        {/* Header Section */}
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>Candidate vs Job Match</h1>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{overall_match}%</span>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-light)' }}>{match_label}</span>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                <strong>Confidence:</strong> {confidence}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-light)' }}>&times;</button>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Why This Candidate Matches</h3>
            <p style={{ color: 'var(--text)', lineHeight: '1.5' }}>{summary}</p>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Category Breakdown</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {Object.entries(category_scores).map(([cat, score]) => (
              <div key={cat} style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', textTransform: 'capitalize', marginBottom: '0.5rem' }}>
                  {cat.replace('_', ' ')}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                  {score}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Gaps */}
        <div style={{ padding: '2rem', display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Main Strengths</h3>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text)' }}>
              {strengths.length > 0 ? strengths.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>) : <li>None identified.</li>}
            </ul>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Main Gaps</h3>
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text)' }}>
              {gaps.length > 0 ? gaps.map((g, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{g}</li>) : <li>None identified.</li>}
            </ul>
          </div>
        </div>

        {/* Detailed Requirements */}
        <div style={{ padding: '2rem' }}>
          
          {matched_requirements.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--success)', borderBottom: '2px solid var(--success)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                ✅ Strong Matches ({matched_requirements.length})
              </h3>
              {matched_requirements.map(req => renderRequirement(req, '✅', 'var(--success)'))}
            </div>
          )}

          {partial_requirements.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--warning)', borderBottom: '2px solid var(--warning)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                ⚠️ Partial Matches ({partial_requirements.length})
              </h3>
              {partial_requirements.map(req => renderRequirement(req, '⚠️', 'var(--warning)'))}
            </div>
          )}

          {missing_requirements.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--danger)', borderBottom: '2px solid var(--danger)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                ❌ Missing Requirements ({missing_requirements.length})
              </h3>
              {missing_requirements.map(req => renderRequirement(req, '❌', 'var(--danger)'))}
            </div>
          )}

          {not_available_requirements.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: 'var(--text-light)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                ℹ️ Not Available ({not_available_requirements.length})
              </h3>
              {not_available_requirements.map(req => renderRequirement(req, 'ℹ️', 'var(--text-light)'))}
            </div>
          )}
          
        </div>

      </div>
    </div>
  );
};
