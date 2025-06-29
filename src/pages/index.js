import React, { useState } from "react";

export default function HomePage() {
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState("3");
  const [temperature, setTemperature] = useState("0.7");
  const [usedTopK, setUsedTopK] = useState(3);
  const [usedTemp, setUsedTemp] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [topKError, setTopKError] = useState("");
  const [tempError, setTempError] = useState("");

  const handleTopKChange = (e) => {
    const value = e.target.value;
    setTopK(value);
    setResult(null);
    const num = Number(value);
    if (value === "" || !Number.isInteger(num) || num < 1 || num > 10) {
      setTopKError("Top-K must be an integer between 1 and 10.");
    } else {
      setTopKError("");
    }
  };

  const handleTempChange = (e) => {
    const value = e.target.value;
    setTemperature(value);
    setResult(null);
    const num = Number(value);
    if (value === "" || isNaN(num) || num < 0 || num > 1) {
      setTempError("Temperature must be a number between 0 and 1.");
    } else {
      setTempError("");
    }
  };

  const canSearch =
    !loading &&
    question.trim().length > 0 &&
    topK !== "" &&
    temperature !== "" &&
    topKError === "" &&
    tempError === "";

  const handleSearch = async () => {
    if (!canSearch) return;
    setLoading(true);
    setError("");
    setResult(null);

    const numTopK = Number(topK);
    const numTemp = Number(temperature);
    setUsedTopK(numTopK);
    setUsedTemp(numTemp);

    try {
      const res = await fetch("https://gpt-fastapi-app.onrender.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          top_k: numTopK,
          temperature: numTemp,
        }),
      });
      if (!res.ok) throw new Error(`API Error ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to fetch results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 32,
        maxWidth: 700,
        margin: "40px auto",
        background: "white",
        borderRadius: 20,
        boxShadow: "0 0 24px #e0e0f7",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1
        style={{
          color: "#4B42C4",
          fontWeight: 700,
          fontSize: "2.4rem",
          marginBottom: 24,
        }}
      >
        Semantic Search + GPT Demo
      </h1>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter your question..."
        style={{
          width: "100%",
          fontSize: 18,
          padding: 12,
          borderRadius: 8,
          border: "1px solid #ddd",
          marginBottom: 20,
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 14 }}>Top-K Context Chunks (1–10):</label>
          <input
            type="number"
            value={topK}
            placeholder="e.g. 3"
            onChange={handleTopKChange}
            style={{
              width: 60,
              marginLeft: 8,
              padding: 6,
              borderRadius: 6,
              border: "1px solid #ddd",
              textAlign: "center",
            }}
          />
          {topKError && (
            <div style={{ color: "#c00", fontSize: 12, marginTop: 4 }}>
              {topKError}
            </div>
          )}
        </div>

        <div>
          <label style={{ fontSize: 14 }}>Temperature (0–1):</label>
          <input
            type="number"
            step={0.1}
            value={temperature}
            placeholder="e.g. 0.7"
            onChange={handleTempChange}
            style={{
              width: 60,
              marginLeft: 8,
              padding: 6,
              borderRadius: 6,
              border: "1px solid #ddd",
              textAlign: "center",
            }}
          />
          {tempError && (
            <div style={{ color: "#c00", fontSize: 12, marginTop: 4 }}>
              {tempError}
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          disabled={!canSearch}
          style={{
            marginLeft: "auto",
            background: canSearch ? "#4B42C4" : "#aaa",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
            padding: "10px 24px",
            borderRadius: 8,
            border: "none",
            cursor: canSearch ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div style={{ color: "#c00", fontWeight: 600, marginBottom: 24 }}>
          {error}
        </div>
      )}

      {result && (
        <>
          {/* GPT-Generated Answer */}
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ color: "#333", marginBottom: 8 }}>💡 Generated Answer</h2>
            <div
              style={{
                background: "#f3f2fa",
                padding: 18,
                borderRadius: 10,
                fontSize: 18,
                whiteSpace: "pre-line",
              }}
            >
              {result.gpt_answer}
            </div>
          </section>

          {/* Clarification Explanation */}
          <div
            style={{
              background: "#fff6f0",
              padding: 16,
              borderRadius: 8,
              borderLeft: "4px solid #e07a5f",
              marginBottom: 24,
              fontSize: 14,
              color: "#333",
              lineHeight: 1.6,
            }}
          >
            <p>
              <strong>Note:</strong> The <em>Generated Answer</em> above is a
              single, synthesized response from GPT-4. It is formulated by
              passing <strong>all</strong> of the Context Chunks listed below
              into the model and asking it to summarize or explain your
              question.
            </p>
            <ul style={{ marginLeft: 16, marginTop: 8 }}>
              <li>
                <strong>Top-{usedTopK} Results (Context Chunks):</strong> These
                are the {usedTopK} original snippets that FAISS identified as
                most semantically similar to your query. They are ranked #1,
                #2, #3, … and include a “distance” score.
              </li>
              <li>
                <strong>Generated Answer (GPT Answer):</strong> This is not
                simply chunk #1—it’s GPT-4’s coherent response based on
                <em>all</em> of those chunks.
              </li>
            </ul>
          </div>

          {/* Raw Context Chunks */}
          <section>
            <h3 style={{ color: "#4B42C4", marginBottom: 8 }}>
              🔎 Top-{usedTopK} Context Chunks
            </h3>
            {result.top_chunks.map((chunk) => (
              <div
                key={chunk.rank}
                style={{
                  background: "#eef1ff",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                  fontSize: 16,
                  borderLeft: "4px solid #4B42C4",
                }}
              >
                <div style={{ marginBottom: 6 }}>
                  <b>#{chunk.rank}</b>{" "}
                  <span style={{ color: "#666", fontSize: 13 }}>
                    distance: {chunk.distance.toFixed(4)}
                  </span>
                </div>
                <div style={{ color: "#222" }}>{chunk.text}</div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}