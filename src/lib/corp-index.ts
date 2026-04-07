import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export type CorpIndexItem = {
  corpCode: string;
  corpName: string;
  corpEngName?: string;
  stockCode?: string;
  modifyDate?: string;
};

let cache: CorpIndexItem[] | null = null;

export async function loadCorpIndex(): Promise<CorpIndexItem[]> {
  if (cache) return cache;
  const file = resolve(process.cwd(), "data/corp-index.json");
  const raw = await readFile(file, "utf-8");
  cache = JSON.parse(raw) as CorpIndexItem[];
  return cache;
}
