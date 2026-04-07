"use client";

import { useMemo, useState } from "react";
import AccountCharts from "@/components/finance/AccountCharts";
import type { NormalizedFinance } from "@/lib/finance-normalizer";

type Corp = {
  corpCode: string;
  corpName: string;
  stockCode: string | null;
};

type FinanceResponse = {
  normalized: NormalizedFinance;
};

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [corpList, setCorpList] = useState<Corp[]>([]);
  const [selectedCorp, setSelectedCorp] = useState<Corp | null>(null);
  const [year, setYear] = useState(String(new Date().getFullYear() - 1));
  const [reportCode, setReportCode] = useState("11011");
  const [finance, setFinance] = useState<NormalizedFinance | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 10 }).map((_, idx) => String(current - idx));
  }, []);

  async function searchCorp() {
    setError("");
    const response = await fetch(`/api/corp/search?q=${encodeURIComponent(query)}&limit=20`);
    const json = (await response.json()) as { list: Corp[] };
    setCorpList(json.list);
  }

  async function loadFinance() {
    if (!selectedCorp) {
      setError("회사를 먼저 선택해 주세요.");
      return;
    }
    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const response = await fetch(
        `/api/finance/single-account?corp_code=${selectedCorp.corpCode}&bsns_year=${year}&reprt_code=${reportCode}`,
      );
      const json = (await response.json()) as FinanceResponse & { error?: string };
      if (!response.ok) {
        throw new Error(json.error ?? "재무정보 조회에 실패했습니다.");
      }
      setFinance(json.normalized);

      const aiResponse = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: json.normalized }),
      });
      const aiJson = (await aiResponse.json()) as { text?: string; error?: string };
      if (!aiResponse.ok) {
        throw new Error(aiJson.error ?? "AI 분석에 실패했습니다.");
      }
      setAnalysis(aiJson.text ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>누구나 이해하는 재무 시각화 서비스</h1>
      <p>회사 검색 → OpenDART 재무조회 → 차트 시각화 → AI 쉬운 해설</p>

      <section style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="회사명 또는 종목코드를 입력하세요"
            style={{ flex: 1, padding: 8 }}
          />
          <button onClick={searchCorp} style={{ padding: "8px 12px" }}>
            검색
          </button>
        </div>

        {corpList.length > 0 && (
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
            {corpList.map((corp) => (
              <button
                key={corp.corpCode}
                onClick={() => setSelectedCorp(corp)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: 8,
                  marginBottom: 6,
                  border: "1px solid #eee",
                  borderRadius: 6,
                  background: selectedCorp?.corpCode === corp.corpCode ? "#eff6ff" : "#fff",
                }}
              >
                {corp.corpName} ({corp.stockCode || "-"}) / {corp.corpCode}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label>사업연도</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <label>보고서</label>
          <select value={reportCode} onChange={(e) => setReportCode(e.target.value)}>
            <option value="11013">1분기보고서</option>
            <option value="11012">반기보고서</option>
            <option value="11014">3분기보고서</option>
            <option value="11011">사업보고서</option>
          </select>
          <button onClick={loadFinance} disabled={loading} style={{ padding: "8px 12px" }}>
            {loading ? "조회 중..." : "재무 조회"}
          </button>
        </div>
      </section>

      {selectedCorp && (
        <p style={{ marginTop: 12 }}>
          선택 회사: <strong>{selectedCorp.corpName}</strong> ({selectedCorp.corpCode})
        </p>
      )}

      {error && <p style={{ marginTop: 12, color: "crimson" }}>{error}</p>}

      {finance && <AccountCharts data={finance} />}

      {analysis && (
        <section style={{ marginTop: 24, border: "1px solid #ddd", borderRadius: 8, padding: 12, whiteSpace: "pre-wrap" }}>
          <h2>AI 쉬운 해설</h2>
          {analysis}
        </section>
      )}
    </main>
  );
}
