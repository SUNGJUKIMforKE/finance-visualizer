import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { XMLParser } from "fast-xml-parser";
import { dirname, resolve } from "node:path";
import iconv from "iconv-lite";

type CorpXmlItem = {
  corp_code?: string;
  corp_name?: string;
  corp_eng_name?: string;
  stock_code?: string;
  modify_date?: string;
};

type CorpXml = {
  result?: {
    list?: CorpXmlItem[] | CorpXmlItem;
  };
};

function toSafeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

async function main() {
  const filePath = process.argv[2] ?? "C:\\Users\\RIANNOTE\\Downloads\\corp.xml";
  const outputPath = process.argv[3] ?? "data/corp-index.json";
  const raw = await readFile(filePath);
  let xml = raw.toString("utf-8");
  if (xml.includes("�")) {
    xml = iconv.decode(raw, "euc-kr");
  }
  const parser = new XMLParser({
    ignoreAttributes: true,
    trimValues: true,
    parseTagValue: false,
  });
  const parsed = parser.parse(xml) as CorpXml;
  const list = parsed.result?.list;
  const rows = Array.isArray(list) ? list : list ? [list] : [];

  if (rows.length === 0) {
    throw new Error("corp.xml에서 유효한 list를 찾지 못했습니다.");
  }

  const normalized = rows
    .map((item) => ({
      corpCode: toSafeString(item.corp_code),
      corpName: toSafeString(item.corp_name),
      corpEngName: toSafeString(item.corp_eng_name),
      stockCode: toSafeString(item.stock_code),
      modifyDate: toSafeString(item.modify_date),
    }))
    .filter((item) => item.corpCode && item.corpName);

  const outputFile = resolve(outputPath);
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, JSON.stringify(normalized), "utf-8");

  console.log(`완료: ${normalized.length}건 인덱스 생성`);
  console.log(`출력 파일: ${outputFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
