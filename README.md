# 바다사서

바다에 메시지를 담은 유리병을 띄우고 다른 사람의 메시지를 건져올리는 서비스입니다.

## 기술 스택

- **프레임워크**: Next.js (App Router)
- **데이터베이스**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **배포**: Vercel

## 로컬 개발 환경 설정

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 로컬 Supabase 실행

로컬 개발에는 Docker 기반의 Supabase를 사용합니다. `supabase/config.toml`에 로컬 환경 설정이 정의되어 있습니다.

```bash
# Supabase CLI 설치 (최초 1회)
brew install supabase/tap/supabase

# 로컬 Supabase 시작
supabase start

# 중지
supabase stop
```

시작 후 아래 서비스가 실행됩니다:

| 서비스 | URL |
|--------|-----|
| API | http://127.0.0.1:54321 |
| Studio (DB 관리 UI) | http://127.0.0.1:54323 |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres |

### 3. 환경 변수 설정

`.env` 파일을 생성하고 로컬 Supabase DB 연결 정보를 입력합니다:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
CRON_SECRET="your-secret"
```

### 4. DB 스키마 동기화

```bash
npx prisma db push
```

### 5. 개발 서버 실행

```bash
pnpm dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 배포

Vercel에 배포되며, 프로덕션 환경에서는 Supabase 클라우드의 PostgreSQL을 사용합니다.
