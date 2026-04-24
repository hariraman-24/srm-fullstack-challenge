import React from 'react';

const TreeRenderer = ({ nodeName, children }) => {
  const childEntries = Object.entries(children);
  
  return (
    <div className="tree-node">
      <span className="node-label">{nodeName}</span>
      {childEntries.length > 0 && (
        <div className="children">
          {childEntries.map(([childName, descendants]) => (
            <TreeRenderer 
              key={childName} 
              nodeName={childName} 
              children={descendants} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HierarchyVisualizer = ({ hierarchies }) => {
  if (!hierarchies || hierarchies.length === 0) return null;

  return (
    <div className="hierarchies-container">
      {hierarchies.map((h, idx) => (
        <div key={idx} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#fff' }}>
              Root: <span style={{ color: 'var(--accent)' }}>{h.root}</span>
            </h3>
            {h.has_cycle ? (
              <span style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(248, 113, 113, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                Cycle Detected
              </span>
            ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Depth: {h.depth}
              </span>
            )}
          </div>

          {!h.has_cycle ? (
            <div className="tree-viz">
              <TreeRenderer 
                nodeName={h.root} 
                children={h.tree[h.root] || {}} 
              />
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Visualization disabled for cyclic groups.
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default HierarchyVisualizer;
