import { number, object, ObjectSchema } from 'yup';

import { IDeleteUserTemplatePayload } from './deleteTemplate.types';

export const deleteUserTemplatePayloadValidate: ObjectSchema<IDeleteUserTemplatePayload> = object({
  template_id: number().required().integer().positive(),
}).required();
