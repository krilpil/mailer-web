# SignUpForm

## Назначение
- Форма регистрации: email, пароль и подтверждение пароля.

## Точки конфигурации
- `onSubmitAction` — обработчик отправки формы.
- `error` — внешний текст ошибки для отображения.
- Встроенная валидация полей (Yup).

## Параметры
- `onSubmitAction: (values: SignUpFormValues) => void`.
- `error?: string`.

## Шаблоны
- Поля email, password, confirmPassword.
- Кнопка отправки и блок ошибки.
- Ссылка на `/sign-in`.

## Зависимости
- `formik`, `yup`, `antd` Button.
- Styled components из `src/entities/session/ui/SignUpForm/SignUpForm.styles`.

## Где вызывается
- `SignUpPage` (`src/screens/SignUpPage/ui/SignUpPage.tsx`).
