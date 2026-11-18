# REST 연습 (React + TypeScript + SCSS)

JSONPlaceholder `/posts`로 REST CRUD(조회/상세/생성/삭제)를 연습하는 프로젝트.

## 시작

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

## 스크립트

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 (proxy 적용) |
| `pnpm build` | 타입 체크 + 빌드 |
| `pnpm typecheck` | 타입 체크만 |
| `pnpm lint` | Biome |
| `pnpm format` | prettier |

## 구조

```
src/
├── api/                 # REST 호출 함수
├── components/          # 컴포넌트 (SCSS import 없음)
├── assets/scss/         # 정적 스타일 (main.scss가 진입점)
│   ├── abstracts/       # 변수, mixin
│   ├── base/            # reset, typography
│   └── components/      # 컴포넌트별 스타일
├── App.tsx
└── main.tsx             # 전역 SCSS는 여기서만 import
```

## 환경 설정 메모

- **경로 alias**: `@/` → `src/` (vite.config.ts + tsconfig.app.json 양쪽 설정)
- **환경변수**: `.env.development`(proxy 경유 `/api`), `.env.production`(실제 주소)
- **CORS 우회**: 개발 중에는 Vite proxy가 `/api`를 JSONPlaceholder로 전달
- **SCSS**: `loadPaths` 설정으로 `@use 'abstracts/variables'` 형태의 짧은 경로 사용
