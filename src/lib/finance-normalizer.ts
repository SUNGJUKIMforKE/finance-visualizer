export type DartAccount = {
  account_nm: string;
  sj_div: string;
  thstrm_amount?: string;
  frmtrm_amount?: string;
};

export type NormalizedFinance = {
  kpis: {
    assets: number | null;
    liabilities: number | null;
    equity: number | null;
    revenue: number | null;
    operatingIncome: number | null;
  };
  chartData: Array<{
    account: string;
    current: number;
    previous: number;
  }>;
};

function toNumber(value?: string): number | null {
  if (!value) return null;
  const cleaned = value.replaceAll(",", "").trim();
  if (!cleaned || cleaned === "-") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function pickAccount(accounts: DartAccount[], names: string[]): DartAccount | undefined {
  return accounts.find((item) => names.some((name) => item.account_nm.includes(name)));
}

export function normalizeFinanceData(accounts: DartAccount[]): NormalizedFinance {
  const bs = accounts.filter((item) => item.sj_div === "BS");
  const isList = accounts.filter((item) => item.sj_div === "IS");

  const assets = pickAccount(bs, ["자산총계"]);
  const liabilities = pickAccount(bs, ["부채총계"]);
  const equity = pickAccount(bs, ["자본총계"]);
  const revenue = pickAccount(isList, ["매출액", "영업수익"]);
  const operatingIncome = pickAccount(isList, ["영업이익"]);

  const kpis = {
    assets: toNumber(assets?.thstrm_amount),
    liabilities: toNumber(liabilities?.thstrm_amount),
    equity: toNumber(equity?.thstrm_amount),
    revenue: toNumber(revenue?.thstrm_amount),
    operatingIncome: toNumber(operatingIncome?.thstrm_amount),
  };

  const important = [
    { label: "자산총계", row: assets },
    { label: "부채총계", row: liabilities },
    { label: "자본총계", row: equity },
    { label: "매출액", row: revenue },
    { label: "영업이익", row: operatingIncome },
  ];

  const chartData = important
    .map((item) => ({
      account: item.label,
      current: toNumber(item.row?.thstrm_amount) ?? 0,
      previous: toNumber(item.row?.frmtrm_amount) ?? 0,
    }))
    .filter((item) => item.current !== 0 || item.previous !== 0);

  return { kpis, chartData };
}
