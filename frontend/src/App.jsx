import React, { useState } from 'react';
import HierarchyVisualizer from './components/HierarchyVisualizer';

function App() {
  const [input, setInput] = useState('[\n  "A->B", "A->C", "B->D", "C->E", "E->F",\n  "X->Y", "Y->Z", "Z->X",\n  "P->Q", "Q->R",\n  "G->H", "G->H", "G->I",\n  "hello", "1->2", "A->"\n]');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Basic JSON validation
      let dataArray;
      try {
        dataArray = JSON.parse(input);
        if (!Array.isArray(dataArray)) throw new Error();
      } catch (e) {
        throw new Error("Invalid format. Please provide a valid JSON array of strings.");
      }

      const res = await fetch('http://localhost:4000/bfhl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: dataArray }),
      });

      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch from API');
      }

      setResponse(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>SRM Hierarchy Processor</h1>
        <p className="subtitle">Visualizing complex relationships with precision.</p>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="nodes-input">Node Relationships (JSON Array)</label>
          <textarea
            id="nodes-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='["A->B", "C->D"]'
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit to BFHL'}
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      {response && (
        <div className="results-section">
          <div className="section-title">Summary Dashboard</div>
          <div className="summary-grid card">
            <div className="stat-item">
              <div className="stat-value">{response.summary.total_trees}</div>
              <div className="stat-label">Total Trees</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{response.summary.total_cycles}</div>
              <div className="stat-label">Total Cycles</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{response.summary.largest_tree_root || 'N/A'}</div>
              <div className="stat-label">Largest Root</div>
            </div>
          </div>

          <div className="section-title">Hierarchy Visualizer</div>
          <HierarchyVisualizer hierarchies={response.hierarchies} />

          {response.invalid_entries.length > 0 && (
            <div className="card">
              <div style={{ color: '#f87171', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Invalid Entries Discarded
              </div>
              <div className="tag-list">
                {response.invalid_entries.map((entry, i) => (
                  <span key={i} className="tag">{entry}</span>
                ))}
              </div>
            </div>
          )}

          {response.duplicate_edges.length > 0 && (
            <div className="card">
              <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Duplicate Edges Found
              </div>
              <div className="tag-list">
                {response.duplicate_edges.map((entry, i) => (
                  <span key={i} className="tag">{entry}</span>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
             User: {response.user_id} | {response.college_roll_number}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
