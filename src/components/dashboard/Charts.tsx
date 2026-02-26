"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

const STATUS_COLORS_CHART: Record<string, string> = {
  PENDING: "#9ca3af",
  UNDER_REVIEW: "#f59e0b",
  APPROVED: "#3b82f6",
  ACTIVE: "#22c55e",
  CLOSED: "#64748b",
  REJECTED: "#ef4444",
  DEFAULTED: "#7f1d1d",
};

interface LoanStatusChartProps {
  data: { status: string; count: number }[];
}

export function LoanStatusChart({ data }: LoanStatusChartProps) {
  const chartData = data.map((d) => ({ name: d.status, value: d.count }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Loan Status Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS_CHART[entry.name] || "#9ca3af"}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [value, name]}
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MonthlyDisbursementsChartProps {
  data: { month: string; amount: number; count: number }[];
}

function formatTSH(v: number) {
  if (v >= 1_000_000) return `TSH ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `TSH ${(v / 1_000).toFixed(0)}K`;
  return `TSH ${v}`;
}

export function MonthlyDisbursementsChart({ data }: MonthlyDisbursementsChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Disbursements (6 months)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatTSH} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) => [formatTSH(Number(value)), "Disbursed"]}
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
          />
          <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
