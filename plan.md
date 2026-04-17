# 장비 관리 시스템 - 구현 계획 및 진행 현황

## 프로젝트 개요
노트북, 모니터, 데스크탑 등 장비를 관리하는 웹 애플리케이션.
QR코드를 통한 장비 이력 추적, 사용자/위치 관리, 엑셀 내보내기 기능이 핵심.

## Tech Stack
| 구분 | 기술 |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Backend/DB | Supabase (PostgreSQL + Auth) |
| UI | shadcn/ui (v4, base-ui 기반) + Tailwind CSS v4 |
| 주요 라이브러리 | `qrcode.react`, `exceljs`, `react-hook-form` + `zod`, `nanoid`, `date-fns`, `@tanstack/react-query` |

---

## 구현 계획 vs 진행 현황

### 1단계: 프로젝트 초기화 -- ✅ 완료
- [x] `create-next-app` 프로젝트 생성
- [x] shadcn/ui 초기화 및 컴포넌트 설치 (button, input, table, dialog, select, badge, card, tabs, dropdown-menu, sonner, sheet, pagination, label, textarea, popover, calendar, separator, tooltip)
- [x] form 컴포넌트 수동 생성 (shadcn v4 호환)
- [x] 의존성 설치 (`@supabase/supabase-js`, `@supabase/ssr`, `qrcode.react`, `exceljs`, `nanoid`, `date-fns`, `react-hook-form`, `@hookform/resolvers`, `zod`, `@tanstack/react-query`, `lucide-react`)
- [x] `.env.local` 환경변수 설정

### 2단계: Supabase DB 마이그레이션 -- ✅ 완료
- [x] `equipment_types` 테이블 + 기본 데이터 8종 (노트북, 데스크탑, 모니터, 키보드, 마우스, 프린터, 서버, 기타)
- [x] `equipment` 테이블 (이름, 유형, 시리얼, 모델, 제조사, 구매일, 구매가, 상태, qr_code_id 등)
- [x] `equipment_history` 테이블 (사용자, 부서, 기간, 위치)
- [x] `equipment_with_current_user` DB View
- [x] `assign_equipment()` 트랜잭션 함수
- [x] `update_updated_at()` 트리거
- [x] RLS 정책 (인증된 사용자 전체 접근)
- [x] Playwright로 Supabase SQL Editor에서 직접 실행 완료

### 3단계: Supabase 클라이언트 + 타입 정의 -- ✅ 완료
- [x] `src/lib/supabase/server.ts` - 서버사이드 클라이언트
- [x] `src/lib/supabase/client.ts` - 클라이언트사이드 클라이언트
- [x] `src/middleware.ts` - 인증 미들웨어 (로그인/QR 경로 제외)
- [x] `src/types/equipment.ts` - TypeScript 타입 정의
- [x] `src/lib/validators/equipment.ts` - 장비 Zod 스키마
- [x] `src/lib/validators/history.ts` - 이력 Zod 스키마
- [x] `src/lib/qr.ts` - QR URL 빌더

### 4단계: 레이아웃 -- ✅ 완료
- [x] `src/app/layout.tsx` - 루트 레이아웃 (Providers, Toaster)
- [x] `src/app/equipment/layout.tsx` - 장비 페이지 레이아웃 (Sidebar + Header)
- [x] `src/components/layout/sidebar.tsx` - 사이드바 네비게이션
- [x] `src/components/layout/header.tsx` - 헤더 (모바일 햄버거 메뉴, 로그아웃)
- [x] `src/components/providers.tsx` - React Query + TooltipProvider

### 5단계: 장비 목록 페이지 -- ✅ 완료
- [x] `src/app/equipment/page.tsx` - 서버 컴포넌트, 검색/필터/페이지네이션
- [x] `src/components/equipment/equipment-table.tsx` - 장비 테이블 (삭제 기능 포함)
- [x] `src/components/equipment/equipment-filters.tsx` - 검색, 상태/유형 필터
- [x] `src/components/equipment/equipment-pagination.tsx` - 페이지네이션
- [x] `src/components/equipment/equipment-status-badge.tsx` - 상태 뱃지

### 6단계: 장비 등록/수정 폼 -- ✅ 완료
- [x] `src/components/equipment/equipment-form.tsx` - 공유 폼 (create/edit 모드)
- [x] `src/app/equipment/new/page.tsx` - 장비 등록 페이지
- [x] `src/app/equipment/[id]/edit/page.tsx` - 장비 수정 페이지
- [x] 등록 시 `nanoid(10)`으로 QR ID 자동 생성

