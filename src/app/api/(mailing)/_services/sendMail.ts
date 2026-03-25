import axios from 'axios';

import { ISendMailPayload, ISendMailResponse } from '../mailing/sendMail/sendMail.types';

export const sendMail = async (payload: ISendMailPayload) => {
  return axios<ISendMailResponse>({
    url: `${process.env.BILLION_MAIL_API}/batch_mail/api/send`,
    method: 'POST',
    headers: {
      'X-API-Key': `${process.env.BILLION_MAIL_KEY}`,
      'Content-Type': 'application/json',
    },
    data: {
      recipient: payload.recipient,
      attribs: { html: payload.attribs.html },
    },
  });
};
