export interface ISendMailPayload {
  recipient: string;
  attribs: {
    html: string;
  };
}

export interface ISendMailResponse {
  success: boolean;
  msg: string;
}
