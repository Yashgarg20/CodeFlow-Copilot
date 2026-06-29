import {
  Bug,
  BookOpen,
  GitCommit,
  Search,
  FolderGit2,
  FileText,
} from "lucide-react";
import Footer from "./components/Footer";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import AnalyticsCharts from "./components/AnalyticsCharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";

const API = "http://localhost:8000";

export default function App() {
  const [tab, setTab] = useState("explain");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");

  const loadHistory = async () => {
    try {
      const res = await fetch(API + "/history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(API + "/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const run = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setOutput(null);

    let endpoint = "";
    let body = {};

    if (tab === "explain") {
      endpoint = "/explain";
      body = { log_text: input };
    }
    
    else if (tab === "docs") {
      endpoint = "/docs";
      body = { error_text: input };
    }
    
    else if (tab === "commit") {
      endpoint = "/commit";
      body = { diff: input };
    }
    else if (tab === "review") {
      endpoint = "/review";
      body = {
        code: input,
      };
    }
    else if (tab === "repository") {
      endpoint = "/repository";
      body = {
        repo_url: input,
      };
    }
    else if (tab === "readme") {
      endpoint = "/readme";
    
      body = {
        repo_url: input,
        project_description: input,
      };
    }
    
   

    try {
      const res = await fetch(API + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      setOutput(data);

      loadHistory();
      loadStats();
    } catch {
      setOutput({
        error: "Server Error",
      });
    }

    setLoading(false);
  };

  const severityColor = (sev) => {
    if (sev === "High") return "text-red-400";
    if (sev === "Medium") return "text-yellow-400";
    return "text-green-400";
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(
      JSON.stringify(output, null, 2)
    );
  
    toast.success("Output copied successfully!");
  };
  
  const downloadPDF = () => {
    toast.info("Downloading PDF...");
    window.open(API + "/export/pdf", "_blank");
  };
  
  const downloadCSV = () => {
    toast.info("Downloading CSV...");
    window.open(API + "/export/csv", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-slate-900 text-white">
  
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_35%)] pointer-events-none"></div>
  
      <div className="relative w-full max-w-[1700px] mx-auto px-10 py-8 overflow-visible">
  
      <Header />
      
      
      

{stats && <StatsCards stats={stats} />}

{/* Uncomment only if you want charts */}
{stats && <AnalyticsCharts stats={stats} />} 

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* LEFT */}
          <div className="xl:col-span-3 space-y-4">

            {/* Tabs */}
            <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-2xl p-2 flex flex-wrap gap-2 shadow-xl">

  {[
    {
      id: "explain",
      icon: Bug,
      label: "Explain",
    },
    {
      id: "docs",
      icon: BookOpen,
      label: "Docs",
    },
    {
      id: "commit",
      icon: GitCommit,
      label: "Commit",
    },
    {
      id: "review",
      icon: Search,
      label: "Review",
    },
    {
      id: "repository",
      icon: FolderGit2,
      label: "Repository",
    },
    {
      id: "readme",
      label: "README",
      icon: FileText,
  },
  ].map((item) =>{
    const Icon=item.icon;
    return(
    <button
      key={item.id}
      onClick={() => setTab(item.id)}
      className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 font-semibold ${
        tab === item.id
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
          : "hover:bg-gray-800 text-gray-300"
      }`}
    >
      <Icon size={18} />
      {item.label}
    </button>
    );
  })}

</div>

            {/* INPUT CARD */}
            <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-2xl hover:border-blue-500 transition-all duration-300">
            <div className="mb-5">

            <h2 className="text-lg font-semibold text-white">
Analysis Input
</h2>

<p className="text-sm text-gray-400 mt-2">
Choose a tool above, then paste your input to let Gemini AI analyze it.
</p>

</div>

              <textarea
                rows={5}
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                placeholder={
                  tab === "review"
                    ? "Paste source code for AI review..."
                    : tab === "repository"
                    ? "Example: https://github.com/facebook/react"
                    : tab === "readme"
                    ? "Enter a GitHub repository URL or project description..."
                    : "Paste error, exception, stack trace, or git diff..."
                }
                className="w-full h-44 bg-slate-950 border border-gray-700 rounded-2xl p-5 resize-none text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              {tab === "repository" && (
  <p className="mt-2 text-sm text-gray-400">
    Enter any public GitHub repository URL (e.g.
    https://github.com/facebook/react).
  </p>
)}
{tab === "readme" && (
  <p className="mt-2 text-sm text-gray-400">
    Enter a GitHub repository URL or a short project description to generate a professional README.
  </p>
)}

<div className="flex flex-col sm:flex-row gap-3 mt-3">

                <button
                  onClick={run}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 py-3 rounded-xl font-semibold shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all duration-300"
                >
                  Run Analysis
                </button>

                <button
                  onClick={() => setInput("")}
                  className="w-full sm:w-auto px-6 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all"
                >
                  Clear
                </button>

              </div>

            </div>

            {/* EXAMPLES */}
            {!output && !loading && (
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-2xl border border-gray-700 shadow-lg">

                <p className="font-semibold mb-2">
                Example Inputs
                </p>

                <ul className="text-gray-400 text-sm list-disc ml-5 space-y-1">
                  <li>
                    TypeError: Cannot read property
                    'map' of undefined
                  </li>

                  <li>
                    SyntaxError: Unexpected token
                    &#125;
                  </li>

                  <li>
                    ModuleNotFoundError: No module
                    named requests
                  </li>

                  <li>
Paste any GitHub repository URL for AI analysis
</li>
<li>
Generate a professional README for any GitHub repository.
</li>
                </ul>

              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="animate-pulse text-blue-400">
                <div className="flex flex-col items-center justify-center py-20">
  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>

  <p className="mt-4 text-blue-400 font-medium">
  Analyzing your request...

Please wait while Gemini AI processes your input.
  </p>
</div>
              </div>
            )}

            {/* OUTPUT */}
            {output && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

{tab === "explain" && (

<div>

<div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5">

<div className="flex justify-between items-center">

<div>

<h2 className="text-2xl font-bold">
🐞 Error Analysis
</h2>

<p className="text-blue-100 mt-1">
AI generated explanation
</p>

</div>

<span
className={`px-4 py-2 rounded-full text-sm font-semibold ${
output.severity==="High"
?"bg-red-500"
:output.severity==="Medium"
?"bg-yellow-500 text-black"
:"bg-green-500"
}`}
>

{output.severity}

</span>

</div>

</div>

<div className="p-8 space-y-8">

<div className="bg-slate-900 rounded-2xl border border-slate-700 p-6">

<h3 className="text-xl font-bold text-cyan-400 mb-4">
📄 Explanation
</h3>

<p className="leading-8 whitespace-pre-wrap text-gray-200">

{output.explanation}

</p>

</div>

<div className="bg-slate-900 rounded-2xl border border-slate-700 p-6">

<h3 className="text-xl font-bold text-green-400 mb-4">
🛠 Suggested Fix
</h3>

<p className="leading-8 whitespace-pre-wrap text-gray-200">

{output.fix}

</p>

</div>

</div>

</div>

)}

{tab === "docs" && (

<div>

<div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-5">

<h2 className="text-2xl font-bold">
📚 Documentation
</h2>

<p className="text-cyan-100 mt-1">
Official documentation and references
</p>

</div>

<div className="p-8">

<div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">

<p className="text-gray-300 mb-5">
Open the documentation below.
</p>

<a
href={output.docs}
target="_blank"
rel="noreferrer"
className="text-blue-400 underline break-all text-lg"
>

{output.docs}

</a>

</div>

</div>

</div>

)}

                {tab === "commit" && (
                  <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-purple-400 mb-4">
                    📝 Generated Commit
                  </h2>
                
                  <code className="font-mono text-lg text-green-400">
                    {output.commit_message}
                  </code>
                </div>
                )}
                {tab === "review" && (

<div>

<div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">

<div className="flex justify-between items-center">

    <div>

        <h2 className="text-2xl font-bold">
            🔍 AI Code Review
        </h2>

        <p className="text-purple-100 mt-1">
            Professional analysis of your code
        </p>

    </div>

    <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-semibold uppercase">

        {output.language || "TEXT"}

    </span>

</div>

</div>

<div className="p-6 md:p-8 space-y-6">

{/* Issues */}

<div className="bg-slate-900 rounded-2xl border border-red-500/30 p-6">

<h3 className="text-red-400 text-xl font-bold mb-4">
🔴 Issues Found
</h3>

<ul className="space-y-3">

{output.issues?.map((issue, i) => (

<li
  key={i}
  className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"
>
  🔴 {issue}
</li>

))}

</ul>

</div>

{/* Severity */}

<div className="bg-slate-900 rounded-2xl border border-yellow-500/30 p-6">

<h3 className="text-yellow-400 text-xl font-bold mb-3">
🟡 Severity
</h3>

<span className="px-4 py-2 rounded-full bg-yellow-500 text-black font-bold">

{output.severity}

</span>

</div>

{/* Suggestions */}

<div className="bg-slate-900 rounded-2xl border border-cyan-500/30 p-6">

<h3 className="text-cyan-400 text-xl font-bold mb-4">
💡 Suggestions
</h3>

<ul className="space-y-3">

{output.suggestions?.map((item, i) => (

<li
  key={i}
  className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3"
>
  💡 {item}
</li>

))}

</ul>

<button
  onClick={() => {
    navigator.clipboard.writeText(
      output.suggestions.join("\n")
    );
  
    toast.success("Suggestions copied!");
  }}
  className="mt-5 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
>

📋 Copy Suggestions

</button>

</div>

{/* Improved Code */}

<div className="bg-slate-900 rounded-2xl border border-green-500/30 p-6">

<div className="flex justify-between items-center mb-4">

<h3 className="text-green-400 text-xl font-bold">
💻 Improved Code
</h3>

<button
onClick={() => {
  navigator.clipboard.writeText(
    output.improved_code
  );

  toast.success("Improved code copied!");
}}
className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold"
>

📋 Copy Improved Code

</button>

</div>

<SyntaxHighlighter
  language={output.language || "text"}
  style={oneDark}
  wrapLongLines={false}
  customStyle={{
    borderRadius: "16px",
    padding: "24px",
    fontSize: "14px",
    overflowX: "auto",
    background: "#0d1117",
    border: "1px solid #334155",
    margin: 0,
  }}
>

{output.improved_code || "// No code generated"}

</SyntaxHighlighter>

</div>

</div>

</div>

)}

{tab === "repository" && (

<div>

<div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">

<h2 className="text-2xl font-bold">
📂 Repository Analysis
</h2>

<p className="text-emerald-100 mt-1">
AI-powered GitHub repository insights
</p>

</div>

<div className="p-8 space-y-6">

<div className="grid md:grid-cols-2 gap-4">

<div className="bg-slate-900 rounded-xl p-4">
<b>Repository</b><br/>
{output.repository}
</div>

<div className="bg-slate-900 rounded-xl p-4">
<b>Owner</b><br/>
{output.owner}
</div>

<div className="bg-slate-900 rounded-xl p-4">
<b>Language</b><br/>
{output.language}
</div>

<div className="bg-slate-900 rounded-xl p-4">
<b>⭐ Stars</b><br/>
{output.stars}
</div>

<div className="bg-slate-900 rounded-xl p-4">
<b>🍴 Forks</b><br/>
{output.forks}
</div>

<div className="bg-slate-900 rounded-xl p-4">
<b>🐞 Open Issues</b><br/>
{output.issues}
</div>

</div>

<div className="bg-slate-900 rounded-2xl p-6">

<h3 className="text-cyan-400 text-xl font-bold mb-3">
🧠 AI Summary
</h3>

<p>
{output.summary}
</p>

</div>

<div className="bg-slate-900 rounded-2xl p-6">

<h3 className="text-green-400 text-xl font-bold mb-3">
✅ Strengths
</h3>

<ul className="space-y-2">

{output.strengths?.map((item,index)=>(

<li key={index}>
✔ {item}
</li>

))}

</ul>

</div>

<div className="bg-slate-900 rounded-2xl p-6">

<h3 className="text-yellow-400 text-xl font-bold mb-3">
⚠ Improvements
</h3>

<ul className="space-y-2">

{output.improvements?.map((item,index)=>(

<li key={index}>
• {item}
</li>

))}

</ul>

</div>

</div>

</div>

)}
{tab === "readme" && (

<div>

<div className="bg-gradient-to-r from-sky-600 to-cyan-600 px-6 py-5">

<h2 className="text-2xl font-bold">
📄 AI README Generator
</h2>

<p className="text-sky-100 mt-1">
Professional README generated using Gemini AI
</p>

</div>

<div className="p-8">

<SyntaxHighlighter
language="markdown"
style={oneDark}
wrapLongLines
customStyle={{
background:"#0d1117",
padding:"24px",
borderRadius:"16px"
}}
>

{output.readme}

</SyntaxHighlighter>

</div>

</div>

)}

<div className="border-t border-slate-700 bg-slate-900 px-6 py-5 flex flex-col sm:flex-row gap-4">

<button
  onClick={copyOutput}
  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold"
>
  Copy Output
</button>

<button
  onClick={downloadPDF}
  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition font-semibold"
>
  Export PDF
</button>

<button
  onClick={downloadCSV}
  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition font-semibold"
>
  Export CSV
</button>

</div>

              </div>
            )}
          </div>

          {/* HISTORY PANEL */}
          <div className="xl:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[850px]">

          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 border-b border-white/10">

<div className="flex justify-between items-center">

  <div>

    <h2 className="text-2xl font-bold">
      Recent Activity 
    </h2>

    <p className="text-gray-400 text-sm mt-1">
      Your latest AI analyses
    </p>

  </div>

  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">

    {history.length} Records

  </span>

</div>

</div>

            <div className="px-6 py-5">

<input
value={search}
onChange={(e)=>setSearch(e.target.value)}
placeholder="🔍 Search history..."
className="w-full text-sm bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
/>

</div>

<div className="max-h-[700px] lg:max-h-[730px] overflow-y-auto px-5 pb-5 space-y-4">

              {history.length === 0 ? (
                <div className="text-center py-16 text-gray-500">

                <div className="text-6xl mb-5">
                📂
                </div>
                
                <h3 className="text-xl font-bold mb-2">
                No Activity Yet
                </h3>
                
                <p>
                Run your first AI analysis to populate history.
                </p>
                
                </div>
              ) : (
                history
                  .filter((item) =>
                    item.error_type
                      .toLowerCase()
                      .includes(
                        search.toLowerCase()
                      )
                  )
                  .map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-900/70 backdrop-blur-lg border border-slate-700 rounded-2xl p-5 hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="flex justify-between items-center">

                      <h3 className="font-bold text-lg break-words">
                          {item.error_type}
                        </h3>

                        <span
  className={`px-3 py-1 rounded-full text-sm font-bold ${
    item.severity === "High"
      ? "bg-red-500 text-white"
      : item.severity === "Medium"
      ? "bg-yellow-500 text-black"
      : "bg-green-500 text-white"
  }`}
>
  {item.severity}
</span>

                      </div>

                      <span className="inline-block mt-2 bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full">
                      {item.language === "Python" && "🐍 Python"}
{item.language === "JavaScript" && "🟨 JavaScript"}
{item.language === "Java" && "☕ Java"}
{item.language === "PHP" && "🐘 PHP"}
{item.language === "Git" && "🌿 Git"}
{item.language === "Documentation" && "📚 Documentation"}
{item.language === "Code Review" && "🤖 Code Review"}
{item.language === "Unknown" && "📄 Unknown"}
</span>

<p className="text-xs text-gray-500 mt-2">
  🕒 {item.created_at}
</p>

<p className="text-sm text-gray-300 mt-4 leading-6 break-words">
  {item.explanation}
</p>

                    </div>
                  ))
              )}

            </div>

          </div>

        </div>

        <footer className="mt-12 border-t border-slate-800 pt-6">

        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-sm text-gray-500">

<div>

CodeFlow Copilot v1.0

</div>

<div>

React • FastAPI • Gemini AI

</div>

<div>

© 2026 Yash Garg

</div>

</div>

</footer>

</div>

<ToastContainer
  position="top-right"
  autoClose={2500}
  hideProgressBar={false}
  newestOnTop
  closeOnClick
  pauseOnHover
  draggable
  theme="dark"
/>

</div>
);
}
