export default function Footer() {
    return (
      <footer className="mt-14 border-t border-slate-800 py-8">
  
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
  
          <div>
  
            <h3 className="text-lg font-semibold text-white">
              CodeFlow Copilot
            </h3>
  
            <p className="text-sm text-gray-400 mt-1">
              AI-Powered Software Engineering Assistant
            </p>
  
          </div>
  
          <div className="text-center md:text-right">
  
            <p className="text-sm text-gray-400">
              Built with React • FastAPI • Gemini AI • SQLite
            </p>
  
            <p className="text-xs text-gray-500 mt-1">
              © 2026 Yash Garg • Final Year Project
            </p>
  
          </div>
  
        </div>
  
      </footer>
    );
  }