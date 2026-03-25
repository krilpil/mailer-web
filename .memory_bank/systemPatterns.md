# System Patterns

## Architecture Overview
- Next.js App Router с группами маршрутов `(public)/(private)/(providers)/(theme)` в `src/app/`.
- FSD‑слои: app → screens → widgets → features → entities → shared.
- Серверные API — в `src/app/api` с раздельными handlers/services.

## Key Decisions
- Public API каждого среза экспортируется через `index.ts`.
- UI‑компоненты не делают API‑вызовы напрямую; бизнес‑логика передается пропсами сверху.
- Формы используют Formik + Yup; стили — styled‑components.
- Авторизация через NextAuth; маршруты разделены на public/private в `shared/config/routes`.

## Data Flow
- Страница → экран → feature/entity → API‑hook (`src/entities/.../api`) → `/api/...` handler → service → внешний API/БД.
- Для публичных страниц проверка сессии и редирект выполняются на серверной странице.

## Integration Points
- Внешний почтовый провайдер через `BILLION_MAIL_API`/`BILLION_MAIL_TOKEN`.
- БД через TypeORM + Postgres (`pg`), конфигурация в `database/data-source.ts`.
- UI и инфраструктурные библиотеки: Ant Design, styled‑components, React Query, Formik/Yup.

## Границы подсистем
- Клиентское приложение (Next.js App Router): `src/app/`, с UI-слоями в `src/screens/`, `src/widgets/`, `src/features/`, `src/entities/`, `src/shared/`.
- Серверные API (route handlers): `src/app/api/`.
- Публичные маршруты и статика: `src/app/(public)/`, `public/`.
- Конфигурация аутентификации и прокси: `src/auth.ts`, `src/proxy.ts`.
- Данные и БД: `database/`, `src/database/`.
- Документация и память: `docs/`, `.memory_bank/`, `local/`.
- CI/CD и инфраструктура: в корне не обнаружены `.github/`, `.gitlab-ci.yml`, `Dockerfile`, `docker-compose.*`, `k8s/`, `infra/`.
