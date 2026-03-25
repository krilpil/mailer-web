# SignInPage

## Назначение
- Экран входа в аккаунт на публичной странице `/sign-in`.

## Точки конфигурации
- `callbackUrl` (опционально) задает безопасный URL редиректа после входа.

## Параметры
- `callbackUrl?: string` (из `SignInPageProps`).

## Шаблоны
- Бренд и заголовок страницы.
- Карточка с формой входа.

## Зависимости
- `SignInForm` из `src/entities/session`.
- `signIn` из `next-auth/react`.
- `useRouter` из `next/navigation`.
- Styled components из `src/screens/SignInPage/ui/SignInPage.styles`.

## Где вызывается
- Маршрут: `src/app/(public)/sign-in/page.tsx`.
