import React, { useState } from 'react';

function DevSpam() {
  const [input, setInput] = useState('Win a FREE iPhone now!\nनमस्ते, आपका ऑर्डर भेज दिया गया है।\nਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਆਪਣਾ OTP ਦਰਜ ਕਰੋ।');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const predict = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const texts = input.split('\n').map((s) => s.trim()).filter(Boolean);
      const res = await fetch('/api/v1/ai/spam/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts })
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t);
      }
      const data = await res.json();
      setResult(data.labels || []);
    } catch (e) {
      setError(e.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Spam Detection Tester</h1>
      <p>Enter one message per line (any language). Click Predict to get spam/ham labels.</p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={10}
        style={{ width: '100%', maxWidth: 800, fontFamily: 'monospace', padding: 8 }}
      />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button className="btn-primary" onClick={predict} disabled={loading}>{loading ? 'Predicting...' : 'Predict'}</button>
        <button className="btn-secondary" onClick={() => { setResult(null); setError(''); }}>Clear</button>
      </div>

      {error && (
        <div style={{ color: '#b00020', marginTop: 12 }}>{error}</div>
      )}

      {Array.isArray(result) && (
        <div style={{ marginTop: 12 }}>
          <h3>Results</h3>
          <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 800 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 6 }}>Text</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 6 }}>Label</th>
              </tr>
            </thead>
            <tbody>
              {input.split('\n').map((t, idx) => (
                t.trim() ? (
                  <tr key={idx}>
                    <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{t}</td>
                    <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>
                      <span className={`badge badge-${(result[idx] || 'ham') === 'spam' ? 'danger' : 'success'}`}>{result[idx] || '-'}</span>
                    </td>
                  </tr>
                ) : null
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DevSpam;


