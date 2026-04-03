import { mixed, object, ObjectSchema, string } from 'yup';

import { ICreateTemplatePayload } from './createTemplate.types';

export const createTemplatePayloadValidate: ObjectSchema<ICreateTemplatePayload> = object({
  template_name: string().trim().required(),
  content: mixed()
    .test('is-object', 'Содержимое шаблона должно быть объектом', (value) => {
      return typeof value === 'object' && value !== null;
    })
    .required(),
}).required();
