import { mixed, object, ObjectSchema, string } from 'yup';

import { ICreateTemplatePayload } from './createTemplate.types';

export const createTemplatePayloadValidate: ObjectSchema<ICreateTemplatePayload> = object({
  template_name: string().trim().required(),
  content: mixed()
    .test('is-object', 'Содержимое шаблона должно быть объектом', (value) => {
      return value === undefined || (typeof value === 'object' && value !== null);
    })
    .optional(),
  html_content: string()
    .test('not-empty', 'HTML шаблон не должен быть пустым', (value) => {
      return value === undefined || value.trim().length > 0;
    })
    .optional(),
})
  .test(
    'content-or-html',
    'Нужно передать content или html_content',
    (value) => Boolean(value?.content) || Boolean(value?.html_content?.trim())
  )
  .required();
