# Tech Context

## Stack
- Next.js 16 (App Router), React 19, TypeScript.
- NextAuth v5 beta.
- Ant Design, styled‑components, React Query.
- Axios для HTTP, Formik + Yup для форм.
- TypeORM + pg для доступа к БД.

## Environments
- `.env.dev.local` (dev), `.env.dev` (build:dev), `.env.prod` (build:prod), `.env.local`.
- Скрипты используют `env-cmd`.

## Tooling
- Yarn (packageManager: `yarn@4.5.1`).
- ESLint, Prettier.
- Jest + Testing Library.
- SWC plugin для styled‑components.

## Constraints
- Следовать FSD‑слоям и public API через `index.ts`.
- UI‑компоненты не вызывают API напрямую; коллбеки приходят сверху.
- Использовать yarn‑скрипты; текущий lint вызывает `next lint --fix`.

## Структура репозитория
- Основные директории: `src/`, `public/`, `docs/`, `database/`, `.memory_bank/`, `local/`.
- Ключевые runtime‑точки входа: `src/app/layout.tsx`, `src/app/api/`, `src/auth.ts`, `src/proxy.ts`, `database/data-source.ts`.
- Публичная часть: `public/`, `src/app/(public)/`.
- Компоненты/шаблоны: `src/entities/`, `src/features/`, `src/widgets/`, `src/screens/`, `src/shared/`, `src/app/`.
- CI/CD и инфраструктура: в корне не обнаружены `.github/`, `.gitlab-ci.yml`, `Dockerfile`, `docker-compose.*`, `k8s/`, `infra/`.
