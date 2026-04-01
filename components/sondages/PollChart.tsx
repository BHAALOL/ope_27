"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatDate } from "@/lib/utils";

interface PollChartProps {
  data: Array<{
    date: string;
    [candidatName: string]: string | number;
  }>;
  candidates: Array<{ name: string; color: string }>;
}

export function PollChart({ data, candidates }: PollChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => {
            try {
              const parts = formatDate(v).split(" ");
              return parts[0] + " " + (parts[2] || "");
            } catch {
              return v;
            }
          }}
        />
        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(10, 10, 20, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            color: "#fff",
            fontSize: "13px",
          }}
          formatter={(v) => [`${v}%`]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend
          wrapperStyle={{ color: "#9ca3af", fontSize: "12px" }}
        />
        {candidates.map((c) => (
          <Line
            key={c.name}
            type="monotone"
            dataKey={c.name}
            stroke={c.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: c.color }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
