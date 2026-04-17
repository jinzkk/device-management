# 수정 내역 (Playwright 검증 기반)

검증 일시: 2026-04-17  
검증 방법: Playwright MCP 브라우저 자동화 테스트 (1~11단계 전체)

---

## [Warning] middleware.ts 폐기 → proxy.ts 전환

**증상:** 개발 서버 시작 시 경고 출력
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```
**파일:** `src/middleware.ts` → `src/proxy.ts`  
**원인:** Next.js 16에서 Middleware 이름이 Proxy로 변경됨. 함수 export 이름도 `middleware` → `proxy`로 변경.  
**수정:**
- `src/middleware.ts` 삭제
- `src/proxy.ts` 생성 (동일 로직, `export async function proxy(...)` 형태)

**검증:** 서버 재기동 후 로그에 `proxy.ts: 93ms` 표시, 경고 없음 ✅

---

## [Bug #1] 장비 수정 폼 - 유형 Select에 UUID 표시

**증상:** `/equipment/[id]/edit` 접근 시 `유형 *` 드롭다운에 이름(`노트북`) 대신 UUID(`3f005275-f405-4dfe-a1bf-4e954f85689e`) 표시  
**파일:** `src/components/equipment/equipment-form.tsx`  
**원인:** Base UI의 `Select.Value`는 외부에서 제어값(UUID)을 받을 때 items가 portal에서 지연 렌더링되어 label 매핑이 초기에 실패함.  
**수정:** `SelectValue`의 children에 `types` 배열에서 직접 조회한 type name을 전달:

```tsx
// Before
<SelectValue placeholder="유형 선택" />

// After
<SelectValue placeholder="유형 선택">
  {field.value
    ? types.find((t) => t.id === field.value)?.name
    : undefined}
</SelectValue>
```

**검증:** 수정 폼 진입 시 `노트북` 정상 표시 ✅

---

## [Bug #2] 장비 목록 필터 - 비제어 Input 콘솔 오류

**증상:** 검색창 입력 시 콘솔 오류 발생
```
Base UI: A component is changing the default value state of an uncontrolled FieldControl after being initialized.
```
**파일:** `src/components/equipment/equipment-filters.tsx`  
**원인:** `<Input defaultValue={...}>` (비제어) 사용 중 URL searchParams 변경 시 값 불일치 발생.  
**수정:** `useState` + `useRef`를 사용한 제어 Input으로 전환:

```tsx
// Before (비제어)
<Input
  defaultValue={searchParams.get("search") || ""}
  onChange={(e) => {
    const timer = setTimeout(() => updateParams("search", e.target.value), 300);
    return () => clearTimeout(timer);
  }}
/>

// After (제어)
const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setSearchValue(value);
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => updateParams("search", value), 300);
};

<Input value={searchValue} onChange={handleSearchChange} />
```

**검증:** 검색 입력 시 콘솔 오류 없음, URL 정상 업데이트 ✅

---

## [Bug #3] 이력 수정 Dialog - 종료일(end_date) pre-fill 누락

**증상:** 반납 처리된 이력 수정 시 `종료일` 필드가 비어 있음 → 저장 시 end_date가 NULL로 초기화되어 장비 상태 불일치 발생  
**파일:** `src/components/history/history-form-dialog.tsx`  
**원인:** `useForm`의 `defaultValues`는 컴포넌트 최초 마운트 시에만 적용됨. `HistoryFormDialog`는 항상 DOM에 마운트된 상태이므로 `editItem` prop 변경 시 폼이 재초기화되지 않음.  
**수정:** `useEffect`로 Dialog가 열릴 때마다 `form.reset()` 호출:

```tsx
useEffect(() => {
  if (open) {
    form.reset({
      user_name: editItem?.user_name || "",
      department: editItem?.department || "",
      start_date: editItem?.start_date || format(new Date(), "yyyy-MM-dd"),
      end_date: editItem?.end_date || "",
      location: editItem?.location || "",
      notes: editItem?.notes || "",
    });
  }
}, [open, editItem]);
```

**검증:** 반납된 이력 수정 Dialog 열기 시 `종료일` 필드에 `2026-04-17` 정상 표시 ✅

---

## [Bug #4] QR 스캔 - 미인증 시 404 반환

**증상:** 로그아웃 상태에서 `/qr/[qrCodeId]` 접근 시 404 페이지 표시  
**파일:** `src/app/qr/[qrCodeId]/page.tsx`  
**원인:** Supabase RLS 정책이 인증된 사용자만 `equipment` 테이블 조회 허용. 미인증 상태에서 qr_code_id 조회가 빈 결과를 반환하여 `notFound()` 호출됨. middleware는 `/qr` 경로를 공개 처리하나 Supabase DB 조회 레벨에서 차단됨.  
**수정:** `notFound()` 대신 `/login`으로 리다이렉트:

```tsx
// Before
if (!equipment) notFound();

