# EDUWELL | 교육복지 통합업무관리시스템

교육복지사를 위한 통합업무관리 웹앱입니다. 상담일지, 사례관리, 자원연계, 프로그램, 일정, 통계를 한곳에서 관리합니다.

## 기술 스택

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth)
- recharts (통계 차트)

## 시작하기

### 1. Supabase 스키마 적용

Supabase 대시보드 → **SQL Editor**에서 `supabase/schema.sql` 파일 내용을 전체 실행하세요.
`students`, `counseling_logs`, `cases`, `case_notes`, `resources`, `referrals`, `programs`,
`program_participants`, `program_sessions`, `attendance`, `schedules`, `notices`, `memos`,
`profiles` 테이블과 RLS 정책이 생성됩니다.

이미 `schema.sql`을 한 번 실행한 적이 있다면(Google 로그인 전환 이전), 전체를 다시 실행할 필요 없이
`supabase/migrations/0002_google_oauth_profile.sql`만 추가로 실행하면 됩니다.

### 2. 환경변수

`.env.local`에 아래 값을 설정합니다 (Supabase 프로젝트 Settings → API에서 확인).

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 3. Google 로그인(OAuth) 설정

로그인/회원가입은 Google 계정으로만 진행됩니다. 아래 두 곳을 설정해야 합니다.

**Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials)
1. OAuth 2.0 클라이언트 ID 생성 (애플리케이션 유형: 웹 애플리케이션)
2. **승인된 리디렉션 URI**에 아래 주소 추가:
   ```
   https://<프로젝트-ref>.supabase.co/auth/v1/callback
   ```
3. 발급된 **클라이언트 ID / 클라이언트 보안비밀**을 복사

**Supabase 대시보드** → Authentication → Sign In / Providers → **Google**
1. Google Provider를 켜고, 위에서 발급받은 클라이언트 ID/보안비밀 입력
2. Authentication → URL Configuration → **Redirect URLs**에 아래 추가:
   ```
   http://localhost:3000/auth/callback
   ```
   (배포 후에는 실제 배포 도메인의 `/auth/callback`도 함께 추가)

### 4. 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속 후 "Google 계정으로 계속하기"로 로그인하면,
최초 1회 이름·소속기관(학교)·연락처를 입력하는 온보딩 화면으로 이동합니다.
(내부 업무관리 시스템 특성상, 로그인한 담당자는 전체 데이터에 접근 가능합니다.)

## 주요 기능

- **홈**: 오늘 일정, 미작성 상담일지, 공지사항, 개인 메모
- **일정**: 상담/사례회의/프로그램 등 월별 일정 관리
- **상담일지**: 상담·교육·의뢰·가정방문 등 상담 기록
- **사례관리**: 위기학생 사례 등록, 위험도/상태 관리, 진행기록 타임라인
- **학생관리**: 지원대상 학생 정보 및 관련 기록 통합 조회
- **자원연계**: 지역 기관 DB, 학생별 연계 신청 및 진행 상태 관리
- **프로그램**: 방과후/체험/멘토링 프로그램, 참여자 및 회차별 출석 관리
- **통계**: 월별 상담 추이, 사례/자원연계 상태 분포, 프로그램 참여 현황
