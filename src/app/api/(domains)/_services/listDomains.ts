import axios from 'axios';

import { IListResponse } from '../domains/list/list.types';

export const fetchDomainsList = async (page: number): Promise<IListResponse> => {
  const response = await axios<IListResponse>({
    url: `${process.env.BILLION_MAIL_API}/domains/list`,
    method: 'GET',
    headers: {
      authorization: `${process.env.BILLION_MAIL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    params: {
      page,
      page_size: 10,
    },
  });

  const body = response.data;

  if (!body?.success) {
    return {
      success: body?.success ?? false,
      msg: 'Не удалось получить список доменов',
      data: { total: 0, list: [] },
    };
  }

  return {
    success: body.success,
    msg: 'Успешно',
    data: {
      total: body.data.total,
      list: body.data.list.map(({ domain, create_time, active, mailboxes, dns_records }) => ({
        domain,
        create_time,
        active,
        mailboxes,
        dns_records,
      })),
    },
  };
};
