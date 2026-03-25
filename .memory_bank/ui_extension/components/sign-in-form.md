# SignInForm

## Назначение
- Форма входа (email и пароль) с валидацией и отображением ошибок.

## Точки конфигурации
- `onSubmit` — обработчик отправки формы (возвращает строку ошибки или `null`).
- Встроенная валидация email/пароля (Yup).

## Параметры
- `onSubmit: (values: SignInFormValues) => Promise<string | null>`.

## Шаблоны
- Поля email и password.
- Ссылки: `/forgot-password`, `/sign-up`.
- Кнопка отправки и блок ошибки.

## Зависимости
- `formik`, `yup`, `antd` Button.
- Styled components из `src/entities/session/ui/SignInForm/SignInForm.styles`.

## Где вызывается
- `SignInPage` (`src/screens/SignInPage/ui/SignInPage.tsx`).
