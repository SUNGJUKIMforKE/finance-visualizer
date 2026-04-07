# Finance Visualizer

React(Next.js) 기반 재무 데이터 시각화/해설 서비스입니다.

## 실행

```bash
npm install
npm run import:corp
npm run dev
```

## 환경 변수

- `OPENDART_API_KEY`: OpenDART API 키
- `GEMINI_API_KEY`: Gemini API 키
- `GEMINI_MODEL`: `gemini-2.0-flash` 또는 `gemini-2.5-flash`

## corp.xml 인덱스

- 검색 기능은 `data/corp-index.json` 파일을 사용합니다.
- 이 파일은 `npm run import:corp` 실행 시 `C:\Users\RIANNOTE\Downloads\corp.xml` 기반으로 생성됩니다.

## 배포 주의사항

- `.env.local`은 Git에 포함하지 않습니다.
- Vercel 프로젝트의 Environment Variables에 키를 등록해야 합니다.
- 키가 누락된 경우 API는 친화적 오류 메시지를 반환합니다.
