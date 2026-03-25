# /sign-up

## Назначение
- Публичная страница регистрации с подтверждением по OTP.

## Компоненты/виджеты
- `SignUpPage` (screen): `src/screens/SignUpPage/ui/SignUpPage.tsx`.
- `SignUpForm` (entity component): `src/entities/session/ui/SignUpForm/SignUpForm.tsx`.
- `ConfirmationForm` (entity component): `src/entities/session/ui/ConfirmationForm/ConfirmationForm.tsx`.
- API-хуки регистрации: `src/entities/auth/api/sendOTPSignUp/`, `src/entities/auth/api/submitOTPSignUp/`.

## Входы/выходы данных
- Вход: email и пароль (этап регистрации), OTP-код (этап подтверждения).
- Выход: запрос OTP и подтверждение OTP; переход на страницу аутентификации через `routes.AUTH_PAGE`.

## Где искать реализацию
- Страница маршрута: `src/app/(public)/sign-up/page.tsx`.
- Экран: `src/screens/SignUpPage/`.
- Формы: `src/entities/session/ui/SignUpForm/`, `src/entities/session/ui/ConfirmationForm/`.
- API-хуки: `src/entities/auth/api/sendOTPSignUp/`, `src/entities/auth/api/submitOTPSignUp/`.
