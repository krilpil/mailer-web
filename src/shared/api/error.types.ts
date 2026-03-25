export interface IError {
  status?: number;
}

export class DetailsError extends Error {
  details: object;

  constructor(message: string, details: object) {
    super(message);
    this.details = details;

    // eslint-disable-next-line no-console
    console.error(message, details);
    Object.setPrototypeOf(this, DetailsError.prototype);
    return { name: message, message: message, details: details };
  }
}
