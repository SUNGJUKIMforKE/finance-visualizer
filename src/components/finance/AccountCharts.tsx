"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { NormalizedFinance } from "@/lib/finance-normalizer";

type Props = {
  data: NormalizedFinance;
};

function won(value: number | null): string {
  if (value === null) return "-";
  return `${value.toLocaleString("ko-KR")} 원`;
}

export default function AccountCharts({ data }: Props) {
  const cards = [
    { label: "자산총계", value: data.kpis.assets },
    { label: "부채총계", value: data.kpis.liabilities },
    { label: "자본총계", value: data.kpis.equity },
    { label: "매출액", value: data.kpis.revenue },
    { label: "영업이익", value: data.kpis.operatingIncome },
  ];

  return (
    <section style={{ marginTop: 24 }}>
      <h2>주요 계정 시각화</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
        {cards.map((card) => (
          <article key={card.label} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <p style={{ margin: 0, color: "#666" }}>{card.label}</p>
            <strong>{won(card.value)}</strong>
          </article>
        ))}
      </div>
      <div style={{ width: "100%", height: 380, marginTop: 20 }}>
        <ResponsiveContainer>
          <BarChart data={data.chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="account" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" name="당기" fill="#2563eb" />
            <Bar dataKey="previous" name="전기" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
