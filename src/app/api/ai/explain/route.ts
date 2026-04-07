import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "서버에 GEMINI_API_KEY가 설정되지 않았습니다." }, { status: 500 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const data = body.data;
  if (!data) {
    return NextResponse.json({ error: "분석할 재무 데이터가 필요합니다." }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
다음 재무 데이터(JSON)를 바탕으로 비전문가가 이해하기 쉽게 한국어로 설명해줘.
조건:
1) 핵심 변화 3개
2) 유의사항 2개
3) 한 줄 결론 1개
4) 과장 없이 숫자 근거 중심

데이터:
${JSON.stringify(data)}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return NextResponse.json({ text });
}
