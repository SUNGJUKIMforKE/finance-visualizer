import { NextRequest, NextResponse } from "next/server";
import { loadCorpIndex } from "@/lib/corp-index";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit") ?? 20), 50);

  if (!q) {
    return NextResponse.json({ list: [] });
  }

  try {
    const index = await loadCorpIndex();
    const keyword = q.toLowerCase();
    const rows = index
      .filter((item) => {
        const name = item.corpName.toLowerCase();
        const stock = (item.stockCode ?? "").toLowerCase();
        return name.includes(keyword) || stock.includes(keyword);
      })
      .sort((a, b) => a.corpName.localeCompare(b.corpName, "ko"))
      .slice(0, limit)
      .map((item) => ({
        corpCode: item.corpCode,
        corpName: item.corpName,
        stockCode: item.stockCode || null,
      }));

    return NextResponse.json({ list: rows });
  } catch {
    return NextResponse.json(
      {
        error: "검색 인덱스 파일을 찾을 수 없습니다. 먼저 npm run import:corp 를 실행해 주세요.",
        list: [],
      },
      { status: 500 },
    );
  }
}
