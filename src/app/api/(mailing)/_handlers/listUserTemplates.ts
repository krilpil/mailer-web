import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';

import {
  IListUserTemplatesResponse,
  IUserTemplateItem,
} from '../email_template/list/listTemplates.types';

const emptyData: IListUserTemplatesResponse['data'] = { total: 0, list: [] };

const toUnix = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toTemplateItem = (row: unknown): IUserTemplateItem | null => {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const source = row as Record<string, unknown>;
  const templateId = Number(source.template_id);

  if (!Number.isInteger(templateId) || templateId <= 0) {
    return null;
  }

  return {
    template_id: templateId,
    template_name: toString(source.template_name),
    template: toString(source.template),
    create_time: toUnix(source.create_time),
    update_time: toUnix(source.update_time),
  };
};

export async function GET() {
  const session = await auth();
  const accountId = session?.user?.id;

  if (!accountId) {
    return NextResponse.json<IListUserTemplatesResponse>(
      {
        success: false,
        msg: 'Требуется авторизация',
        error: 'email_template_access_denied',
        data: emptyData,
      },
      { status: 401 }
    );
  }

  try {
    const dataSource = await getDataSource();
    const rows = await dataSource.query(
      `SELECT
          template_id,
          template_name,
          template,
          EXTRACT(EPOCH FROM created_at)::BIGINT AS create_time,
          EXTRACT(EPOCH FROM updated_at)::BIGINT AS update_time
       FROM account_template
       WHERE account_id = $1
       ORDER BY updated_at DESC, id DESC`,
      [accountId]
    );

    const list = (rows as unknown[])
      .map((row) => toTemplateItem(row))
      .filter((item): item is IUserTemplateItem => item !== null);

    return NextResponse.json<IListUserTemplatesResponse>({
      success: true,
      msg: 'Успешно',
      data: {
        total: list.length,
        list,
      },
    });
  } catch {
    return NextResponse.json<IListUserTemplatesResponse>(
      {
        success: false,
        msg: 'Не удалось получить список шаблонов',
        error: 'email_template_list_failed',
        data: emptyData,
      },
      { status: 500 }
    );
  }
}
