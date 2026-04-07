import { NextRequest, NextResponse } from "next/server";
import { normalizeFinanceData } from "@/lib/finance-normalizer";

const STATUS_MESSAGES: Record<string, string> = {
  "000": "정상",
  "010": "등록되지 않은 키입니다.",
  "011": "사용할 수 없는 키입니다.",
  "012": "접근할 수 없는 IP입니다.",
  "013": "조회된 데이터가 없습니다.",
  "020": "요청 제한을 초과했습니다.",
  "100": "요청 인자가 유효하지 않습니다.",
  "800": "시스템 점검 중입니다.",
  "900": "정의되지 않은 오류입니다.",
  "901": "개인정보 보유기간 만료 키입니다.",
};

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENDART_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "서버에 OPENDART_API_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  const corpCode = request.nextUrl.searchParams.get("corp_code");
  const bsnsYear = request.nextUrl.searchParams.get("bsns_year");
  const reprtCode = request.nextUrl.searchParams.get("reprt_code");

  if (!corpCode || !bsnsYear || !reprtCode) {
    return NextResponse.json({ error: "corp_code, bsns_year, reprt_code는 필수입니다." }, { status: 400 });
  }

  const url = new URL("https://opendart.fss.or.kr/api/fnlttSinglAcnt.json");
  url.searchParams.set("crtfc_key", apiKey);
  url.searchParams.set("corp_code", corpCode);
  url.searchParams.set("bsns_year", bsnsYear);
  url.searchParams.set("reprt_code", reprtCode);

  let json: {
    status: string;
    message?: string;
    list?: Array<Record<string, string>>;
  } = { status: "900" };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url.toString(), { cache: "no-store" });
    json = (await response.json()) as typeof json;
    if (json.status !== "020") break;
    await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
  }

  if (json.status !== "000" || !json.list) {
    return NextResponse.json(
      { error: STATUS_MESSAGES[json.status] ?? json.message ?? "OpenDART 오류가 발생했습니다.", status: json.status },
      { status: 400 },
    );
  }

  const normalized = normalizeFinanceData(
    json.list.map((item) => ({
      account_nm: item.account_nm ?? "",
      sj_div: item.sj_div ?? "",
      thstrm_amount: item.thstrm_amount ?? "",
      frmtrm_amount: item.frmtrm_amount ?? "",
    })),
  );

  return NextResponse.json({
    status: json.status,
    rawList: json.list,
    normalized,
  });
}
