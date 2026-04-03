import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { ValidationError } from 'yup';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';

import { listBatchMailTasks } from '../_services/listBatchMailTasks';
import { listBatchMailTasksQueryValidate } from '../batch_mail/task/list/listTasks.validation';
import {
  IBatchMailGroupInfo,
  IBatchMailTagInfo,
  IBatchMailTask,
  IListBatchMailTasksQuery,
  IListBatchMailTasksResponse,
} from '../batch_mail/task/list/listTasks.types';

const emptyData: IListBatchMailTasksResponse['data'] = { total: 0, list: [] };

interface IMailingOwnership {
  mailboxUsernames: Set<string>;
  domains: Set<string>;
  templateIds: Set<number>;
  groupIds: Set<number>;
}

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toPositiveInteger = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const toLower = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().toLowerCase();
};

const extractEmail = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  const lowerValue = value.trim().toLowerCase();
  if (!lowerValue) {
    return '';
  }

  const emailMatch = lowerValue.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/);

  return emailMatch?.[0] ?? '';
};

const getDomainFromEmail = (email: string): string => {
  if (!email) {
    return '';
  }

  const delimiterIndex = email.lastIndexOf('@');
  if (delimiterIndex <= 0 || delimiterIndex >= email.length - 1) {
    return '';
  }

  return email.slice(delimiterIndex + 1).toLowerCase();
};

const hasOwnershipSignals = (ownership: IMailingOwnership): boolean =>
  ownership.mailboxUsernames.size > 0 ||
  ownership.domains.size > 0 ||
  ownership.templateIds.size > 0 ||
  ownership.groupIds.size > 0;

const readMailingOwnership = async (accountId: string): Promise<IMailingOwnership> => {
  const dataSource = await getDataSource();

  const [domainRows, mailboxRows, templateRows, groupRows] = await Promise.all([
    dataSource.query('SELECT domain FROM account_domain WHERE account_id = $1', [accountId]),
    dataSource.query('SELECT username, domain FROM account_mailbox WHERE account_id = $1', [
      accountId,
    ]),
    dataSource.query('SELECT template_id FROM account_template WHERE account_id = $1', [accountId]),
    dataSource.query('SELECT group_id FROM account_recipient WHERE account_id = $1', [accountId]),
  ]);

  const domains = new Set(
    (domainRows as Array<{ domain?: unknown }>)
      .map((row) => toLower(row.domain))
      .filter((domain) => !!domain)
  );

  const mailboxUsernames = new Set(
    (mailboxRows as Array<{ username?: unknown; domain?: unknown }>)
      .flatMap((row) => [toLower(row.username), toLower(row.domain)])
      .filter((value) => !!value)
  );

  const templateIds = new Set(
    (templateRows as Array<{ template_id?: unknown }>)
      .map((row) => toPositiveInteger(row.template_id))
      .filter((value): value is number => value !== null)
  );

  const groupIds = new Set(
    (groupRows as Array<{ group_id?: unknown }>)
      .map((row) => toPositiveInteger(row.group_id))
      .filter((value): value is number => value !== null)
  );

  return {
    mailboxUsernames,
    domains,
    templateIds,
    groupIds,
  };
};

const normalizeTag = (value: unknown): IBatchMailTagInfo | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Record<string, unknown>;
  const id = toNumber(source.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return {
    id,
    name: toString(source.name),
    create_time: toNumber(source.create_time),
  };
};

const normalizeGroup = (value: unknown): IBatchMailGroupInfo | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Record<string, unknown>;
  const id = toNumber(source.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return {
    id,
    name: toString(source.name),
    description: toString(source.description),
    count: toNumber(source.count),
  };
};

const normalizeTask = (value: unknown): IBatchMailTask | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Record<string, unknown>;
  const id = toNumber(source.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const tags = Array.isArray(source.tags)
    ? source.tags
        .map((item) => normalizeTag(item))
        .filter((item): item is IBatchMailTagInfo => item !== null)
    : [];

  return {
    id,
    task_name: toString(source.task_name),
    addresser: toString(source.addresser),
    subject: toString(source.subject),
    full_name: toString(source.full_name),
    recipient_count: toNumber(source.recipient_count),
    task_process: toNumber(source.task_process),
    pause: toNumber(source.pause),
    template_id: toNumber(source.template_id),
    is_record: toNumber(source.is_record),
    unsubscribe: toNumber(source.unsubscribe),
    threads: toNumber(source.threads),
    track_open: toNumber(source.track_open),
    track_click: toNumber(source.track_click),
    start_time: toNumber(source.start_time),
    create_time: toNumber(source.create_time),
    update_time: toNumber(source.update_time),
    remark: toString(source.remark),
    active: toNumber(source.active),
    add_type: toNumber(source.add_type),
    estimated_time_with_warmup: toNumber(source.estimated_time_with_warmup),
    group_id: toNumber(source.group_id),
    group_name: toString(source.group_name),
    use_tag_filter: toNumber(source.use_tag_filter),
    tag_logic: toString(source.tag_logic),
    sent_count: toNumber(source.sent_count),
    unsent_count: toNumber(source.unsent_count),
    progress: toNumber(source.progress),
    template_name: toString(source.template_name),
    success_count: toNumber(source.success_count),
    error_count: toNumber(source.error_count),
    deferred: toNumber(source.deferred),
    tags,
    groups: normalizeGroup(source.groups),
  };
};

