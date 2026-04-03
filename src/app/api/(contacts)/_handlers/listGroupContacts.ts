import { AxiosError } from 'axios';
import { NextResponse } from 'next/server';
import { number } from 'yup';

import { auth } from '@/auth';
import { getDataSource } from '@/database/data-source';

import { listGroupContacts } from '../_services/listGroupContacts';
import { IListGroupContactsResponse } from '../contact/group/contacts/listGroupContacts.types';

const PAGE_SIZE = 200;
const MAX_PAGES = 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const emptyList = { total: 0, list: [] };

  let groupId: number;
  try {
    groupId = await number()
      .required()
      .integer()
      .positive()
      .validate(searchParams.get('group_id'), { abortEarly: true });
  } catch {
    return NextResponse.json<IListGroupContactsResponse>(
      {
        success: false,
        msg: 'Некорректная группа',
        error: 'contact_group_contacts_failed',
        data: emptyList,
      },
      { status: 400 }
    );
  }

  const session = await auth();
  const accountId = session?.user?.id;
  if (!accountId) {
    return NextResponse.json<IListGroupContactsResponse>(
      { success: false, msg: 'Требуется авторизация', data: emptyList },
      { status: 401 }
    );
  }

  if (!process.env.BILLION_MAIL_API || !process.env.BILLION_MAIL_TOKEN) {
    return NextResponse.json<IListGroupContactsResponse>(
      {
        success: false,
        msg: 'Почтовый API не настроен',
        error: 'contact_group_contacts_failed',
        data: emptyList,
      },
      { status: 500 }
    );
  }

  try {
    const dataSource = await getDataSource();
    const rows = await dataSource.query(
      'SELECT 1 FROM account_recipient WHERE account_id = $1 AND group_id = $2 LIMIT 1',
      [accountId, groupId]
    );

    if ((rows as Array<unknown>).length === 0) {
      return NextResponse.json<IListGroupContactsResponse>(
        {
          success: false,
          msg: 'Группа недоступна',
          error: 'contact_group_access_denied',
          data: emptyList,
        },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json<IListGroupContactsResponse>(
      {
        success: false,
        msg: 'Не удалось проверить доступ к группе',
        error: 'contact_group_contacts_failed',
        data: emptyList,
      },
      { status: 500 }
    );
  }

  try {
    const contactMap = new Map<
      string,
      {
        id: number;
        email: string;
        group_id: number;
        active: 0 | 1;
        status: 0 | 1;
        create_time: number;
      }
    >();

    let page = 1;
    let providerTotal = 0;

    while (page <= MAX_PAGES) {
      const providerResponse = await listGroupContacts({
        page,
        page_size: PAGE_SIZE,
        group_id: groupId,
      });
      const providerBody = providerResponse.data;

      if (!providerBody?.success) {
        return NextResponse.json<IListGroupContactsResponse>(
          {
            success: false,
            msg: 'Не удалось получить список пользователей группы',
            error: 'contact_group_contacts_failed',
            data: emptyList,
          },
          { status: 500 }
        );
      }

      const providerList = Array.isArray(providerBody.data?.list) ? providerBody.data.list : [];
      providerTotal = Number(providerBody.data?.total ?? providerTotal);

      providerList.forEach((contact) => {
        const email = contact.email?.trim().toLowerCase();
        if (!email) return;

        contactMap.set(email, {
          id: Number.isFinite(Number(contact.id)) ? Number(contact.id) : 0,
          email,
          group_id: Number.isFinite(Number(contact.group_id)) ? Number(contact.group_id) : groupId,
          active: Number(contact.active) === 0 ? 0 : 1,
          status: Number(contact.status) === 0 ? 0 : 1,
          create_time: Number.isFinite(Number(contact.create_time))
            ? Number(contact.create_time)
            : 0,
        });
      });

      if (providerList.length < PAGE_SIZE) break;
      if (providerTotal > 0 && contactMap.size >= providerTotal) break;

      page += 1;
    }

    const list = Array.from(contactMap.values());

    return NextResponse.json<IListGroupContactsResponse>({
      success: true,
      msg: 'Успешно',
      data: {
        total: list.length,
        list,
      },
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      return NextResponse.json<IListGroupContactsResponse>(
        {
          success: false,
          msg: 'Не удалось получить список пользователей группы',
          error: 'contact_group_contacts_failed',
          data: emptyList,
        },
        { status: 500 }
      );
    }

    return NextResponse.json<IListGroupContactsResponse>(
      {
        success: false,
        msg: 'Не удалось получить список пользователей группы',
        error: 'contact_group_contacts_failed',
        data: emptyList,
      },
      { status: 500 }
    );
  }
}
