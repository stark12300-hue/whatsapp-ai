'use client';

import { useEffect, useState } from 'react';

type Settings = {
  busyMode: boolean;
  autoReplyEnabled: boolean;
  personality: string;
  boundaries: string;
  styleExamples: string[];
};

const empty: Settings = {
  busyMode: true,
  autoReplyEnabled: true,
  personality: 'Casual, natural Hinglish. Keep replies concise unless the conversation needs detail.',
  boundaries: 'Do not invent facts, promises, payments, commitments, or personal plans.',
  styleExamples: []
};

export default function Admin() {
  const [token, setToken] = useState('');
  const [s, setS] = useState<Settings>(empty);
  const [examples, setExamples] = useState('');
  const [status, setStatus] = useState('Enter ADMIN_TOKEN to load settings.');

  async function load() {
    setStatus('Loading...');
    const r = await fetch('/api/settings', { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) return setStatus('Unauthorized or server not configured.');
    const data = await r.json();
    setS({ ...empty, ...data });
    setExamples((data.styleExamples || []).join('\n---\n'));
    setStatus('Loaded.');
  }

  async function save() {
    setStatus('Saving...');
    const r = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...s, styleExamples: examples.split(/\n(?:-{3,}|={3,})\n/g).map(x => x.trim()).filter(Boolean) })
    });
    setStatus(r.ok ? 'Saved.' : 'Save failed.');
  }

  useEffect(() => { if (token) load(); }, [token]);

  return (
    <main className="panel">
      <h1>AI You — Control Panel</h1>
      <p className="small">This panel controls when the AI replies and the style it follows.</p>
      <div className="card">
        <label>Admin token</label>
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="ADMIN_TOKEN" type="password" />
        <div className="row" style={{ marginTop: 12 }}>
          <button type="button" onClick={load}>Load</button>
          <span className="status">{status}</span>
        </div>
      </div>
      <div className="grid">
        <div className="card">
          <label><input type="checkbox" checked={s.busyMode} onChange={e => setS({...s, busyMode: e.target.checked})} /> Busy mode</label>
          <p className="small">AI replies only when this is ON.</p>
        </div>
        <div className="card">
          <label><input type="checkbox" checked={s.autoReplyEnabled} onChange={e => setS({...s, autoReplyEnabled: e.target.checked})} /> Auto replies</label>
          <p className="small">Master switch for automatic replies.</p>
        </div>
      </div>
      <div className="card">
        <label>How you normally talk</label>
        <textarea value={s.personality} onChange={e => setS({...s, personality: e.target.value})} />
      </div>
      <div className="card">
        <label>Boundaries</label>
        <textarea value={s.boundaries} onChange={e => setS({...s, boundaries: e.target.value})} />
      </div>
      <div className="card">
        <label>Your real chat examples</label>
        <textarea value={examples} onChange={e => setExamples(e.target.value)} placeholder={'Paste examples of how YOU reply. Separate examples with --- on its own line.'} />
        <p className="small">Use examples without passwords, OTPs, bank details, or other sensitive information.</p>
      </div>
      <button type="button" onClick={save}>Save settings</button>
    </main>
  );
}