// After
if (!equipment) redirect("/login");
```

**검증:** 로그아웃 후 `/qr/T4Et1zF4ix` 접근 시 `/login`으로 리다이렉트 ✅

---

## [개선] QR 스캔 - 공개 읽기 전용 뷰 + 잘못된 QR 안내 페이지

**배경:** 핸드폰으로 QR 스캔 시 비로그인 상태에서도 장비 정보를 확인할 수 있어야 하며, 존재하지 않는 QR은 `/login`이 아닌 친화적인 안내 페이지로 처리해야 함.

**파일:**
- `src/app/qr/[qrCodeId]/page.tsx` — 전면 재작성
- `src/lib/supabase/admin.ts` — 신규 생성
- `.env.local` — `SUPABASE_SERVICE_ROLE_KEY` 추가

**원인:** 기존 구현은 장비 있으면 `/equipment/{id}`로 리다이렉트, 없으면 `/login`으로 리다이렉트. 리다이렉트된 장비 상세 페이지는 RLS로 인해 미인증 사용자에게 데이터가 보이지 않음.

**수정:**

1. **`src/lib/supabase/admin.ts`** 신규 생성 — service role 키로 RLS 우회하는 admin 클라이언트:

```ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

2. **`src/app/qr/[qrCodeId]/page.tsx`** 재작성 — redirect 제거, 직접 렌더링:
   - `createAdminClient()`로 `equipment_with_current_user` 뷰 조회 (RLS 우회)
   - 장비 없음 → `PackageSearch` 아이콘 + "해당 장비를 찾을 수 없습니다" 안내 UI
   - 장비 있음 → 읽기 전용 카드 (장비명, 상태, 유형, 시리얼, 모델, 제조사, 현재 사용자, 부서, 위치, 비고)

3. **`.env.local`** — Supabase 대시보드에서 legacy service_role JWT 키를 Playwright로 추출하여 추가:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

**검증:** 로그아웃 상태에서 `/qr/{유효한qrCodeId}` 접근 시 장비 정보 카드 표시, `/qr/invalid123` 접근 시 "해당 장비를 찾을 수 없습니다" 표시

---

## [배포] GitHub 푸쉬 및 Vercel 배포

### Git 푸쉬

**파일:** `.gitignore`  
**수정:** Playwright 캡처 파일 및 Claude Code 설정 파일 제외 추가:
```
.playwright-mcp/
.claude/
```

**결과:** `git add -A` → `git commit` → `git push origin master`  
레포: https://github.com/jinzkk/device-management ✅

---

### Vercel 배포 - 빌드 실패 (1차)

**증상:** `npx vercel` 첫 배포 시 빌드 오류:
```
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
Export encountered an error on /login/page: /login, exiting the build.
```
**원인:** `.env.local`은 git에서 제외되므로 Vercel 빌드 환경에 환경변수가 없음.  
**해결:** Vercel CLI로 환경변수 4개 추가:
```bash
echo "https://dfxywwukkczwirnhgdqb.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "sb_publishable_..." | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "eyJhbGci..." | vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo "https://text-view.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production
```

