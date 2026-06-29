import {
  BookOpen,
  GitCommit,
  Bot,
  FolderGit2,
  BarChart3,
  TriangleAlert,
  Flame,
  Boxes,
  FileText,
} from "lucide-react";
export default function StatsCards({ stats }) {

    if (!stats) return null;
  
    const cards = [
      {
        title: "Docs",
        value: stats.docs,
        color: "from-blue-500 to-cyan-500",
        icon: BookOpen,
      },
      {
        title: "Commit",
        value: stats.commit,
        color: "from-violet-500 to-purple-500",
        icon: GitCommit,
      },
      {
        title: "Review",
        value: stats.review,
        color: "from-pink-500 to-fuchsia-500",
        icon: Bot,
      },
      {
        title: "Repository",
        value: stats.repository,
        color: "from-teal-500 to-cyan-500",
        icon: FolderGit2,
    },
    {
      title: "README",
      value: stats.readme,
      color: "from-sky-500 to-cyan-500",
      icon: FileText,
    },
      {
        title: "Queries",
        value: stats.total,
        color: "from-emerald-500 to-green-500",
        icon: BarChart3,
      },
      {
        title: "Syntax",
        value: stats.syntax,
        color: "from-orange-500 to-amber-500",
        icon: TriangleAlert,
      },
      {
        title: "Runtime",
        value: stats.runtime,
        color: "from-red-500 to-rose-500",
        icon: Flame,
      },
      {
        title: "Dependency",
        value: stats.dependency,
        color: "from-indigo-500 to-blue-500",
        icon: Boxes,
      },
    ];
  
    return (
  
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-8">
  
  {cards.map((card) => {
  const Icon = card.icon;

  return (
    <div
      key={card.title}
      className={`bg-gradient-to-br ${card.color}
      rounded-lg
border border-white/10
px-4 py-3
shadow-md
hover:shadow-lg
hover:-translate-y-0.5
cursor-default transition-all
duration-300`}
    >
      <div className="flex items-center gap-2 mb-2">
  <Icon size={16} strokeWidth={2} className="text-white/90" />

  <span className="text-xs uppercase tracking-wide text-white/90">
    {card.title}
  </span>
</div>

      <div className="text-2xl font-bold mt-2">
        {card.value}
      </div>
    </div>
  );
})} 
        </div>
      );
    }