### 7단계: 장비 상세 페이지 + 이력 타임라인 -- ✅ 완료
- [x] `src/app/equipment/[id]/page.tsx` - 장비 상세 (정보 카드 + 이력)
- [x] `src/components/equipment/equipment-detail-client.tsx` - 이력 탭 + Dialog 관리
- [x] `src/components/history/history-timeline.tsx` - 이력 타임라인 (반납/수정/삭제)

### 8단계: 이력 추가/수정 Dialog -- ✅ 완료
- [x] `src/components/history/history-form-dialog.tsx` - 이력 폼 다이얼로그
- [x] 신규 배정 시 `assign_equipment()` RPC 호출 (기존 배정 자동 종료)
- [x] 반납 처리 기능 (end_date 설정 + 장비 상태 변경)

### 9단계: QR 코드 -- ✅ 완료
- [x] `src/app/equipment/[id]/qr/page.tsx` - QR 코드 표시 페이지
- [x] `src/components/equipment/qr-code-display.tsx` - QR SVG 렌더링 + 인쇄 버튼
- [x] `src/app/qr/[qrCodeId]/page.tsx` - QR 스캔 → 공개 장비 상세 페이지 (비로그인 허용)
- [x] `src/lib/supabase/admin.ts` - service role 클라이언트 (RLS 우회, 공개 QR 조회용)
- [x] 잘못된 QR 코드 → "해당 장비를 찾을 수 없습니다" 안내 UI

### 10단계: 엑셀 내보내기 -- ✅ 완료
- [x] `src/app/equipment/export/route.ts` - GET Route Handler
- [x] ExcelJS로 스타일링 포함 XLSX 생성 (헤더 색상, 테두리, 숫자 포맷)
- [x] 필터 조건 반영 (검색, 상태, 유형)
- [x] 파일명: `equipment_YYYYMMDD.xlsx`

### 11단계: 인증 -- ✅ 완료
- [x] `src/app/login/page.tsx` - 로그인 페이지
- [x] `src/middleware.ts` - 미인증 사용자 `/login`으로 리다이렉트
- [x] Supabase에 테스트 유저 생성 (`admin@test.com` / `admin1234`)
- [x] Playwright로 유저 생성 자동화 완료

### 12단계: Git 푸쉬 및 Vercel 배포 -- ✅ 완료
- [x] `.gitignore`에 `.playwright-mcp/`, `.claude/` 추가
- [x] GitHub 레포 생성 및 초기 커밋 후 push (`https://github.com/jinzkk/device-management`)
- [x] Vercel CLI(`npx vercel`)로 GitHub 계정 연동 및 프로젝트 생성 (`text-view`)
- [x] Vercel 환경변수 4개 설정 (CLI `vercel env add`)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL` = `https://text-view.vercel.app`
- [x] `vercel --prod`로 프로덕션 배포 성공
- [x] Supabase Auth URL Configuration 업데이트
  - Site URL: `https://text-view.vercel.app`
  - Redirect URL: `https://text-view.vercel.app/**`
- [x] **배포 URL: https://text-view.vercel.app**

### 13단계: 폴리싱 -- ✅ 완료 (Playwright 검증 완료)
- [x] 로딩 상태 — `equipment/loading.tsx`, `equipment/[id]/loading.tsx` (animate-pulse 스켈레톤)
- [x] 에러 바운더리 — `app/error.tsx` (루트), `equipment/error.tsx` (장비 영역), `app/not-found.tsx` (404)
- [x] 반응형 최적화 — 모바일(`sm` 미만)에서 카드 레이아웃, 데스크탑은 기존 테이블 유지
- [x] 토스트 알림 — `richColors`, `position="top-right"`, `duration=3000` 설정 + 주요 액션에 `description` 추가

---

## 프로젝트 구조 (최종)

