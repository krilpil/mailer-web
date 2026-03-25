import { NextResponse } from 'next/server';
import { ObjectSchema, ValidationError } from 'yup';

type ParseResult<T> = { data: T } | { error: NextResponse };

export const parseAndValidate = async <T>(
  request: Request,
  schema: ObjectSchema<T>
): Promise<ParseResult<T>> => {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return {
      error: NextResponse.json({ success: false, msg: 'Invalid JSON payload' }, { status: 400 }),
    };
  }

  try {
    const data = await schema.validate(payload, { abortEarly: false, stripUnknown: true });
    return { data };
  } catch (error) {
    if (error instanceof ValidationError) {
      const msg = error.errors.length ? error.errors.join(', ') : 'Validation error';

      return { error: NextResponse.json({ success: false, msg }, { status: 400 }) };
    }

    return { error: NextResponse.json({ success: false, msg: 'Validation error' }, { status: 400 }) };
  }
};
