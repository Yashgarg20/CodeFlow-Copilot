import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
  
  const COLORS = [
    "#3B82F6",
    "#F59E0B",
    "#EF4444",
    "#10B981",
  ];
  
  export default function AnalyticsCharts({ stats }) {
    if (!stats) return null;
  
    const errorData = [
      {
        name: "Syntax",
        value: stats.syntax || 0,
      },
      {
        name: "Runtime",
        value: stats.runtime || 0,
      },
      {
        name: "Type",
        value: stats.type || 0,
      },
      {
        name: "Dependency",
        value: stats.dependency || 0,
      },
    ];
  
    const featureData = [
      {
        name: "Docs",
        value: stats.docs || 0,
      },
      {
        name: "Commit",
        value: stats.commit || 0,
      },
      {
        name: "Review",
        value: stats.review || 0,
      },
      {
        name: "Repository",
        value: stats.repository || 0,
      },
      {
        name: "README",
        value: stats.readme || 0,
      },
    ];
  
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
  
        {/* Error Distribution */}
  
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5 shadow-xl">
  
          <h2 className="text-lg font-bold mb-5 text-white">
            Error Distribution
          </h2>
  
          <div className="flex justify-center">
  
          <PieChart width={430} height={300}>
  
              <Pie
                data={errorData.filter((item) => item.value > 0)}
                dataKey="value"
                nameKey="name"
                cx="45%"
                cy="50%"
                outerRadius={75}
                label={({ value }) => value}
                animationDuration={900}
              >
  
                {errorData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
  
              </Pie>
  
              <Tooltip
              formatter={(value, name) => [`${value}`, name]}
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "10px",
                color: "#fff",
              }}
              
              />
              <Legend
  verticalAlign="bottom"
  align="center"
  iconType="circle"
  wrapperStyle={{
    color: "#d1d5db",
    fontSize: 13,
    paddingTop: 12,
  }}
/>
  
            </PieChart>
  
          </div>
  
        </div>
  
        {/* Feature Usage */}
  
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-5 shadow-xl">
  
          <h2 className="text-xl font-semibold mb-5 text-white">
            Feature Usage
          </h2>
  
          <div className="overflow-x-auto">
  
            <BarChart
              width={430}
              height={250}
              data={featureData}
            >
  
  <CartesianGrid
    stroke="#334155"
    strokeDasharray="4 4"
/>
  
              <XAxis
    dataKey="name"
    tick={{ fill: "#cbd5e1", fontSize: 12 }}
/>
  
<YAxis
    tick={{ fill: "#94a3b8", fontSize: 12 }}
/>
  
              
              <Tooltip
              formatter={(value) => [`${value}`, "Requests"]}
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "10px",
                color: "#fff",
              }}
            />
              
  
              <Bar
  dataKey="value"
  fill="#3B82F6"
  radius={[8, 8, 0, 0]}
  animationDuration={800}
/>
  
            </BarChart>
  
          </div>
  
        </div>
  
      </div>
    );
  }