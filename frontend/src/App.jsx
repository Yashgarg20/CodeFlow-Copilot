import { useState } from "react";

const API = "http://localhost:8000";

export default function App() {
  const [tab, setTab] = useState("explain");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setOutput(null);

    let endpoint = "";
    let body = {};

    if (tab === "explain") {
      endpoint = "/explain";
      body = { log_text: input };
    } else if (tab === "docs") {
      endpoint = "/docs";
      body = { error_text: input };
    } else {
      endpoint = "/commit";
      body = { diff: input };
    }

    try {
      const res = await fetch(API + endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setOutput(data);
    } catch (err) {
      setOutput({ error: "Server error" });
    }

    setLoading(false);
  };

  const severityColor = (sev) => {
    if (sev === "High") return "text-red-500";
    if (sev === "Medium") return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center">
      <div className="w-full max-w-3xl">

        <h1 className="text-3xl font-bold mb-6 text-center">
          CodeFlow Copilot
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-4 justify-center">
          {["explain", "docs", "commit"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded ${
                tab === t ? "bg-blue-500" : "bg-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Input */}
        <textarea
          className="w-full p-3 rounded bg-gray-800"
          rows={6}
          placeholder="Paste error / diff here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          onClick={run}
          className="mt-4 w-full bg-green-500 py-2 rounded"
        >
          Run
        </button>

        {loading && <p className="mt-4">Analyzing...</p>}

        {/* Output */}
        {output && (
          <div className="mt-6 p-4 bg-gray-800 rounded">

            {tab === "explain" && (
              <>
                <p><b>Type:</b> {output.error_type}</p>
                <p className={severityColor(output.severity)}>
                  <b>Severity:</b> {output.severity}
                </p>
                <p><b>Explanation:</b> {output.explanation}</p>
                <p><b>Fix:</b> {output.fix}</p>
              </>
            )}

            {tab === "docs" && (
              <a href={output.docs} target="_blank">
                {output.docs}
              </a>
            )}

            {tab === "commit" && (
              <p>{output.commit_message}</p>
            )}

            <button
              className="mt-3 bg-blue-500 px-3 py-1 rounded"
              onClick={() =>
                navigator.clipboard.writeText(JSON.stringify(output))
              }
            >
              Copy
            </button>

          </div>
        )}
      </div>
    </div>
  );
}