```
src/
├── app/
│   ├── layout.tsx                          # 루트 레이아웃
│   ├── page.tsx                            # / → /equipment 리다이렉트
│   ├── login/page.tsx                      # 로그인
│   ├── equipment/
│   │   ├── layout.tsx                      # Sidebar + Header 레이아웃
│   │   ├── page.tsx                        # 장비 목록
│   │   ├── new/page.tsx                    # 장비 등록
│   │   ├── [id]/page.tsx                   # 장비 상세 + 이력
│   │   ├── [id]/edit/page.tsx              # 장비 수정
│   │   ├── [id]/qr/page.tsx               # QR 코드 표시/인쇄
│   │   └── export/route.ts                 # 엑셀 다운로드 API
│   └── qr/[qrCodeId]/page.tsx             # QR 스캔 리다이렉트
├── components/
│   ├── ui/                                 # shadcn/ui (20개 컴포넌트)
│   ├── layout/                             # header, sidebar
│   ├── equipment/                          # table, form, filters, pagination, status-badge, detail-client, qr-code-display
│   ├── history/                            # timeline, form-dialog
│   └── providers.tsx                       # React Query + TooltipProvider
├── lib/
│   ├── supabase/server.ts, client.ts       # Supabase 클라이언트
│   ├── validators/equipment.ts, history.ts # Zod 스키마
│   ├── qr.ts                              # QR URL 빌더
│   └── utils.ts                            # cn() 유틸리티
├── middleware.ts                            # 인증 미들웨어
└── types/equipment.ts                      # TypeScript 타입
```

---

## DB 스키마

```
equipment_types (장비 유형)
├── id: UUID (PK)
├── name: TEXT (UNIQUE) -- 노트북, 데스크탑, 모니터 등
├── description: TEXT
└── created_at: TIMESTAMPTZ

equipment (장비)
├── id: UUID (PK)
├── name: TEXT (NOT NULL)
├── type_id: UUID (FK → equipment_types)
├── serial_number: TEXT (UNIQUE)
├── model, manufacturer: TEXT
├── purchase_date: DATE
├── purchase_price: INTEGER
├── status: TEXT -- 사용가능 | 사용중 | 수리중 | 폐기
├── qr_code_id: TEXT (UNIQUE, NOT NULL) -- nanoid(10)
├── notes, image_url: TEXT
└── created_at, updated_at: TIMESTAMPTZ

equipment_history (장비 이력)
├── id: UUID (PK)
├── equipment_id: UUID (FK → equipment, CASCADE)
├── user_name: TEXT (NOT NULL)
├── department: TEXT
├── start_date: DATE (NOT NULL)
├── end_date: DATE -- NULL이면 현재 사용중
├── location, notes: TEXT
└── created_at, updated_at: TIMESTAMPTZ

equipment_with_current_user (뷰)
└── equipment + type_name + current_user_name/department/location/start_date

assign_equipment() (함수)
└── 기존 배정 종료 → 새 배정 생성 → 장비 상태 '사용중' 변경 (트랜잭션)
```

---

## 구현 시 참고사항

### shadcn/ui v4 호환
- `@base-ui/react` 기반 (Radix UI 아님)
- `asChild` prop 대신 `render` prop 또는 `buttonVariants()` + Link 조합 사용
- `toast` 대신 `sonner` 사용
- `form` 컴포넌트는 수동 생성 필요 (`FormControl`에서 `cloneElement` 방식)

### Select 컴포넌트 (base-ui)
- `onValueChange` 콜백의 값이 `null` 가능 → `v ?? "all"` 처리 필요
- 네이티브 `<select>`가 아니므로 Playwright에서 `fill_form`의 combobox 타입 사용 불가 → `click`으로 옵션 선택

### Supabase 키
- 최신 Supabase는 `publishable key` / `secret key` 체계 사용
- `publishable key`가 기존 `anon key` 역할
- `.env.local`에서 `NEXT_PUBLIC_SUPABASE_ANON_KEY`로 매핑

---

## 실행 방법

```bash
# 개발 서버 시작
npm run dev

# 로컬 접속
http://localhost:3000

# 프로덕션 (Vercel)
https://text-view.vercel.app

# 테스트 계정
이메일: admin@test.com
비밀번호: admin1234
```

## 배포 정보

| 항목 | 내용 |
|------|------|
| GitHub | https://github.com/jinzkk/device-management |
| Vercel 프로젝트 | jinzkk/text-view |
| 배포 URL | https://text-view.vercel.app |
| Vercel 대시보드 | https://vercel.com/jinzkk/text-view |

---

## 남은 작업
- QR 코드 인쇄 시 `@media print` CSS 최적화
- 장비 사진 업로드 (Supabase Storage 연동)
