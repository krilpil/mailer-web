import { NextResponse } from 'next/server';
import { AnyObject, ObjectSchema, ValidationError } from 'yup';

type ParseResult<T> = { data: T } | { error: NextResponse };

export const parseAndValidate = async <T extends AnyObject>(
  request: Request,
  schema: ObjectSchema<T>
): Promise<ParseResult<T>> => {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return {
      error: NextResponse.json(
        { success: false, msg: 'Некорректное тело запроса' },
        { status: 400 }
      ),
    };
  }

  try {
    const data = await schema.validate(payload, { abortEarly: false, stripUnknown: true });
    return { data: data as T };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        error: NextResponse.json({ success: false, msg: 'Некорректные данные запроса' }, { status: 400 }),
      };
    }

    return {
      error: NextResponse.json({ success: false, msg: 'Некорректные данные запроса' }, { status: 400 }),
    };
  }
};
