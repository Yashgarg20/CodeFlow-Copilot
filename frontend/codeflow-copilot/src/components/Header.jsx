export default function Header() {
  return (
    <header className="mb-6 overflow-visible">

<div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">

        {/* Left */}

        <div className="flex-1 min-w-0 pr-4">

        <h1
  className="
    inline-block
    text-5xl
    lg:text-6xl
    xl:text-7xl
    font-black
    leading-[1.15]
    tracking-[-0.03em]
    pb-2
    bg-gradient-to-r
    from-blue-400
    via-cyan-300
    to-emerald-400
    bg-clip-text
    text-transparent
  "
>
{"CodeFlow Copilot "}
</h1>

          <p className="text-gray-400 text-base font-medium mt-3">

            AI-Powered Software Engineering Assistant

          </p>

          <p className="mt-5 max-w-2xl text-gray-400 leading-8 text-[15px]">

          CodeFlow Copilot is an AI-powered software engineering assistant that helps developers analyze errors, generate documentation, review code, create Git commit messages, analyze GitHub repositories, generate professional README files, and monitor project analytics using Gemini AI.

          </p>

        </div>

        {/* Right */}

        <div className="flex justify-start lg:justify-end shrink-0">

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 shadow-sm">

            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>

            <span className="text-emerald-300 font-medium">

              Gemini Connected

            </span>

          </div>

        </div>

      </div>

    </header>
  );
}