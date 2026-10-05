export default function Home() {
  return (
    <main className="panel">
      <h1>WhatsApp AI You</h1>
      <p className="small">AI reply assistant using WhatsApp Cloud API. Open <a href="/admin">/admin</a> to configure it.</p>
      <div className="card">
        <h2>How it works</h2>
        <p className="small">Incoming WhatsApp text → conversation memory → your style profile → AI reply → WhatsApp.</p>
      </div>
    </main>
  );
}