const isOwnedTask = (task: IBatchMailTask, ownership: IMailingOwnership): boolean => {
  if (ownership.templateIds.has(task.template_id)) {
    return true;
  }

  if (ownership.groupIds.has(task.group_id)) {
    return true;
  }

  if (task.groups?.id && ownership.groupIds.has(task.groups.id)) {
    return true;
  }

  const addresserEmail = extractEmail(task.addresser);
  const addresserDomain = getDomainFromEmail(addresserEmail);

  if (addresserEmail && ownership.mailboxUsernames.has(addresserEmail)) {
    return true;
  }

  if (addresserDomain && ownership.domains.has(addresserDomain)) {
    return true;
  }

  if (addresserDomain && ownership.mailboxUsernames.has(addresserDomain)) {
    return true;
  }

  return false;
};

const buildErrorResponse = (
  msg: string,
  status = 500,
  error = 'batch_mail_task_list_failed',
  code?: number
) =>
  NextResponse.json<IListBatchMailTasksResponse>(
    {
      success: false,
      msg,
      error,
      code,
      data: emptyData,
    },
    { status }
  );

const parseQuery = async (
  request: Request
): Promise<
  { data: IListBatchMailTasksQuery } | { error: NextResponse<IListBatchMailTasksResponse> }
> => {
  const { searchParams } = new URL(request.url);

  const rawPayload: Partial<Record<keyof IListBatchMailTasksQuery, string>> = {
    page: searchParams.get('page') ?? undefined,
    page_size: searchParams.get('page_size') ?? undefined,
    keyword: searchParams.get('keyword') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  };

  try {
    const data = await listBatchMailTasksQueryValidate.validate(rawPayload, {
      abortEarly: false,
      stripUnknown: true,
    });

    return { data };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        error: buildErrorResponse(
          'Некорректные параметры запроса',
          400,
          'batch_mail_task_list_invalid_query'
        ),
      };
    }

    return {
      error: buildErrorResponse(
        'Некорректные параметры запроса',
        400,
        'batch_mail_task_list_invalid_query'
      ),
    };
  }
};

export async function GET(request: Request) {
  const queryResult = await parseQuery(request);

  if ('error' in queryResult) {
    return queryResult.error;
  }

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return buildErrorResponse('Требуется авторизация', 401, 'batch_mail_task_access_denied');
  }

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return buildErrorResponse('Почтовый API не настроен');
  }

  let ownership: IMailingOwnership;

  try {
    ownership = await readMailingOwnership(accountId);
  } catch {
    return buildErrorResponse(
      'Не удалось получить данные аккаунта',
      500,
      'batch_mail_task_list_failed'
    );
  }

  if (!hasOwnershipSignals(ownership)) {
    return NextResponse.json<IListBatchMailTasksResponse>({
      success: true,
      msg: 'Успешно',
      data: emptyData,
    });
  }

  const providerPageSize = Math.max(queryResult.data.page_size, 100);

  try {
    const ownedTasks: IBatchMailTask[] = [];
    let providerCode: number | undefined;
    let providerPage = 1;
    let providerTotalPages = 1;

    while (providerPage <= providerTotalPages) {
      const providerBody = (
        await listBatchMailTasks({
          ...queryResult.data,
          page: providerPage,
          page_size: providerPageSize,
        })
      ).data;

      const currentProviderCode =
        typeof providerBody?.code === 'number' && Number.isFinite(providerBody.code)
          ? providerBody.code
          : undefined;

      if (typeof providerCode === 'undefined') {
        providerCode = currentProviderCode;
      }

      if (!providerBody?.success) {
        return buildErrorResponse(
          'Не удалось получить список задач',
          500,
          'batch_mail_task_list_failed',
          currentProviderCode
        );
      }

      const providerList = Array.isArray(providerBody.data?.list)
        ? providerBody.data.list
            .map((item) => normalizeTask(item))
            .filter((item): item is IBatchMailTask => item !== null)
        : [];

      ownedTasks.push(...providerList.filter((task) => isOwnedTask(task, ownership)));

      const providerTotal = toNumber(providerBody.data?.total, 0);

      if (providerTotal > 0) {
        providerTotalPages = Math.max(1, Math.ceil(providerTotal / providerPageSize));
      } else if (providerList.length < providerPageSize) {
        break;
      } else {
        providerTotalPages = providerPage + 1;
      }

      providerPage += 1;
    }

    const offset = (queryResult.data.page - 1) * queryResult.data.page_size;
    const pagedList = ownedTasks.slice(offset, offset + queryResult.data.page_size);
    const total = ownedTasks.length;

    return NextResponse.json<IListBatchMailTasksResponse>({
      success: true,
      msg: 'Успешно',
      code: providerCode,
      data: {
        total,
        list: pagedList,
      },
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      const providerError =
        error.response?.data && typeof error.response.data === 'object'
          ? (error.response.data as { msg?: string; error?: string; code?: number })
          : undefined;

      return buildErrorResponse(
        'Не удалось получить список задач',
        500,
        'batch_mail_task_list_failed',
        providerError?.code
      );
    }

    return buildErrorResponse('Не удалось получить список задач');
  }
}
