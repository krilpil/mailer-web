# SignUpPage

## Назначение
- Экран регистрации с подтверждением по OTP на публичной странице `/sign-up`.

## Точки конфигурации
- Переход после подтверждения задается через `routes.AUTH_PAGE`.
- Внутренние стадии: `signUp` и `confirmation`.

## Параметры
- Входных props нет.

## Шаблоны
- Бренд и заголовок страницы.
- Карточка с формой регистрации или подтверждения.

## Зависимости
- `SignUpForm` и `ConfirmationForm` из `src/entities/session`.
- `useSendOTPSignUp`, `useSubmitOTPSignUp` из `src/entities/auth/api`.
- `useRouter` из `next/navigation`.
- `routes` из `src/shared/config/routes.ts`.
- Styled components из `src/screens/SignUpPage/ui/SignUpPage.styles`.

## Где вызывается
- Маршрут: `src/app/(public)/sign-up/page.tsx`.