### Vercel 배포 - 성공 (2차)

**명령:** `npx vercel --prod`  
**결과:** 빌드 성공, 전체 라우트 정상 생성 ✅
```
○ /login
ƒ /equipment, /equipment/[id], /equipment/[id]/edit ...
ƒ /qr/[qrCodeId]
ƒ Proxy (Middleware)
```
**배포 URL:** https://text-view.vercel.app

---

### Supabase Auth URL 설정

**경로:** Supabase 대시보드 → Authentication → URL Configuration  
**수정:**
- Site URL: `http://localhost:3000` → `https://text-view.vercel.app`
- Redirect URLs: `https://text-view.vercel.app/**` 추가

**이유:** Supabase OAuth 콜백이 허용되지 않은 도메인으로 오면 로그인이 실패함 ✅

---

## [Bug #5] 장비 목록 필터 - Select 비제어→제어 전환 오류 및 유형 UUID 표시

**증상:** 상태/유형 필터 드롭다운 선택 시 콘솔 오류 발생, 유형 선택 후 드롭다운에 이름 대신 UUID 표시
```
Base UI: A component is changing the default value state of an uncontrolled Select after being initialized.
Base UI: A component is changing the uncontrolled value state of Select to be controlled.
```
**파일:** `src/components/equipment/equipment-filters.tsx`  
**원인:**
1. `defaultValue` 사용으로 비제어 컴포넌트로 초기화된 후 Next.js 클라이언트 라우팅 시 searchParams 변경으로 `defaultValue`를 재설정하려 해 Base UI 경고 발생
2. `value={searchParams.get(...)}` 직접 사용 시 Next.js Suspense 전환 중 일시적으로 `undefined`가 되어 비제어→제어 전환 경고 발생
3. Base UI 포탈 렌더링으로 인해 `SelectValue`가 UUID를 label로 매핑하지 못해 UUID 직접 표시

**수정:**
```tsx
// Before (비제어 - 오류 발생)
<Select defaultValue={searchParams.get("status") || "all"} ...>

// After (제어 - useState로 안정적인 초기값 보장)
const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all");

<Select
  value={statusFilter}
  onValueChange={(v) => { const val = v ?? "all"; setStatusFilter(val); updateParams("status", val); }}
>

// 유형 SelectValue에 명시적 레이블 전달 (Bug #1과 동일한 패턴)
<SelectValue placeholder="유형">
  {typeFilter !== "all"
    ? types.find((t) => t.id === typeFilter)?.name
    : undefined}
</SelectValue>
```

**검증 (Playwright):**
- 상태 필터 "사용가능" 선택 → URL `?status=사용가능`, 드롭다운 "사용가능" 표시, 콘솔 오류 0건 ✅
- 유형 필터 "노트북" 선택 → URL `?type=UUID`, 드롭다운 "노트북" 표시, 콘솔 오류 0건 ✅

---

## 전체 테스트 결과 요약

