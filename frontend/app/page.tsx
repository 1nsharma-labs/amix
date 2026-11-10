"use client";

import { useState } from "react";

interface ChatResponse {
  model: string;
  content: string;
  complexity: number;
  cached: boolean;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/amix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data: ChatResponse = await res.json();
      setResponse(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1>SHUTTER</h1>
      <p>Consumer & enterprise AI products powered by AMIX intelligence.</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask AMIX intelligence..."
        rows={6}
        style={{ width: "100%" }}
      />
      <button onClick={send} disabled={loading}>
        {loading ? "Thinking..." : "Ask AMIX"}
      </button>
      {response && (
        <div>
          <p>Model: {response.model}</p>
          <p>Complexity: {response.complexity}</p>
          <p>{response.content}</p>
        </div>
      )}
    </main>
  );
}
