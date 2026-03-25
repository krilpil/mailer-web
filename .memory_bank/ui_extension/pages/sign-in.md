# /sign-in

## Назначение
- Публичная страница входа в аккаунт.

## Компоненты/виджеты
- `SignInPage` (screen): `src/screens/SignInPage/ui/SignInPage.tsx`.
- `SignInForm` (entity component): `src/entities/session/ui/SignInForm/SignInForm.tsx`.

## Входы/выходы данных
- Вход: email и пароль из формы.
- Выход: попытка аутентификации через NextAuth credentials; редирект при успехе.
- Серверный слой перенаправляет на `/`, если сессия уже есть.

## Где искать реализацию
- Страница маршрута: `src/app/(public)/sign-in/page.tsx`.
- Экран: `src/screens/SignInPage/`.
- Форма: `src/entities/session/ui/SignInForm/`.