| 단계 | 항목 | 결과 |
|------|------|------|
| 1 | 프로젝트 초기화 (앱 로드, shadcn 렌더링) | ✅ |
| 2 | Supabase DB (테이블, 시드 데이터) | ✅ |
| 3 | Supabase 클라이언트 + 타입 (세션, 쿼리) | ✅ |
| 4 | 레이아웃 (사이드바, 헤더, 모바일 반응형) | ✅ |
| 5 | 장비 목록 (테이블, 검색, 필터, 드롭다운) | ✅ (Bug #5 수정 후) |
| 6 | 장비 등록/수정 (Zod 유효성, CRUD) | ✅ (Bug #1 수정 후) |
| 7 | 장비 상세 (정보 카드, 이력 탭) | ✅ |
| 8 | 이력 Dialog (추가, 반납, 수정) | ✅ (Bug #3 수정 후) |
| 9 | QR 코드 (SVG 렌더링, 스캔 리다이렉트) | ✅ (개선: 공개 읽기 전용 뷰 + 잘못된 QR 안내) |
| 10 | 엑셀 내보내기 (API 응답, Content-Type) | ✅ |
| 11 | 인증 (로그인, 로그아웃, 미인증 리다이렉트) | ✅ (Bug #4 수정 후) |
| 12 | Git 푸쉬 (GitHub) | ✅ |
| 13 | Vercel 배포 (프로덕션) | ✅ (환경변수 설정 후 2차 배포 성공) |
| 14 | 로딩 스켈레톤 (equipment, equipment/[id]) | ✅ |
| 15 | 에러 바운더리 (error.tsx, not-found.tsx) | ✅ |
| 16 | 모바일 카드 레이아웃 (375px 검증) | ✅ |
| 17 | 토스트 richColors + description 추가 | ✅ |
| 18 | QR 인쇄 — 사이드바/헤더 제거, @page 여백 설정 | ✅ (Playwright 검증) |
| 19 | 장비 사진 업로드 — Storage 연동, 미리보기, 상세 표시 | ✅ (Playwright 검증) |
| 20 | loading.tsx Fragment key 누락 콘솔 오류 수정 | ✅ (Playwright 검증) |
| 21 | 장비 상세 이미지 왜곡 수정 (object-cover → object-contain) | ✅ (Playwright 검증) |

**수정 파일 목록:**
- `src/middleware.ts` → 삭제
- `src/proxy.ts` → 신규 생성 (middleware 대체)
- `src/components/equipment/equipment-form.tsx` → Bug #1, 사진 업로드 기능
- `src/components/equipment/equipment-filters.tsx` → Bug #2, Bug #5
- `src/components/history/history-form-dialog.tsx` → Bug #3
- `src/app/qr/[qrCodeId]/page.tsx` → Bug #4 + QR 공개 접근 개선
- `src/lib/supabase/admin.ts` → 신규 생성 (service role 클라이언트)
- `src/lib/validators/equipment.ts` → image_url 필드 추가
- `src/app/equipment/layout.tsx` → QR 인쇄 print:hidden
- `src/components/equipment/qr-code-display.tsx` → @page 여백 + 인쇄 레이아웃
- `src/app/equipment/[id]/page.tsx` → 장비 사진 표시, infoRows.map `&&` → 삼항 연산자 수정
- `src/app/equipment/[id]/loading.tsx` → Fragment key 누락 수정 (Bug #6)
- `.gitignore` → `.playwright-mcp/`, `.claude/` 추가
- `.env.local` → `SUPABASE_SERVICE_ROLE_KEY` 추가

**[13단계 폴리싱]**
- `src/app/equipment/loading.tsx` → 신규 (목록 스켈레톤)
- `src/app/equipment/[id]/loading.tsx` → 신규 (상세 스켈레톤)
- `src/app/not-found.tsx` → 신규 (글로벌 404)
- `src/app/error.tsx` → 신규 (루트 에러 폴백)
- `src/app/equipment/error.tsx` → 신규 (장비 영역 에러)
- `src/components/equipment/equipment-table.tsx` → 모바일 카드 레이아웃 + toast description
- `src/components/equipment/equipment-form.tsx` → 등록/수정 toast description 추가
- `src/app/layout.tsx` → Toaster richColors, position, duration 설정

---

## [개선] QR 코드 인쇄 `@media print` CSS 최적화

**파일:**
- `src/app/equipment/layout.tsx`
- `src/components/equipment/qr-code-display.tsx`

**수정:**

1. **`src/app/equipment/layout.tsx`** — Sidebar/Header에 `print:hidden` 래퍼 추가 및 `<main>` 패딩 `print:p-0`:
```tsx
<div className="print:hidden"><Sidebar /></div>
<div className="flex flex-1 flex-col">
  <div className="print:hidden"><Header /></div>
  <main className="flex-1 p-4 md:p-6 print:p-0">{children}</main>
</div>
```

2. **`src/components/equipment/qr-code-display.tsx`** — `@page` 여백 설정 + 인쇄 레이아웃:
```tsx
<style>{`@page { margin: 10mm; }`}</style>
<div className="... print:flex print:items-center print:justify-center print:min-h-screen print:m-0">
  // 카드 패딩 print:p-4, 텍스트 print:text-base / print:text-xs
```

---

## [기능] 장비 사진 업로드 (Supabase Storage 연동)

**파일:**
- Supabase Storage (대시보드)
- `src/lib/validators/equipment.ts`
- `src/components/equipment/equipment-form.tsx`
- `src/app/equipment/[id]/page.tsx`

**수정:**

1. **Supabase Storage** — `equipment-images` Public 버킷 생성, RLS 정책 추가:
```sql
CREATE POLICY "Auth upload equipment-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'equipment-images');
CREATE POLICY "Auth update equipment-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'equipment-images');
CREATE POLICY "Auth delete equipment-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'equipment-images');
```

2. **`src/lib/validators/equipment.ts`** — `image_url` 필드 추가:
```ts
image_url: z.string().optional(),
```

3. **`src/components/equipment/equipment-form.tsx`** — 이미지 업로드 UI + 로직:
- `useState<File | null>`, `useState<string | null>` 로 파일/미리보기 관리
- hidden `<input type="file" accept="image/*">` + 커스텀 버튼
- 미리보기 `w-32 h-32 object-cover` + 삭제 버튼
- `onSubmit`에서 Storage 업로드 후 public URL을 payload의 `image_url`에 포함

4. **`src/app/equipment/[id]/page.tsx`** — 장비 상세 카드 상단 이미지 표시:
```tsx
{eq.image_url && (
  <img src={eq.image_url} alt={eq.name} className="w-full max-h-48 object-cover rounded-lg mb-4" />
)}
```

---

## [Bug #6] 장비 상세 로딩 스켈레톤 - Fragment key 누락 콘솔 오류

**증상:** `/equipment/[id]` 및 `/equipment/[id]/qr` 접근 시 콘솔 오류 발생
```
Each child in a list should have a unique "key" prop.
```
**파일:** `src/app/equipment/[id]/loading.tsx`  
**원인:** `Array.from({ length: 6 }).map()` 내부에서 `<>...</>` Fragment를 반환할 때 key 미지정. 내부 div에는 key가 있었으나 Fragment 자체에 key가 없어 React가 경고를 발생시킴.  
**수정:** `<>` → `<Fragment key={i}>` 로 교체 및 `import { Fragment } from "react"` 추가:

```tsx
// Before
{Array.from({ length: 6 }).map((_, i) => (
  <>
    <div key={`l-${i}`} className="h-4 w-20 animate-pulse rounded bg-muted" />
    <div key={`v-${i}`} className="h-4 w-32 animate-pulse rounded bg-muted" />
  </>
))}

// After
{Array.from({ length: 6 }).map((_, i) => (
  <Fragment key={i}>
    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
  </Fragment>
))}
```

**검증:** `/equipment/[id]`, `/equipment/[id]/qr` 진입 시 콘솔 오류 0건 ✅

---

## [Bug #7] 장비 상세 페이지 - 이미지 왜곡 표시

**증상:** 장비 사진 등록 후 상세 페이지에서 이미지가 납작하게 왜곡됨
- 원본 685×655px(비율 1.05)이 921×192px(비율 0.21)로 렌더링됨 — 약 4배 왜곡

**파일:** `src/app/equipment/[id]/page.tsx`  
**원인:** `w-full max-h-48 object-cover` 조합이 부모 전체 너비(921px)로 이미지를 강제 확장하고, 높이를 192px로 제한하면서 `object-cover`가 이미지를 크롭·왜곡함.

**수정:**
```tsx
// Before
<img className="w-full max-h-48 object-cover rounded-lg mb-4" />

// After
<div className="flex justify-center mb-4">
  <img className="max-h-48 max-w-full object-contain rounded-lg" />
</div>
```

**검증:** 렌더링 비율 0.21 → 1.05 (원본과 동일), 콘솔 오류 0건 ✅
